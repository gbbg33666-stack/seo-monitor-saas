import mongoose, { Schema, model } from 'mongoose'

const ReferralSchema = new Schema({
  referrer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referredUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tier: {
    type: String,
    enum: ['pro', 'agency'],
    default: 'pro',
  },
  commissionRate: {
    type: Number,
    default: 0.1, // 10% default
    min: [0, 'Commission rate cannot be negative'],
    max: [1, 'Commission rate cannot exceed 100%'],
  },
  // Tier 1: Direct referral commission
  tier1Commission: {
    type: Number,
    default: 0,
    min: [0, 'Commission cannot be negative'],
  },
  // Tier 2: Secondary referral commission (if applicable)
  tier2Commission: {
    type: Number,
    default: 0,
    min: [0, 'Commission cannot be negative'],
  },
  // Tier 3: Tertiary referral commission (if applicable)
  tier3Commission: {
    type: Number,
    default: 0,
    min: [0, 'Commission cannot be negative'],
  },
  // Lifetime earnings
  lifetimeEarnings: {
    type: Number,
    default: 0,
    min: [0, 'Earnings cannot be negative'],
  },
  // Subscription payments from referred users
  referredSubscriptions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
  ],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for frequent queries
ReferralSchema.index({ referrer: 1, status: 1 })
ReferralSchema.index({ referredUser: 1 })

export const Referral = model('Referral', ReferralSchema)
export default Referral