import mongoose, { Schema, model } from 'mongoose'

const PaymentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  // USDT transaction details
  transactionHash: {
    type: String,
    required: [true, 'Transaction hash is required'],
    unique: true,
  },
  usdtAddress: {
    type: String,
    required: [true, 'USDT address is required'],
  },
  tier: {
    type: String,
    enum: ['pro', 'agency'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'refunded'],
    default: 'pending',
  },
  confirmationBlock: {
    type: Number,
    min: 0,
  },
  confirmedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for frequent queries
PaymentSchema.index({ user: 1, status: 1 })
PaymentSchema.index({ transactionHash: 1, usdtAddress: 1 })

export const Payment = model('Payment', PaymentSchema)
export default Payment