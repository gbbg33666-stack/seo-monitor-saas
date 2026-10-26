import 'dotenv/config'

import express, { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import path from 'path'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
type ExpressRequest = any
type ExpressResponse = any

// Connect to MongoDB
const MONGODB_URI = 'mongodb+srv://gbbg33666_db_user:pGu4qq9FIoyvISvk@cluster0.kpgrpd1.mongodb.net/seomonitor'

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully')
    startMonitoringCron()
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
  })

// Import routes
import userRoutes from './routes/users'
import domainRoutes from './routes/domains'
import referralRoutes from './routes/referrals'

app.use('/api/users', userRoutes)
app.use('/api/domains', domainRoutes)
app.use('/api/referrals', referralRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'))
  })
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Cron monitoring job
let monitorJob: any = null

function startMonitoringCron() {
  const { CronJob } = require('cron')

  monitorJob = new CronJob('*/5 * * * *', async () => {
    console.log(`Monitoring job started at ${new Date().toISOString()}`)

    try {
      // Fetch all domains that need checking
      const domains = await mongoose.connection.useDb('seomonitor').collection('domains').find({
        status: { $ne: 'checking' }
      }).limit(50).toArray()

      console.log(`Checking ${domains.length} domains`)

      for (const domain of domains) {
        try {
          const { url } = domain
          let status = 'healthy'
          let nginxStatusCode = 200
          let sitemapIssues: string[] = []
          let hasDisallow = false
          let disallowDirectives: string[] = []
          let isDefaultPage = false

          // Fetch robots.txt
          try {
            const robotsUrl = `${url}/robots.txt`
            const robotsResponse = await globalThis.fetch(robotsUrl, {
              method: 'GET',
              timeout: 8000
            })

            // Simple robots.txt parsing
            const robotsText = await robotsResponse.text()
            if (robotsText.includes('Disallow:')) {
              hasDisallow = true
              const disallowMatches = robotsText.match(/Disallow:[\s]*(.+)/gi)
              if (disallowMatches) {
                disallowDirectives = disallowMatches.map(m => m.replace('Disallow:', '').trim())
              }
            }
          } catch (robotsError) {
            console.log(`robots.txt fetch error for ${url}:`, robotsError)
          }

          // Fetch sitemap.xml
          try {
            const sitemapUrl = `${url}/sitemap.xml`
            const sitemapResponse = await globalThis.fetch(sitemapUrl, {
              method: 'GET',
              headers: { 'Accept': 'application/xml' },
              timeout: 8000
            })

            const sitemapText = await sitemapResponse.text()
            if (!sitemapText.includes('<url>')) {
              sitemapIssues.push('missing')
            }
          } catch (sitemapError) {
            console.log(`sitemap.xml fetch error for ${url}:`, sitemapError)
            sitemapIssues.push('invalid-structure')
          }

          // Fetch Nginx server response
          try {
            const headersResponse = await globalThis.fetch(url, {
              method: 'HEAD',
              timeout: 8000,
              validateStatus: (status: number) => status < 500
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
                const getResponse = await globalThis.fetch(url, {
                  method: 'GET',
                  timeout: 8000,
                  maxRedirects: 0
                })
                const html = await getResponse.text()
                const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
                const title = titleMatch ? titleMatch[1] : ''
                const defaultTitles = ['index of /', 'welcome to nginx', 'debian default page', 'apache default page']
                isDefaultPage = defaultTitles.some(t => title.toLowerCase().includes(t.toLowerCase()))
              } catch {}
            }
          } catch (nginxError) {
            console.log(`Nginx fetch error for ${url}:`, nginxError)
            status = 'down'
            nginxStatusCode = 0
          }

          // Determine overall status
          if (status === 'critical' || nginxStatusCode === 0) {
            status = 'critical'
          } else if (hasDisallow && sitemapIssues.includes('missing')) {
            status = 'warning'
          }

          // Update domain in database
          await mongoose.connection.useDb('seomonitor').collection('domains').updateOne(
            { _id: domain._id },
            {
              $set: {
                status,
                lastChecked: new Date(),
                nginxStatus: {
                  code: nginxStatusCode,
                  title: isDefaultPage ? 'Default Nginx Page' : '',
                  isDefaultPage
                },
                sitemap: {
                  isValid: sitemapIssues.length === 0,
                  issues: sitemapIssues,
                  lastChecked: new Date()
                },
                robots: {
                  hasDisallow,
                  disallowDirectives,
                  lastChecked: new Date()
                }
              }
            }
          )

          console.log(`✓ ${url}: ${status} (status: ${nginxStatusCode})`)

        } catch (domainError) {
          console.error(`Error checking domain ${domain._id}:`, domainError)
        }
      }

      console.log(`Monitoring job completed at ${new Date().toISOString()}`)

    } catch (error) {
      console.error('Monitoring job error:', error)
    }
  }, true) // Run once immediately

  monitorJob.start()
  console.log('Domain monitoring cron job started - runs every 5 minutes')
