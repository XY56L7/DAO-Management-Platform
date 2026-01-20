import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-treasury',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './treasury.component.html',
  styleUrls: ['./treasury.component.scss']
})
export class TreasuryComponent implements OnInit {
  private apiService = inject(ApiService);

  balance = signal<any>(null);
  transactions = signal<any[]>([]);
  analytics = signal<any>(null);
  loading = signal(true);

  ngOnInit() {
    this.loadTreasuryData();
  }

  loadTreasuryData() {
    this.loading.set(true);

    this.apiService.getTreasuryBalance().subscribe(balance => {
      this.balance.set(balance);
    });

    this.apiService.getTreasuryTransactions({ page: 1, limit: 20 }).subscribe(data => {
      this.transactions.set(data.transactions);
    });

    this.apiService.getTreasuryAnalytics().subscribe(analytics => {
      this.analytics.set(analytics);
      this.loading.set(false);
    });
  }

  getTypeClass(type: string): string {
    const typeClasses: Record<string, string> = {
      'Deposit': 'badge-success',
      'Withdrawal': 'badge-danger',
      'Transfer': 'badge-info',
      'Expenditure': 'badge-warning'
    };
    return typeClasses[type] || 'badge-info';
  }
}
