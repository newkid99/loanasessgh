// ApplicationDetail.jsx - Admin view
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  Briefcase,
  DollarSign,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deciding, setDeciding] = useState(false)
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchApplication()
  }, [id])

  const fetchApplication = async () => {
    try {
      const response = await adminAPI.getApplicationDetail(id)
      setApplication(response.data)
    } catch (error) {
      toast.error('Failed to load application')
    } finally {
      setLoading(false)
    }
  }

  const handleDecision = async (decision) => {
    setDeciding(true)
    try {
      await adminAPI.decideApplication(id, {
        decision,
        officer_notes: notes,
        rejection_reason: decision === 'reject' ? rejectionReason : undefined,
        amount_approved: decision === 'approve' ? application.loan_details?.amount_requested : undefined
      })
      
      toast.success(`Application ${decision}ed successfully`)
      navigate('/admin/applications')
    } catch (error) {
      toast.error('Failed to process decision')
    } finally {
      setDeciding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-ghana-green" size={40} />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Application not found</p>
      </div>
    )
  }

  const canDecide = ['submitted', 'under_review'].includes(application.status)

  return (
    <div>
      <Link to="/admin/applications" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} />
        Back to Applications
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{application.application_number}</h1>
          <p className="text-gray-600">{application.loan_details?.purpose?.replace(/_/g, ' ')}</p>
        </div>
        <span className={`px-4 py-2 rounded-full font-medium status-${application.status}`}>
          {application.status?.replace(/_/g, ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User size={20} className="text-ghana-green" />
              Applicant Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{application.user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{application.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{application.user?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ghana Card</p>
                <p className="font-medium">{application.user?.ghana_card || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-ghana-green" />
              Loan Details
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Amount Requested</p>
                <p className="text-2xl font-bold">GH₵ {application.loan_details?.amount_requested?.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Term</p>
                <p className="text-2xl font-bold">{application.loan_details?.term_months} mo</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Interest Rate</p>
                <p className="text-2xl font-bold">{application.loan_details?.interest_rate || '--'}%</p>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-ghana-green" />
              Financial Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Monthly Income</p>
                <p className="font-medium">GH₵ {application.financial_info?.monthly_income?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Expenses</p>
                <p className="font-medium">GH₵ {application.financial_info?.monthly_expenses?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employment</p>
                <p className="font-medium">{application.financial_info?.employment_status?.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employer</p>
                <p className="font-medium">{application.financial_info?.employer_name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">DTI Ratio</p>
                <p className="font-medium">{application.financial_info?.dti?.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Credit Utilization</p>
                <p className="font-medium">{application.financial_info?.credit_utilization}%</p>
              </div>
            </div>
          </div>

          {/* Decision Panel */}
          {canDecide && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Make Decision</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Officer Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about this application..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (if rejecting)
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleDecision('approve')}
                  disabled={deciding}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {deciding ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                  Approve
                </button>
                <button
                  onClick={() => handleDecision('reject')}
                  disabled={deciding}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deciding ? <Loader2 className="animate-spin" size={20} /> : <XCircle size={20} />}
                  Reject
                </button>
                <button
                  onClick={() => handleDecision('request_docs')}
                  disabled={deciding}
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                >
                  {deciding ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
                  Request Docs
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Assessment Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-4">AI Assessment</h3>
            
            <div className="text-center py-4">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${
                (application.ai_assessment?.approval_probability || 0) >= 0.7 ? 'border-green-400' :
                (application.ai_assessment?.approval_probability || 0) >= 0.4 ? 'border-yellow-400' : 'border-red-400'
              }`}>
                <div>
                  <div className="text-2xl font-bold">
                    {((application.ai_assessment?.approval_probability || 0) * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">Approval</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Risk Grade</span>
                <span className="font-bold text-ghana-gold">{application.ai_assessment?.risk_grade || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Default Risk</span>
                <span className="font-medium">
                  {((application.ai_assessment?.default_probability || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          {application.ai_assessment?.risk_factors?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="text-orange-500" size={20} />
                Risk Factors
              </h3>
              <div className="space-y-3">
                {application.ai_assessment.risk_factors.map((factor, i) => (
                  <div key={i} className={`p-3 rounded-lg ${
                    factor.level === 'critical' ? 'bg-red-50' : 'bg-yellow-50'
                  }`}>
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{factor.name}</span>
                      <span className="text-sm">{factor.value}{factor.unit}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{factor.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Scores */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Alternative Data</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">MoMo Trust</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-ghana-green rounded-full"
                      style={{ width: `${application.alternative_scores?.momo_trust_score || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{application.alternative_scores?.momo_trust_score || '--'}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Stability</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${application.alternative_scores?.stability_score || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{application.alternative_scores?.stability_score || '--'}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Social Trust</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${application.alternative_scores?.social_trust_score || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{application.alternative_scores?.social_trust_score || '--'}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
