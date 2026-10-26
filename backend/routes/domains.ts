import express, { Request, Response, Router } from 'express'
import { Domain } from '../models/Domain'
import { User } from '../models/User'
import axios from 'axios'
const cheerio = require('cheerio')
const { create } = require('sitemap')
const robots = require('robots-parser')

const router = express.Router()

// @route   GET /api/domains
// @desc    Get all monitored domains for user
router.get('/', async (req, res) => {
  try {
    const domains = await Domain.find({ user: req.user?.userId })
    res.json(domains)
  } catch (error) {
    console.error('Get domains error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/domains
// @desc    Add new domain for monitoring
router.post('/', async (req, res) => {
  try {
    const { url } = req.body
    
    if (!url) {
      return res.status(400).json({ message: 'Domain URL is required' })
    }
    
    // Check if user already monitors this domain
    const existingDomain = await Domain.findOne({ url, user: req.user?.userId })
    if (existingDomain) {
      return res.status(400).json({ message: 'You already monitor this domain' })
    }
    
    // Parse the URL
    const parsedUrl = new URL(url)
    const domainName = parsedUrl.hostname// Perform initial check
    let status = 'healthy'
    let nginxStatusCode = 200
    let sitemapIssues: any[] = []
    let robotsIssues: any[] = []
    
    // Initialize monitoring variables (defined outside try block for scope accessibility)
    let robotsInfo: any
    let hasDisallow = false
    let disallowDirectives: any[] = []
    let isDefaultPage = false
    
    try {
      // Fetch robots.txt
      const robotsUrl = `${url}/robots.txt`
      const robotsResponse = await axios.get(robotsUrl, { timeout: 10000 })
      const robotsContent = robotsResponse.data
      
      // Parse robots.txt
      robotsInfo = robots(parsedUrl.origin)
      const parsedRobots = robotsInfo.parse(parsedUrl.pathname)
      
      // Check for disallow directives
      if (robotsInfo && robotsInfo.disallow) {
        // Check if any disallow affects the root or important paths
        const disallows = Array.isArray(robotsInfo.disallow) ? robotsInfo.disallow : [robotsInfo.disallow]
        hasDisallow = disallows.length > 0
        disallowDirectives = disallows
      }
      
      // Fetch sitemap.xml
      const sitemapUrl = `${url}/sitemap.xml`
      let sitemapResponse
      try {
        sitemapResponse = await axios.get(sitemapUrl, { timeout: 10000, headers: { 'Accept': 'application/xml' } })
        
        // Validate sitemap structure
        const $ = cheerio.load(sitemapResponse.data)
        const urls = $('url > loc').get()
        
        if (urls.length === 0) {
          sitemapIssues.push('missing')
        }
      } catch (sitemapError) {
        sitemapIssues.push('invalid-structure')
      }
      
      // Fetch Nginx server response
      const headersResponse = await axios.get(url, {
        method: 'HEAD',
        timeout: 10000,
        validateStatus: (status) => status < 500, // Accept all status codes under 500
      })
      
      nginxStatusCode = headersResponse.status
      
      // Check for error status codes
      if (nginxStatusCode >= 500) {
        status = 'critical'
      } else if (nginxStatusCode >= 400) {
        status = 'warning'
      }
      
      // Check for default server pages (basic detection)
      if (nginxStatusCode === 200) {
        try {
          const getResponse = await axios.get(url, { timeout: 10000, maxRedirects: 0 })
          const $ = cheerio.load(getResponse.data)
          const title = $('title').first().text().trim()
          const defaultTitles = ['index of /', 'welcome to nginx', 'debian default page', 'apache default page']
          isDefaultPage = defaultTitles.some(t => title.toLowerCase().includes(t.toLowerCase()))
        } catch {
          // If GET fails, might be default page
        }
      }
    } catch (error: any) {
      // Network error or domain not reachable
      status = 'down'
      nginxStatusCode = 0
    }
    
    await domain.save()
    
    // Add to user's monitored domains
    await User.findByIdAndUpdate(
      req.user?.userId,
      { $push: { monitoredDomains: domain._id } },
      { new: true }
    )
    
    res.status(201).json(domain)
  } catch (error) {
    console.error('Add domain error:', error)
    res.status(500).json({ message: 'Server error adding domain' })
  }
})

// @route   DELETE /api/domains/:id
// @desc    Remove monitored domain
router.delete('/:id', async (req, res) => {
  try {
    const domain = await Domain.findOneAndDelete({
      _id: req.params.id,
      user: req.user?.userId,
    })
    
    if (!domain) {
      return res.status(404).json({ message: 'Domain not found' })
    }
    
    // Remove from user's monitored domains
    await User.findByIdAndUpdate(
      req.user?.userId,
      { $pull: { monitoredDomains: req.params.id } },
      { new: true }
    )
    
    res.json({ message: 'Domain removed successfully' })
  } catch (error) {
    console.error('Remove domain error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/domains/check/:id
// @desc    Run manual check on a domain
router.post('/check/:id', async (req, res) => {
  try {
    const domain = await Domain.findOne({
      _id: req.params.id,
      user: req.user?.userId,
    })
    
    if (!domain) {
      return res.status(404).json({ message: 'Domain not found' })
    }
    
    // Perform the same checks as on creation
    const { url } = domain
    let status = 'healthy'
    let nginxStatusCode = 200
    let sitemapIssues: any[] = []
    let robotsIssues: any[] = []
    let hasDisallow = false
    let disallowDirectives: any[] = []
    let isDefaultPage = false
    
    try {
      // Fetch robots.txt
      const robotsUrl = `${url}/robots.txt`
      const robotsResponse = await axios.get(robotsUrl, { timeout: 10000 })
      const robotsContent = robotsResponse.data
      
      // Parse robots.txt using robots-parser
      const parsedRobots = robots(`${url.origin}`)
      const robotsInfo = await parsedRobots.parse(url.pathname)
      
      if (robotsInfo && robotsInfo.disallow) {
        const disallows = Array.isArray(robotsInfo.disallow) ? robotsInfo.disallow : [robotsInfo.disallow]
        hasDisallow = disallows.length > 0
        disallowDirectives = disallows
      }
      
      // Fetch sitemap.xml
      const sitemapUrl = `${url}/sitemap.xml`
      let sitemapResponse
      try {
        sitemapResponse = await axios.get(sitemapUrl, { timeout: 10000, headers: { 'Accept': 'application/xml' } })
        
        const $ = cheerio.load(sitemapResponse.data)
        const urls = $('url > loc').get()
        
        if (urls.length === 0) {
          sitemapIssues.push('missing')
        }
      } catch (sitemapError) {
        sitemapIssues.push('invalid-structure')
      }
      
      // Fetch Nginx server response
      const headersResponse = await axios.head(url, {
        timeout: 10000,
        validateStatus: (status) => status < 500,
      })
      
      nginxStatusCode = headersResponse.status
      
      if (nginxStatusCode >= 500) {
        status = 'critical'
      } else if (nginxStatusCode >= 400) {
        status = 'warning'
      }
      
      // Check for default server pages
      if (nginxStatusCode === 200) {
        try {
          const getResponse = await axios.get(url, { timeout: 10000, maxRedirects: 0 })
          const $ = cheerio.load(getResponse.data)
          const title = $('title').first().text().trim()
          const defaultTitles = ['index of /', 'welcome to nginx', 'debian default page', 'apache default page']
          isDefaultPage = defaultTitles.some(t => title.toLowerCase().includes(t.toLowerCase()))
        } catch {
          // If GET fails, might be default page
        }
      }
      
    } catch (error: any) {
      status = 'down'
      nginxStatusCode = 0
    }
    
    // Update domain
    domain.status = status
    domain.lastChecked = new Date()
    domain.nginxStatus = {
      code: nginxStatusCode,
      title: isDefaultPage ? 'Default Nginx Page' : '',
      isDefaultPage,
    }
    domain.sitemap = {
      isValid: sitemapIssues.length === 0,
      issues: sitemapIssues,
      lastChecked: new Date(),
    }
    domain.robots = {
      hasDisallow,
      disallowDirectives,
      lastChecked: new Date(),
    }
    
    await domain.save()
    
    res.json(domain)
  } catch (error) {
    console.error('Manual check error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router