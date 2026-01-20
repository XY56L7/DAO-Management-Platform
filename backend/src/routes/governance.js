const express = require('express');
const router = express.Router();
const { getContracts } = require('../config/contracts');

// Get governance settings
router.get('/settings', async (req, res) => {
  try {
    const { daoGovernor } = getContracts();
    
    const votingDelay = await daoGovernor.votingDelay();
    const votingPeriod = await daoGovernor.votingPeriod();
    const proposalThreshold = await daoGovernor.proposalThreshold();
    const quorum = await daoGovernor.quorum(await daoGovernor.clock());

    res.json({
      votingDelay: Number(votingDelay),
      votingPeriod: Number(votingPeriod),
      proposalThreshold: proposalThreshold.toString(),
      quorum: quorum.toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current block
router.get('/block', async (req, res) => {
  try {
    const { provider } = getContracts();
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);

    res.json({
      number: blockNumber,
      timestamp: block.timestamp,
      hash: block.hash
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contract addresses
router.get('/contracts', async (req, res) => {
  try {
    res.json({
      governanceToken: process.env.GOVERNANCE_TOKEN_ADDRESS,
      daoGovernor: process.env.DAO_GOVERNOR_ADDRESS,
      daoTreasury: process.env.DAO_TREASURY_ADDRESS,
      voteEscrow: process.env.VOTE_ESCROW_ADDRESS,
      timeLock: process.env.TIMELOCK_ADDRESS
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
