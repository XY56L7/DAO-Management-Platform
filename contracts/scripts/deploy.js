const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const GovernanceToken = await hre.ethers.getContractFactory("GovernanceToken");
  const governanceToken = await GovernanceToken.deploy();
  await governanceToken.waitForDeployment();
  const tokenAddress = await governanceToken.getAddress();

  const minDelay = 3600;
  const proposers = [deployer.address];
  const executors = [deployer.address];
  const admin = deployer.address;

  const TimeLock = await hre.ethers.getContractFactory("TimelockController");
  const timeLock = await TimeLock.deploy(minDelay, proposers, executors, admin);
  await timeLock.waitForDeployment();
  const timeLockAddress = await timeLock.getAddress();

  const DAOGovernor = await hre.ethers.getContractFactory("DAOGovernor");
  const daoGovernor = await DAOGovernor.deploy(tokenAddress, timeLockAddress);
  await daoGovernor.waitForDeployment();
  const governorAddress = await daoGovernor.getAddress();

  const executorsList = [deployer.address, governorAddress];
  const requiredConfirmations = 2;
  
  const DAOTreasury = await hre.ethers.getContractFactory("DAOTreasury");
  const daoTreasury = await DAOTreasury.deploy(executorsList, requiredConfirmations);
  await daoTreasury.waitForDeployment();
  const treasuryAddress = await daoTreasury.getAddress();

  const VoteEscrow = await hre.ethers.getContractFactory("VoteEscrow");
  const voteEscrow = await VoteEscrow.deploy(tokenAddress);
  await voteEscrow.waitForDeployment();
  const voteEscrowAddress = await voteEscrow.getAddress();
  
  const PROPOSER_ROLE = await timeLock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timeLock.EXECUTOR_ROLE();
  const CANCELLER_ROLE = await timeLock.CANCELLER_ROLE();

  await timeLock.grantRole(PROPOSER_ROLE, governorAddress);
  await timeLock.grantRole(EXECUTOR_ROLE, governorAddress);
  await timeLock.grantRole(CANCELLER_ROLE, deployer.address);

  await governanceToken.delegate(deployer.address);

  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      GovernanceToken: tokenAddress,
      TimeLock: timeLockAddress,
      DAOGovernor: governorAddress,
      DAOTreasury: treasuryAddress,
      VoteEscrow: voteEscrowAddress
    },
    timestamp: new Date().toISOString()
  };

  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "../deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const fileName = `deployment-${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, fileName),
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    process.exit(1);
  });
