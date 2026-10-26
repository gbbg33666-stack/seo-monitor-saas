import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LandingPage: React.FC = () => {
  const [url, setUrl] = useState('')
  const navigate = useNavigate()
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<any>(null)

  const checkServer = async () => {
    if (!url) return
    setChecking(true)
    setResult(null)
    
    try {
      // Check the URL with protocol
      const targetUrl = url.startsWith('http') ? url : `https://${url}`
      
      // Fetch Nginx server headers
      const headersResponse = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/json',
        },
        timeout: 10000
      })
      
      // Fetch robots.txt
      const robotsUrl = new URL('/robots.txt', targetUrl).href
      const robotsResponse = await fetch(robotsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        },
        timeout: 10000
      })
      
      const robotsText = await robotsResponse.text()
      
      // Fetch sitemap.xml
      const sitemapUrl = new URL('/sitemap.xml', targetUrl).href
      const sitemapResponse = await fetch(sitemapUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml',
        },
        timeout: 10000
      })
      
      const sitemapXml = await sitemapResponse.text()
      
      setResult({
        status: headersResponse.status,
        statusText: headersResponse.statusText,
        headers: headersResponse.headers,
        robotsText,
        sitemapXml,
        isHealthy: headersResponse.status >= 200 && headersResponse.status < 500
      })
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        isHealthy: false
      })
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-darkgreen-50 to-gold-50 text-darkgreen-900">
      {/* Header Section */}
      <header className="py-6 px-6 border-b border-darkgreen-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gold-500 text-darkgreen-600 rounded-flex items-center justify-center font-bold text-xl">
              <span>SM</span>
            </div>
            <span className="text-2xl font-bold tracking-wider">SEO Monitor</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-darkgreen-600 hover:text-gold-500 transition-colors">Features</a>
            <a href="#pricing" className="text-darkgreen-600 hover:text-gold-500 transition-colors">Pricing</a>
          </div>
        </div>
      </header>

      {/* Hero Section - Freemium Lead Magnet */}
      <section className="px-6 py-20 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 text-darkgreen-600 rounded-full text-sm font-medium mb-8">
            <span>🎁</span>
            <span>Freemium Lead Magnet</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Automated SEO & <br/>Server Monitoring
          </h1>
          
          <p className="text-lg md:text-xl text-darkgreen-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Real-time backend checks on critical infrastructure files. Get instant alerts for unannounced changes, downtime, or misconfigurations on your Nginx servers.
          </p>
          
          {/* URL Check Form */}
          <div className="bg-white rounded-2xl p-8 mx-auto mb-12 max-w-2xl shadow-2xl">
            <h2 className="text-2xl font-bold darkgreen-600 mb-6">Instant Server Health Check</h2>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                if (url.trim()) {
                  checkServer()
                }
              }}
            >
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter your domain URL (e.g., example.com)"
                  disabled={checking}
                  className="flex-1 rounded-xl border border-darkgreen-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors"
                  aria-label="Enter domain URL"
                />
                <button
                  type="submit"
                  disabled={checking}
                  className="bg-gold-500 text-darkgreen-600 hover:bg-gold-600 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {checking ? 'Checking...' : 'Check Now'}
                </button>
              </div>
              
              {/* Result Display */}
              {result && (
                <div className="mt-6 p-6 rounded-2xl {result.isHealthy ? 'bg-darkgreen-50' : 'bg-red-500/10'} border-l-4 {result.isHealthy ? 'border-darkgreen-500' : 'border-red-500'}">
                  {result.error ? (
                    <div className="text-sm text-red-600 mb-4">
                      <strong>Error:</strong> {result.error}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-darkgreen-500">Status Code</p>
                        <p className="text-2xl font-bold {result.status >= 500 ? 'text-red-600' : 'text-green-600'}">{result.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-darkgreen-500">Robots.txt</p>
                        <p className="text-sm {/robotsText.includes('Disallow: /') ? 'text-red-600' : 'text-green-600'}">{result.robotsText.substring(0, 100)}...</p>
                      </div>
                      <div>
                        <p className="text-sm text-darkgreen-500">Sitemap.xml</p>
                        <p className="text-sm">{result.sitemapXml.includes('<url>') ? 'Valid sitemap found' : 'No sitemap'}...</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setResult(null)}
                    className="mt-4 inline-flex items-center gap-2 text-sm text-gold-500 hover underline"
                  >
                    Hide Results
                  </button>
                </div>
              )}
            </form>
          </div>
          
          {/* Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-darkgreen-200">
            <div>
              <p className="text-sm text-darkgreen-500">Trusted by</p>
              <div className="flex gap-2 mt-2">
                <span className="w-8 h-8 bg-white rounded flex items-center justify-center text-xs font-medium">AG</span>
                <span className="w-8 h-8 bg-white rounded flex items-center justify-center text-xs font-medium">SE</span>
                <span className="w-8 h-8 bg-white rounded flex items-center justify-center text-xs font-medium">EN</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-darkgreen-500">Since 2024</p>
            </div>
            <div>
              <p className="text-sm text-darkgreen-500">99.9%</p>
              <p className="text-xs text-darkgreen-400">Uptime SLA</p>
            </div>
            <div>
              <p className="text-sm text-darkgreen-500">24/7</p>
              <p className="text-xs text-darkgreen-400">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-12" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold darkgreen-600 mb-4">Premium Features</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center text-xs font-medium text-darkgreen-600 flex-shrink-0">
                    <span>✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium darkgreen-700">Sitemap.xml Analysis</h4>
                    <p className="text-darkgreen-500 text-sm">Structural integrity validation and schema detection</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center text-xs font-medium text-darkgreen-600 flex-shrink-0">
                    <span>✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium darkgreen-700">robots.txt Monitoring</h4>
                    <p className="text-darkgreen-500 text-sm">Unwanted Disallow directive detection</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center text-xs font-medium text-darkgreen-600 flex-shrink-0">
                    <span>✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium darkgreen-700">Nginx Header Monitoring</h4>
                    <p className="text-darkgreen-500 text-sm">500, 502, 503 error detection and default page warning</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center text-xs font-medium text-darkgreen-600 flex-shrink-0">
                    <span>✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium darkgreen-700">Real-time Alerts</h4>
                    <p className="text-darkgreen-500 text-sm">Instant notifications via webhook or email</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold darkgreen-600 mb-4">Why Monitor?</h3>
              <ul className="space-y-3 text-darkgreen-600">
                <li>Prevent revenue loss from unexpected downtime</li>
                <li>Catch SEO-breaking robots.txt changes immediately</li>
                <li>Maintain site health for search engine crawlers</li>
                <li>Get ahead of server misconfigurations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-20 bg-gold-50" id="pricing">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold darkgreen-600 mb-4">Flexible Pricing Tiers</h2>
            <p className="text-darkgreen-600 max-w-2xl mx-auto">Choose the plan that fits your agency needs</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Free Tier */}
            <div className="bg-white rounded-3xl p-6 border border-darkgreen-200 transition-all hover:border-gold-500">
              <p className="text-sm text-darkgreen-500 uppercase tracking-wider mb-3">Freemium</p>
              <p className="text-4xl font-bold darkgreen-600 mb-2">$0/month</p>
              <ul className="space-y-3 text-darkgreen-600">
                <li>✓ 2 monitored domains</li>
                <li>✓ Daily health checks</li>
                <li>✓ Basic uptime monitoring</li>
                <li>✓ Email alerts</li>
                <li>✗ Sitemap analysis</li>
                <li>✗ robots.txt monitoring</li>
              </ul>
              <button className="mt-4 w-full bg-gold-500 text-darkgreen-600 py-3 rounded-xl font-medium hover:bg-gold-600 transition-colors">
                Get Started Free
              </button>
            </div>
            
            {/* Pro Tier */}
            <div className="bg-white rounded-3xl p-6 border border-darkgreen-200 transition-all hover:border-gold-500">
              <p className="text-sm text-darkgreen-500 uppercase tracking-wider mb-3">Pro</p>
              <p className="text-4xl font-bold darkgreen-600 mb-2">$10/month</p>
              <ul className="space-y-3 text-darkgreen-600">
                <li>✓ 5 monitored domains</li>
                <li>✓ Hourly health checks</li>
                <li>✓ Sitemap analysis</li>
                <li>✓ robots.txt monitoring</li>
                <li>✓ Nginx header monitoring</li>
                <li>✓ Real-time alerts</li>
              </ul>
              <button className="mt-4 w-full bg-darkgreen-600 text-white py-3 rounded-xl font-medium hover:bg-green-500 transition-colors">
                Subscribe Pro
              </button>
            </div>
            
            {/* Agency Tier */}
            <div className="bg-white rounded-3xl p-6 border border-darkgreen-200 transition-all hover:border-gold-500">
              <p className="text-sm text-darkgreen-500 uppercase tracking-wider mb-3">Agency</p>
              <p className="text-4xl font-bold darkgreen-600 mb-2">$50/month</p>
              <ul className="space-y-3 text-darkgreen-600">
                <li>✓ 50 monitored domains</li>
                <li>✓ Real-time health checks</li>
                <li>✓ Advanced sitemap validation</li>
                <li>✓ Comprehensive robots.txt audit</li>
                <li>✓ Nginx deep header analysis</li>
                <li>✓ Priority alerts</li>
              </ul>
              <button className="mt-4 w-full bg-gold-500 text-darkgreen-600 py-3 rounded-xl font-medium hover:bg-gold-600 transition-colors">
                Subscribe Agency
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage