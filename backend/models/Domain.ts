import mongoose, { Schema, model } from 'mongoose'

const DomainSchema = new Schema({
  url: {
    type: String,
    required: [true, 'Domain URL is required'],
    trim: true,
    match: [/^https?:\/\//i, 'Please enter a valid URL with http:// or https://'],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['healthy', 'warning', 'critical', 'down'],
    default: 'healthy',
  },
  lastChecked: {
    type: Date,
    default: Date.now,
  },
  uptimePercentage: {
    type: Number,
    default: 100,
    min: [0, 'Uptime cannot be less than 0%'],
    max: [100, 'Uptime cannot be more than 100%'],
  },
  sitemap: {
    isValid: {
      type: Boolean,
      default: true,
    },
    lastChecked: {
      type: Date,
      default: Date.now,
    },
    issues: [{
      type: String,
      enum: ['missing', 'invalid-structure', 'broken-links', 'other'],
    }],
  },
  robots: {
    hasDisallow: {
      type: Boolean,
      default: false,
    },
    disallowDirectives: [
      {
        type: String,
      },
    ],
    lastChecked: {
      type: Date,
      default: Date.now,
    },
  },
  nginxStatus: {
    code: {
      type: Number,
      default: 200,
    },
    title: {
      type: String,
      default: '',
    },
    isDefaultPage: {
      type: Boolean,
      default: false,
    },
    lastChecked: {
      type: Date,
      default: Date.now,
    },
  },
  alertPreferences: {
    downtime: {
      type: Boolean,
      default: true,
    },
    error5xx: {
      type: Boolean,
      default: true,
    },
    robotsChanges: {
      type: Boolean,
      default: true,
    },
    sitemapIssues: {
      type: Boolean,
      default: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for frequent queries
DomainSchema.index({ user: 1, status: 1 })
DomainSchema.index({ user: 1, lastChecked: -1 })

export const Domain = model('Domain', DomainSchema)
export default Domain