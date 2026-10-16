export const validateRequired = (value: string | null | undefined, fieldName = 'This field') => {
  const trimmedValue = value?.toString().trim() || ''

  if (!trimmedValue) {
    return `${fieldName} is required.`
  }

  return ''
}

export const INSTITUTIONAL_EMAIL_DOMAIN = 'isu.edu.ph'

export const validateEmail = (
  value: string | null | undefined,
  options: { institutionalOnly?: boolean } = {}
) => {
  const trimmedValue = value?.toString().trim() || ''

  if (!trimmedValue) {
    return 'Email is required.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
    return 'Please enter a valid email address.'
  }

  if (options.institutionalOnly) {
    const domain = INSTITUTIONAL_EMAIL_DOMAIN.toLowerCase()
    if (!trimmedValue.toLowerCase().endsWith(`@${domain}`)) {
      return `Use your institutional email (@${INSTITUTIONAL_EMAIL_DOMAIN}).`
    }
  }

  return ''
}

export const validatePhoneNumber = (value: string | null | undefined) => {
  const trimmedValue = value?.toString().trim() || ''

  if (!trimmedValue) {
    return 'Phone number is required.'
  }

  if (!/^\d{1,12}$/.test(trimmedValue)) {
    return 'Phone number must contain numbers only, up to 12 digits.'
  }

  return ''
}

export const validateMinimumAge = (value: string | null | undefined, minimumAge = 21) => {
  const trimmedValue = value?.toString().trim() || ''

  if (!trimmedValue) {
    return 'Birth date is required.'
  }

  const birthDate = new Date(`${trimmedValue}T00:00:00`)
  if (Number.isNaN(birthDate.getTime())) {
    return 'Enter a valid birth date.'
  }

  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setFullYear(cutoff.getFullYear() - minimumAge)

  if (birthDate > cutoff) {
    return `You must be at least ${minimumAge} years old to register.`
  }

  return ''
}

export const validatePasswordStrength = (value: string | null | undefined) => {
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
