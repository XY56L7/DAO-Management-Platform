import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Web3Service } from '@core/services/web3.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  private web3Service = inject(Web3Service);

  stats = signal<any>(null);
  recentProposals = signal<any[]>([]);
  treasuryBalance = signal<any>(null);
  userVotingPower = signal<string>('0');
  loading = signal(true);

  account = this.web3Service.account;

  async ngOnInit() {
    await this.loadDashboardData();
  }

  async loadDashboardData() {
    this.loading.set(true);

    try {
      // Load stats
      this.apiService.getOverallStats().subscribe(stats => {
        this.stats.set(stats);
      });

      // Load recent proposals
      this.apiService.getProposals({ page: 1, limit: 5 }).subscribe(data => {
        this.recentProposals.set(data.proposals);
      });

      // Load treasury balance
      this.apiService.getTreasuryBalance().subscribe(balance => {
        this.treasuryBalance.set(balance);
      });

      // Load user voting power if connected
      if (this.account()) {
        this.apiService.getVotingPower(this.account()!).subscribe(power => {
          this.userVotingPower.set(power.total);
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      this.loading.set(false);
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
}
