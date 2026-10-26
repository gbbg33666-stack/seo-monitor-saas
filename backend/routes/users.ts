import express from 'express'
import { User } from '../models/User'
import { Referral } from '../models/Referral'
import { Payment } from '../models/Payment'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router()

// @route   POST /api/users/signup
// @desc    Register new user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, tier } = req.body
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' })
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      tier: tier || 'free',
    })
    
    await user.save()
    
    // Generate auth token
    const token = jwt.sign(
      { userId: user._id, tier: user.tier },
      process.env.JWT_SECRET || 'seomonitortoken',
      { expiresIn: '7d' }
    )
    
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        tier: user.tier,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ message: 'Server error during signup' })
  }
})

// @route   POST /api/users/login
// @desc    Authenticate user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    
    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    
    // Update last login
    user.lastLogin = new Date()
    await user.save()
    
    // Generate auth token
    const token = jwt.sign(
      { userId: user._id, tier: user.tier },
      process.env.JWT_SECRET || 'seomonitortoken',
      { expiresIn: '7d' }
    )
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        usdtBalance: user.usdtBalance,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login' })
  }
})

// @route   GET /api/users/me
// @desc    Get current user profile
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      usdtBalance: user.usdtBalance,
      referralCode: user.referralCode,
      monitoredDomains: user.monitoredDomains.length,
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/users/withdraw
// @desc    Withdraw USDT balance
router.post('/withdraw', async (req, res) => {
  try {
    const { address, amount } = req.body
    
    if (!address || !amount) {
      return res.status(400).json({ message: 'Address and amount are required' })
    }
    
    const user = await User.findById(req.user?.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    if (user.usdtBalance < amount) {
      return res.status(400).json({ message: 'Insufficient USDT balance' })
    }
    
    // In real implementation, would send USDT to the address
    // For now, just deduct from balance
    user.usdtBalance -= amount
    await user.save()
    
    res.json({
      message: 'Withdrawal processed successfully',
      newBalance: user.usdtBalance,
    })
  } catch (error) {
    console.error('Withdrawal error:', error)
    res.status(500).json({ message: 'Server error during withdrawal' })
  }
})

// @route   POST /api/users/referrals
// @desc    Get user referral stats
router.get('/referrals', async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    // Get referral data
    const referrals = await Referral.find({ referrer: user._id, status: 'active' })
    
    // Calculate earnings
    let totalEarnings = 0
    referrals.forEach((ref) => {
      totalEarnings += ref.tier1Commission + ref.tier2Commission + ref.tier3Commission
    })
    
    res.json({
      referralCode: user.referralCode,
      referredCount: referrals.length,
      totalEarnings,
      tier1Commission: referrals.reduce((sum, ref) => sum + ref.tier1Commission, 0),
      tier2Commission: referrals.reduce((sum, ref) => sum + ref.tier2Commission, 0),
      tier3Commission: referrals.reduce((sum, ref) => sum + ref.tier3Commission, 0),
    })
  } catch (error) {
    console.error('Referral stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router