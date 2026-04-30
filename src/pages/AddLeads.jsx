import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { calculateScore } from '../lib/scoring'

const initialForm = {
  name: '',
  phone: '',
  service_type: 'salon',
  message: '',
  source: 'whatsapp',
  budget_range: 'medium',
  urgency: 'normal',
  notes: '',
}

export default function AddLead() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Live score preview as user fills form
  const liveScore = calculateScore(form)

  async function checkRepeatCustomer(phone) {
    const { data } = await supabase
      .from('customer_history')
      .select('*')
      .eq('phone', phone)
      .order('visit_date', { ascending: false })
      .limit(1)
    return data && data.length > 0 ? data[0] : null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { score, priority, conversion_probability } = calculateScore(form)
      const repeatCustomer = await checkRepeatCustomer(form.phone)

      const { error: insertError } = await supabase.from('leads').insert([{
        ...form,
        score,
        priority,
        conversion_probability,
        is_repeat_customer: !!repeatCustomer,
        status: 'new',
        follow_up_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }])

      if (insertError) throw insertError
      navigate('/leads')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const priorityStyles = {
    hot: 'bg-red-50 border-red-200 text-red-700',
    warm: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    cold: 'bg-blue-50 border-blue-200 text-blue-700',
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Add New Lead</h2>
        <p className="text-sm text-gray-500 mt-1">Lead score updates live as you fill the form</p>
      </div>

      {/* Live score preview */}
      <div className={`border rounded-xl p-4 mb-6 ${priorityStyles[liveScore.priority]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Live Score Preview</p>
            <p className="text-xs mt-0.5 opacity-75">Updates as you fill the form</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{liveScore.score}</p>
            <p className="text-xs font-medium uppercase tracking-wide">{liveScore.priority} lead</p>
          </div>
        </div>
        <div className="mt-2 bg-white bg-opacity-50 rounded-lg h-2">
          <div
            className="h-2 rounded-lg transition-all duration-300"
            style={{
              width: `${liveScore.conversion_probability}%`,
              background: liveScore.priority === 'hot' ? '#ef4444' : liveScore.priority === 'warm' ? '#f59e0b' : '#3b82f6'
            }}
          />
        </div>
        <p className="text-xs mt-1 opacity-75">{liveScore.conversion_probability}% conversion probability</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Customer name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="91XXXXXXXXXX"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select name="service_type" value={form.service_type} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
              <option value="salon">Salon</option>
              <option value="clinic">Clinic</option>
              <option value="repair">Repair Shop</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select name="source" value={form.source} onChange={handleChange}
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
            <select name="budget_range" value={form.budget_range} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
            <select name="urgency" value={form.urgency} onChange={handleChange}
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
          <textarea name="message" value={form.message} onChange={handleChange}
            placeholder="What did they ask about?"
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange}
            placeholder="Any personal notes about this lead..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Lead'}
        </button>
      </form>
    </div>
  )
}