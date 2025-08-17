import type { APIRoute } from 'astro';
import { google } from 'googleapis';

// --- Configuración de Seguridad y Entorno ---

// Carga las credenciales de forma segura desde variables de entorno.
// ¡NUNCA expongas estas claves en el código del lado del cliente!
const GOOGLE_SERVICE_ACCOUNT_KEY = JSON.parse(import.meta.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
const SPREADSHEET_ID = import.meta.env.SPREADSHEET_ID; // Carga el ID de la hoja desde variables de entorno
const SHEET_NAME = import.meta.env.SHEET_NAME || 'contactos'; // Nombre de la hoja, con un valor por defecto

// --- Utilidades de Seguridad ---

/**
 * Sanitiza el texto para prevenir ataques de XSS y Formula Injection en Google Sheets.
 * - Escapa caracteres que podrían iniciar una fórmula (=, +, -, @).
 * - Reemplaza caracteres HTML para prevenir XSS.
 * @param text El texto a sanitizar.
 * @returns El texto sanitizado.
 */
const sanitizeInput = (text: string): string => {
  if (!text) return '';
  let sanitizedText = text;
  // Previene Formula Injection
  if (['=', '+', '-', '@'].includes(sanitizedText.charAt(0))) {
    sanitizedText = `'` + sanitizedText;
  }
  // Previene XSS básico
  const htmlEntities: { [key: string]: string } = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    '\'': '&#39;',
    '/': '&#x2F;'
  };
  return sanitizedText.replace(/[<>&"'\/]/g, char => htmlEntities[char]);
};

/**
 * Valida si una cadena de texto es un email válido.
 * @param email El email a validar.
 * @returns `true` si el email es válido, de lo contrario `false`.
 */
const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^S@]+@[^S@]+\.[^S@]+$/;
  return emailRegex.test(email);
};


// --- Endpoint de la API ---

export const POST: APIRoute = async ({ request }) => {
  // 1. Validación de la solicitud
  if (request.headers.get("Content-Type") !== "application/json") {
    return new Response(JSON.stringify({ message: 'Tipo de contenido no permitido.' }), { status: 415 });
  }

  try {
    const body = await request.json();

    // 2. Validación de Datos (Presencia, Formato y Longitud)
    const { name, email, company, message } = body;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ message: 'Nombre, email y mensaje son campos requeridos.' }), { status: 400 });
    }
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ message: 'El formato del email no es válido.' }), { status: 400 });
    }
    if (name.length > 100 || email.length > 100 || message.length > 5000 || (company && company.length > 100)) {
        return new Response(JSON.stringify({ message: 'Uno de los campos excede la longitud máxima permitida.' }), { status: 400 });
    }

    // 3. Sanitización de Entradas
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedCompany = company ? sanitizeInput(company) : '';
    const sanitizedMessage = sanitizeInput(message);

    // 4. Autenticación y Conexión con Google Sheets
    if (!SPREADSHEET_ID || !GOOGLE_SERVICE_ACCOUNT_KEY.client_email) {
        console.error("Error: Las variables de entorno para Google Sheets no están configuradas.");
        return new Response(JSON.stringify({ message: 'Error de configuración del servidor.' }), { status: 500 });
    }
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_KEY.client_email,
        private_key: GOOGLE_SERVICE_ACCOUNT_KEY.private_key.replace(/\\n/g, '\n'), // Asegura el formato correcto de la clave
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 5. Escritura en la Hoja de Cálculo
    const timestamp = new Date().toISOString();
    const values = [[timestamp, sanitizedName, sanitizedEmail, sanitizedCompany, sanitizedMessage]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:E`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return new Response(JSON.stringify({ message: 'Mensaje enviado con éxito.' }), { status: 200 });

  } catch (error) {
    console.error('Error al procesar el formulario:', error);
    // Evita exponer detalles del error al cliente
    return new Response(JSON.stringify({ message: 'Error interno del servidor al procesar la solicitud.' }), { status: 500 });
  }
};
