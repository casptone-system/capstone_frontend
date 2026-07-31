type MockAuthClient = {
  signInWithPassword: (credentials: { email: string; password: string }) => Promise<{ data: any; error: any }>
  signInWithOAuth: (options: any) => Promise<{ data: any; error: any }>
  signUp: (options: any) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  getSession: () => Promise<{ data: any; error: any }>
  getUser: () => Promise<{ data: { user: any | null }; error: any }>
  onAuthStateChange: (callback: (event: string, session: any) => void) => { subscription: { unsubscribe: () => void } }
}

const mockAuth: MockAuthClient = {
  signInWithPassword: async () => ({ data: { user: null }, error: null }),
  signInWithOAuth: async () => ({ data: null, error: null }),
  signUp: async () => ({ data: { user: null }, error: null }),
  signOut: async () => ({ error: null }),
  getSession: async () => ({ data: { session: null }, error: null }),
  getUser: async () => ({ data: { user: null }, error: null }),
  onAuthStateChange: () => ({ subscription: { unsubscribe: () => undefined } })
}

export const supabase = {
  auth: mockAuth,
  from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
    update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }) }),
    insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
    delete: () => ({ eq: async () => ({ data: null, error: null }) })
  }),
  storage: {
    from: () => ({
      upload: async () => ({ error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      remove: async () => ({ error: null })
    })
  }
}

export default supabase