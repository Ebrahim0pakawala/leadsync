import { Link, useLocation } from 'react-router-dom'

const links = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/leads', label: 'All Leads', icon: '👥' },
    { to: '/add-lead', label: 'Add Lead', icon: '➕' },
    { to: '/revival', label: 'Revival Queue', icon: '🔥' },
  ]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-56 bg-white border-r border-gray-100 flex flex-col py-6 px-3">
      <div className="px-3 mb-8">
        <h1 className="text-lg font-semibold text-gray-900">LeadSync</h1>
        <p className="text-xs text-gray-400 mt-0.5">Lead Intelligence</p>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              location.pathname === link.to
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}