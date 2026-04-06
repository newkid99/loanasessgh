// Profile.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { userAPI } from '../services/api'
import { User, Mail, Phone, MapPin, CreditCard, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [creditProfile, setCreditProfile] = useState(null)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    region: ''
  })

  useEffect(() => {
    fetchCreditProfile()
  }, [])

  const fetchCreditProfile = async () => {
    try {
      const response = await userAPI.getCreditProfile()
      setCreditProfile(response.data)
    } catch (error) {
      console.error('Failed to load credit profile')
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await userAPI.updateProfile(formData)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-transparent"
                  >
                    <option value="">Select region</option>
                    <option value="Greater Accra">Greater Accra</option>
                    <option value="Ashanti">Ashanti</option>
                    <option value="Western">Western</option>
                    <option value="Eastern">Eastern</option>
                    <option value="Central">Central</option>
                    <option value="Volta">Volta</option>
                    <option value="Northern">Northern</option>
                    <option value="Upper East">Upper East</option>
                    <option value="Upper West">Upper West</option>
                    <option value="Brong Ahafo">Brong Ahafo</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-ghana-green text-white px-6 py-3 rounded-lg hover:bg-ghana-green/90 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* Credit Profile Card */}
        <div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard size={24} />
              <h2 className="text-lg font-semibold">Credit Profile</h2>
            </div>

            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-ghana-gold mb-4">
                <div>
                  <div className="text-3xl font-bold">
                    {creditProfile?.credit_score || user?.credit_score || '---'}
                  </div>
                  <div className="text-xs text-gray-400">Score</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Risk Grade</span>
                <span className="font-semibold text-ghana-gold">
                  {creditProfile?.risk_grade || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Applications</span>
                <span className="font-semibold">{creditProfile?.total_applications || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Approved</span>
                <span className="font-semibold text-green-400">
                  {creditProfile?.approved_applications || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Loans</span>
                <span className="font-semibold">{creditProfile?.active_loans || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
