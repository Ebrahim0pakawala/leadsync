import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getPriorityColor } from '../lib/scoring'
import { generateWhatsAppMessage } from '../lib/ai'

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost']

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [history, setHistory] = useState([])
  const [interactions, setInteractions] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiMessage, setAiMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [tone, setTone] = useState('friendly')
  const [statusUpdating, setStatusUpdating] = useState(false)

  async function fetchAll() {
    const { data: leadData } = await supabase
      .from('leads').select('*').eq('id', id).single()

    const { data: historyData } = leadData
      ? await supabase.from('customer_history').select('*')
          .eq('phone', leadData.phone)
          .order('visit_date', { ascending: false })
          .limit(3)
      : { data: [] }

    const { data: interactionData } = await supabase
      .from('interactions').select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })

    setLead(leadData)
    setHistory(historyData || [])
    setInteractions(interactionData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
  }, [id])

  async function generateMessage() {
    if (!lead) return
    setAiLoading(true)
    setAiMessage('')
    try {
      const message = await generateWhatsAppMessage(lead, tone)
      setAiMessage(message)
    } catch (err) {
      setAiMessage('Could not generate message: ' + err.message)
    }
    setAiLoading(false)
  }

  async function updateStatus(newStatus) {
    setStatusUpdating(true)
    await supabase.from('leads').update({ status: newStatus }).eq('id', id)
    await supabase.from('interactions').insert([{
      lead_id: id,
      type: 'status_change',
      note: `Status changed to ${newStatus}`,
    }])
    setLead(prev => ({ ...prev, status: newStatus }))
    setStatusUpdating(false)
  }

  async function logInteraction(type, note) {
    await supabase.from('interactions').insert([{
      lead_id: id,
      type,
      note,
      sent_message: type === 'whatsapp' ? aiMessage : null,
    }])
    await supabase.from('leads').update({ last_contacted: new Date().toISOString() }).eq('id', id)
    fetchAll()
  }

  function openWhatsApp() {
    if (!aiMessage || !lead) return
    const phone = lead.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(aiMessage)}`, '_blank')
    logInteraction('whatsapp', 'Sent WhatsApp message')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading lead...</p>
    </div>
  )

  if (!lead) return (
    <div className="text-center py-12">
      <p className="text-gray-400 text-sm">Lead not found.</p>
      <button onClick={() => navigate('/leads')} className="mt-4 text-sm text-gray-600 underline">Back to leads</button>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => navigate('/leads')} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
        <button onClick={() => navigate(`/leads/${id}/edit`)}
          className="text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          ✏️ Edit Lead
        </button>
      </div>

      {/* Lead card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-semibold text-gray-900">{lead.name}</h2>
              {lead.is_repeat_customer && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">↩ returning customer</span>
              )}
            </div>
            <p className="text-sm text-gray-500">{lead.phone} · {lead.service_type} · via {lead.source}</p>
            {lead.message && (
              <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2">"{lead.message}"</p>
            )}
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <div className="text-3xl font-bold text-gray-900">{lead.score}</div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPriorityColor(lead.priority)}`}>
              {lead.priority} lead
            </span>
            <p className="text-xs text-gray-400 mt-1">{lead.conversion_probability}% conversion chance</p>
          </div>
        </div>

        {/* Status pipeline */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-3">Pipeline Status</p>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} onClick={() => updateStatus(s)} disabled={statusUpdating}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors capitalize ${
                  lead.status === s
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Repeat customer history */}
      {lead.is_repeat_customer && history.length > 0 && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
          <p className="text-sm font-medium text-purple-900 mb-3">↩ Returning Customer History</p>
          <div className="space-y-2">
            {history.map(h => (
              <div key={h.id} className="flex justify-between items-center text-sm">
                <span className="text-purple-700">{h.service_type}</span>
                <span className="text-purple-500 text-xs">{new Date(h.visit_date).toLocaleDateString('en-IN')}</span>
                {h.amount_paid && <span className="text-purple-700 font-medium">₹{h.amount_paid}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Message Generator */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className="text-sm font-medium text-gray-900 mb-4">AI Follow-up Message</p>

        {/* Tone toggle */}
        <div className="flex gap-2 mb-4">
          {['friendly', 'formal', 'urgent'].map(t => (
            <button key={t}
              onClick={() => { setTone(t); setAiMessage('') }}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                tone === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
              {t === 'friendly' ? '😊 Friendly' : t === 'formal' ? '💼 Formal' : '⚡ Urgent'}
            </button>
          ))}
        </div>

        <button onClick={generateMessage} disabled={aiLoading}
          className="w-full border border-gray-200 text-gray-700 text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 mb-3 flex items-center justify-center gap-2">
          {aiLoading
            ? <><span className="animate-spin inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full" /> Generating...</>
            : '✨ Generate WhatsApp Message'}
        </button>

        {aiMessage && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <p className="text-sm text-gray-800 leading-relaxed">{aiMessage}</p>
            </div>
            <button onClick={openWhatsApp}
              className="w-full bg-green-600 text-white text-sm py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium">
              📱 Open in WhatsApp
            </button>
          </div>
        )}
      </div>

      {/* Interaction timeline */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <p className="text-sm font-medium text-gray-900 mb-4">Activity Timeline</p>
        {interactions.length === 0 ? (
          <p className="text-xs text-gray-400">No interactions yet. Update status or send a message to log activity.</p>
        ) : (
          <div className="space-y-3">
            {interactions.map(i => (
              <div key={i.id} className="flex gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-700 capitalize">{i.type.replace('_', ' ')} — {i.note}</p>
                  {i.sent_message && <p className="text-xs text-gray-400 mt-0.5">"{i.sent_message}"</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(i.created_at).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}