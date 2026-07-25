import { supabase } from './supabase'
import type { User } from '@/types'

export interface AuthResponse {
  user: User | null
  error: string | null
}

export interface SessionResponse {
  session: any | null
  error: string | null
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    if (data.user) {
      // Fetch the user's profile from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is okay for new users
        console.warn('Profile fetch error:', profileError)
      }

      const user: User = {
        id: data.user.id,
        name: profile?.name || data.user.email?.split('@')[0] || 'User',
        email: data.user.email || '',
        role: profile?.role || 'faculty',
        institution: profile?.institution || 'State University',
        avatar: profile?.avatar || undefined,
        createdAt: data.user.created_at
      }

      return { user, error: null }
    }

    return { user: null, error: 'No user returned' }
  } catch (err: any) {
    return { user: null, error: err.message || 'Login failed' }
  }
}

export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    })

    if (error) throw error

    // OAuth redirects away, so we won't get user data here
    return { user: null, error: null }
  } catch (err: any) {
    return { user: null, error: err.message || 'Google login failed' }
  }
}

export async function signInWithGithub(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    })

    if (error) throw error

    return { user: null, error: null }
  } catch (err: any) {
    return { user: null, error: err.message || 'GitHub login failed' }
  }
}

export async function signUp(email: string, password: string, name: string, role: string = 'faculty', institution: string = 'State University'): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          institution
        }
      }
    })

    if (error) throw error

    return { user: null, error: null }
  } catch (err: any) {
    return { user: null, error: err.message || 'Sign up failed' }
  }
}

export async function signOutUser(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (err: any) {
    return { error: err.message || 'Logout failed' }
  }
}

export async function getCurrentSession(): Promise<SessionResponse> {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return { session: data.session, error: null }
  } catch (err: any) {
    return { session: null, error: err.message }
  }
}

export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!authUser) return { user: null, error: 'No authenticated user' }

    // Fetch the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('Profile fetch error:', profileError)
    }

    const user: User = {
      id: authUser.id,
      name: profile?.name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      role: profile?.role || 'faculty',
      institution: profile?.institution || 'State University',
      avatar: profile?.avatar || undefined,
      createdAt: authUser.created_at
    }

    return { user, error: null }
  } catch (err: any) {
    return { user: null, error: err.message || 'Failed to get user' }
  }
}

// eslint-disable-next-line no-unused-vars
export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      callback(session?.user || null)
    } else if (event === 'SIGNED_OUT') {
      callback(null)
    }
  })
}