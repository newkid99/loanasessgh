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
                        {user?.f
