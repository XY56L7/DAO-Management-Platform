import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@core/services/api.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  private apiService = inject(ApiService);

  stats = signal<any>(null);
  topVoters = signal<any[]>([]);
  topProposers = signal<any[]>([]);
  participation = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.loading.set(true);

    this.apiService.getOverallStats().subscribe(stats => {
      this.stats.set(stats);
    });

    this.apiService.getTopVoters().subscribe(data => {
      this.topVoters.set(data.topVoters);
    });

    this.apiService.getTopProposers().subscribe(data => {
      this.topProposers.set(data.topProposers);
    });

    this.apiService.getParticipationRate().subscribe(data => {
      this.participation.set(data.participation);
      this.loading.set(false);
    });
  }
}
