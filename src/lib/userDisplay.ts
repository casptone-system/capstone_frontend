export const resolveUserImageUrl = (value: unknown, userId?: number | string | null): string | null => {
  if (!value || typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('data:') || /^https?:\/\//i.test(trimmed)) return trimmed

  const rawBase = process.env.VUE_APP_API_BASE_URL || '/api'
  const backendOrigin = rawBase.replace(/\/api\/?$/, '')
  const apiBase = rawBase.endsWith('/api') || rawBase.endsWith('/api/')
    ? rawBase.replace(/\/$/, '')
    : `${backendOrigin}/api`

  // Prefer the durable API photo endpoint over ephemeral /storage/ paths.
  if (
    userId != null &&
    userId !== '' &&
    (trimmed.startsWith('profile_photos/') ||
      trimmed.includes('/storage/profile_photos/') ||
      trimmed.startsWith('storage/profile_photos/'))
  ) {
    return `${apiBase}/users/${userId}/profile-photo`
  }

  if (trimmed.includes('/profile-photo')) {
    return trimmed.startsWith('/') ? `${backendOrigin}${trimmed}` : `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`
  }

  if (trimmed.startsWith('/')) return `${backendOrigin}${trimmed}`
  if (trimmed.includes('/storage/')) {
    return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`
  }
  if (trimmed.startsWith('storage/')) return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`
  if (trimmed.startsWith('profile_photos/')) return `${backendOrigin}/storage/${trimmed}`

  return `${backendOrigin}/storage/${trimmed.replace(/^\/+/, '')}`
}

export const getUserPhotoUrl = (user: Record<string, unknown> | null | undefined): string | null => {
  if (!user) return null

  const userId = (user.id as number | string | undefined) ?? null

  const preferred =
    user.profilePhoto ||
    user.profile_photo_url ||
    user.avatar_url ||
    user.photo_url ||
    user.image_url ||
    null

  // Full API URLs / absolute URLs win.
  if (typeof preferred === 'string' && preferred.trim()) {
    const resolved = resolveUserImageUrl(preferred, userId)
    if (resolved) return resolved
  }

  const pathLike =
    user.profilePhotoPath ||
    user.profile_photo ||
    user.avatar ||
    user.photo ||
    null

  if (pathLike && userId != null && userId !== '') {
    return resolveUserImageUrl(String(pathLike), userId)
  }

  return resolveUserImageUrl(pathLike, userId)
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
