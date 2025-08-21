/**
 * Maneja la validación y envío de formularios con seguridad mejorada
 */
class FormManager {
  constructor() {
    this.init();
  }

  /**
   * Inicializa el gestor de formularios
   */
  init() {
    this.setupContactForm();
  }

  /**
   * Configura el formulario de contacto con validación y manejo de eventos
   */
  setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmission(contactForm);
    });
  }

  /**
   * Maneja el envío del formulario con validación y estados de carga
   * @param {HTMLFormElement} form - El formulario a procesar
   */
  async handleFormSubmission(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;

    const originalButtonText = submitButton.innerHTML;
    
    // Get form data
    const formData = this.getFormData(form);
    
    // Validate form data
    const validation = this.validateFormData(formData);
    if (!validation.isValid) {
      this.showNotification(validation.message, 'error');
      return;
    }

    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        this.showNotification(
          result.message || `¡Gracias ${formData.name}! Tu mensaje ha sido enviado.`,
          'success'
        );
        form.reset();
      } else {
        this.showNotification(
          `Error: ${result.message || 'No se pudo enviar el mensaje.'}`,
          'error'
        );
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      this.handleNetworkError(error);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  }

  /**
   * Extrae y limpia los datos del formulario
   * @param {HTMLFormElement} form - El formulario del cual extraer datos
   * @returns {Object} Objeto con los datos del formulario
   */
  getFormData(form) {
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const companyInput = form.querySelector('#company');
    const messageInput = form.querySelector('#message');

    return {
      name: nameInput ? nameInput.value.trim() : '',
      email: emailInput ? emailInput.value.trim() : '',
      company: companyInput ? companyInput.value.trim() : '',
      message: messageInput ? messageInput.value.trim() : ''
    };
  }

  /**
   * Valida los datos del formulario con múltiples verificaciones
   * @param {Object} data - Los datos del formulario a validar
   * @returns {Object} Resultado de la validación con isValid y message
   */
  validateFormData(data) {
    // Required fields validation
    if (!data.name) {
      return { isValid: false, message: 'El nombre es requerido.' };
    }
    
    if (!data.email) {
      return { isValid: false, message: 'El email es requerido.' };
    }
    
    if (!data.message) {
      return { isValid: false, message: 'El mensaje es requerido.' };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { isValid: false, message: 'Por favor ingresa un email válido.' };
    }

    // Length validations
    if (data.name.length < 2) {
      return { isValid: false, message: 'El nombre debe tener al menos 2 caracteres.' };
    }

    if (data.message.length < 10) {
      return { isValid: false, message: 'El mensaje debe tener al menos 10 caracteres.' };
    }

    // XSS prevention - enhanced sanitization check
    const dangerousPatterns = /<script|javascript:|on\w+=/i;
    const allFields = Object.values(data).join(' ');
    if (dangerousPatterns.test(allFields)) {
      return { isValid: false, message: 'Contenido no válido detectado.' };
    }

    // Sanitize input data
    Object.keys(data).forEach(key => {
      data[key] = this.sanitizeInput(data[key]);
    });

    return { isValid: true, message: 'Validación exitosa' };
  }

  /**
   * Sanitiza entrada de texto para prevenir ataques XSS
   * @param {string} input - El texto a sanitizar
   * @returns {string} Texto sanitizado
   */
  sanitizeInput(input) {
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
   * Maneja diferentes tipos de errores de red con mensajes específicos
   * @param {Error} error - El error capturado
   */
  handleNetworkError(error) {
    let message = 'Error inesperado. Contacta soporte.';
    let type = 'error';

    if (error.name === 'TypeError') {
      message = 'Error de conexión. Verifica tu internet.';
    } else if (error.name === 'AbortError') {
      message = 'Solicitud cancelada.';
      type = 'warning';
    } else if (error.message.includes('fetch')) {
      message = 'No se pudo conectar al servidor. Inténtalo más tarde.';
    } else if (error.message.includes('timeout')) {
      message = 'La solicitud tardó demasiado. Inténtalo de nuevo.';
    }

    this.showNotification(message, type);
  }

  /**
   * Muestra notificaciones toast con diferentes tipos y animaciones
   * @param {string} message - El mensaje a mostrar
   * @param {string} type - Tipo de notificación: 'info', 'success', 'error', 'warning'
   */
  showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`;
    
    // Set notification style based on type
    switch (type) {
      case 'success':
        notification.classList.add('bg-green-500', 'text-white');
        break;
      case 'error':
        notification.classList.add('bg-red-500', 'text-white');
        break;
      default:
        notification.classList.add('bg-blue-500', 'text-white');
    }

    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <span>${message}</span>
        <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }
}

// Initialize when DOM is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    new FormManager();
  });
}