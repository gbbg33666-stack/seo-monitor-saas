import express from 'express'
import { User } from '../models/User'
import { Referral } from '../models/Referral'
import { Payment } from '../models/Payment'
import jwt from 'jsonwebtoken'

const router = express.Router()

// @route   GET /api/referrals/stats
// @desc    Get referral statistics
router.get('/stats', async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    // Get direct referrals
    const directReferrals = await Referral.find({ referrer: user._id, status: 'active' })
    
    // Get secondary referrals (referred users who also made referrals)
    const secondaryReferralIds = directReferrals
      .filter(ref => ref.referredUser)
      .map(ref => ref.referredUser)
    
    const secondaryReferrals = await Referral.find({
      referrer: { $in: secondaryReferralIds },
      status: 'active'
    })
    
    // Calculate commissions
    let totalEarnings = 0
    let tier1Total = 0
    let tier2Total = 0
    let tier3Total = 0
    
    directReferrals.forEach((ref) => {
      tier1Total += ref.tier1Commission
      tier2Total += ref.tier2Commission
      tier3Total += ref.tier3Commission
      totalEarnings += ref.tier1Commission + ref.tier2Commission + ref.tier3Commission
    })
    
    secondaryReferrals.forEach((ref) => {
      tier1Total += ref.tier1Commission
      tier2Total += ref.tier2Commission
      tier3Total += ref.tier3Commission
      totalEarnings += ref.tier1Commission + ref.tier2Commission + ref.tier3Commission
    })
    
    res.json({
      referralCode: user.referralCode,
      directReferrals: directReferrals.length,
      secondaryReferrals: secondaryReferrals.length,
      tier1CommissionRate: user.tier === 'agency' ? 0.15 : 0.10,
      tier2CommissionRate: user.tier === 'agency' ? 0.08 : 0.05,
      tier3CommissionRate: user.tier === 'agency' ? 0.03 : 0,
      tier1Total,
      tier2Total,
      tier3Total,
      totalEarnings,
      UsdtBalance: user.usdtBalance,
    })
  } catch (error) {
    console.error('Referral stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/referrals/generate
// @desc    Generate referral link for user
router.post('/generate', async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    // Check if referral code already exists
    let referralCode = user.referralCode
    if (!referralCode) {
      const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
      let code = ''
      for (let i = 0; i < 6; i++) {
        code += characters[Math.floor(Math.random() * characters.length)]
      }
      referralCode = code
      
      // Update user's referral code
      user.referralCode = code
      await user.save()
    }
    
    // Generate referral link
    const referralLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/referral/${referralCode}`
    
    res.json({
      referralCode,
      referralLink,
      commissionRates: {
        tier1: user.tier === 'agency' ? 0.15 : 0.10,
        tier2: user.tier === 'agency' ? 0.08 : 0.05,
        tier3: user.tier === 'agency' ? 0.03 : 0,
      },
    })
  } catch (error) {
    console.error('Generate referral link error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/referrals/confirm/:referredId
// @desc    Confirm referral and calculate commissions
router.post('/confirm/:referredId', async (req, res) => {
  try {
    const referrer = await User.findById(req.user?.userId)
    const referredUser = await User.findById(req.params.referredId)
    
    if (!referrer || !referredUser) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    // Check if referral already exists
    const existingReferral = await Referral.findOne({
      referrer: referrer._id,
      referredUser: referredUser._id,
    })
    
    if (existingReferral) {
      return res.status(400).json({ message: 'Referral already exists' })
    }
    
    // Create referral record
    const commissionRate = referrer.tier === 'agency' ? 0.15 : 0.10
    
    const referral = new Referral({
      referrer: referrer._id,
      referredUser: referredUser._id,
      tier: referrer.tier,
      commissionRate,
      tier1Commission: 0, // Will be calculated on first payment
    })
    
    await referral.save()
    
    res.json({
      message: 'Referral tracked successfully',
      referralCode: referrer.referralCode,
      commissionRate,
    })
  } catch (error) {
    console.error('Confirm referral error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/referrals/calculate
// @desc    Calculate commissions on subscription payment
router.post('/calculate', async (req, res) => {
  try {
    const { paymentId, referredTier } = req.body
    
    // Find the payment
    const payment = await Payment.findById(paymentId)
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }
    
    const referredUser = await User.findById(payment.user)
    const referrer = await User.findById(req.user?.userId)
    
    if (!referredUser || !referrer) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    // Determine commission rates based on referred tier
    let commissionRate: number
    if (referredTier === 'agency') {
      commissionRate = 0.15 // 15% for agency referrals
    } else {
      commissionRate = 0.10 // 10% for pro referrals
    }
    
    // Calculate commission amount
    const commissionAmount = payment.amount * commissionRate
    
    // Update referral earnings
    if (existingReferral) {
      // This should not happen based on the check above, but just in case
      await Referral.updateOne(
        { _id: existingReferral._id },
        {
          $inc: { tier1Commission: commissionAmount, lifetimeEarnings: commissionAmount },
        }
      )
    } else {
      const newReferral = new Referral({
        referrer: referrer._id,
        referredUser: referredUser._id,
        tier: referredTier,
        commissionRate,
        tier1Commission: commissionAmount,
        lifetimeEarnings: commissionAmount,
      })
      await newReferral.save()
    }
    
    // Add to referrer's USDT balance
    await User.updateOne(
      { _id: referrer._id },
      { $inc: { usdtBalance: commissionAmount } }
    )
    
    res.json({
      message: 'Commission calculated successfully',
      commissionAmount,
      newBalance: referrer.usdtBalance + commissionAmount,
    })
  } catch (error) {
    console.error('Calculate commission error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router