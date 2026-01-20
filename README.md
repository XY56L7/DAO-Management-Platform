# DAO Management Platform

A decentralized autonomous organization (DAO) platform with proposal voting, treasury management, and governance token staking. Built with Angular 18, Node.js, and Solidity smart contracts.

## Features

- Create and vote on proposals with timelock execution
- Multi-signature treasury management
- Token locking for enhanced voting power
- Vote delegation system
- Real-time analytics and statistics
- MetaMask integration

## Tech Stack

- **Frontend**: Angular 18, TypeScript, Ethers.js
- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin

## Local Setup

### Prerequisites

- Node.js v18+
- MongoDB v5+
- MetaMask browser extension

### 1. Install Dependencies

```bash
cd contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

### 2. Deploy Smart Contracts

```bash
cd contracts
npx hardhat node
```

In a new terminal:
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract addresses from the console output.

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Update `backend/.env` with contract addresses:
```env
MONGODB_URI=mongodb://localhost:27017/dao-platform
RPC_URL=http://127.0.0.1:8545
GOVERNANCE_TOKEN_ADDRESS=<address>
DAO_GOVERNOR_ADDRESS=<address>
DAO_TREASURY_ADDRESS=<address>
VOTE_ESCROW_ADDRESS=<address>
TIMELOCK_ADDRESS=<address>
```

Start MongoDB and run:
```bash
npm run dev
```

### 4. Configure Frontend

Update contract addresses in `frontend/src/environments/environment.ts`.

Copy contract ABIs:
```bash
cp contracts/artifacts/contracts/GovernanceToken.sol/GovernanceToken.json frontend/src/assets/abis/
cp contracts/artifacts/contracts/DAOGovernor.sol/DAOGovernor.json frontend/src/assets/abis/
cp contracts/artifacts/contracts/DAOTreasury.sol/DAOTreasury.json frontend/src/assets/abis/
cp contracts/artifacts/contracts/VoteEscrow.sol/VoteEscrow.json frontend/src/assets/abis/
```

Start the app:
```bash
npm start
```

Open `http://localhost:4200` in your browser.
