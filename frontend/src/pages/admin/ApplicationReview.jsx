// ApplicationReview.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import { Search, Filter, Loader2, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ApplicationReview() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [statusFilter])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getApplications({ status: statusFilter || undefined })
      setApplications(response.data)
    } catch (error) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'disbursed', label: 'Disbursed' }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600">Review and manage loan applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search applications..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-ghana-green mx-auto" size={40} />
          </div>
        ) : applications.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Application</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Applicant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Risk</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{app.application_number}</p>
                    <p className="text-sm text-gray-500">{app.purpose?.replace(/_/g, ' ')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{app.user?.name}</p>
                    <p className="text-sm text-gray-500">{app.user?.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold">GH₵ {app.amount_requested?.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{app.term_months} months</p>
                  </td>
                  <td className="px-6 py-4">
                    {app.risk_grade && (
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold grade-${app.risk_grade?.toLowerCase()}`}>
                        {app.risk_grade}
                      </span>
                    )}
                    {app.approval_probability && (
                      <p className="text-sm text-gray-500 mt-1">
                        {(app.approval_probability * 100).toFixed(0)}%
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium status-${app.status}`}>
                      {app.status?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/admin/applications/${app.id}`}
                      className="text-ghana-green hover:text-ghana-green/80"
                    >
                      <ChevronRight size={20} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500">
            No applications found
          </div>
        )}
      </div>
    </div>
  )
}
