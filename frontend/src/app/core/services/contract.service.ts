import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import { Contract } from 'ethers';
import { environment } from '@env/environment';

// Import ABIs
import GovernanceTokenABI from '../../../assets/abis/GovernanceToken.json';
import DAOGovernorABI from '../../../assets/abis/DAOGovernor.json';
import DAOTreasuryABI from '../../../assets/abis/DAOTreasury.json';
import VoteEscrowABI from '../../../assets/abis/VoteEscrow.json';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  constructor(private web3Service: Web3Service) {}

  get governanceToken(): Contract {
    return this.web3Service.getContract(
      environment.contracts.governanceToken,
      GovernanceTokenABI.abi
    );
  }

  get daoGovernor(): Contract {
    return this.web3Service.getContract(
      environment.contracts.daoGovernor,
      DAOGovernorABI.abi
    );
  }

  get daoTreasury(): Contract {
    return this.web3Service.getContract(
      environment.contracts.daoTreasury,
      DAOTreasuryABI.abi
    );
  }

  get voteEscrow(): Contract {
    return this.web3Service.getContract(
      environment.contracts.voteEscrow,
      VoteEscrowABI.abi
    );
  }

  // Governance Token Methods
  async getTokenBalance(address: string): Promise<bigint> {
    return await this.governanceToken.balanceOf(address);
  }

  async getVotingPower(address: string): Promise<bigint> {
    return await this.daoGovernor.getVotingPower(address);
  }

  async delegateVotes(delegatee: string) {
    const tx = await this.governanceToken.delegate(delegatee);
    return await tx.wait();
  }

  // Proposal Methods
  async createProposal(
    targets: string[],
    values: bigint[],
    calldatas: string[],
    description: string,
    title: string,
    category: string
  ) {
    const tx = await this.daoGovernor.proposeWithMetadata(
      targets,
      values,
      calldatas,
      description,
      title,
      category
    );
    return await tx.wait();
  }

  async castVote(proposalId: string, support: number, reason: string = '') {
    const tx = await this.daoGovernor.castVoteWithReasonAndParams(
      proposalId,
      support,
      reason,
      '0x'
    );
    return await tx.wait();
  }

  async getProposalState(proposalId: string): Promise<number> {
    return await this.daoGovernor.state(proposalId);
  }

  async getProposalVotes(proposalId: string) {
    return await this.daoGovernor.proposalVotes(proposalId);
  }

  async getProposalMetadata(proposalId: string) {
    return await this.daoGovernor.getProposalMetadata(proposalId);
  }

  // Vote Escrow Methods
  async createLock(amount: bigint, unlockTime: number) {
    const tx = await this.voteEscrow.createLock(amount, unlockTime);
    return await tx.wait();
  }

  async increaseAmount(amount: bigint) {
    const tx = await this.voteEscrow.increaseAmount(amount);
    return await tx.wait();
  }

  async increaseUnlockTime(unlockTime: number) {
    const tx = await this.voteEscrow.increaseUnlockTime(unlockTime);
    return await tx.wait();
  }

  async withdraw() {
    const tx = await this.voteEscrow.withdraw();
    return await tx.wait();
  }

  async getLockedBalance(address: string) {
    return await this.voteEscrow.locked(address);
  }

  async getEscrowVotingPower(address: string): Promise<bigint> {
    return await this.voteEscrow.getTotalVotingPower(address);
  }

  // Treasury Methods
  async submitTreasuryTransaction(to: string, value: bigint, data: string) {
    const tx = await this.daoTreasury.submitTransaction(to, value, data);
    return await tx.wait();
  }

  async confirmTreasuryTransaction(txIndex: number) {
    const tx = await this.daoTreasury.confirmTransaction(txIndex);
    return await tx.wait();
  }

  async executeTreasuryTransaction(txIndex: number) {
    const tx = await this.daoTreasury.executeTransaction(txIndex);
    return await tx.wait();
  }

  async getTreasuryBalance(): Promise<bigint> {
    return await this.daoTreasury.getBalance();
  }

  async getTreasuryTransaction(txIndex: number) {
    return await this.daoTreasury.transactions(txIndex);
  }
}
