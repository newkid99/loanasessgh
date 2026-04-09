import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layouts
import MainLayout from './components/Layout/MainLayout'
import AdminLayout from './components/Layout/AdminLayout'


// Public Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Calculator from './pages/Calculator'

// Protected Pages
import Dashboard from './pages/Dashboard'
import LoanApplication from './pages/LoanApplication'
import MyLoans from './pages/MyLoans'
import LoanDetail from './pages/LoanDetail'
import Profile from './pages/Profile'
import Analytics from './pages/admin/Analytics'
import Users from './pages/admin/Users'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ApplicationReview from './pages/admin/ApplicationReview'
import ApplicationDetail from './pages/admin/ApplicationDetail'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ghana-green"></div>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />
}

// Admin Route Component
function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ghana-green"></div>
      </div>
    )
  }
  
  return isAdmin ? children : <Navigate to="/dashboard" />
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="calculator" element={<Calculator />} />
      </Route>
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="apply" element={<LoanApplication />} />
        <Route path="loans" element={<MyLoans />} />
        <Route path="loans/:id" element={<LoanDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="applications" element={<ApplicationReview />} />
        <Route path="applications/:id" element={<ApplicationDetail />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="users" element={<Users />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
