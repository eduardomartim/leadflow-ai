import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null)
      } else if (session) {
        setSession(session)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  function signUp({ email, password, fullName, companyName }) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, company_name: companyName },
      },
    })
  }

  function signIn({ email, password }) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  function signOut() {
    return supabase.auth.signOut()
  }

  function signInDemo() {
    return supabase.auth.signInAnonymously()
  }

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signUp,
    signIn,
    signOut,
    signInDemo,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
