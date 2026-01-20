import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Web3Service } from '@core/services/web3.service';

@Component({
  selector: 'app-create-proposal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-proposal.component.html',
  styleUrls: ['./create-proposal.component.scss']
})
export class CreateProposalComponent {
  private apiService = inject(ApiService);
  private web3Service = inject(Web3Service);
  private router = inject(Router);

  account = this.web3Service.account;
  submitting = signal(false);

  proposal = {
    title: '',
    description: '',
    category: 'Governance',
    targets: [''],
    values: ['0'],
    calldatas: ['0x']
  };

  categories = ['Treasury', 'Governance', 'Technical', 'Marketing', 'Community', 'Other'];

  async submitProposal() {
    if (!this.account()) {
      alert('Please connect your wallet first');
      return;
    }

    if (!this.proposal.title || !this.proposal.description) {
      alert('Please fill in all required fields');
      return;
    }

    this.submitting.set(true);

    try {
      const proposalData = {
        ...this.proposal,
        proposer: this.account()!
      };

      await this.apiService.createProposal(proposalData).toPromise();
      
      alert('Proposal created successfully!');
      this.router.navigate(['/proposals']);
    } catch (error) {
      alert('Failed to create proposal');
    } finally {
      this.submitting.set(false);
    }
  }
}
