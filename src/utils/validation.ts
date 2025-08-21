/**
 * Utilidades para validación de datos (DEPRECATED)
 * @deprecated Use FormValidator from '../shared/validation.ts' instead
 */

// Re-export from shared module for backward compatibility
export { 
  FormValidator, 
  VALIDATION_RULES 
} from '../shared/validation';

export type { 
  ValidationResult, 
  FormData as ValidatedFormData
} from '../shared/validation';

// Import for legacy functions
import { FormValidator } from '../shared/validation';

// Legacy exports for backward compatibility
export const validateEmail = FormValidator.validateEmail;
export const sanitizeInput = FormValidator.sanitizeInput;
export const detectDangerousPatterns = FormValidator.detectDangerousPatterns;

/**
 * @deprecated Use FormValidator.validateTextLength instead
 */
export function validateTextLength(
  text: string, 
  minLength: number, 
  fieldName: string
) {
  return FormValidator.validateTextLength(text, fieldName, { minLength, required: true });
}