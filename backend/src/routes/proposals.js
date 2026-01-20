const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const Proposal = require('../models/Proposal');
const { getContracts } = require('../config/contracts');

// Get all proposals
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('state').optional().isString(),
  query('category').optional().isString(),
  query('proposer').optional().isEthereumAddress()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.state) filter.state = req.query.state;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.proposer) filter.proposer = req.query.proposer.toLowerCase();

    const proposals = await Proposal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Proposal.countDocuments(filter);

    res.json({
      proposals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get proposal by ID
router.get('/:proposalId', [
  param('proposalId').isString()
], async (req, res) => {
  try {
    const proposal = await Proposal.findOne({ proposalId: req.params.proposalId });
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Get on-chain data
    const { daoGovernor } = getContracts();
    const state = await daoGovernor.state(req.params.proposalId);
    const votes = await daoGovernor.proposalVotes(req.params.proposalId);

    proposal.state = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'][state];
    proposal.forVotes = votes.forVotes.toString();
    proposal.againstVotes = votes.againstVotes.toString();
    proposal.abstainVotes = votes.abstainVotes.toString();
    
    await proposal.save();

    res.json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create proposal
router.post('/', [
  body('title').isString().notEmpty(),
  body('description').isString().notEmpty(),
  body('category').isString().optional(),
  body('targets').isArray(),
  body('values').isArray(),
  body('calldatas').isArray(),
  body('proposer').isEthereumAddress()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, targets, values, calldatas, proposer } = req.body;

    // In production, this would interact with the smart contract
    const proposalId = `0x${Date.now().toString(16)}`;

    const proposal = new Proposal({
      proposalId,
      title,
      description,
      category,
      targets,
      values,
      calldatas,
      proposer: proposer.toLowerCase(),
      state: 'Pending'
    });

    await proposal.save();

    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get proposal votes
router.get('/:proposalId/votes', async (req, res) => {
  try {
    const proposal = await Proposal.findOne({ proposalId: req.params.proposalId });
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json({
      proposalId: proposal.proposalId,
      forVotes: proposal.forVotes,
      againstVotes: proposal.againstVotes,
      abstainVotes: proposal.abstainVotes,
      voters: proposal.voters
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get proposal statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Proposal.aggregate([
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Proposal.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      byState: stats,
      byCategory: categoryStats,
      total: await Proposal.countDocuments()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
