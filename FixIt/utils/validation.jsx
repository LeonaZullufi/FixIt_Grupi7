export const VALIDATION_PATTERNS = {
  name: /^[A-Za-zÀ-ž\s]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export const VALIDATION_MESSAGES = {
  firstName: {
    required: "Emri është i detyrueshëm.",
    invalid: "Emri nuk është valid (vetëm shkronja).",
  },
  lastName: {
    required: "Mbiemri është i detyrueshëm.",
    invalid: "Mbiemri nuk është valid (vetëm shkronja).",
  },
  email: {
    required: "Email është i detyrueshëm.",
    invalid: "Email nuk është në format të saktë.",
  },
  currentPassword: {
    required: "Password-i aktual kërkohet për ruajtje.",
  },
  newPassword: {
    minLength: "Password-i i ri duhet të ketë të paktën 6 karaktere.",
  },
  confirmPassword: {
    mismatch: "Password-et e reja nuk përputhen.",
  },
};

/**
 * @param {Object} form
 * @param {Object} initialForm
 * @returns {Object}
 */
export const validateProfileForm = (form, initialForm) => {
  if (!initialForm) return {};

  const errors = {};
  const emailChanged = form.email !== initialForm.email;
  const passwordChanged = form.newPassword.length > 0;
  const dataChanged =
    form.firstName !== initialForm.firstName ||
    form.lastName !== initialForm.lastName;
  const requiresPassword = emailChanged || passwordChanged || dataChanged;

  if (!form.firstName.trim()) {
    errors.firstName = VALIDATION_MESSAGES.firstName.required;
  } else if (!VALIDATION_PATTERNS.name.test(form.firstName)) {
    errors.firstName = VALIDATION_MESSAGES.firstName.invalid;
  }

  if (!form.lastName.trim()) {
    errors.lastName = VALIDATION_MESSAGES.lastName.required;
  } else if (!VALIDATION_PATTERNS.name.test(form.lastName)) {
    errors.lastName = VALIDATION_MESSAGES.lastName.invalid;
  }

  if (!form.email.trim()) {
    errors.email = VALIDATION_MESSAGES.email.required;
  } else if (!VALIDATION_PATTERNS.email.test(form.email)) {
    errors.email = VALIDATION_MESSAGES.email.invalid;
  }

  if (requiresPassword && !form.currentPassword) {
    errors.currentPassword = VALIDATION_MESSAGES.currentPassword.required;
  }

  if (passwordChanged) {
    if (form.newPassword.length < 6) {
      errors.newPassword = VALIDATION_MESSAGES.newPassword.minLength;
    }

    if (form.newPassword !== form.confirmPassword) {
      errors.confirmPassword = VALIDATION_MESSAGES.confirmPassword.mismatch;
    }
  }

  return errors;
};
