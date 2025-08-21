/**
 * Utilidades para validación de datos
 */

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, message: 'El email es requerido.' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Por favor ingresa un email válido.' };
  }
  
  return { isValid: true, message: 'Email válido' };
}

/**
 * Valida longitud de texto
 */
export function validateTextLength(
  text: string, 
  minLength: number, 
  fieldName: string
): ValidationResult {
  if (!text) {
    return { isValid: false, message: `${fieldName} es requerido.` };
  }
  
  if (text.length < minLength) {
    return { 
      isValid: false, 
      message: `${fieldName} debe tener al menos ${minLength} caracteres.` 
    };
  }
  
  return { isValid: true, message: `${fieldName} válido` };
}

/**
 * Sanitiza entrada de texto para prevenir XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Detecta patrones peligrosos para XSS
 */
export function detectDangerousPatterns(text: string): boolean {
  const dangerousPatterns = /<script|javascript:|on\w+=/i;
  return dangerousPatterns.test(text);
}