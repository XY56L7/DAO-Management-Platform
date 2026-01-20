const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs (simplified - import from artifacts in production)
const GOVERNANCE_TOKEN_ABI = require('../../contracts/artifacts/contracts/GovernanceToken.sol/GovernanceToken.json').abi;
const DAO_GOVERNOR_ABI = require('../../contracts/artifacts/contracts/DAOGovernor.sol/DAOGovernor.json').abi;
const DAO_TREASURY_ABI = require('../../contracts/artifacts/contracts/DAOTreasury.sol/DAOTreasury.json').abi;
const VOTE_ESCROW_ABI = require('../../contracts/artifacts/contracts/VoteEscrow.sol/VoteEscrow.json').abi;

// Provider setup
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Contract instances
const getContracts = () => {
  return {
    governanceToken: new ethers.Contract(
      process.env.GOVERNANCE_TOKEN_ADDRESS,
      GOVERNANCE_TOKEN_ABI,
      provider
    ),
    daoGovernor: new ethers.Contract(
      process.env.DAO_GOVERNOR_ADDRESS,
      DAO_GOVERNOR_ABI,
      provider
    ),
    daoTreasury: new ethers.Contract(
      process.env.DAO_TREASURY_ADDRESS,
      DAO_TREASURY_ABI,
      provider
    ),
    voteEscrow: new ethers.Contract(
      process.env.VOTE_ESCROW_ADDRESS,
      VOTE_ESCROW_ABI,
      provider
    ),
    provider
  };
};

module.exports = { getContracts, provider };
