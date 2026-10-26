import React, { useState } from 'react'

const Signup: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tier, setTier] = useState('free')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // In real implementation, would call auth API
      if (!name || !email || !password) {
        setError('Please fill in all fields')
        return
      }
      
      // Mock signup
      localStorage.setItem('name', name)
      localStorage.setItem('token', 'mock-jwt-token')
      setTier('pro')
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Signup failed. Please try again.')
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
          <h2 className="text-3xl font-bold darkgreen-600">Create Account</h2>
          <p className="text-darkgreen-500 text-sm">Join the SEO Monitor community</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-xl">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlName="name" className="block text-darkgreen-600 text-sm font-medium mb-2">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full rounded-xl border border-darkgreen-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors"
            />
          </div>
          
          <div>
            <label htmlEmail="email" className="block text-darkgreen-600 text-sm font-medium mb-2">
              Email address
            </label>
            <input
              type="email"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-darkgreen-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-darkgreen-600 text-sm font-medium mb-2">Select Plan</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tier"
                  value="free"
                  checked={tier === 'free'}
                  onChange={(e) => setTier(e.target.value)}
                  className="rounded border-darkgreen-300 w-4 h-4"
                />
                <span className="text-darkgreen-600">Freemium (Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tier"
                  value="pro"
                  checked={tier === 'pro'}
                  onChange={(e) => setTier(e.target.value)}
                  className="rounded border-darkgreen-300 w-4 h-4"
                />
                <span className="text-darkgreen-600">Pro ($10/mo)</span>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 text-darkgreen-600 py-3 rounded-xl font-medium hover:bg-gold-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-darkgreen-500 text-sm">Already have an account?</p>
          <a href="/login" className="text-gold-500 font-medium hover underline">Sign in</a>
        </div>
      </div>
    </div>
  )
}

export default Signup