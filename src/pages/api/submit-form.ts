/**
 * API endpoint para manejar el envío del formulario de contacto
 * Reenvía los datos a Google Apps Script para guardar en Google Sheets
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { GOOGLE_SCRIPT_URL, RATE_LIMIT_CONFIG, VALIDATION_CONFIG } from '../../config/api';
import { validateEmail, validateTextLength, sanitizeInput, detectDangerousPatterns } from '../../utils/validation';
import { kv } from '@vercel/kv';

// Verificar variables de entorno de Vercel KV
if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  console.error("Warning: Missing Vercel KV environment variables. Rate limiting will use fallback.");
}

// Fallback en memoria para rate limiting cuando KV no está disponible
const memoryStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Implementa rate limiting con Vercel KV y fallback en memoria
 */
async function checkRateLimit(clientIP: string): Promise<{ allowed: boolean; message?: string }> {
  const key = `ratelimit:${clientIP}`;
  const windowMs = RATE_LIMIT_CONFIG.windowMs;
  const maxRequests = RATE_LIMIT_CONFIG.maxRequests;

  try {
    // Intentar usar Vercel KV primero
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const currentCount = await kv.incr(key);
      
      // Si es la primera petición en la ventana, establecer la expiración
      if (currentCount === 1) {
        await kv.expire(key, Math.ceil(windowMs / 1000)); // expire usa segundos
      }

      if (currentCount > maxRequests) {
        return {
          allowed: false,
          message: `Demasiadas solicitudes. Inténtalo de nuevo en ${Math.ceil(windowMs / 60000)} minutos.`
        };
      }

      return { allowed: true };
    } else {
      // Fallback a memoria local
      return checkRateLimitMemory(clientIP, windowMs, maxRequests);
    }
  } catch (error) {
    console.warn('Vercel KV error, using memory fallback:', error);
    return checkRateLimitMemory(clientIP, windowMs, maxRequests);
  }
}

/**
 * Rate limiting en memoria como fallback
 */
function checkRateLimitMemory(clientIP: string, windowMs: number, maxRequests: number): { allowed: boolean; message?: string } {
  const now = Date.now();
  const record = memoryStore.get(clientIP);

  if (!record || now > record.resetTime) {
    // Nueva ventana o primera petición
    memoryStore.set(clientIP, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      message: `Demasiadas solicitudes. Inténtalo de nuevo en ${Math.ceil((record.resetTime - now) / 60000)} minutos.`
    };
  }

  // Incrementar contador
  record.count++;
  return { allowed: true };
}

/**
 * Valida los datos del formulario utilizando funciones de utilidad
 */
function validateFormData(data: any): { valid: boolean; message?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, message: 'Datos inválidos.' };
  }

  // Validaciones de campos
  const nameValidation = validateTextLength(data.name, VALIDATION_CONFIG.name.minLength, 'El nombre');
  if (!nameValidation.isValid) return { valid: false, message: nameValidation.message };

  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) return { valid: false, message: emailValidation.message };

  const messageValidation = validateTextLength(data.message, VALIDATION_CONFIG.message.minLength, 'El mensaje');
  if (!messageValidation.isValid) return { valid: false, message: messageValidation.message };

  // Verificar longitudes máximas
  if (data.name.length > VALIDATION_CONFIG.name.maxLength) {
    return { valid: false, message: `El nombre no puede exceder los ${VALIDATION_CONFIG.name.maxLength} caracteres.` };
  }
  if (data.email.length > VALIDATION_CONFIG.email.maxLength) {
    return { valid: false, message: `El email no puede exceder los ${VALIDATION_CONFIG.email.maxLength} caracteres.` };
  }
  if (data.company && data.company.length > VALIDATION_CONFIG.company.maxLength) {
    return { valid: false, message: `El nombre de la empresa no puede exceder los ${VALIDATION_CONFIG.company.maxLength} caracteres.` };
  }
  if (data.message.length > VALIDATION_CONFIG.message.maxLength) {
    return { valid: false, message: `El mensaje no puede exceder los ${VALIDATION_CONFIG.message.maxLength} caracteres.` };
  }

  // Verificar contenido peligroso
  const allFields = [data.name, data.email, data.company || '', data.message].join(' ');
  if (detectDangerousPatterns(allFields)) {
    return { valid: false, message: 'Contenido no válido detectado.' };
  }

  return { valid: true };
}

/**
 * Sanitiza los datos de entrada utilizando una función de utilidad
 */
function sanitizeData(data: any) {
  return {
    name: sanitizeInput(data.name),
    email: sanitizeInput(data.email),
    company: data.company ? sanitizeInput(data.company) : '',
    message: sanitizeInput(data.message)
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Obtener IP del cliente para rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Verificar rate limiting
    const rateLimitCheck = await checkRateLimit(clientIP);
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
            'Access-Control-Allow-Origin': 'https://www.jeroologic.com',
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
            'Access-Control-Allow-Origin': 'https://www.jeroologic.com'
          }
        }
      );
    }

    // Parsear datos JSON
    let formData: any;
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
            'Access-Control-Allow-Origin': 'https://www.jeroologic.com'
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
            'Access-Control-Allow-Origin': 'https://www.jeroologic.com'
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
          'Access-Control-Allow-Origin': 'https://www.jeroologic.com',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );

  } catch (error) {
    console.error('--- DETAILED SUBMIT-FORM API ERROR ---');
    console.error('Timestamp:', new Date().toISOString());
    if (error instanceof Error) {
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
    } else {
      console.error('Caught a non-Error object:', error);
    }
    console.error('--- END OF DETAILED ERROR ---');

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error interno del servidor. Por favor, inténtalo de nuevo.'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://www.jeroologic.com'
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
      'Access-Control-Allow-Origin': 'https://www.jeroologic.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    }
  });
};