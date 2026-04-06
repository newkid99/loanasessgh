// LoanDetail.jsx - View loan details and assessment
import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { loanAPI } from '../services/api'
import { Loader2, CheckCircle, AlertTriangle, Target, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function LoanDetail() {
  const { id } = useParams()
  const location = useLocation()
  const [loan, setLoan] = useState(null)
  const [assessment, setAssessment] = useState(location.state?.assessment || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLoan()
  }, [id])

  const fetchLoan = async () => {
    try {
      const response = await loanAPI.getOne(id)
      setLoan(response.data)
      
      if (response.data.status !== 'draft' && !assessment) {
        const assessRes = await loanAPI.getAssessment(id)
        setAssessment(assessRes.data)
      }
    } catch (error) {
      toast.error('Failed to load loan details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-ghana-green" size={40} />
      </div>
    )
  }

  if (!loan) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Loan not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/dashboard/loans" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} />
        Back to My Loans
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{loan.application_number}</h1>
            <p className="text-gray-500">{loan.purpose?.replace(/_/g, ' ')}</p>
          </div>
          <span className={`px-4 py-2 rounded-full font-medium status-${loan.status}`}>
            {loan.status?.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Amount Requested</p>
            <p className="text-2xl font-bold">GH₵ {loan.amount_requested?.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Interest Rate</p>
            <p className="text-2xl font-bold">{loan.interest_rate || '--'}%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Monthly Payment</p>
            <p className="text-2xl font-bold">GH₵ {loan.monthly_payment?.toLocaleString() || '--'}</p>
          </div>
        </div>
      </div>

      {assessment && (
        <>
          {/* Assessment Result */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">AI Assessment Result</h2>
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                assessment.approval_probability >= 0.7 ? 'bg-green-500' :
                assessment.approval_probability >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {(assessment.approval_probability * 100).toFixed(0)}%
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {assessment.recommendation === 'PRE-APPROVED' ? '✅ Pre-Approved!' :
                   assessment.recommendation === 'UNDER_REVIEW' ? '⏳ Under Review' :
                   '📚 Credit Coaching Recommended'}
                </p>
                <p className="text-gray-600">Risk Grade: {assessment.risk_grade}</p>
              </div>
            </div>

            {assessment.affordability && (
              <div className={`rounded-lg p-4 ${
                assessment.affordability.can_afford ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="flex items-center gap-2">
                  {assessment.affordability.can_afford ? 
                    <CheckCircle className="text-green-600" size={20} /> :
                    <AlertTriangle className="text-red-600" size={20} />
                  }
                  <span className="font-medium">{assessment.affordability.message}</span>
                </div>
              </div>
            )}
          </div>

          {/* Credit Coach */}
          {assessment.credit_coach && (
            <div className="bg-gradient-to-br from-ghana-green to-green-700 rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Target size={24} />
                <h2 className="text-xl font-semibold">Credit Coach Recommendations</h2>
              </div>
              
              <div className="space-y-3">
                {assessment.credit_coach.actions?.map((action, i) => (
                  <div key={i} className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-ghana-gold text-gray-900 rounded-full flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium">{action.action}</p>
                        <p className="text-sm text-green-200">Impact: {action.impact} • {action.timeframe}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
