const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getContracts } = require('../config/contracts');
const { ethers } = require('ethers');

// Get token info
router.get('/info', async (req, res) => {
  try {
    const { governanceToken } = getContracts();
    
    const name = await governanceToken.name();
    const symbol = await governanceToken.symbol();
    const totalSupply = await governanceToken.totalSupply();
    const maxSupply = await governanceToken.MAX_SUPPLY();

    res.json({
      name,
      symbol,
      totalSupply: ethers.formatEther(totalSupply),
      maxSupply: ethers.formatEther(maxSupply),
      decimals: 18
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get token balance
router.get('/balance/:address', async (req, res) => {
  try {
    const { governanceToken } = getContracts();
    const balance = await governanceToken.balanceOf(req.params.address);

    res.json({
      address: req.params.address,
      balance: ethers.formatEther(balance)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get locked balance
router.get('/locked/:address', async (req, res) => {
  try {
    const { voteEscrow } = getContracts();
    const locked = await voteEscrow.locked(req.params.address);

    res.json({
      address: req.params.address,
      amount: ethers.formatEther(locked.amount),
      end: Number(locked.end),
      endDate: new Date(Number(locked.end) * 1000).toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create lock
router.post('/lock', [
  body('address').isEthereumAddress(),
  body('amount').isString(),
  body('duration').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { address, amount, duration } = req.body;
    const unlockTime = Math.floor(Date.now() / 1000) + duration;

    res.json({
      success: true,
      lock: {
        address,
        amount,
        unlockTime,
        unlockDate: new Date(unlockTime * 1000).toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vesting schedule
router.get('/vesting/:address', async (req, res) => {
  try {
    const { governanceToken } = getContracts();
    
    const vestingDuration = await governanceToken.vestingSchedules(req.params.address);
    const vestedAmount = await governanceToken.vestedAmount(req.params.address);
    const vestingStart = await governanceToken.vestingStart(req.params.address);
    const claimable = await governanceToken.getVestedAmount(req.params.address);

    res.json({
      address: req.params.address,
      vestingDuration: Number(vestingDuration),
      vestedAmount: ethers.formatEther(vestedAmount),
      vestingStart: Number(vestingStart),
      claimable: ethers.formatEther(claimable)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get token holders
router.get('/holders', async (req, res) => {
  try {
    // This would typically query indexed data from The Graph or similar
    res.json({
      holders: [],
      totalHolders: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
