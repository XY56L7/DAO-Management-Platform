import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env/environment';

export interface Proposal {
  proposalId: string;
  title: string;
  description: string;
  category: string;
  proposer: string;
  state: string;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  voters: any[];
  createdAt: string;
}

export interface TreasuryTransaction {
  _id: string;
  type: string;
  token: any;
  amount: string;
  from?: string;
  to?: string;
  description?: string;
  executed: boolean;
  timestamp: string;
}

export interface User {
  address: string;
  username?: string;
  bio?: string;
  avatar?: string;
  votingPower: string;
  proposalsCreated: number;
  votesCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private useMockData = true;

  private mockProposals: Proposal[] = [
    {
      proposalId: '1',
      title: 'Increase Treasury Allocation for Marketing',
      description: 'Proposal to allocate 50,000 USDC from treasury for Q1 2026 marketing campaigns including social media, partnerships, and community events.',
      category: 'Treasury',
      proposer: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      state: 'Active',
      forVotes: '125000',
      againstVotes: '45000',
      abstainVotes: '12000',
      voters: [],
      createdAt: '2026-01-15T10:30:00Z'
    },
    {
      proposalId: '2',
      title: 'Update Governance Parameters',
      description: 'Reduce voting period from 7 days to 5 days and lower quorum requirement from 4% to 3%.',
      category: 'Governance',
      proposer: '0x8B3192f2F19e8b42A0bC4e99e4f91D9b8D3e1C2F',
      state: 'Succeeded',
      forVotes: '250000',
      againstVotes: '18000',
      abstainVotes: '5000',
      voters: [],
      createdAt: '2026-01-10T14:20:00Z'
    },
    {
      proposalId: '3',
      title: 'Fund Community Development Grant Program',
      description: 'Establish a quarterly grant program with 100,000 tokens to support community developers building on our platform.',
      category: 'Community',
      proposer: '0x1F9090aaE28b8a3dCeaDf281B0F12828e676c326',
      state: 'Active',
      forVotes: '180000',
      againstVotes: '65000',
      abstainVotes: '8000',
      voters: [],
      createdAt: '2026-01-18T09:15:00Z'
    },
    {
      proposalId: '4',
      title: 'Partner with DeFi Protocol XYZ',
      description: 'Approve strategic partnership and token swap with DeFi Protocol XYZ for cross-chain liquidity provision.',
      category: 'Partnership',
      proposer: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c',
      state: 'Pending',
      forVotes: '95000',
      againstVotes: '32000',
      abstainVotes: '4000',
      voters: [],
      createdAt: '2026-01-19T16:45:00Z'
    },
    {
      proposalId: '5',
      title: 'Implement Staking Rewards V2',
      description: 'Launch upgraded staking mechanism with dynamic APY based on lock duration and improved reward distribution.',
      category: 'Protocol',
      proposer: '0x9f2C9E9F8E1D4B5C3A2F8E7D6C5B4A3E2D1C0B9A',
      state: 'Defeated',
      forVotes: '50000',
      againstVotes: '150000',
      abstainVotes: '15000',
      voters: [],
      createdAt: '2026-01-05T11:00:00Z'
    }
  ];

  private mockUsers: User[] = [
    {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      username: 'CryptoWhale',
      bio: 'Long-term DAO contributor and DeFi enthusiast',
      votingPower: '125000',
      proposalsCreated: 8,
      votesCount: 45
    },
    {
      address: '0x8B3192f2F19e8b42A0bC4e99e4f91D9b8D3e1C2F',
      username: 'GovernanceGuru',
      bio: 'Focused on improving DAO processes',
      votingPower: '89000',
      proposalsCreated: 12,
      votesCount: 67
    },
    {
      address: '0x1F9090aaE28b8a3dCeaDf281B0F12828e676c326',
      username: 'DevAdvocate',
      bio: 'Building tools for the community',
      votingPower: '67000',
      proposalsCreated: 5,
      votesCount: 52
    }
  ];

  getProposals(params?: any): Observable<any> {
    if (this.useMockData) {
      return of({ proposals: this.mockProposals, total: this.mockProposals.length }).pipe(delay(300));
    }
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.baseUrl}/proposals`, { params: httpParams });
  }

  getProposal(proposalId: string): Observable<Proposal> {
    if (this.useMockData) {
      const proposal = this.mockProposals.find(p => p.proposalId === proposalId) || this.mockProposals[0];
      return of(proposal).pipe(delay(200));
    }
    return this.http.get<Proposal>(`${this.baseUrl}/proposals/${proposalId}`);
  }

  createProposal(proposal: any): Observable<Proposal> {
    if (this.useMockData) {
      const newProposal: Proposal = {
        proposalId: (this.mockProposals.length + 1).toString(),
        ...proposal,
        forVotes: '0',
        againstVotes: '0',
        abstainVotes: '0',
        voters: [],
        state: 'Pending',
        createdAt: new Date().toISOString()
      };
      return of(newProposal).pipe(delay(500));
    }
    return this.http.post<Proposal>(`${this.baseUrl}/proposals`, proposal);
  }

  getProposalVotes(proposalId: string): Observable<any> {
    if (this.useMockData) {
      return of({
        votes: [
          { voter: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', support: 1, weight: '25000', reason: 'Great initiative!' },
          { voter: '0x8B3192f2F19e8b42A0bC4e99e4f91D9b8D3e1C2F', support: 1, weight: '18000', reason: 'Fully support this' },
          { voter: '0x1F9090aaE28b8a3dCeaDf281B0F12828e676c326', support: 0, weight: '12000', reason: 'Need more details' }
        ]
      }).pipe(delay(250));
    }
    return this.http.get(`${this.baseUrl}/proposals/${proposalId}/votes`);
  }

  getProposalStats(): Observable<any> {
    if (this.useMockData) {
      return of({
        total: 47,
        active: 2,
        succeeded: 28,
        defeated: 12,
        pending: 5
      }).pipe(delay(200));
    }
    return this.http.get(`${this.baseUrl}/proposals/stats/overview`);
  }

  castVote(voteData: any): Observable<any> {
    if (this.useMockData) {
      return of({ success: true, txHash: '0x' + Math.random().toString(16).substr(2, 64) }).pipe(delay(800));
    }
    return this.http.post(`${this.baseUrl}/voting/cast`, voteData);
  }

  getVotingPower(address: string): Observable<any> {
    if (this.useMockData) {
      return of({
        votingPower: '125000',
        delegatedPower: '25000',
        ownPower: '100000'
      }).pipe(delay(200));
    }
    return this.http.get(`${this.baseUrl}/voting/power/${address}`);
  }

  delegateVotes(delegationData: any): Observable<any> {
    if (this.useMockData) {
      return of({ success: true, txHash: '0x' + Math.random().toString(16).substr(2, 64) }).pipe(delay(700));
    }
    return this.http.post(`${this.baseUrl}/voting/delegate`, delegationData);
  }

  getVoteHistory(address: string): Observable<any> {
    if (this.useMockData) {
      return of({
        votes: [
          { proposalId: '1', proposalTitle: 'Increase Treasury Allocation', support: 1, weight: '25000', timestamp: '2026-01-15T12:00:00Z' },
          { proposalId: '2', proposalTitle: 'Update Governance Parameters', support: 1, weight: '25000', timestamp: '2026-01-11T15:30:00Z' },
          { proposalId: '3', proposalTitle: 'Fund Community Grant Program', support: 1, weight: '25000', timestamp: '2026-01-18T10:45:00Z' }
        ]
      }).pipe(delay(250));
    }
    return this.http.get(`${this.baseUrl}/voting/history/${address}`);
  }

  getTreasuryBalance(): Observable<any> {
    if (this.useMockData) {
      return of({
        totalValueUSD: '2847563.50',
        tokens: [
          { symbol: 'ETH', balance: '450.5', valueUSD: '1126250.00', address: '0x0000000000000000000000000000000000000000' },
          { symbol: 'USDC', balance: '850000', valueUSD: '850000.00', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
          { symbol: 'DAI', balance: '525000', valueUSD: '525000.00', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
          { symbol: 'WBTC', balance: '8.5', valueUSD: '346313.50', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' }
        ]
      }).pipe(delay(300));
    }
    return this.http.get(`${this.baseUrl}/treasury/balance`);
  }

  getTreasuryTransactions(params?: any): Observable<any> {
    if (this.useMockData) {
      return of({
        transactions: [
          { _id: '1', type: 'deposit', token: { symbol: 'ETH' }, amount: '50', from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', description: 'Protocol revenue', executed: true, timestamp: '2026-01-18T14:00:00Z' },
          { _id: '2', type: 'withdrawal', token: { symbol: 'USDC' }, amount: '50000', to: '0x8B3192f2F19e8b42A0bC4e99e4f91D9b8D3e1C2F', description: 'Marketing budget Q1', executed: true, timestamp: '2026-01-15T10:30:00Z' },
          { _id: '3', type: 'withdrawal', token: { symbol: 'DAI' }, amount: '25000', to: '0x1F9090aaE28b8a3dCeaDf281B0F12828e676c326', description: 'Developer grants', executed: false, timestamp: '2026-01-19T16:00:00Z' }
        ]
      }).pipe(delay(250));
    }
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.baseUrl}/treasury/transactions`, { params: httpParams });
  }

  submitTreasuryTransaction(txData: any): Observable<any> {
    if (this.useMockData) {
      return of({ success: true, transactionId: 'tx_' + Date.now() }).pipe(delay(600));
    }
    return this.http.post(`${this.baseUrl}/treasury/submit`, txData);
  }

  confirmTreasuryTransaction(txId: string, confirmer: string): Observable<any> {
    if (this.useMockData) {
      return of({ success: true, confirmations: 2 }).pipe(delay(500));
    }
    return this.http.post(`${this.baseUrl}/treasury/confirm/${txId}`, { confirmer });
  }

  getTreasuryAnalytics(): Observable<any> {
    if (this.useMockData) {
      return of({
        totalInflow: '1250000',
        totalOutflow: '425000',
        inflowByMonth: [120000, 135000, 98000, 142000, 155000],
        outflowByMonth: [85000, 92000, 75000, 88000, 85000]
      }).pipe(delay(300));
    }
    return this.http.get(`${this.baseUrl}/treasury/analytics`);
  }

  getExpenditures(): Observable<any> {
    if (this.useMockData) {
      return of({
        categories: [
          { name: 'Marketing', amount: '150000', percentage: 35 },
          { name: 'Development', amount: '200000', percentage: 47 },
          { name: 'Operations', amount: '50000', percentage: 12 },
          { name: 'Community', amount: '25000', percentage: 6 }
        ]
      }).pipe(delay(250));
    }
    return this.http.get(`${this.baseUrl}/treasury/expenditures`);
  }

  getTokenInfo(): Observable<any> {
    if (this.useMockData) {
      return of({
        name: 'DAO Governance Token',
        symbol: 'DAOG',
        totalSupply: '10000000',
        circulatingSupply: '6500000',
        decimals: 18
      }).pipe(delay(200));
    }
    return this.http.get(`${this.baseUrl}/tokens/info`);
  }

  getTokenBalance(address: string): Observable<any> {
    if (this.useMockData) {
      return of({
        balance: '125000',
        balanceFormatted: '125,000 DAOG'
      }).pipe(delay(200));
    }
    return this.http.get(`${this.baseUrl}/tokens/balance/${address}`);
  }

  getLockedBalance(address: string): Observable<any> {
    if (this.useMockData) {
      return of({
        amount: '75000',
        unlockTime: '2026-07-20T00:00:00Z',
        multiplier: 2.5
      }).pipe(delay(200));
    }
    return this.http.get(`${this.baseUrl}/tokens/locked/${address}`);
  }

  createLock(lockData: any): Observable<any> {
    if (this.useMockData) {
      return of({ success: true, txHash: '0x' + Math.random().toString(16).substr(2, 64) }).pipe(delay(800));
    }
    return this.http.post(`${this.baseUrl}/tokens/lock`, lockData);
  }

  getVestingSchedule(address: string): Observable<any> {
    if (this.useMockData) {
      return of({
        total: '500000',
        released: '200000',
        vesting: [
          { date: '2026-03-01', amount: '100000', status: 'unlocked' },
          { date: '2026-06-01', amount: '100000', status: 'unlocked' },
          { date: '2026-09-01', amount: '100000', status: 'pending' },
          { date: '2026-12-01', amount: '100000', status: 'pending' },
          { date: '2027-03-01', amount: '100000', status: 'pending' }
        ]
      }).pipe(delay(250));
    }
    return this.http.get(`${this.baseUrl}/tokens/vesting/${address}`);
  }

  getGovernanceSettings(): Observable<any> {
    if (this.useMockData) {
      return of({
        votingDelay: '1 day',
        votingPeriod: '7 days',
        proposalThreshold: '100000',
        quorumPercentage: '4'
      }).pipe(delay(200));
    }
    return this.http.get(`${this.baseUrl}/governance/settings`);
  }

  getCurrentBlock(): Observable<any> {
    if (this.useMockData) {
      return of({ blockNumber: 19234567 }).pipe(delay(100));
    }
    return this.http.get(`${this.baseUrl}/governance/block`);
  }

  getContractAddresses(): Observable<any> {
    if (this.useMockData) {
      return of({
        governor: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        token: '0x8B3192f2F19e8b42A0bC4e99e4f91D9b8D3e1C2F',
        treasury: '0x1F9090aaE28b8a3dCeaDf281B0F12828e676c326',
        voteEscrow: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c'
      }).pipe(delay(150));
    }
    return this.http.get(`${this.baseUrl}/governance/contracts`);
  }

  getOverallStats(): Observable<any> {
    if (this.useMockData) {
      return of({
        proposals: {
          total: 47,
          active: 2,
          succeeded: 28,
          defeated: 12,
          pending: 5
        },
        users: {
          total: 1247,
          active: 892
        },
        votes: {
          total: 3542,
          thisMonth: 458
        },
        treasury: {
          valueUSD: '2847563.50'
        }
      }).pipe(delay(250));
    }
    return this.http.get(`${this.baseUrl}/analytics/stats`);
  }

  getParticipationRate(): Observable<any> {
    if (this.useMockData) {
      return of({
        participation: [
          {
            proposalId: '1',
            title: 'Increase Treasury Allocation for Marketing',
            votersCount: 342,
            participationRate: 72.5
          },
          {
            proposalId: '2',
            title: 'Update Governance Parameters',
            votersCount: 389,
            participationRate: 81.2
          },
          {
            proposalId: '3',
            title: 'Fund Community Development Grant Program',
            votersCount: 298,
            participationRate: 65.8
          },
          {
            proposalId: '4',
            title: 'Partner with DeFi Protocol XYZ',
            votersCount: 256,
            participationRate: 58.3
          },
          {
            proposalId: '5',
            title: 'Implement Staking Rewards V2',
            votersCount: 412,
            participationRate: 88.9
          }
        ]
      }).pipe(delay(200));
    }
    return this.http.get(`${this.baseUrl}/analytics/participation`);
  }

  getTopVoters(): Observable<any> {
    if (this.useMockData) {
      return of({
        topVoters: [
          { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', username: 'CryptoWhale', votesCount: 45, votingPower: '125,000' },
          { address: '0x8B3192f2F19e8b42A0bC4e99e4f91D9b8D3e1C2F', username: 'GovernanceGuru', votesCount: 67, votingPower: '89,000' },
          { address: '0x1F9090aaE28b8a3dCeaDf281B0F12828e676c326', username: 'DevAdvocate', votesCount: 52, votingPower: '67,000' },
          { address: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c', username: 'DeFiMaxi', votesCount: 38, votingPower: '54,500' },
          { address: '0x9f2C9E9F8E1D4B5C3A2F8E7D6C5B4A3E2D1C0B9A', username: 'TokenHolder', votesCount: 29, votingPower: '42,300' }
        ]
      }).pipe(delay(200));
    }
    return this.http.get(`${this.baseUrl}/analytics/top-voters`);
  }

  getTopProposers(): Observable<any> {
    if (this.useMockData) {
      return of({
        topProposers: [
          { address: '0x8B3192f2F19e8b42A0bC4e99e4f91D9b8D3e1C2F', username: 'GovernanceGuru', proposalsCreated: 12, successRate: 75 },
          { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', username: 'CryptoWhale', proposalsCreated: 8, successRate: 87.5 },
          { address: '0x1F9090aaE28b8a3dCeaDf281B0F12828e676c326', username: 'DevAdvocate', proposalsCreated: 5, successRate: 80 },
          { address: '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c', username: 'DeFiMaxi', proposalsCreated: 4, successRate: 100 },
          { address: '0x9f2C9E9F8E1D4B5C3A2F8E7D6C5B4A3E2D1C0B9A', username: 'TokenHolder', proposalsCreated: 3, successRate: 66.7 }
        ]
      }).pipe(delay(200));
    }
    return this.http.get(`${this.baseUrl}/analytics/top-proposers`);
  }

  getActivityTimeline(days: number = 30): Observable<any> {
    if (this.useMockData) {
      const timeline = Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        proposals: Math.floor(Math.random() * 3),
        votes: Math.floor(Math.random() * 50) + 10
      }));
      return of({ timeline }).pipe(delay(300));
    }
    return this.http.get(`${this.baseUrl}/analytics/timeline?days=${days}`);
  }

  getUserProfile(address: string): Observable<User> {
    if (this.useMockData) {
      const user = this.mockUsers.find(u => u.address === address) || {
        address,
        username: 'Anonymous',
        bio: 'DAO Member',
        votingPower: '50000',
        proposalsCreated: 2,
        votesCount: 15
      };
      return of(user).pipe(delay(200));
    }
    return this.http.get<User>(`${this.baseUrl}/users/${address}`);
  }

  updateUserProfile(address: string, updates: any): Observable<User> {
    if (this.useMockData) {
      const user = this.mockUsers.find(u => u.address === address) || this.mockUsers[0];
      return of({ ...user, ...updates }).pipe(delay(400));
    }
    return this.http.put<User>(`${this.baseUrl}/users/${address}`, updates);
  }

  getUserDelegation(address: string): Observable<any> {
    if (this.useMockData) {
      return of({
        delegatingTo: null,
        delegatedFrom: [
          { address: '0x9f2C9E9F8E1D4B5C3A2F8E7D6C5B4A3E2D1C0B9A', amount: '25000' }
        ]
      }).pipe(delay(200));
    }
    return this.http.get(`${this.baseUrl}/users/${address}/delegation`);
  }
}
