import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getPriorityColor, getStatusColor } from '../lib/scoring'

const BULK_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost']
const BULK_PRIORITIES = ['hot', 'warm', 'cold']

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [selected, setSelected] = useState([])
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)
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

  const reloadLeads = async () => {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('score', { ascending: false })
    setLeads(data || [])
  }

  const toggleSelect = id => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelected(filteredLeads.map(lead => lead.id))
  }

  const clearSelection = () => {
    setSelected([])
  }

  const updateBulk = async changes => {
    setBulkLoading(true)
    const { error } = await supabase.from('leads').update(changes).in('id', selected)
    if (error) {
      setImportError(error.message)
    } else {
      setImportSuccess('Bulk update applied successfully.')
      await reloadLeads()
      clearSelection()
    }
    setBulkLoading(false)
  }

  const deleteSelected = async () => {
    if (!selected.length || !window.confirm(`Delete ${selected.length} selected lead(s)?`)) return
    setBulkLoading(true)
    const { error } = await supabase.from('leads').delete().in('id', selected)
    if (error) {
      setImportError(error.message)
    } else {
      setImportSuccess('Selected leads have been deleted.')
      await reloadLeads()
      clearSelection()
    }
    setBulkLoading(false)
  }

  const downloadCSV = () => {
    const headers = [
      'id', 'name', 'phone', 'service_type', 'source', 'budget_range', 'urgency', 'message',
      'notes', 'priority', 'status', 'score', 'conversion_probability', 'follow_up_at', 'is_repeat_customer'
    ]
    const rows = leads.map(lead =>
      headers.map(key => JSON.stringify(lead[key] ?? '')).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `leads-export-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const parseCSV = text => {
    const [headerLine, ...lines] = text.trim().split(/\r?\n/)
    const headers = headerLine.split(',').map(h => h.trim())
    return lines.map(line => {
      const values = line.split(',').map(value => value.trim().replace(/^"|"$/g, ''))
      return headers.reduce((obj, header, index) => ({
        ...obj,
        [header]: values[index] ?? ''
      }), {})
    })
  }

  const importLeadsFromFile = async event => {
    setImportError('')
    setImportSuccess('')
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    let rows
    try {
      if (file.name.endsWith('.json')) {
        rows = JSON.parse(text)
      } else {
        rows = parseCSV(text)
      }
    } catch (error) {
      setImportError('Failed to parse file. Make sure it is valid CSV or JSON.')
      return
    }

    if (!Array.isArray(rows) || !rows.length) {
      setImportError('No lead records found in the file.')
      return
    }

    const payload = rows.map(row => ({
      name: row.name || row.full_name || '',
      phone: row.phone || '',
      service_type: row.service_type || row.service || 'salon',
      source: row.source || 'manual',
      budget_range: row.budget_range || 'medium',
      urgency: row.urgency || 'normal',
      message: row.message || '',
      notes: row.notes || '',
      priority: row.priority || 'cold',
      status: row.status || 'new',
      score: Number(row.score) || 0,
      conversion_probability: Number(row.conversion_probability) || 0,
      follow_up_at: row.follow_up_at || new Date().toISOString(),
      is_repeat_customer: row.is_repeat_customer === 'true' || row.is_repeat_customer === true,
    }))

    const { error } = await supabase.from('leads').insert(payload)
    if (error) {
      setImportError(error.message)
      return
    }

    setImportSuccess(`Imported ${payload.length} lead(s).`)
    event.target.value = ''
    await reloadLeads()
  }

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const text = `${lead.name} ${lead.phone} ${lead.service_type} ${lead.source} ${lead.status}`.toLowerCase()
      const matchesSearch = !search || text.includes(search.toLowerCase())
      const matchesStatus = !statusFilter || lead.status === statusFilter
      const matchesPriority = !priorityFilter || lead.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [leads, search, statusFilter, priorityFilter])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading leads...</p>
    </div>
  )

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">All Leads</h2>
          <p className="text-sm text-gray-500 mt-0.5">{filteredLeads.length} of {leads.length} leads</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => navigate('/add-lead')}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            + Add Lead
          </button>
          <button onClick={downloadCSV}
            className="bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Export CSV
          </button>
          <label className="cursor-pointer bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Import
            <input type="file" accept=".csv,.json" className="hidden" onChange={importLeadsFromFile} />
          </label>
        </div>
      </div>

      {importError && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">{importError}</div>
      )}
      {importSuccess && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-700">{importSuccess}</div>
      )}

      {selected.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">{selected.length} lead(s) selected</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={selectAll}
                className="bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Select All
              </button>
              <button onClick={clearSelection}
                className="bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Clear Selection
              </button>
              <div className="flex flex-wrap gap-2">
                {BULK_STATUSES.map(status => (
                  <button key={status} onClick={() => updateBulk({ status })}
                    disabled={bulkLoading}
                    className="bg-blue-50 text-blue-700 text-sm px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                    {status}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {BULK_PRIORITIES.map(priority => (
                  <button key={priority} onClick={() => updateBulk({ priority })}
                    disabled={bulkLoading}
                    className="bg-yellow-50 text-yellow-700 text-sm px-3 py-2 rounded-lg hover:bg-yellow-100 transition-colors">
                    {priority}
                  </button>
                ))}
              </div>
              <button onClick={deleteSelected}
                disabled={bulkLoading}
                className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg hover:bg-red-100 transition-colors">
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-4 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search leads..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="quoted">Quoted</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">All priorities</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
        </select>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No leads yet. Add your first one.</p>
          <button onClick={() => navigate('/add-lead')}
            className="mt-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Add Lead
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map(lead => (
            <div key={lead.id}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => navigate(`/leads/${lead.id}`)}>
              <input
                type="checkbox"
                checked={selected.includes(lead.id)}
                onChange={e => {
                  e.stopPropagation()
                  toggleSelect(lead.id)
                }}
                className="h-4 w-4 text-gray-900 rounded border-gray-300 bg-white"
              />

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