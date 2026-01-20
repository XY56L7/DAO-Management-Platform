import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Proposal } from '@core/services/api.service';

@Component({
  selector: 'app-proposals-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './proposals-list.component.html',
  styleUrls: ['./proposals-list.component.scss']
})
export class ProposalsListComponent implements OnInit {
  private apiService = inject(ApiService);

  proposals = signal<Proposal[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  selectedState = signal('All');
  selectedCategory = signal('All');

  states = ['All', 'Pending', 'Active', 'Succeeded', 'Defeated', 'Executed'];
  categories = ['All', 'Treasury', 'Governance', 'Technical', 'Marketing', 'Community', 'Other'];

  ngOnInit() {
    this.loadProposals();
  }

  loadProposals() {
    this.loading.set(true);

    const params: any = {
      page: this.currentPage(),
      limit: 10
    };

    if (this.selectedState() !== 'All') {
      params.state = this.selectedState();
    }

    if (this.selectedCategory() !== 'All') {
      params.category = this.selectedCategory();
    }

    this.apiService.getProposals(params).subscribe({
      next: (data) => {
        this.proposals.set(data.proposals);
        this.totalPages.set(data.pagination.pages);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
      }
    });
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadProposals();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.loadProposals();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadProposals();
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
