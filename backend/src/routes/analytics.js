const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const Treasury = require('../models/Treasury');

// Get overall statistics
router.get('/stats', async (req, res) => {
  try {
    const totalProposals = await Proposal.countDocuments();
    const activeProposals = await Proposal.countDocuments({ state: 'Active' });
    const totalUsers = await User.countDocuments();
    const totalVotes = await Proposal.aggregate([
      { $unwind: '$voters' },
      { $count: 'total' }
    ]);

    res.json({
      proposals: {
        total: totalProposals,
        active: activeProposals
      },
      users: {
        total: totalUsers
      },
      votes: {
        total: totalVotes[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get participation rate
router.get('/participation', async (req, res) => {
  try {
    const recentProposals = await Proposal.find({
      state: { $in: ['Active', 'Succeeded', 'Defeated', 'Executed'] }
    }).limit(10);

    const totalUsers = await User.countDocuments();
    
    const participation = recentProposals.map(p => ({
      proposalId: p.proposalId,
      title: p.title,
      votersCount: p.voters.length,
      participationRate: totalUsers > 0 ? (p.voters.length / totalUsers * 100).toFixed(2) : 0
    }));

    res.json({ participation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top voters
router.get('/top-voters', async (req, res) => {
  try {
    const topVoters = await User.find()
      .sort({ votesCount: -1 })
      .limit(10)
      .select('address username votesCount votingPower');

    res.json({ topVoters });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top proposers
router.get('/top-proposers', async (req, res) => {
  try {
    const topProposers = await User.find()
      .sort({ proposalsCreated: -1 })
      .limit(10)
      .select('address username proposalsCreated');

    res.json({ topProposers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity timeline
router.get('/timeline', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const proposalsOverTime = await Proposal.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      period: `${days}d`,
      timeline: proposalsOverTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
