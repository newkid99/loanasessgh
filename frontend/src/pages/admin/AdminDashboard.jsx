// AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import { 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

const COLORS = ['#006B3F', '#0891B2', '#FCD116', '#CE1126', '#64748B']

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [recentApps, setRecentApps] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, analyticsRes, appsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAnalytics(30),
        adminAPI.getApplications({ limit: 5 })
      ])
      
      setStats(statsRes.data)
      setAnalytics(analyticsRes.data)
      setRecentApps(appsRes.data)
    } catch (error) {
      toast.error('Failed to load dashboard')
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

  const statCards = [
    { 
      label: 'Total Applications', 
      value: stats?.total_applications || 0, 
      icon: FileText, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Pending Review', 
      value: stats?.pending_review || 0, 
      icon: Clock, 
      color: 'bg-yellow-500' 
    },
    { 
      label: 'Approved Today', 
      value: stats?.approved_today || 0, 
      icon: CheckCircle, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Total Disbursed', 
      value: `GH₵${(stats?.total_disbursed / 1000).toFixed(0)}K`, 
      icon: DollarSign, 
      color: 'bg-ghana-green' 
    }
  ]

  const gradeData = analytics?.by_risk_grade ? 
    Object.entries(analytics.by_risk_grade).map(([name, value]) => ({ name, value })) : []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of loan applications and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                <stat.icon size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Applications</h2>
            <Link to="/admin/applications" className="text-ghana-green hover:underline text-sm flex items-center gap-1">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="divide-y">
            {recentApps.map((app) => (
              <Link
                key={app.id}
                to={`/admin/applications/${app.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{app.user?.name}</p>
                  <p className="text-sm text-gray-500">{app.application_number}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">GH₵ {app.amount_requested?.toLocaleString()}</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full status-${app.status}`}>
                    {app.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Risk Grade Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Risk Grade Distribution</h2>
          
          {gradeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={gradeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {gradeData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}

          <div className="mt-4 space-y-2">
            {gradeData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span>Grade {item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-ghana-green to-green-700 rounded-xl p-6 text-white">
          <p className="text-green-100">Approval Rate</p>
          <p className="text-4xl font-bold mt-2">{stats?.average_approval_rate || 0}%</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white">
          <p className="text-gray-400">Avg Loan Amount</p>
          <p className="text-4xl font-bold mt-2">GH₵ {stats?.average_loan_amount?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-ghana-gold to-yellow-500 rounded-xl p-6 text-gray-900">
          <p className="text-yellow-800">Current GRR</p>
          <p className="text-4xl font-bold mt-2">{analytics?.grr_current || 11.71}%</p>
        </div>
      </div>
    </div>
  )
}
