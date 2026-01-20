import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Proposal } from '@core/services/api.service';
import { Web3Service } from '@core/services/web3.service';

@Component({
  selector: 'app-proposal-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proposal-detail.component.html',
  styleUrls: ['./proposal-detail.component.scss']
})
export class ProposalDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private web3Service = inject(Web3Service);

  proposal = signal<Proposal | null>(null);
  loading = signal(true);
  voting = signal(false);
  voteReason = signal('');
  account = this.web3Service.account;

  async ngOnInit() {
    const proposalId = this.route.snapshot.paramMap.get('id');
    if (proposalId) {
      await this.loadProposal(proposalId);
    }
  }

  async loadProposal(proposalId: string) {
    this.loading.set(true);
    this.apiService.getProposal(proposalId).subscribe({
      next: (proposal) => {
        this.proposal.set(proposal);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading proposal:', error);
        this.loading.set(false);
      }
    });
  }

  async castVote(support: number) {
    if (!this.account()) {
      alert('Please connect your wallet first');
      return;
    }

    this.voting.set(true);

    try {
      await this.apiService.castVote({
        proposalId: this.proposal()!.proposalId,
        voter: this.account()!,
        support,
        reason: this.voteReason()
      }).toPromise();

      alert('Vote cast successfully!');
      await this.loadProposal(this.proposal()!.proposalId);
      this.voteReason.set('');
    } catch (error) {
      console.error('Error casting vote:', error);
      alert('Failed to cast vote');
    } finally {
      this.voting.set(false);
    }
  }

  getStateClass(state: string): string {
    const stateClasses: Record<string, string> = {
      'Active': 'badge-info',
      'Pending': 'badge-warning',
      'Succeeded': 'badge-success',
      'Defeated': 'badge-danger',
      'Executed': 'badge-success'
    };
    return stateClasses[state] || 'badge-info';
  }

  hasUserVoted(): boolean {
    if (!this.account() || !this.proposal()) return false;
    return this.proposal()!.voters.some(v => 
      v.address.toLowerCase() === this.account()!.toLowerCase()
    );
  }
}
