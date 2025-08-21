/**
 * Módulo de validación compartido para el cliente
 * Versión JavaScript compatible con navegadores
 */

/**
 * Configuración de validación centralizada
 */
const VALIDATION_RULES = {
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
};

/**
 * Clase principal de validación para el cliente
 */
class FormValidator {
  /**
   * Valida formato de email
   */
  static validateEmail(email) {
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
  static validateTextLength(text, fieldName, rules) {
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
  static sanitizeInput(input) {
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
  static detectDangerousPatterns(text) {
    const dangerousPatterns = /<script|javascript:|on\w+=/i;
    return dangerousPatterns.test(text);
  }

  /**
   * Valida formulario completo
   */
  static validateForm(data) {
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
  static sanitizeFormData(data) {
    return {
      name: this.sanitizeInput(data.name),
      email: this.sanitizeInput(data.email),
      company: data.company ? this.sanitizeInput(data.company) : '',
      message: this.sanitizeInput(data.message)
    };
  }
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  window.FormValidator = FormValidator;
  window.VALIDATION_RULES = VALIDATION_RULES;
}