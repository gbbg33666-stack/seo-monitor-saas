import mongoose, { Schema, model } from 'mongoose'

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  usdtBalance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative'],
  },
  referralCode: {
    type: String,
    unique: true,
    default: undefined,
  },
  referredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  referralEarnings: {
    type: Number,
    default: 0,
    min: [0, 'Earnings cannot be negative'],
  },
  tier: {
    type: String,
    enum: ['free', 'pro', 'agency'],
    default: 'free',
  },
  monitoredDomains: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
})

// Generate referral code before saving
UserSchema.pre('save', async function (next) {
  if (!this.referralCode) {
    // Generate a 6-character referral code
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += characters[Math.floor(Math.random() * characters.length)]
    }
    this.referralCode = code
  }
  next()
})

export const User = model('User', UserSchema)
export default User