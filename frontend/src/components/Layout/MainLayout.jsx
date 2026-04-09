import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  Home, 
  Calculator, 
  LogOut, 
  Menu, 
  X,
  FileText,
  LayoutDashboard,
  Shield
} from 'lucide-react'
import { useState } from 'react'

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'loan_officer'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-1 ghana-gradient-horizontal" />
      
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🇬🇭</span>
              <span className="text-xl font-bold text-ghana-green">LoanAssess</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-ghana-green flex items-center gap-1">
                <Home size={18} />
                Home
              </Link>
              <Link to="/calculator" className="text-gray-600 hover:text-ghana-green flex items-center gap-1">
                <Calculator size={18} />
                Calculator
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-ghana-green flex items-center gap-1">
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                  <Link to="/dashboard/loans" className="text-gray-600 hover:text-ghana-green flex items-center gap-1">
                    <FileText size={18} />
                    My Loans
                  </Link>
                  
                  {isAdmin && (
                    <Link to="/admin" className="text-yellow-600 hover:text-yellow-500 flex items-center gap-1 font-semibold">
                      <Shield size={18} />
                      Admin Panel
                    </Link>
                  )}
                  
                  <div className="flex items-center space-x-4 ml-4 pl-4 border-l">
                    <Link to="/dashboard/profile" className="flex items-center gap-2 text-gray-700">
                      <div className="w-8 h-8 rounded-full bg-ghana-green text-white flex items-center justify-center">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </div>
                      <span className="hidden lg:block">{user?.first_name}</span>
                    </Link>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                      <LogOut size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="text-ghana-green hover:text-ghana-green/80">
                    Login
                  </Link>
                  <Link to="/register" className="bg-ghana-green text-white px-4 py-2 rounded-lg hover:bg-ghana-green/90">
                    Get Started
                  </Link>
                </div>
              )}
            </nav>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-3">
              <Link to="/" className="block py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/calculator" className="block py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                Calculator
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="block py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/dashboard/loans" className="block py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                    My Loans
                  </Link>
                  
                  {isAdmin && (
                    <Link to="/admin" className="block py-2 text-yellow-600 font-semibold" onClick={() => setMobileMenuOpen(false)}>
                      🛡️ Admin Panel
                    </Link>
                  )}
                  
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block py-2 text-red-600">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-2 text-ghana-green" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="block py-2 bg-ghana-green text-white rounded-lg text-center" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🇬🇭</span>
                <span className="text-xl font-bold">LoanAssess</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-Powered Loan Assessment Platform for Ghana
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/calculator" className="hover:text-white">Loan Calculator</Link></li>
                <li><Link to="/register" className="hover:text-white">Apply Now</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 LoanAssess Ghana. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
