import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 p-10 text-center shadow-sm">
        <p className="text-sm text-gray-500 uppercase tracking-[0.2em]">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900">Page not found</h1>
        <p className="mt-3 text-sm text-gray-500">The route you were trying to reach does not exist.</p>
        <Link
          to="/"
          className="inline-flex mt-8 items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition"
        >
          Return home
        </Link>
      </div>
    </div>
  )
}
