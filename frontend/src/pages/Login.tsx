import React, { useState } from 'react'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // In real implementation, would call auth API
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // })
      // const data = await response.json()
      
      // Mock login
      if (email && password) {
        localStorage.setItem('name', email.split('@')[0])
        localStorage.setItem('token', 'mock-jwt-token')
        window.location.href = '/dashboard'
      } else {
        setError('Please enter email and password')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-full bg-darkgreen-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-darkgreen-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold-500 text-darkgreen-600 rounded-flex items-center justify-center text-2xl mb-4">
            <span>SM</span>
          </div>
          <h2 className="text-3xl font-bold darkgreen-600">Welcome Back</h2>
          <p className="text-darkgreen-500 text-sm">Log in to your SEO Monitor account</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-xl">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlEmail="email" className="block text-darkgreen-600 text-sm font-medium mb-2">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-darkgreen-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors"
            />
          </div>
          
          <div>
            <label htmlPassword="password" className="block text-darkgreen-600 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-darkgreen-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 text-darkgreen-600 py-3 rounded-xl font-medium hover:bg-gold-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-darkgreen-500 text-sm">Don't have an account?</p>
          <a href="/signup" className="text-gold-500 font-medium hover underline">Create account</a>
        </div>
      </div>
    </div>
  )
}

export default Login