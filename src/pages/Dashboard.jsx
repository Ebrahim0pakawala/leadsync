import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, hot: 0, warm: 0, cold: 0, won: 0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase.from('leads').select('priority, status')
      if (data) {
        setStats({
          total: data.length,
          hot: data.filter(l => l.priority === 'hot').length,
          warm: data.filter(l => l.priority === 'warm').length,
          cold: data.filter(l => l.priority === 'cold').length,
          won: data.filter(l => l.status === 'won').length,
        })
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Total Leads', value: stats.total, color: 'text-gray-900' },
    { label: 'Hot Leads', value: stats.hot, color: 'text-red-600' },
    { label: 'Warm Leads', value: stats.warm, color: 'text-yellow-600' },
    { label: 'Cold Leads', value: stats.cold, color: 'text-blue-600' },
    { label: 'Won', value: stats.won, color: 'text-green-600' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Your lead pipeline at a glance</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-5 gap-4 mb-8">
            {cards.map(card => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-sm font-medium text-gray-900 mb-1">Quick Actions</p>
            <p className="text-xs text-gray-500 mb-4">What do you want to do?</p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/add-lead')}
                className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                + Add New Lead
              </button>
              <button onClick={() => navigate('/leads')}
                className="border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                View All Leads
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}