const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const { getContracts } = require('../config/contracts');

// Cast vote
router.post('/cast', [
  body('proposalId').isString().notEmpty(),
  body('voter').isEthereumAddress(),
  body('support').isInt({ min: 0, max: 2 }),
  body('reason').optional().isString(),
  body('signature').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { proposalId, voter, support, reason } = req.body;

    const proposal = await Proposal.findOne({ proposalId });
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Check if already voted
    const hasVoted = proposal.voters.some(v => v.address.toLowerCase() === voter.toLowerCase());
    if (hasVoted) {
      return res.status(400).json({ error: 'Already voted on this proposal' });
    }

    // Get voting power
    const { daoGovernor } = getContracts();
    const votingPower = await daoGovernor.getVotingPower(voter);

    // Add vote
    proposal.voters.push({
      address: voter.toLowerCase(),
      support,
      weight: votingPower.toString(),
      reason: reason || '',
      timestamp: new Date()
    });

    // Update vote counts
    if (support === 1) {
      proposal.forVotes = (BigInt(proposal.forVotes) + votingPower).toString();
    } else if (support === 0) {
      proposal.againstVotes = (BigInt(proposal.againstVotes) + votingPower).toString();
    } else {
      proposal.abstainVotes = (BigInt(proposal.abstainVotes) + votingPower).toString();
    }

    await proposal.save();

    // Update user stats
    await User.findOneAndUpdate(
      { address: voter.toLowerCase() },
      { 
        $inc: { votesCount: 1 },
        $set: { lastActive: new Date() }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      vote: {
        proposalId,
        voter,
        support,
        weight: votingPower.toString(),
        reason
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get voting power
router.get('/power/:address', async (req, res) => {
  try {
    const { daoGovernor, voteEscrow } = getContracts();
    
    const votingPower = await daoGovernor.getVotingPower(req.params.address);
    const escrowPower = await voteEscrow.getTotalVotingPower(req.params.address);

    res.json({
      address: req.params.address,
      votingPower: votingPower.toString(),
      escrowPower: escrowPower.toString(),
      total: (votingPower + escrowPower).toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delegate votes
router.post('/delegate', [
  body('delegator').isEthereumAddress(),
  body('delegatee').isEthereumAddress(),
  body('signature').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { delegator, delegatee } = req.body;

    // Update user records
    await User.findOneAndUpdate(
      { address: delegator.toLowerCase() },
      { 
        delegatedTo: delegatee.toLowerCase(),
        lastActive: new Date()
      },
      { upsert: true }
    );

    await User.findOneAndUpdate(
      { address: delegatee.toLowerCase() },
      { 
        $addToSet: { delegatedFrom: delegator.toLowerCase() },
        lastActive: new Date()
      },
      { upsert: true }
    );

    res.json({
      success: true,
      delegation: {
        from: delegator,
        to: delegatee
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vote history
router.get('/history/:address', async (req, res) => {
  try {
    const proposals = await Proposal.find({
      'voters.address': req.params.address.toLowerCase()
    }).sort({ createdAt: -1 });

    const votes = proposals.map(proposal => {
      const vote = proposal.voters.find(v => v.address === req.params.address.toLowerCase());
      return {
        proposalId: proposal.proposalId,
        title: proposal.title,
        support: vote.support,
        weight: vote.weight,
        reason: vote.reason,
        timestamp: vote.timestamp
      };
    });

    res.json({ votes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
