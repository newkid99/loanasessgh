// MyLoans.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { loanAPI } from '../services/api'
import { FileText, Plus, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MyLoans() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLoans()
  }, [])

  const fetchLoans = async () => {
    try {
      const response = await loanAPI.getAll()
      setLoans(response.data)
    } catch (error) {
      toast.error('Failed to load loans')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'disbursed':
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />
      case 'rejected':
        return <AlertCircle className="text-red-500" size={20} />
      default:
        return <Clock className="text-yellow-500" size={20} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-ghana-green" size={40} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Loans</h1>
        <Link
          to="/dashboard/apply"
          className="flex items-center gap-2 bg-ghana-green text-white px-4 py-2 rounded-lg hover:bg-ghana-green/90"
        >
          <Plus size={20} />
          New Application
        </Link>
      </div>

      {loans.length > 0 ? (
        <div className="space-y-4">
          {loans.map((loan) => (
            <Link
              key={loan.id}
              to={`/dashboard/loans/${loan.id}`}
              className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(loan.status)}
                  <div>
                    <p className="font-semibold text-gray-900">{loan.application_number}</p>
                    <p className="text-sm text-gray-500">{loan.purpose.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    GH₵ {loan.amount_requested?.toLocaleString()}
                  </p>
                  <p className={`text-sm font-medium px-3 py-1 rounded-full inline-block status-${loan.status}`}>
                    {loan.status.replace(/_/g, ' ').toUpperCase()}
                  </p>
                </div>
              </div>
              {loan.interest_rate && (
                <div className="mt-4 pt-4 border-t flex gap-6 text-sm text-gray-600">
                  <span>Rate: {loan.interest_rate}%</span>
                  <span>Term: {loan.term_months} months</span>
                  {loan.monthly_payment && <span>Monthly: GH₵ {loan.monthly_payment.toLocaleString()}</span>}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No loans yet</h3>
          <p className="text-gray-500 mb-6">Start your first loan application today</p>
          <Link
            to="/dashboard/apply"
            className="inline-flex items-center gap-2 bg-ghana-green text-white px-6 py-3 rounded-lg hover:bg-ghana-green/90"
          >
            <Plus size={20} />
            Apply Now
          </Link>
        </div>
      )}
    </div>
  )
}
