import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard: React.FC = () => {
  const [domains, setDomains] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userTier, setUserTier] = useState('free')
  const [usdtBalance, setUsdtBalance] = useState('0.00')
  const navigate = useNavigate()

  // Fetch domains and user data
  useEffect(() => {
    const loadDomains = async () => {
      setLoading(true)
      try {
        // In a real implementation, this would fetch from the backend API
        // const response = await fetch('/api/user/domains', {
        //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        // })
        // const data = await response.json()
        // setDomains(data.domains)
        // setUserTier(data.tier)
        
        // Mock data for demo
        setDomains([
          { id: '1', url: 'example1.com', status: 'healthy', lastChecked: 'Just now', uptime: '99.99%' },
          { id: '2', url: 'example2.com', status: 'warning', lastChecked: '2 min ago', uptime: '99.50%' },
          { id: '3', url: 'example3.com', status: 'critical', lastChecked: '5 min ago', uptime: '95.00%' },
        ])
        setUserTier('pro')
        setUsdtBalance('12.50')
      } catch (error) {
        console.error('Error loading domains:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadDomains()
  }, [navigate])

  const handleAddDomain = () => {
    // Navigate to add domain form or open modal
    alert('Add domain functionality coming soon')
  }

  const handleRemoveDomain = async (domainId: string) => {
    if (confirm('Are you sure you want to remove this monitored domain?')) {
      setDomains(domains.filter(d => d.id !== domainId))
    }
  }

  const handleAlertConfig = () => {
    // Open alert configuration panel
    alert('Alert configuration panel')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-darkgreen-500"></div>
          <span className="text-darkgreen-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-darkgreen-50 text-darkgreen-900">
      {/* Header */}
      <header className="border-b border-darkgreen-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gold-500 text-darkgreen-600 rounded-flex items-center justify-center font-bold text-xl">
              <span>SM</span>
            </div>
            <span className="text-xl font-bold tracking-wider">SEO Monitor</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-darkgreen-600 hover:text-gold-500 transition-colors">Domains</a>
            <a href="#" className="text-darkgreen-600 hover:text-gold-500 transition-colors">Alerts</a>
            <a href="#" className="text-darkgreen-600 hover:text-gold-500 transition-colors">Billing</a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-darkgreen-600 text-sm">
              Welcome, {localStorage.getItem('name') || 'User'}
            </span>
            <button
              onClick={() => navigate('/logout')}
              className="bg-gold-500 text-darkgreen-600 hover:bg-gold-600 text-sm font-medium py-2 px-4 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* USDT Balance & Upgrade Section */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-2xl border border-darkgreen-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gold-500 text-darkgreen-600 rounded-flex items-center justify-center flex-shrink-0 text-xl">
                <span>💰</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold darkgreen-600">USDT Balance</h2>
                <p className="text-3xl font-medium gold-500"> {usdtBalance} USDT</p>
                <p className="text-darkgreen-500 text-sm">Available for withdrawal</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-darkgreen-200">
              <h3 className="text-semibold darkgreen-600 mb-4">Upgrade Your Tier</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => alert('Upgrade to Pro: $10/month for 5 sites')}
                  className="flex items-center gap-3 px-4 py-3 bg-darkgreen-600 text-white rounded-xl font-medium hover:bg-green-500 transition-all"
                >
                  <span className="text-xl">$10</span>
                  <span>Pro (5 sites)</span>
                </button>
                <button
                  onClick={() => alert('Upgrade to Agency: $50/month for 50 sites')}
                  className="flex items-center gap-3 px-4 py-3 bg-gold-500 text-darkgreen-600 rounded-xl font-medium hover:bg-gold-600 transition-all"
                >
                  <span className="text-xl">$50</span>
                  <span>Agency (50 sites)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Monitored Domains Table */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-2xl border border-darkgreen-200">
            <h2 className="text-2xl font-bold darkgreen-600 mb-6">Monitored Domains</h2>
            
            {domains.length === 0 ? (
              <p className="text-darkgreen-500 text-sm">No domains monitored yet. Add your first domain to get started.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-darkgreen-200">
                      <th className="text-left py-3 font-medium text-darkgreen-600">Domain</th>
                      <th className="text-center py-3 font-medium text-darkgreen-600">Status</th>
                      <th className="text-center py-3 font-medium text-darkgreen-600">Uptime</th>
                      <th className="text-center py-3 font-medium text-darkgreen-600">Last Checked</th>
                      <th className="text-right py-3 font-medium text-darkgreen-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domains.map((domain) => (
                      <tr key={domain.id} className="border-b border-darkgreen-100 hover:bg-darkgreen-50">
                        <td className="py-4 font-medium darkgreen-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-gold-100 flex items-center justify-center flex-shrink-0">
                              {domain.url.substring(0, 2).toUpperCase()}
                            </div>
                            <span>{domain.url}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-2 rounded text-xs font-medium ${domain.status === 'healthy' ? 'bg-darkgreen-100 text-darkgreen-600' : domain.status === 'warning' ? 'bg-gold-100 text-gold-600' : 'bg-red-100 text-red-600'}`}>
                            {domain.status}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <p className="text-sm {domain.uptime >= 99 ? 'text-darkgreen-600' : 'text-gold-600'} font-medium">
                            {domain.uptime}%
                          </p>
                        </td>
                        <td className="py-4 text-center text-darkgreen-500 text-sm">
                          {domain.lastChecked}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleRemoveDomain(domain.id)}
                            className="text-red-600 hover underline text-sm"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Alert Configuration Panel */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-2xl border border-darkgreen-200">
            <h2 className="text-2xl font-bold darkgreen-600 mb-6">Alert Configuration</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-darkgreen-600 text-sm font-medium mb-2">Notification Method</label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="notification" 
                      defaultChecked 
                      className="rounded border-darkgreen-300 w-4 h-4"
                    />
                    <span className="text-darkgreen-600">Email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="notification" 
                      className="rounded border-darkgreen-300 w-4 h-4"
                    />
                    <span className="text-darkgreen-600">Webhook</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="notification" 
                      className="rounded border-darkgreen-300 w-4 h-4"
                    />
                    <span className="text-darkgreen-600">Telegram</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-darkgreen-600 text-sm font-medium mb-2">Alert Triggers</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="rounded border-darkgreen-300 w-4 h-4"
                    />
                    <span className="text-darkgreen-600">Downtime detected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="rounded border-darkgreen-300 w-4 h-4"
                    />
                    <span className="text-darkgreen-600">500/502/503 errors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="rounded border-darkgreen-300 w-4 h-4"
                    />
                    <span className="text-darkgreen-600">robots.txt changes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="rounded border-darkgreen-300 w-4 h-4"
                    />
                    <span className="text-darkgreen-600">Sitemap issues</span>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gold-500 text-darkgreen-600 py-3 rounded-xl font-medium hover:bg-gold-600 transition-all"
              >
                Save Alert Settings
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-darkgreen-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="w-8 h-8 bg-gold-500 text-darkgreen-600 rounded-flex items-center justify-center font-bold text-xl mb-4">
                <span>SM</span>
              </div>
              <h3 className="text-xl font-bold darkgreen-600 mb-3">SEO Monitor</h3>
              <p className="text-darkgreen-500 text-sm">Premium automated SEO and server monitoring for webmasters and agencies.</p>
            </div>
            <div>
              <h4 className="text-darkgreen-600 font-medium mb-3">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-darkgreen-500 hover:text-gold-500 transition-colors text-sm">Features</a></li>
                <li><a href="#" className="text-darkgreen-500 hover:text-gold-500 transition-colors text-sm">Pricing</a></li>
                <li><a href="#" className="text-darkgreen-500 hover:text-gold-500 transition-colors text-sm">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-darkgreen-600 font-medium mb-3">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-darkgreen-500 hover:text-gold-500 transition-colors text-sm">About</a></li>
                <li><a href="#" className="text-darkgreen-500 hover:text-gold-500 transition-colors text-sm">Careers</a></li>
                <li><a href="#" className="text-darkgreen-500 hover:text-gold-500 transition-colors text-sm">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-darkgreen-600 font-medium mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-darkgreen-500 hover:text-gold-500 transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-darkgreen-500 hover:text-gold-500 transition-colors text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-darkgreen-500 hover:text-gold-500 transition-colors text-sm">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-darkgreen-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-darkgreen-500 text-sm">2024 SEO Monitor. All rights reserved.</p>
            <div className="flex gap-3">
              <a href="#" className="text-darkgreen-500 hover:text-gold-500 transition-colors" aria-label="Twitter">
                <span className="w-5 h-5 bg-darkgreen-500 rounded-flex items-center justify-center text-xs font-medium text-white">T</span>
              </a>
              <a href="#" className="text-darkgreen-500 hover:text-gold-500 transition-colors" aria-label="LinkedIn">
                <span className="w-5 h-5 bg-darkgreen-500 rounded-flex items-center justify-center text-xs font-medium text-white">In</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard