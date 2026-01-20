import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  // Proposals
  getProposals(params?: any): Observable<any> {
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
    return this.http.get<Proposal>(`${this.baseUrl}/proposals/${proposalId}`);
  }

  createProposal(proposal: any): Observable<Proposal> {
    return this.http.post<Proposal>(`${this.baseUrl}/proposals`, proposal);
  }

  getProposalVotes(proposalId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/proposals/${proposalId}/votes`);
  }

  getProposalStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/proposals/stats/overview`);
  }

  // Voting
  castVote(voteData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/voting/cast`, voteData);
  }

  getVotingPower(address: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/voting/power/${address}`);
  }

  delegateVotes(delegationData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/voting/delegate`, delegationData);
  }

  getVoteHistory(address: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/voting/history/${address}`);
  }

  // Treasury
  getTreasuryBalance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/treasury/balance`);
  }

  getTreasuryTransactions(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.baseUrl}/treasury/transactions`, { params: httpParams });
  }

  submitTreasuryTransaction(txData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/treasury/submit`, txData);
  }

  confirmTreasuryTransaction(txId: string, confirmer: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/treasury/confirm/${txId}`, { confirmer });
  }

  getTreasuryAnalytics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/treasury/analytics`);
  }

  getExpenditures(): Observable<any> {
    return this.http.get(`${this.baseUrl}/treasury/expenditures`);
  }

  // Tokens
  getTokenInfo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tokens/info`);
  }

  getTokenBalance(address: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/tokens/balance/${address}`);
  }

  getLockedBalance(address: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/tokens/locked/${address}`);
  }

  createLock(lockData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/tokens/lock`, lockData);
  }

  getVestingSchedule(address: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/tokens/vesting/${address}`);
  }

  // Governance
  getGovernanceSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/governance/settings`);
  }

  getCurrentBlock(): Observable<any> {
    return this.http.get(`${this.baseUrl}/governance/block`);
  }

  getContractAddresses(): Observable<any> {
    return this.http.get(`${this.baseUrl}/governance/contracts`);
  }

  // Analytics
  getOverallStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/stats`);
  }

  getParticipationRate(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/participation`);
  }

  getTopVoters(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/top-voters`);
  }

  getTopProposers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/top-proposers`);
  }

  getActivityTimeline(days: number = 30): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/timeline?days=${days}`);
  }

  // Users
  getUserProfile(address: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${address}`);
  }

  updateUserProfile(address: string, updates: any): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${address}`, updates);
  }

  getUserDelegation(address: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${address}/delegation`);
  }
}
