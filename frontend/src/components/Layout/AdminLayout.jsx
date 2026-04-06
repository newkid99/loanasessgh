import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings,
  LogOut,
  ChevronLeft,
  BarChart3
} from 'lucide-react'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/applications', icon: FileText, label: 'Applications' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/users', icon: Users, label: 'Users' },
  ]

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Ghana Flag Bar */}
      <div className="h-1 ghana-gradient-horizontal" />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 min-h-screen fixed left-0 top-1">
          <div className="p-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 mb-8">
              <span className="text-2xl">🇬🇭</span>
              <span className="text-xl font-bold text-white">LoanAssess</span>
            </Link>

            {/* Back to main site */}
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm"
            >
              <ChevronLeft size={16} />
              Back to Dashboard
            </Link>

            {/* Admin badge */}
            <div className="bg-ghana-gold/20 text-ghana-gold px-3 py-2 rounded-lg text-sm mb-6">
              👤 {user?.role === 'admin' ? 'Administrator' : 'Loan Officer'}
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path, item.exact)
                      ? 'bg-ghana-green text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Bottom section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-ghana-green text-white flex items-center justify-center font-medium">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                <p className="text-gray-500 text-xs">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-red-400 w-full"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
