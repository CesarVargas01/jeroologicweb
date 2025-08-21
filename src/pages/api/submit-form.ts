/**
 * API endpoint para manejar el envío del formulario de contacto
 * Reenvía los datos a Google Apps Script para guardar en Google Sheets
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { GOOGLE_SCRIPT_URL, RATE_LIMIT_CONFIG, VALIDATION_CONFIG } from '../../config/api';
import { validateEmail, validateTextLength, sanitizeInput, detectDangerousPatterns } from '../../utils/validation';
import Redis from 'ioredis';

// Inicialización del cliente Vercel KV para rate limiting persistente
if (!process.env.KV_URL || !process.env.KV_REST_API_TOKEN) {
  // Log a más descriptivo en el servidor
  console.error("Error: Missing Vercel KV environment variables. Check Vercel project settings.");
  // No lances un error aquí para que el resto de la app (si aplica) pueda funcionar,
  // pero el endpoint fallará con un mensaje claro.
}

const kv = new Redis(process.env.KV_URL as string);

/**
 * Implementa rate limiting persistente por IP usando Vercel KV
 */
async function checkRateLimit(clientIP: string): Promise<{ allowed: boolean; message?: string }> {
  const key = `ratelimit:${clientIP}`;
  const windowMs = RATE_LIMIT_CONFIG.windowMs; // Ventana en milisegundos
  const maxRequests = RATE_LIMIT_CONFIG.maxRequests; // Máximo de peticiones

  // Incrementar el contador para la IP
  const currentCount = await kv.incr(key);

  // Si es la primera petición en la ventana, establecer la expiración
  if (currentCount === 1) {
    await kv.pexpire(key, windowMs); // pexpire usa milisegundos
  }

  // Verificar si se ha excedido el límite
  if (currentCount > maxRequests) {
    return {
      allowed: false,
      message: `Demasiadas solicitudes. Inténtalo de nuevo en ${Math.ceil(windowMs / 60000)} minutos.`
    };
  }

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