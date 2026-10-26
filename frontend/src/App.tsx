import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import './index.css'

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-darkgreen-50 text-darkgreen-900">
        <nav className="border-b border-darkgreen-200 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gold-500 text-darkgreen-600 rounded-flex items-center justify-center font-bold text-xl">
                <span>SM</span>
              </div>
              <span className="text-xl font-bold tracking-wider">SEO Monitor</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-darkgreen-600 hover:text-gold-500 transition-colors">Features</a>
              <a href="#pricing" className="text-darkgreen-600 hover:text-gold-500 transition-colors">Pricing</a>
              <a href="/dashboard" className="text-gold-500 font-medium">Dashboard</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="/login" className="text-darkgreen-600 hover:text-gold-500 transition-colors text-sm">Login</a>
              <a href="/signup" className="bg-gold-500 text-darkgreen-600 hover:bg-gold-600 text-sm font-medium py-1.5 px-4 rounded">Sign Up</a>
            </div>
          </div>
        </nav>

        <main className="py-8">
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Router>
        </main>
      </div>
    </Router>
  )
}

export default App