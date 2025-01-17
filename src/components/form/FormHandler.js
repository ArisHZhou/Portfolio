export class FormHandler {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    this.submitButton = this.form?.querySelector('button[type="submit"]');
    this.isSubmitting = false;
  }

  init() {
    if (!this.form) return;
    this.setupFormValidation();
    this.setupSubmitHandler();
  }

  setupFormValidation() {
    const inputs = this.form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.validateField(input));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(value);
        errorMessage = 'Please enter a valid email address';
        break;

      case 'text':
        isValid = value.length >= 2;
        errorMessage = 'This field is required';
        break;

      case 'textarea':
        isValid = value.length >= 10;
        errorMessage = 'Please enter at least 10 characters';
        break;
    }

    this.updateFieldValidation(field, isValid, errorMessage);
    this.updateSubmitButton();
  }

  updateFieldValidation(field, isValid, errorMessage) {
    const errorElement = this.getErrorElement(field);
    
    if (!isValid) {
      field.classList.add('invalid');
      field.classList.remove('valid');
      errorElement.textContent = errorMessage;
    } else {
      field.classList.remove('invalid');
      field.classList.add('valid');
      errorElement.textContent = '';
    }
  }

  getErrorElement(field) {
    let errorElement = field.nextElementSibling;
    if (!errorElement?.classList.contains('error-message')) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    return errorElement;
  }

  updateSubmitButton() {
    const isFormValid = [...this.form.elements].every(element => 
      !element.classList.contains('invalid') && 
      (element.value.trim() !== '' || element.type === 'submit')
    );
    
    this.submitButton.disabled = !isFormValid;
  }

  setupSubmitHandler() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this.isSubmitting) return;

      this.isSubmitting = true;
      this.updateSubmitButtonState('loading');

      try {
        const formData = new FormData(this.form);
        await this.submitForm(formData);
        this.showSuccess();
        this.form.reset();
      } catch (error) {
        this.showError(error);
      } finally {
        this.isSubmitting = false;
        this.updateSubmitButtonState('default');
      }
    });
  }

  async submitForm(formData) {
    const response = await fetch(this.form.action, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Form submission failed');
    }

    return response.json();
  }

  updateSubmitButtonState(state) {
    const originalText = this.submitButton.dataset.text || 'Send';
    
    switch (state) {
      case 'loading':
        this.submitButton.disabled = true;
        this.submitButton.innerHTML = '<span class="spinner"></span> Sending...';
        break;
      case 'default':
        this.submitButton.disabled = false;
        this.submitButton.textContent = originalText;
        break;
    }
  }

  showSuccess() {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Message sent successfully!';
    
    this.form.insertAdjacentElement('beforebegin', successMessage);
    
    gsap.from(successMessage, {
      y: -20,
      opacity: 0,
      duration: 0.5
    });

    setTimeout(() => {
      gsap.to(successMessage, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => successMessage.remove()
      });
    }, 3000);
  }

  showError(error) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message global';
    errorMessage.textContent = error.message || 'Something went wrong. Please try again.';
    
    this.form.insertAdjacentElement('beforebegin', errorMessage);
    
    gsap.from(errorMessage, {
      y: -20,
      opacity: 0,
      duration: 0.5
    });

    setTimeout(() => {
      gsap.to(errorMessage, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => errorMessage.remove()
      });
    }, 5000);
  }
}
