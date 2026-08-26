import { supabase } from '../supabase'

const TABLE = 'activities'

export async function listActivities() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, leads(name, company_name, status)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function listActivitiesForLead(leadId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createActivity(payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select('*, leads(name)')
    .single()

  if (error) throw error
  return data
}
