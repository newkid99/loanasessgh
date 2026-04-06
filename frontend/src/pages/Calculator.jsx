import { useState } from 'react'
import { scoringAPI } from '../services/api'
import { 
  Calculator as CalcIcon, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Info,
  Loader2,
  ArrowRight,
  Target
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Calculator() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [formData, setFormData] = useState({
    loan_amount: 20000,
    term_months: 24,
    monthly_income: 5000,
    monthly_expenses: 3000,
    credit_score: 650,
    employment_years: 3,
    dti: 25,
    credit_utilization: 30,
    delinquencies: 0,
    open_accounts: 3
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await scoringAPI.quickAssess(formData)
      setResult(response.data)
    } catch (error) {
      toast.error('Failed to calculate. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (grade) => {
    const colors = {
      A: 'bg-green-500',
      B: 'bg-emerald-500',
      C: 'bg-yellow-500',
      D: 'bg-orange-500',
      E: 'bg-red-400',
      F: 'bg-red-500',
      G: 'bg-red-600'
    }
    return colors[grade] || 'bg-gray-500'
  }

  const getApprovalColor = (prob) => {
    if (prob >= 0.7) return 'text-green-600'
    if (prob >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Loan Calculator & Credit Coach
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          See your approval chances instantly and get personalized advice to improve your score
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-ghana-green/10 rounded-lg flex items-center justify-center">
              <CalcIcon className="text-ghana-green" size={24} />
            </div>
            <h2 className="text-xl font-semibold">Your Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Loan Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Amount (GH₵)
                </label>
                <input
                  type="number"
                  name="loan_amount"
                  value={formData.loan_amount}
                  onChange={handleChange}
                  min="1000"
                  max="500000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Term (Months)
                </label>
                <select
                  name="term_months"
                  value={formData.term_months}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                >
                  {[12, 24, 36, 48, 60].map(m => (
                    <option key={m} value={m}>{m} months</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Income */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Income (GH₵)
                </label>
                <input
                  type="number"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Expenses (GH₵)
                </label>
                <input
                  type="number"
                  name="monthly_expenses"
                  value={formData.monthly_expenses}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
            </div>

            {/* Credit Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credit Score (300-850)
                </label>
                <input
                  type="number"
                  name="credit_score"
                  value={formData.credit_score}
                  onChange={handleChange}
                  min="300"
                  max="850"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Length (Years)
                </label>
                <input
                  type="number"
                  name="employment_years"
                  value={formData.employment_years}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DTI Ratio (%)
                </label>
                <input
                  type="number"
                  name="dti"
                  value={formData.dti}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credit Utilization (%)
                </label>
                <input
                  type="number"
                  name="credit_utilization"
                  value={formData.credit_utilization}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Late Payments (2 yrs)
                </label>
                <input
                  type="number"
                  name="delinquencies"
                  value={formData.delinquencies}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ghana-green text-white py-3 rounded-lg font-semibold hover:bg-ghana-green/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Calculating...
                </>
              ) : (
                <>
                  Calculate My Rate
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div>
          {result ? (
            <div className="space-y-6">
              {/* Main Result Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Your Assessment</h2>
                  <div className={`px-4 py-2 rounded-full text-white font-semibold ${getRiskColor(result.risk_grade)}`}>
                    Grade {result.risk_grade}
                  </div>
                </div>

                {/* Approval Probability */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Approval Probability</span>
                    <span className={`font-bold text-2xl ${getApprovalColor(result.approval_probability)}`}>
                      {(result.approval_probability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        result.approval_probability >= 0.7 ? 'bg-green-500' :
                        result.approval_probability >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.approval_probability * 100}%` }}
                    />
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Interest Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{result.interest_rate}%</p>
                    <p className="text-xs text-gray-500">GRR {result.grr_rate}% + {result.risk_premium}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Monthly Payment</p>
                    <p className="text-2xl font-bold text-gray-900">GH₵ {result.monthly_payment.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">for {formData.term_months} months</p>
                  </div>
                </div>

                {/* Affordability */}
                <div className={`rounded-lg p-4 ${
                  result.affordability.can_afford ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.affordability.can_afford ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <AlertTriangle className="text-red-600" size={20} />
                    )}
                    <span className={`font-semibold ${
                      result.affordability.can_afford ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.affordability.message}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Payment uses {result.affordability.payment_to_income?.toFixed(0) || 0}% of disposable income
                  </p>
                </div>

                <Link
                  to="/register"
                  className="block w-full bg-ghana-green text-white text-center py-3 rounded-lg font-semibold mt-6 hover:bg-ghana-green/90"
                >
                  Apply Now
                </Link>
              </div>

              {/* Credit Coach Card */}
              <div className="bg-gradient-to-br from-ghana-green to-green-700 rounded-xl shadow-sm p-6 lg:p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Target size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Credit Coach</h2>
                    <p className="text-green-200 text-sm">Your personalized improvement plan</p>
                  </div>
                </div>

                {/* Score Progress */}
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Current Score: {result.credit_coach.current_score}</span>
                    <span>Target: {result.credit_coach.target_score}</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-ghana-gold rounded-full"
                      style={{ width: `${(result.credit_coach.current_score / 850) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-green-200 mt-2">
                    Est. time to reach target: {result.credit_coach.estimated_weeks_to_target} weeks
                  </p>
                </div>

                {/* Action Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Action Plan:</h3>
                  {result.credit_coach.actions?.map((action, i) => (
                    <div key={i} className="bg-white/10 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-ghana-gold text-gray-900 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium">{action.action}</p>
                          <div className="flex gap-4 text-sm text-green-200 mt-1">
                            <span>Impact: {action.impact}</span>
                            <span>Time: {action.timeframe}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Projected Improvement */}
                <div className="mt-6 bg-white/10 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-200 mb-1">If you follow this plan</p>
                  <p className="text-lg font-semibold">
                    Rate could drop: {result.credit_coach.projected_rate_improvement}
                  </p>
                </div>
              </div>

              {/* Risk Factors */}
              {result.risk_factors?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-orange-500" size={20} />
                    Risk Factors to Address
                  </h3>
                  <div className="space-y-3">
                    {result.risk_factors.map((factor, i) => (
                      <div key={i} className={`rounded-lg p-3 ${
                        factor.level === 'critical' ? 'bg-red-50' : 'bg-yellow-50'
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium">{factor.name}</span>
                          <span className={`text-sm font-semibold ${
                            factor.level === 'critical' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {factor.value}{factor.unit}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{factor.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Placeholder when no results */
            <div className="bg-gray-100 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
              <CalcIcon className="text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Enter Your Details
              </h3>
              <p className="text-gray-500 max-w-sm">
                Fill in the form to see your approval chances, interest rate, 
                and personalized credit coaching recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
