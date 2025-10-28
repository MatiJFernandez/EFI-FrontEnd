// Validación de email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validación de contraseña
export const isValidPassword = (password) => {
  // Al menos 6 caracteres, una mayúscula, una minúscula y un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

// Validación de nombre de usuario
export const isValidUsername = (username) => {
  // Al menos 3 caracteres, solo letras, números y guiones bajos
  const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
  return usernameRegex.test(username);
};

// Validación de nombre
export const isValidName = (name) => {
  // Al menos 2 caracteres, solo letras y espacios
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
  return nameRegex.test(name);
};

// Mensajes de error predefinidos
export const errorMessages = {
  required: 'Este campo es requerido',
  email: 'Ingresa un correo electrónico válido',
  password: 'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número',
  passwordMatch: 'Las contraseñas no coinciden',
  username: 'El nombre de usuario debe tener al menos 3 caracteres y solo puede contener letras, números y guiones bajos',
  name: 'El nombre debe contener solo letras y tener al menos 2 caracteres',
};

// Función para validar un campo específico
export const validateField = (name, value, formData = {}) => {
  if (!value) {
    return errorMessages.required;
  }

  switch (name) {
    case 'email':
      return isValidEmail(value) ? '' : errorMessages.email;
    
    case 'password':
      return isValidPassword(value) ? '' : errorMessages.password;
    
    case 'confirmPassword':
      return value === formData.password ? '' : errorMessages.passwordMatch;
    
    case 'username':
      return isValidUsername(value) ? '' : errorMessages.username;
    
    case 'firstName':
    case 'lastName':
      return isValidName(value) ? '' : errorMessages.name;
    
    default:
      return '';
  }
};

// Función para validar todo el formulario
export const validateForm = (formData) => {
  const errors = {};
  Object.keys(formData).forEach(key => {
    const error = validateField(key, formData[key], formData);
    if (error) {
      errors[key] = error;
    }
  });
  return errors;
};