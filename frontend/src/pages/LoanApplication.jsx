import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loanAPI } from '../services/api'
import { 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  CheckCircle,
  DollarSign,
  Briefcase,
  Target,
  FileCheck
} from 'lucide-react'
import toast from 'react-hot-toast'

const LOAN_PURPOSES = [
  { value: 'business_working_capital', label: 'Business Working Capital' },
  { value: 'debt_consolidation', label: 'Debt Consolidation' },
  { value: 'home_improvement', label: 'Home Improvement' },
  { value: 'education', label: 'Education' },
  { value: 'medical', label: 'Medical Expenses' },
  { value: 'vehicle', label: 'Vehicle Purchase' },
  { value: 'wedding_funeral', label: 'Wedding / Funeral' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'personal_emergency', label: 'Personal Emergency' },
  { value: 'other', label: 'Other' }
]

const EMPLOYMENT_STATUS = [
  { value: 'employed_full_time', label: 'Employed (Full-time)' },
  { value: 'employed_part_time', label: 'Employed (Part-time)' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'contractor', label: 'Contractor / Freelancer' },
  { value: 'retired', label: 'Retired' },
  { value: 'student', label: 'Student' },
  { value: 'unemployed', label: 'Unemployed' }
]

export default function LoanApplication() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1: Loan Details
    amount_requested: 20000,
    term_months: 24,
    purpose: 'business_working_capital',
    purpose_description: '',
    
    // Step 2: Income & Employment
    monthly_income: 5000,
    monthly_expenses: 3000,
    employment_status: 'employed_full_time',
    employer_name: '',
    employment_length_years: 2,
    
    // Step 3: Credit Info
    existing_debt: 0,
    credit_utilization: 30,
    delinquencies_2yrs: 0,
    open_accounts: 3
  })

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // Create application
      const createResponse = await loanAPI.create(formData)
      const applicationId = createResponse.data.id
      
      // Submit for assessment
      const assessResponse = await loanAPI.submit(applicationId)
      
      toast.success('Application submitted successfully!')
      navigate(`/dashboard/loans/${applicationId}`, { 
        state: { assessment: assessResponse.data } 
      })
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { num: 1, title: 'Loan Details', icon: DollarSign },
    { num: 2, title: 'Employment', icon: Briefcase },
    { num: 3, title: 'Credit Info', icon: Target },
    { num: 4, title: 'Review', icon: FileCheck }
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for a Loan</h1>
      <p className="text-gray-600 mb-8">Complete the form below to get your instant decision</p>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= s.num ? 'bg-ghana-green text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > s.num ? <CheckCircle size={20} /> : <s.icon size={20} />}
            </div>
            <span className={`hidden sm:block ml-2 text-sm font-medium ${
              step >= s.num ? 'text-ghana-green' : 'text-gray-500'
            }`}>
              {s.title}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-12 sm:w-20 h-1 mx-2 ${
                step > s.num ? 'bg-ghana-green' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
        {/* Step 1: Loan Details */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Loan Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount (GH₵)
              </label>
              <input
                type="range"
                name="amount_requested"
                value={formData.amount_requested}
                onChange={handleChange}
                min="1000"
                max="500000"
                step="1000"
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-500">GH₵ 1,000</span>
                <span className="text-2xl font-bold text-ghana-green">
                  GH₵ {formData.amount_requested.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">GH₵ 500,000</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Term
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[12, 24, 36, 48, 60].map(months => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, term_months: months }))}
                    className={`py-3 rounded-lg border-2 font-medium transition-colors ${
                      formData.term_months === months
                        ? 'border-ghana-green bg-ghana-green/10 text-ghana-green'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {months}mo
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose of Loan
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
              >
                {LOAN_PURPOSES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                name="purpose_description"
                value={formData.purpose_description}
                onChange={handleChange}
                rows={3}
                placeholder="Tell us more about how you'll use this loan..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Step 2: Employment & Income */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Employment & Income</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Income (GH₵)
                </label>
                <input
                  type="number"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Expenses (GH₵)
                </label>
                <input
                  type="number"
                  name="monthly_expenses"
                  value={formData.monthly_expenses}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Status
              </label>
              <select
                name="employment_status"
                value={formData.employment_status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
              >
                {EMPLOYMENT_STATUS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employer Name
                </label>
                <input
                  type="text"
                  name="employer_name"
                  value={formData.employer_name}
                  onChange={handleChange}
                  placeholder="Company name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years at Current Job
                </label>
                <input
                  type="number"
                  name="employment_length_years"
                  value={formData.employment_length_years}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Credit Information */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Credit Information</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Debt (GH₵)
                </label>
                <input
                  type="number"
                  name="existing_debt"
                  value={formData.existing_debt}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Total outstanding loans/credit</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Utilization (%)
                </label>
                <input
                  type="number"
                  name="credit_utilization"
                  value={formData.credit_utilization}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">% of credit limit used</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Late Payments (Last 2 Years)
                </label>
                <input
                  type="number"
                  name="delinquencies_2yrs"
                  value={formData.delinquencies_2yrs}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Open Credit Accounts
                </label>
                <input
                  type="number"
                  name="open_accounts"
                  value={formData.open_accounts}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Review Your Application</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Loan Amount</span>
                <span className="font-semibold">GH₵ {formData.amount_requested.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Term</span>
                <span className="font-semibold">{formData.term_months} months</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Purpose</span>
                <span className="font-semibold">
                  {LOAN_PURPOSES.find(p => p.value === formData.purpose)?.label}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Monthly Income</span>
                <span className="font-semibold">GH₵ {formData.monthly_income.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Employment</span>
                <span className="font-semibold">
                  {EMPLOYMENT_STATUS.find(s => s.value === formData.employment_status)?.label}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Employer</span>
                <span className="font-semibold">{formData.employer_name || 'Not specified'}</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                By submitting this application, you agree to our Terms of Service and authorize 
                us to verify your information with credit bureaus and other sources.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-ghana-green text-white rounded-lg hover:bg-ghana-green/90"
            >
              Continue
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-ghana-green text-white rounded-lg hover:bg-ghana-green/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
