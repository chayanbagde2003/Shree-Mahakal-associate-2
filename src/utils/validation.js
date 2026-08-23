/**
 * Validation Utilities
 * Form validation and sanitization functions.
 */

/**
 * Email validation
 */
export const validateEmail = (email) => {
  if (!email) {return { valid: false, message: 'Email is required' };}
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  if (email.length > 100) {
    return { valid: false, message: 'Email is too long (max 100 characters)' };
  }
  
  return { valid: true };
};

/**
 * Phone validation (Indian format)
 */
export const validatePhone = (phone) => {
  if (!phone) { return { valid: false, message: 'Phone number is required' }; }
  
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Indian phone number: optionally +91/91, then 10 digits starting with 6-9
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, message: 'Please enter a valid Indian phone number (10 digits)' };
  }
  
  return { valid: true, cleaned };
};

/**
 * Name validation
 */
export const validateName = (name) => {
  if (!name) {return { valid: false, message: 'Name is required' };}
  
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, message: 'Name is too long (max 100 characters)' };
  }
  
  // Allow letters, spaces, dots, hyphens
  const nameRegex = /^[a-zA-Z\s.'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { valid: false, message: 'Name contains invalid characters' };
  }
  
  return { valid: true, cleaned: trimmed };
};

/**
 * Address validation
 */
export const validateAddress = (address) => {
  if (!address) {return { valid: false, message: 'Address is required' };}
  
  const trimmed = address.trim();
  if (trimmed.length < 10) {
    return { valid: false, message: 'Please enter a complete address (min 10 characters)' };
  }
  
  if (trimmed.length > 500) {
    return { valid: false, message: 'Address is too long (max 500 characters)' };
  }
  
  return { valid: true, cleaned: trimmed };
};

/**
 * Description/textarea validation
 */
export const validateDescription = (text, maxLength = 2000, minLength = 0, fieldName = 'Description') => {
  if (!text && minLength > 0) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  if (text && text.length > maxLength) {
    return { valid: false, message: `${fieldName} is too long (max ${maxLength} characters)` };
  }
  
  if (text && text.length < minLength) {
    return { valid: false, message: `${fieldName} must be at least ${minLength} characters` };
  }
  
  return { valid: true, cleaned: text ? text.trim() : '' };
};

/**
 * Required field validation
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
};

/**
 * Number validation
 */
export const validateNumber = (value, fieldName, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  if (!value && value !== 0) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  const num = parseInt(value);
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a valid number` };
  }
  
  if (num < min) {
    return { valid: false, message: `${fieldName} must be at least ${min}` };
  }
  
  if (num > max) {
    return { valid: false, message: `${fieldName} cannot exceed ${max}` };
  }
  
  return { valid: true, value: num };
};

/**
 * Select/dropdown validation
 */
export const validateSelect = (value, fieldName, allowedValues = []) => {
  if (!value) {
    return { valid: false, message: `Please select a ${fieldName}` };
  }
  
  if (allowedValues.length > 0 && !allowedValues.includes(value)) {
    return { valid: false, message: `Invalid ${fieldName} selected` };
  }
  
  return { valid: true };
};

/**
 * File validation
 */
export const validateFile = (file, options = {}) => {
  const { 
    maxSizeMB = 5, 
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    required = false 
  } = options;
  
  if (!file) {
    if (required) {
      return { valid: false, message: 'File is required' };
    }
    return { valid: true };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: `File type not allowed. Allowed: ${allowedTypes.join(', ')}` };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, message: `File size exceeds ${maxSizeMB}MB limit` };
  }
  
  return { valid: true };
};

/**
 * Validate multiple files
 */
export const validateFiles = (files, options = {}) => {
  const { maxFiles = 5, ...fileOptions } = options;
  
  if (!files || files.length === 0) {
    if (options.required) {
      return { valid: false, message: 'At least one file is required' };
    }
    return { valid: true };
  }
  
  if (files.length > maxFiles) {
    return { valid: false, message: `Maximum ${maxFiles} files allowed` };
  }
  
  for (const file of files) {
    const result = validateFile(file, fileOptions);
    if (!result.valid) {
      return result;
    }
  }
  
  return { valid: true };
};

/**
 * Sanitize HTML to prevent XSS
 */
export const sanitizeHtml = (html) => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Sanitize text input (remove potentially dangerous characters)
 */
export const sanitizeText = (text) => {
  if (!text) {return '';}
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate entire form
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = formData[field];
    
    for (const rule of fieldRules) {
      const result = rule(value);
      if (!result.valid) {
        errors[field] = result.message;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  }
  
  return { isValid, errors };
};

/**
 * Common validation rules for booking form
 */
export const bookingValidationRules = {
  fullName: [
    (v) => validateRequired(v, 'Full Name'),
    (v) => validateName(v)
  ],
  phone: [
    (v) => validateRequired(v, 'Phone Number'),
    (v) => validatePhone(v)
  ],
  email: [
    (v) => validateRequired(v, 'Email'),
    (v) => validateEmail(v)
  ],
  service: [
    (v) => validateRequired(v, 'Service')
  ],
  projectType: [
    (v) => validateRequired(v, 'Project Type')
  ],
  location: [
    (v) => validateRequired(v, 'Location'),
    (v) => validateDescription(v, 200, 5, 'Location')
  ],
  address: [
    (v) => validateRequired(v, 'Address'),
    (v) => validateAddress(v)
  ],
  plotSize: [
    (v) => validateNumber(v, 'Plot Size', 100, 100000)
  ],
  description: [
    (v) => validateDescription(v, 2000, 0, 'Project Description')
  ]
};

export default {
  validateEmail,
  validatePhone,
  validateName,
  validateAddress,
  validateDescription,
  validateRequired,
  validateNumber,
  validateSelect,
  validateFile,
  validateFiles,
  sanitizeHtml,
  sanitizeText,
  validateForm,
  bookingValidationRules
};