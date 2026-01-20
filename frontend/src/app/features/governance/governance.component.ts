import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { Web3Service } from '@core/services/web3.service';

@Component({
  selector: 'app-governance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './governance.component.html',
  styleUrls: ['./governance.component.scss']
})
export class GovernanceComponent implements OnInit {
  private apiService = inject(ApiService);
  private web3Service = inject(Web3Service);

  account = this.web3Service.account;
  settings = signal<any>(null);
  votingPower = signal<any>(null);
  lockedBalance = signal<any>(null);
  loading = signal(true);
  lockAmount = signal('');
  lockDuration = signal(30);

  ngOnInit() {
    this.loadGovernanceData();
  }

  loadGovernanceData() {
    this.loading.set(true);

    this.apiService.getGovernanceSettings().subscribe(settings => {
      this.settings.set(settings);
    });

    if (this.account()) {
      this.apiService.getVotingPower(this.account()!).subscribe(power => {
        this.votingPower.set(power);
      });

      this.apiService.getLockedBalance(this.account()!).subscribe(locked => {
        this.lockedBalance.set(locked);
        this.loading.set(false);
      });
    } else {
      this.loading.set(false);
    }
  }

  hasLockedTokens(): boolean {
    const amount = this.lockedBalance()?.amount;
    return amount ? parseFloat(amount) > 0 : false;
  }

  async lockTokens() {
    if (!this.account()) {
      alert('Please connect your wallet');
      return;
    }

    const amount = this.lockAmount();
    const duration = this.lockDuration() * 24 * 60 * 60;

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await this.apiService.createLock({
        address: this.account()!,
        amount,
        duration
      }).toPromise();

      alert('Tokens locked successfully!');
      this.loadGovernanceData();
    } catch (error) {
      alert('Failed to lock tokens');
    }
  }
}
