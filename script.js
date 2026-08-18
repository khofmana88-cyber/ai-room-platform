const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  nav.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
}

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

const form = document.querySelector('#inquiry-form');

if (form) {
  const success = form.querySelector('.success');
  const formError = form.querySelector('.form-error');
  const submitButton = form.querySelector('.submit-button');
  const submitButtonText = submitButton.firstChild.textContent;
  let submitting = false;

  const validate = (field) => {
    const error = field.parentElement.querySelector('.error');
    let message = '';

    if (field.validity.valueMissing) {
      message = 'Please complete this field.';
    } else if (field.validity.typeMismatch) {
      message = 'Enter a valid business email address.';
    } else if (field.validity.tooShort) {
      message = `Please provide at least ${field.minLength} characters.`;
    }

    field.setAttribute('aria-invalid', String(Boolean(message)));
    error.textContent = message;
    return !message;
  };

  form.querySelectorAll('input,select,textarea').forEach((field) => {
    field.addEventListener('blur', () => validate(field));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validate(field);
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (submitting) return;

    const fields = [...form.querySelectorAll('input,select,textarea')];
    const valid = fields.map(validate).every(Boolean);

    if (!valid) {
      fields.find((field) => field.getAttribute('aria-invalid') === 'true')?.focus();
      return;
    }

    submitting = true;
    submitButton.disabled = true;
    submitButton.classList.add('is-submitting');
    submitButton.firstChild.textContent = 'Sending...';
    formError.hidden = true;
    success.classList.remove('show');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) throw new Error('Form submission failed');

      success.classList.add('show');
      success.focus();
    } catch (error) {
      formError.hidden = false;
      formError.focus();
    } finally {
      submitting = false;
      submitButton.disabled = false;
      submitButton.classList.remove('is-submitting');
      submitButton.firstChild.textContent = submitButtonText;
    }
  });

  form.querySelector('.reset-form').addEventListener('click', () => {
    success.classList.remove('show');
    formError.hidden = true;
    form.reset();
    form.querySelectorAll('[aria-invalid]').forEach((field) => {
      field.setAttribute('aria-invalid', 'false');
    });
    form.querySelectorAll('.error').forEach((error) => {
      error.textContent = '';
    });
    form.querySelector('input')?.focus();
  });
}
