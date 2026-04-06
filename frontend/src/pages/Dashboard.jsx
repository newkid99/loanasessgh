import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { userAPI } from '../services/api'
import { 
  Plus, 
  FileText, 
  TrendingUp, 
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await userAPI.getDashboard()
      setDashboardData(response.data)
    } catch (error) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'disbursed':
      case 'completed':
        return <CheckCircle className="text-green-500" size={18} />
      case 'rejected':
        return <AlertCircle className="text-red-500" size={18} />
      case 'under_review':
      case 'submitted':
        return <Clock className="text-yellow-500" size={18} />
      default:
        return <FileText className="text-gray-400" size={18} />
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your loan activity
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          to="/dashboard/apply"
          className="bg-ghana-green text-white rounded-xl p-6 hover:bg-ghana-green/90 transition-colors card-hover"
        >
          <Plus size={24} className="mb-3" />
          <h3 className="font-semibold text-lg">Apply for Loan</h3>
          <p className="text-green-100 text-sm mt-1">Get instant decision</p>
        </Link>

        <Link
          to="/dashboard/loans"
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow card-hover border"
        >
          <FileText size={24} className="text-ghana-green mb-3" />
          <h3 className="font-semibold text-lg text-gray-900">My Loans</h3>
          <p className="text-gray-500 text-sm mt-1">View applications</p>
        </Link>

        <Link
          to="/calculator"
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow card-hover border"
        >
          <TrendingUp size={24} className="text-ghana-green mb-3" />
          <h3 className="font-semibold text-lg text-gray-900">Calculator</h3>
          <p className="text-gray-500 text-sm mt-1">Check your rate</p>
        </Link>

        <Link
          to="/dashboard/profile"
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow card-hover border"
        >
          <CreditCard size={24} className="text-ghana-green mb-3" />
          <h3 className="font-semibold text-lg text-gray-900">Profile</h3>
          <p className="text-gray-500 text-sm mt-1">Update your info</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Credit Score Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Your Credit Profile</h3>
          
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-ghana-gold">
              <div>
                <div className="text-4xl font-bold">
                  {dashboardData?.user?.credit_score || '---'}
                </div>
                <div className="text-sm text-gray-400">Credit Score</div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
            <div>
              <div className="text-sm text-gray-400">Risk Grade</div>
              <div className="text-2xl font-bold text-ghana-gold">
                {dashboardData?.user?.risk_grade || '-'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Trust Score</div>
              <div className="text-2xl font-bold">
                {dashboardData?.user?.trust_score?.toFixed(0) || '--'}%
              </div>
            </div>
          </div>
        </div>

        {/* Active Loan */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Active Loan</h3>
          
          {dashboardData?.active_loan ? (
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                GH₵ {dashboardData.active_loan.amount?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                Monthly payment: GH₵ {dashboardData.active_loan.monthly_payment?.toLocaleString()}
              </div>
              
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">40%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-ghana-green rounded-full w-2/5" />
                </div>
              </div>

              <Link
                to={`/dashboard/loans/${dashboardData.active_loan.id}`}
                className="flex items-center justify-center gap-2 mt-4 text-ghana-green font-medium hover:underline"
              >
                View Details <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 mb-4">No active loans</p>
              <Link
                to="/dashboard/apply"
                className="inline-flex items-center gap-2 bg-ghana-green text-white px-4 py-2 rounded-lg hover:bg-ghana-green/90"
              >
                <Plus size={18} />
                Apply Now
              </Link>
            </div>
          )}
        </div>

        {/* GRR Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Ghana Reference Rate</h3>
          
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-ghana-green">
              {dashboardData?.grr_rate || 11.71}%
            </div>
            <div className="text-sm text-gray-500 mt-1">Current GRR (March 2026)</div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 mt-4">
            <p className="text-sm text-green-800">
              <strong>Good news!</strong> GRR has dropped from 29.72% in Jan 2025 to 11.71% today. 
              This means lower interest rates for you.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="mt-8 bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Recent Applications</h3>
          <Link to="/dashboard/loans" className="text-ghana-green hover:underline text-sm">
            View all
          </Link>
        </div>
        
        {dashboardData?.recent_applications?.length > 0 ? (
          <div className="divide-y">
            {dashboardData.recent_applications.map((app) => (
              <Link
                key={app.id}
                to={`/dashboard/loans/${app.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(app.status)}
                  <div>
                    <div className="font-medium text-gray-900">
                      {app.application_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      GH₵ {app.amount?.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium status-${app.status}`}>
                    {app.status.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(app.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No applications yet. Ready to apply?
          </div>
        )}
      </div>
    </div>
  )
}
