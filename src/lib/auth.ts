import type { User } from '@/types'
import apiClient, { TOKEN_KEY } from '@/lib/apiClient'

export interface AuthResponse {
  user: User | null
  error: string | null
}

export interface SessionResponse {
  session: any | null
  error: string | null
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

function setToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token)
  } else {
    window.localStorage.removeItem(TOKEN_KEY)
  }
}

function mapApiUser(apiUser: any): User {
  const roles: string[] = apiUser.roles || []
  return {
    id: String(apiUser.id),
    name: apiUser.name || '',
    email: apiUser.email || '',
    role: (roles[0] || 'faculty') as User['role'],
    institution: apiUser.institution || '',
    avatar: apiUser.avatar,
    createdAt: apiUser.created_at,
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await apiClient.post('/login', { email, password })
    const { token, user: apiUser } = response.data.data
    setToken(token)
    const user = mapApiUser(apiUser)
    return { user, error: null }
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.errors?.email?.[0] ||
      'Login failed'
    return { user: null, error: message }
  }
}

export async function signInWithGoogle(): Promise<AuthResponse> {
  return {
    user: null,
    error: 'Google login is not available. Please sign in with your email and password.',
  }
}

export async function signInWithGithub(): Promise<AuthResponse> {
  return {
    user: null,
    error: 'GitHub login is not available. Please sign in with your email and password.',
  }
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: string = 'faculty',
  institution: string = 'State University',
): Promise<AuthResponse> {
  try {
    const response = await apiClient.post('/register', { email, password, name, role, institution })
    const { token, user: apiUser } = response.data.data
    setToken(token)
    const user = mapApiUser(apiUser)
    return { user, error: null }
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.errors?.email?.[0] ||
      err.response?.data?.errors?.password?.[0] ||
      'Registration failed'
    return { user: null, error: message }
  }
}

export async function signOutUser(): Promise<{ error: string | null }> {
  try {
    await apiClient.post('/logout')
  } catch (err: any) {
    console.warn('Logout API warning:', err.response?.data?.message || err.message)
  } finally {
    setToken(null)
  }
  return { error: null }
}

export async function getCurrentSession(): Promise<SessionResponse> {
  const token = getToken()
  if (!token) {
    return { session: null, error: null }
  }
  try {
    const response = await apiClient.get('/me')
    return { session: { user: response.data.data }, error: null }
  } catch (err: any) {
    setToken(null)
    return { session: null, error: null }
  }
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const token = getToken()
  if (!token) {
    return { user: null, error: 'No authenticated user' }
  }
  try {
    const response = await apiClient.get('/me')
    const user = mapApiUser(response.data.data)
    return { user, error: null }
  } catch (err: any) {
    const message = err.response?.data?.message || 'Failed to fetch user profile'
    setToken(null)
    return { user: null, error: message }
  }
}

// eslint-disable-next-line no-unused-vars
export function onAuthStateChange(callback: (user: User | null) => void) {
  // Token-based auth has no real-time subscription.
  // Check the token once and notify the listener. The listener
  // callback will fetch the user profile if a token is present.
  const token = getToken()
  if (token) {
    callback({} as User)
  } else {
    callback(null)
  }

  return {
    subscription: {
      unsubscribe: () => undefined,
    },
  }
}
