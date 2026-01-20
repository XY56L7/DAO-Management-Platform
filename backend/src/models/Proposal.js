const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  proposalId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Treasury', 'Governance', 'Technical', 'Marketing', 'Community', 'Other'],
    default: 'Other'
  },
  proposer: {
    type: String,
    required: true,
    lowercase: true
  },
  targets: [{
    type: String
  }],
  values: [{
    type: String
  }],
  calldatas: [{
    type: String
  }],
  state: {
    type: String,
    enum: ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'],
    default: 'Pending'
  },
  forVotes: {
    type: String,
    default: '0'
  },
  againstVotes: {
    type: String,
    default: '0'
  },
  abstainVotes: {
    type: String,
    default: '0'
  },
  startBlock: {
    type: Number
  },
  endBlock: {
    type: Number
  },
  eta: {
    type: Number
  },
  voters: [{
    address: String,
    support: Number,
    weight: String,
    reason: String,
    timestamp: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ProposalSchema.index({ state: 1, createdAt: -1 });
ProposalSchema.index({ proposer: 1, createdAt: -1 });
ProposalSchema.index({ category: 1, state: 1 });

module.exports = mongoose.model('Proposal', ProposalSchema);
