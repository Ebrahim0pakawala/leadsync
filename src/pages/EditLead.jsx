import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { calculateScore } from '../lib/scoring'

export default function EditLead() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchLead() {
      const { data } = await supabase.from('leads').select('*').eq('id', id).single()
      setForm(data)
      setLoading(false)
    }
    fetchLead()
  }, [id])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const liveScore = form ? calculateScore(form) : null

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { score, priority, conversion_probability } = calculateScore(form)
      const { error: updateError } = await supabase
        .from('leads')
        .update({ ...form, score, priority, conversion_probability })
        .eq('id', id)
      if (updateError) throw updateError
      navigate(`/leads/${id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteLead() {
    if (!window.confirm('Delete this lead? This cannot be undone.')) return
    await supabase.from('leads').delete().eq('id', id)
    navigate('/leads')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  )

  const priorityStyles = {
    hot: 'bg-red-50 border-red-200 text-red-700',
    warm: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    cold: 'bg-blue-50 border-blue-200 text-blue-700',
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/leads/${id}`)} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
        <h2 className="text-xl font-semibold text-gray-900">Edit Lead</h2>
      </div>

      {/* Live score preview */}
      {liveScore && (
        <div className={`border rounded-xl p-4 mb-6 ${priorityStyles[liveScore.priority]}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Live Score Preview</p>
              <p className="text-xs mt-0.5 opacity-75">Updates as you edit</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{liveScore.score}</p>
              <p className="text-xs font-medium uppercase tracking-wide">{liveScore.priority} lead</p>
            </div>
          </div>
          <div className="mt-2 bg-white bg-opacity-50 rounded-lg h-2">
            <div className="h-2 rounded-lg transition-all duration-300"
              style={{
                width: `${liveScore.conversion_probability}%`,
                background: liveScore.priority === 'hot' ? '#ef4444' : liveScore.priority === 'warm' ? '#f59e0b' : '#3b82f6'
              }} />
          </div>
          <p className="text-xs mt-1 opacity-75">{liveScore.conversion_probability}% conversion probability</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input name="name" value={form.name || ''} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input name="phone" value={form.phone || ''} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select name="service_type" value={form.service_type || 'salon'} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
              <option value="salon">Salon</option>
              <option value="clinic">Clinic</option>
              <option value="repair">Repair Shop</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select name="source" value={form.source || 'manual'} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
              <option value="whatsapp">WhatsApp</option>
              <option value="referral">Referral</option>
              <option value="instagram">Instagram</option>
              <option value="website">Website</option>
              <option value="manual">Manual / Walk-in</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
            <select name="budget_range" value={form.budget_range || 'medium'} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
            <select name="urgency" value={form.urgency || 'normal'} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
              <option value="immediate">Immediate</option>
              <option value="thisweek">This Week</option>
              <option value="normal">Normal</option>
              <option value="justlooking">Just Looking</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Their Message / Enquiry</label>
          <textarea name="message" value={form.message || ''} onChange={handleChange}
            rows={3} placeholder="What did they ask about?"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Notes</label>
          <textarea name="notes" value={form.notes || ''} onChange={handleChange}
            rows={2} placeholder="Any personal notes..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? (
              <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
              Saving...</>
            ) : 'Save Changes'}
          </button>
          <button type="button" onClick={deleteLead}
            className="border border-red-200 text-red-600 rounded-lg px-4 py-2.5 text-sm hover:bg-red-50 transition-colors">
            Delete
          </button>
        </div>
      </form>
    </div>
  )
}

