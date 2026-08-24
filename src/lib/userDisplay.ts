export const resolveUserImageUrl = (value: unknown): string | null => {
  if (!value || typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('data:') || /^https?:\/\//i.test(trimmed)) return trimmed

  const rawBase = process.env.VUE_APP_API_BASE_URL || '/api'
  const backendOrigin = rawBase.replace(/\/api\/?$/, '')

  if (trimmed.startsWith('/')) return `${backendOrigin}${trimmed}`
  if (trimmed.includes('/storage/')) return trimmed
  if (trimmed.startsWith('storage/')) return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`

  return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`
}

export const getUserPhotoUrl = (user: Record<string, unknown> | null | undefined): string | null => {
  if (!user) return null

  const candidate =
    user.profilePhoto ||
    user.profilePhotoPath ||
    user.profile_photo ||
    user.profile_photo_url ||
    user.avatar ||
    user.avatar_url ||
    user.photo_url ||
    user.image_url ||
    null

  return resolveUserImageUrl(candidate)
}

export const getUserInitials = (name?: string | null, fallback = 'U'): string => {
  const value = String(name || '').trim()
  if (!value) return fallback

  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || fallback
  )
}

export const getUserDisplayName = (user: Record<string, unknown> | null | undefined, fallback = 'User'): string => {
  if (!user) return fallback
  return String(user.name || user.first_name || user.email || fallback)
}
