/**
 * API endpoint para manejar el envío del formulario de contacto
 * Reenvía los datos a Google Apps Script para guardar en Google Sheets
 */

import type { APIRoute } from 'astro';
import { GOOGLE_SCRIPT_URL, RATE_LIMIT_CONFIG, VALIDATION_CONFIG } from '../../config/api';

// Rate limiting simple (en memoria)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Implementa rate limiting básico por IP
 */
function checkRateLimit(clientIP: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    // Primera request o ventana expirada
    rateLimitMap.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs
    });
    return { allowed: true };
  }

  if (clientData.count >= RATE_LIMIT_CONFIG.maxRequests) {
    return {
      allowed: false,
      message: 'Demasiadas solicitudes. Inténtalo de nuevo en 15 minutos.'
    };
  }

  // Incrementar contador
  clientData.count++;
  return { allowed: true };
}

/**
 * Valida los datos del formulario
 */
function validateFormData(data: any): { valid: boolean; message?: string } {
  // Verificar campos requeridos
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < VALIDATION_CONFIG.name.minLength) {
    return { valid: false, message: `El nombre es requerido y debe tener al menos ${VALIDATION_CONFIG.name.minLength} caracteres.` };
  }

  if (!data.email || typeof data.email !== 'string') {
    return { valid: false, message: 'El email es requerido.' };
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < VALIDATION_CONFIG.message.minLength) {
    return { valid: false, message: `El mensaje es requerido y debe tener al menos ${VALIDATION_CONFIG.message.minLength} caracteres.` };
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { valid: false, message: 'Por favor ingresa un email válido.' };
  }

  // Verificar longitudes máximas
  if (data.name.length > VALIDATION_CONFIG.name.maxLength) {
    return { valid: false, message: `El nombre no puede exceder ${VALIDATION_CONFIG.name.maxLength} caracteres.` };
  }

  if (data.email.length > VALIDATION_CONFIG.email.maxLength) {
    return { valid: false, message: `El email no puede exceder ${VALIDATION_CONFIG.email.maxLength} caracteres.` };
  }

  if (data.company && data.company.length > VALIDATION_CONFIG.company.maxLength) {
    return { valid: false, message: `El nombre de la empresa no puede exceder ${VALIDATION_CONFIG.company.maxLength} caracteres.` };
  }

  if (data.message.length > VALIDATION_CONFIG.message.maxLength) {
    return { valid: false, message: `El mensaje no puede exceder ${VALIDATION_CONFIG.message.maxLength} caracteres.` };
  }

  // Verificar contenido peligroso
  const dangerousPatterns = /<script|javascript:|on\w+=/i;
  const allFields = [data.name, data.email, data.company || '', data.message].join(' ');
  if (dangerousPatterns.test(allFields)) {
    return { valid: false, message: 'Contenido no válido detectado.' };
  }

  return { valid: true };
}

/**
 * Sanitiza los datos de entrada
 */
function sanitizeData(data: any) {
  const sanitize = (str: string) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  };

  return {
    name: sanitize(data.name),
    email: sanitize(data.email),
    company: data.company ? sanitize(data.company) : '',
    message: sanitize(data.message)
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Obtener IP del cliente para rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Verificar rate limiting
    const rateLimitCheck = checkRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          message: rateLimitCheck.message
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        }
      );
    }

    // Verificar Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Content-Type debe ser application/json'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Parsear datos JSON
    let formData;
    try {
      formData = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Datos JSON inválidos'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Validar datos
    const validation = validateFormData(formData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          message: validation.message
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Sanitizar datos
    const sanitizedData = sanitizeData(formData);

    // Enviar a Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedData)
    });

    if (!response.ok) {
      throw new Error(`Google Script respondió con status: ${response.status}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.message || '¡Mensaje enviado correctamente!'
      }),
      {
        status: result.success ? 200 : 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );

  } catch (error) {
    console.error('Error en submit-form API:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error interno del servidor. Por favor, inténtalo de nuevo.'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
};

// Manejar preflight requests para CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    }
  });
};