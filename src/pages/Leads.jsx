import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getPriorityColor, getStatusColor } from '../lib/scoring'

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchLeads() {
      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('score', { ascending: false })
      setLeads(data || [])
      setLoading(false)
    }
    fetchLeads()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading leads...</p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">All Leads</h2>
          <p className="text-sm text-gray-500 mt-0.5">{leads.length} total, sorted by score</p>
        </div>
        <button onClick={() => navigate('/add-lead')}
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          + Add Lead
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No leads yet. Add your first one.</p>
          <button onClick={() => navigate('/add-lead')}
            className="mt-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Add Lead
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => (
            <div key={lead.id}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => navigate(`/leads/${lead.id}`)}>
              
              {/* Score circle */}
              <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">{lead.score}</span>
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 text-sm">{lead.name}</p>
                  {lead.is_repeat_customer && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">↩ returning</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{lead.phone} · {lead.service_type} · via {lead.source}</p>
                {lead.message && <p className="text-xs text-gray-400 mt-1 truncate">{lead.message}</p>}
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPriorityColor(lead.priority)}`}>
                  {lead.priority}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}