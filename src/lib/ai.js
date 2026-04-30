import { supabase } from '../supabaseClient'

export async function generateWhatsAppMessage(lead, tone) {
  const { data, error } = await supabase.functions.invoke('generate-message', {
    body: { lead, tone },
  })
  console.log('Full response:', JSON.stringify(data))
  if (error) throw error
  if (!data?.message) throw new Error('No message returned: ' + JSON.stringify(data))
  return data.message
}