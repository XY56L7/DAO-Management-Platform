import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService, User } from '@core/services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  user = signal<User | null>(null);
  voteHistory = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    const address = this.route.snapshot.paramMap.get('address');
    if (address) {
      this.loadProfile(address);
    }
  }

  loadProfile(address: string) {
    this.loading.set(true);

    this.apiService.getUserProfile(address).subscribe({
      next: (user) => {
        this.user.set(user);
      },
      error: (error) => {}
    });

    this.apiService.getVoteHistory(address).subscribe({
      next: (data) => {
        this.voteHistory.set(data.votes);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
      }
    });
  }
}
