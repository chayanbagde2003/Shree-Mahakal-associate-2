export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleaned = email.trim().toLowerCase();
  const valid = emailRegex.test(cleaned);
  return {
    valid,
    cleaned,
    message: valid ? '' : 'Please enter a valid email address.'
  };
};

export const validatePhone = (phone) => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  const valid = phoneRegex.test(cleaned);
  return {
    valid,
    cleaned,
    message: valid ? '' : 'Please enter a valid 10-digit Indian phone number.'
  };
};

export const validateName = (name) => {
  const cleaned = name.trim();
  const valid = cleaned.length >= 2 && /^[a-zA-Z\s.]+$/.test(cleaned);
  return {
    valid,
    cleaned,
    message: valid ? '' : 'Please enter a valid name (minimum 2 characters, letters only).'
  };
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && (!value || (Array.isArray(value) && value.length === 0))) {
      errors[field] = `${rule.label || field} is required`;
      return;
    }
    
    if (value && rule.minLength && value.length < rule.minLength) {
      errors[field] = `${rule.label || field} must be at least ${rule.minLength} characters`;
      return;
    }
    
    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${rule.label || field} is invalid`;
      return;
    }
    
    if (value && rule.custom) {
      const customError = rule.custom(value, data);
      if (customError) {
        errors[field] = customError;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateFiles = (files, options = {}) => {
  const { maxFiles = 5, maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;
  
  if (!files || files.length === 0) {
    return { valid: true, message: '' };
  }
  
  if (files.length > maxFiles) {
    return { valid: false, message: `Maximum ${maxFiles} files allowed.` };
  }
  
  for (const file of files) {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return { valid: false, message: `File ${file.name} exceeds ${maxSizeMB}MB limit.` };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: `File ${file.name} has an unsupported format.` };
    }
  }
  
  return { valid: true, message: '' };
};

export const sanitizeText = (text) => {
  if (typeof text !== 'string') {return text;}
  return text
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const bookingValidationRules = {
  fullName: { required: true, label: 'Full Name', minLength: 2 },
  phone: { required: true, label: 'Phone Number', pattern: /^(\+91|91)?[6-9]\d{9}$/, message: 'Please enter a valid 10-digit Indian phone number.' },
  email: { required: true, label: 'Email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address.' },
  location: { required: true, label: 'Location', minLength: 2 },
  projectType: { required: true, label: 'Project Type' },
  planChoice: { required: true, label: 'Construction Plan' },
  plotSize: { required: true, label: 'Plot Size', custom: (v) => Number(v) < 500 ? 'Plot size must be at least 500 sq.ft' : '' },
  budgetRange: { required: true, label: 'Budget Range' }
};