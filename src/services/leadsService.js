import { supabase } from '../supabase'

const TABLE = 'leads'

export async function listLeads() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function listLeadMetricsRaw() {
  const { data, error } = await supabase.from(TABLE).select('status, estimated_value')
  if (error) throw error
  return data
}

export async function createLead(companyId, payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ ...payload, company_id: companyId }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLead(id, payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteLead(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}
