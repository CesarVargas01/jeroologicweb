/**
 * Módulo de validación compartido entre cliente y servidor
 * Utiliza solo funcionalidades estándar de JavaScript para compatibilidad
 */

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface FormData {
  name: string;
  email: string;
  company?: string;
  message: string;
}

/**
 * Configuración de validación centralizada
 */
export const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 100,
    required: true
  },
  email: {
    maxLength: 100,
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  company: {
    maxLength: 100,
    required: false
  },
  message: {
    minLength: 10,
    maxLength: 1000,
    required: true
  }
} as const;

/**
 * Clase principal de validación
 */
export class FormValidator {
  /**
   * Valida formato de email
   */
  static validateEmail(email: string): ValidationResult {
    if (!email) {
      return { isValid: false, message: 'El email es requerido.' };
    }
    
    if (!VALIDATION_RULES.email.pattern.test(email)) {
      return { isValid: false, message: 'Por favor ingresa un email válido.' };
    }
    
    if (email.length > VALIDATION_RULES.email.maxLength) {
      return { isValid: false, message: `El email no puede exceder los ${VALIDATION_RULES.email.maxLength} caracteres.` };
    }
    
    return { isValid: true, message: 'Email válido' };
  }

  /**
   * Valida longitud de texto
   */
  static validateTextLength(
    text: string, 
    fieldName: string,
    rules: { minLength?: number; maxLength?: number; required?: boolean }
  ): ValidationResult {
    if (rules.required && !text) {
      return { isValid: false, message: `${fieldName} es requerido.` };
    }
    
    if (rules.minLength && text.length < rules.minLength) {
      return { 
        isValid: false, 
        message: `${fieldName} debe tener al menos ${rules.minLength} caracteres.` 
      };
    }

    if (rules.maxLength && text.length > rules.maxLength) {
      return { 
        isValid: false, 
        message: `${fieldName} no puede exceder los ${rules.maxLength} caracteres.` 
      };
    }
    
    return { isValid: true, message: `${fieldName} válido` };
  }

  /**
   * Sanitiza entrada de texto para prevenir XSS
   */
  static sanitizeInput(input: string): string {
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
  static detectDangerousPatterns(text: string): boolean {
    const dangerousPatterns = /<script|javascript:|on\w+=/i;
    return dangerousPatterns.test(text);
  }

  /**
   * Valida formulario completo
   */
  static validateForm(data: FormData): ValidationResult {
    // Validar nombre
    const nameValidation = this.validateTextLength(data.name, 'El nombre', VALIDATION_RULES.name);
    if (!nameValidation.isValid) return nameValidation;

    // Validar email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) return emailValidation;

    // Validar empresa (opcional)
    if (data.company) {
      const companyValidation = this.validateTextLength(data.company, 'El nombre de la empresa', VALIDATION_RULES.company);
      if (!companyValidation.isValid) return companyValidation;
    }

    // Validar mensaje
    const messageValidation = this.validateTextLength(data.message, 'El mensaje', VALIDATION_RULES.message);
    if (!messageValidation.isValid) return messageValidation;

    // Verificar contenido peligroso
    const allFields = [data.name, data.email, data.company || '', data.message].join(' ');
    if (this.detectDangerousPatterns(allFields)) {
      return { isValid: false, message: 'Contenido no válido detectado.' };
    }

    return { isValid: true, message: 'Validación exitosa' };
  }

  /**
   * Sanitiza datos del formulario
   */
  static sanitizeFormData(data: FormData): FormData {
    return {
      name: this.sanitizeInput(data.name),
      email: this.sanitizeInput(data.email),
      company: data.company ? this.sanitizeInput(data.company) : '',
      message: this.sanitizeInput(data.message)
    };
  }
}