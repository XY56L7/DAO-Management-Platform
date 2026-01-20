const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DAO Management Platform", function () {
  let governanceToken;
  let timeLock;
  let daoGovernor;
  let daoTreasury;
  let voteEscrow;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy Governance Token
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    governanceToken = await GovernanceToken.deploy();
    await governanceToken.waitForDeployment();

    // Deploy TimeLock
    const minDelay = 3600;
    const TimeLock = await ethers.getContractFactory("TimelockController");
    timeLock = await TimeLock.deploy(
      minDelay,
      [owner.address],
      [owner.address],
      owner.address
    );
    await timeLock.waitForDeployment();

    // Deploy DAO Governor
    const DAOGovernor = await ethers.getContractFactory("DAOGovernor");
    daoGovernor = await DAOGovernor.deploy(
      await governanceToken.getAddress(),
      await timeLock.getAddress()
    );
    await daoGovernor.waitForDeployment();

    // Deploy Treasury
    const DAOTreasury = await ethers.getContractFactory("DAOTreasury");
    daoTreasury = await DAOTreasury.deploy([owner.address], 1);
    await daoTreasury.waitForDeployment();

    // Deploy Vote Escrow
    const VoteEscrow = await ethers.getContractFactory("VoteEscrow");
    voteEscrow = await VoteEscrow.deploy(await governanceToken.getAddress());
    await voteEscrow.waitForDeployment();

    // Setup roles
    const PROPOSER_ROLE = await timeLock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timeLock.EXECUTOR_ROLE();
    
    await timeLock.grantRole(PROPOSER_ROLE, await daoGovernor.getAddress());
    await timeLock.grantRole(EXECUTOR_ROLE, await daoGovernor.getAddress());

    // Delegate votes
    await governanceToken.delegate(owner.address);
  });

  describe("Governance Token", function () {
    it("Should have correct name and symbol", async function () {
      expect(await governanceToken.name()).to.equal("DAO Governance Token");
      expect(await governanceToken.symbol()).to.equal("DGOV");
    });

    it("Should mint initial supply to owner", async function () {
      const balance = await governanceToken.balanceOf(owner.address);
      expect(balance).to.equal(ethers.parseEther("100000000"));
    });

    it("Should allow minting within max supply", async function () {
      await governanceToken.mint(addr1.address, ethers.parseEther("1000"));
      expect(await governanceToken.balanceOf(addr1.address)).to.equal(
        ethers.parseEther("1000")
      );
    });
  });

  describe("DAO Treasury", function () {
    it("Should receive ETH deposits", async function () {
      const depositAmount = ethers.parseEther("1");
      await owner.sendTransaction({
        to: await daoTreasury.getAddress(),
        value: depositAmount,
      });

      expect(await daoTreasury.getBalance()).to.equal(depositAmount);
    });

    it("Should submit and execute transactions", async function () {
      const depositAmount = ethers.parseEther("1");
      await owner.sendTransaction({
        to: await daoTreasury.getAddress(),
        value: depositAmount,
      });

      await daoTreasury.submitTransaction(
        addr1.address,
        ethers.parseEther("0.5"),
        "0x"
      );

      await daoTreasury.confirmTransaction(0);
      await daoTreasury.executeTransaction(0);

      const tx = await daoTreasury.transactions(0);
      expect(tx.executed).to.be.true;
    });
  });

  describe("Vote Escrow", function () {
    beforeEach(async function () {
      await governanceToken.transfer(addr1.address, ethers.parseEther("1000"));
      await governanceToken
        .connect(addr1)
        .approve(await voteEscrow.getAddress(), ethers.parseEther("1000"));
    });

    it("Should create lock", async function () {
      const lockAmount = ethers.parseEther("100");
      const unlockTime = (await time.latest()) + 365 * 86400; // 1 year

      await voteEscrow.connect(addr1).createLock(lockAmount, unlockTime);

      const locked = await voteEscrow.locked(addr1.address);
      expect(locked.amount).to.equal(lockAmount);
    });

    it("Should calculate voting power correctly", async function () {
      const lockAmount = ethers.parseEther("100");
      const unlockTime = (await time.latest()) + 365 * 86400;

      await voteEscrow.connect(addr1).createLock(lockAmount, unlockTime);

      const votingPower = await voteEscrow.getVotingPower(addr1.address);
      expect(votingPower).to.be.gt(0);
    });
  });

  describe("DAO Governor", function () {
    it("Should get voting power", async function () {
      const votingPower = await daoGovernor.getVotingPower(owner.address);
      expect(votingPower).to.be.gt(0);
    });

    it("Should have correct voting settings", async function () {
      const votingDelay = await daoGovernor.votingDelay();
      const votingPeriod = await daoGovernor.votingPeriod();
      
      expect(votingDelay).to.equal(7200);
      expect(votingPeriod).to.equal(50400);
    });
  });
});
