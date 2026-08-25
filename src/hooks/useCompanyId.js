import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from './useAuth'

export function useCompanyId() {
  const { user } = useAuth()
  const [companyId, setCompanyId] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    Promise.resolve().then(async () => {
      if (cancelled) return

      if (!user) {
        setCompanyId(null)
        setRole(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', user.id)
        .single()

      if (cancelled) return
      if (error) {
        setError(error.message)
      } else {
        setCompanyId(data?.company_id ?? null)
        setRole(data?.role ?? null)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [user])

  return { companyId, role, loading, error }
}
