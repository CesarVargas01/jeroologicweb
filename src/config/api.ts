/**
 * Configuración de APIs y endpoints externos
 */

// URL de Google Apps Script Web App
// IMPORTANTE: Reemplaza esta URL con la tuya después de desplegar el script
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby90rr4ucKj7CoxKUu0OdTXh0nVXGfTD3trZGKoQg0PapzyRjpXaOT_yuilXO58iFSEGQ/exec';

// Configuración de rate limiting
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5, // máximo 5 requests por ventana
};

// Configuración de validación
export const VALIDATION_CONFIG = {
  name: {
    minLength: 2,
    maxLength: 100
  },
  email: {
    maxLength: 100
  },
  company: {
    maxLength: 100
  },
  message: {
    minLength: 10,
    maxLength: 1000
  }
};