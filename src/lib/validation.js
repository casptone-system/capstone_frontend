export const validateRequired = (value, fieldName = 'This field') => {
  const trimmedValue = value?.toString().trim() || ''

  if (!trimmedValue) {
    return `${fieldName} is required.`
  }

  return ''
}

export const validateEmail = (value) => {
  const trimmedValue = value?.toString().trim() || ''

  if (!trimmedValue) {
    return 'Email is required.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
    return 'Please enter a valid email address.'
  }

  return ''
}

export const validatePasswordStrength = (value) => {
  const trimmedValue = value?.toString() || ''

  if (!trimmedValue) {
    return 'Password is required.'
  }

  if (trimmedValue.length < 8) {
    return 'Password must be at least 8 characters.'
  }

  if (!/[A-Z]/.test(trimmedValue)) {
    return 'Password must include at least one uppercase letter.'
  }

  if (!/[0-9]/.test(trimmedValue)) {
    return 'Password must include at least one number.'
  }

  return ''
}
