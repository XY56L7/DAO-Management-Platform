const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Treasury = require('../models/Treasury');
const { getContracts } = require('../config/contracts');
const { ethers } = require('ethers');

// Get treasury balance
router.get('/balance', async (req, res) => {
  try {
    const { daoTreasury, provider } = getContracts();
    const treasuryAddress = await daoTreasury.getAddress();
    
    const ethBalance = await provider.getBalance(treasuryAddress);
    
    res.json({
      address: treasuryAddress,
      eth: ethers.formatEther(ethBalance),
      tokens: [] // Add token balances here
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get treasury transactions
router.get('/transactions', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.type) filter.type = req.query.type;

    const transactions = await Treasury.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Treasury.countDocuments(filter);

    res.json({
      transactions,
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

// Submit treasury transaction
router.post('/submit', [
  body('to').isEthereumAddress(),
  body('value').isString(),
  body('data').optional().isString(),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { to, value, data, description } = req.body;

    const transaction = new Treasury({
      type: 'Transfer',
      to: to.toLowerCase(),
      amount: value,
      description,
      requiredConfirmations: 2,
      executed: false
    });

    await transaction.save();

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm transaction
router.post('/confirm/:txId', [
  body('confirmer').isEthereumAddress()
], async (req, res) => {
  try {
    const transaction = await Treasury.findById(req.params.txId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.executed) {
      return res.status(400).json({ error: 'Transaction already executed' });
    }

    const alreadyConfirmed = transaction.confirmedBy.some(
      c => c.address === req.body.confirmer.toLowerCase()
    );

    if (alreadyConfirmed) {
      return res.status(400).json({ error: 'Already confirmed' });
    }

    transaction.confirmedBy.push({
      address: req.body.confirmer.toLowerCase(),
      timestamp: new Date()
    });

    transaction.confirmations = transaction.confirmedBy.length;

    await transaction.save();

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get treasury analytics
router.get('/analytics', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inflows = await Treasury.aggregate([
      {
        $match: {
          type: 'Deposit',
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: '$amount' } }
        }
      }
    ]);

    const outflows = await Treasury.aggregate([
      {
        $match: {
          type: { $in: ['Withdrawal', 'Transfer', 'Expenditure'] },
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: '$amount' } }
        }
      }
    ]);

    const byCategory = await Treasury.aggregate([
      {
        $match: {
          category: { $exists: true },
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: { $toDouble: '$amount' } },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      period: '30d',
      inflows: inflows[0]?.total || 0,
      outflows: outflows[0]?.total || 0,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expenditures
router.get('/expenditures', async (req, res) => {
  try {
    const { daoTreasury } = getContracts();
    const count = await daoTreasury.getExpenditureCount();
    
    const expenditures = [];
    for (let i = 0; i < count; i++) {
      const exp = await daoTreasury.getExpenditure(i);
      expenditures.push({
        index: i,
        token: exp.token,
        amount: exp.amount.toString(),
        recipient: exp.recipient,
        timestamp: Number(exp.timestamp),
        description: exp.description
      });
    }

    res.json({ expenditures });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
