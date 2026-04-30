import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { generateWhatsAppMessage } from '../lib/ai'
import { getPriorityColor } from '../lib/scoring'

export default function Revival() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState({})
  const [generating, setGenerating] = useState({})

  useEffect(() => {
    fetchColdLeads()
  }, [])

  async function fetchColdLeads() {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 0)

    const { data } = await supabase
      .from('leads')
      .select('*')
      .not('status', 'in', '("won","lost")')
      .lt('created_at', cutoff.toISOString())
      .order('score', { ascending: false })

    setLeads(data || [])
    setLoading(false)
  }

  async function generateRevivalMessage(lead) {
    setGenerating(prev => ({ ...prev, [lead.id]: true }))
    try {
      const message = await generateWhatsAppMessage(lead, 'revival')
      setMessages(prev => ({ ...prev, [lead.id]: message }))
    } catch (err) {
      setMessages(prev => ({ ...prev, [lead.id]: 'Could not generate message.' }))
    }
    setGenerating(prev => ({ ...prev, [lead.id]: false }))
  }
  

  const [generatingAll, setGeneratingAll] = useState(false)

  async function generateAll() {
    setGeneratingAll(true)
    for (const lead of leads) {
      await generateRevivalMessage(lead)
    }
    setGeneratingAll(false)
  }

  function openWhatsApp(lead) {
    const msg = messages[lead.id]
    if (!msg) return
    const phone = lead.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
    
    // Log interaction + mark as revival candidate done
    supabase.from('interactions').insert([{
      lead_id: lead.id,
      type: 'revival',
      note: 'Revival message sent',
      sent_message: msg,
    }])
    supabase.from('leads').update({
      last_contacted: new Date().toISOString(),
      is_revival_candidate: false,
      status: 'contacted',
    }).eq('id', lead.id)

    // Remove from list optimistically
    setLeads(prev => prev.filter(l => l.id !== lead.id))
  }

  const daysSince = (date) =>
    Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Revival Queue</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Finding cold leads...' : `${leads.length} leads went cold — here's how to win them back`}
          </p>
        </div>
        {leads.length > 0 && (
          <button
            onClick={generateAll}
            disabled={generatingAll}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            {generatingAll ? (
                <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                Generating...</>
            ) : '✨ Generate All Messages'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Scanning for cold leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-2xl mb-3">🎉</p>
          <p className="text-gray-700 font-medium">No cold leads right now</p>
          <p className="text-gray-400 text-sm mt-1">All your leads are either active or closed. Check back later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map(lead => (
            <div key={lead.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(lead.priority)}`}>
                      {lead.priority}
                    </span>
                    {lead.is_repeat_customer && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">↩ returning</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {lead.service_type} · {lead.phone} · went cold {daysSince(lead.created_at)} days ago
                  </p>
                  {lead.message && (
                    <p className="text-xs text-gray-400 mt-1">"{lead.message}"</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-lg font-bold text-gray-900">{lead.score}</p>
                  <p className="text-xs text-gray-400">score</p>
                </div>
              </div>

              {/* Message area */}
              {messages[lead.id] ? (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                    <p className="text-sm text-gray-800 leading-relaxed">{messages[lead.id]}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openWhatsApp(lead)}
                      className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                      📱 Send via WhatsApp
                    </button>
                    <button
                        onClick={() => generateRevivalMessage(lead)}
                        disabled={generating[lead.id]}
                        className="border border-gray-200 text-gray-600 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                        {generating[lead.id] ? (
                            <span className="animate-spin inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full" />
                        ) : '🔄'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => generateRevivalMessage(lead)}
                  disabled={generating[lead.id]}
                  className="w-full border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                  {generating[lead.id] ? 'Generating...' : '✨ Generate Revival Message'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}