/**
 * Maneja la validación y envío de formularios con seguridad mejorada
 */
class FormManager {
  constructor() {
    this.lastSubmitTime = null;
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
    // Prevenir envíos muy rápidos (anti-spam básico)
    const now = Date.now();
    if (this.lastSubmitTime && (now - this.lastSubmitTime) < 3000) {
      this.showNotification('Por favor espera un momento antes de enviar otro mensaje.', 'warning');
      return;
    }
    this.lastSubmitTime = now;
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

    // Show enhanced loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando mensaje...';
    submitButton.classList.add('opacity-75', 'cursor-not-allowed');

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
        // Mensaje de éxito personalizado y claro
        const successMessage = result.message || 
          `¡Perfecto, ${formData.name}! Tu mensaje ha sido enviado exitosamente.`;
        
        this.showNotification(successMessage, 'success');
        
        // Reset form after showing success message
        form.reset();
        
        // Optional: Scroll to top to ensure user sees the notification
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
      // Reset button state with smooth transition
      setTimeout(() => {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
        submitButton.classList.remove('opacity-75', 'cursor-not-allowed');
      }, 500); // Small delay to show success state
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
   * Valida los datos del formulario utilizando el módulo compartido
   * @param {Object} data - Los datos del formulario a validar
   * @returns {Object} Resultado de la validación con isValid y message
   */
  validateFormData(data) {
    // Usar el validador compartido si está disponible
    if (typeof window !== 'undefined' && window.FormValidator) {
      return window.FormValidator.validateForm(data);
    }

    // Fallback a validación básica si el módulo compartido no está disponible
    return this.validateFormDataFallback(data);
  }

  /**
   * Validación de fallback (mantiene la lógica original como respaldo)
   * @param {Object} data - Los datos del formulario a validar
   * @returns {Object} Resultado de la validación con isValid y message
   */
  validateFormDataFallback(data) {
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
   * Muestra notificaciones toast mejoradas con diferentes tipos y animaciones
   * @param {string} message - El mensaje a mostrar
   * @param {string} type - Tipo de notificación: 'info', 'success', 'error', 'warning'
   */
  showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    });

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set notification properties based on type
    let icon, duration;
    switch (type) {
      case 'success':
        icon = 'fas fa-check-circle';
        duration = 7000;
        break;
      case 'error':
        icon = 'fas fa-exclamation-circle';
        duration = 8000;
        break;
      case 'warning':
        icon = 'fas fa-exclamation-triangle';
        duration = 6000;
        break;
      default:
        icon = 'fas fa-info-circle';
        duration = 5000;
    }

    notification.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="flex-shrink: 0;">
          <i class="${icon}" style="font-size: 18px;"></i>
        </div>
        <div style="flex: 1;">
          <p style="font-weight: 500; margin: 0; line-height: 1.4;">${message}</p>
          ${type === 'success' ? '<p style="font-size: 14px; opacity: 0.9; margin: 4px 0 0 0; line-height: 1.3;">Nos pondremos en contacto contigo pronto.</p>' : ''}
        </div>
        <button style="flex-shrink: 0; background: none; border: none; color: inherit; cursor: pointer; padding: 0; margin-left: 8px; opacity: 0.8; transition: opacity 0.2s;" 
                onmouseover="this.style.opacity='0.6'" 
                onmouseout="this.style.opacity='0.8'"
                onclick="this.closest('.notification').classList.add('fade-out'); setTimeout(() => this.closest('.notification')?.remove(), 300)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after specified duration
    const autoRemoveTimeout = setTimeout(() => {
      if (notification.parentElement) {
        notification.classList.add('fade-out');
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, duration);

    // Clear timeout if user manually closes
    notification.addEventListener('click', (e) => {
      if (e.target.closest('button')) {
        clearTimeout(autoRemoveTimeout);
      }
    });

    // Add sound notification for success (optional)
    if (type === 'success' && 'speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance('Mensaje enviado');
        utterance.volume = 0.1;
        utterance.rate = 1.5;
        speechSynthesis.speak(utterance);
      } catch (e) {
        // Ignore speech synthesis errors
      }
    }
  }
}

// Initialize when DOM is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    new FormManager();
  });
}