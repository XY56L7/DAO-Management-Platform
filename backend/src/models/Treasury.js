const mongoose = require('mongoose');

const TreasurySchema = new mongoose.Schema({
  transactionHash: {
    type: String,
    unique: true,
    sparse: true
  },
  transactionIndex: {
    type: Number
  },
  type: {
    type: String,
    enum: ['Deposit', 'Withdrawal', 'Transfer', 'Expenditure'],
    required: true
  },
  token: {
    address: {
      type: String,
      lowercase: true
    },
    symbol: String,
    name: String,
    decimals: Number
  },
  amount: {
    type: String,
    required: true
  },
  from: {
    type: String,
    lowercase: true
  },
  to: {
    type: String,
    lowercase: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['Development', 'Marketing', 'Operations', 'Grants', 'Liquidity', 'Other']
  },
  confirmations: {
    type: Number,
    default: 0
  },
  requiredConfirmations: {
    type: Number
  },
  confirmedBy: [{
    address: String,
    timestamp: Date
  }],
  executed: {
    type: Boolean,
    default: false
  },
  executedAt: {
    type: Date
  },
  blockNumber: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

TreasurySchema.index({ type: 1, timestamp: -1 });
TreasurySchema.index({ 'token.address': 1 });
TreasurySchema.index({ executed: 1 });

module.exports = mongoose.model('Treasury', TreasurySchema);
