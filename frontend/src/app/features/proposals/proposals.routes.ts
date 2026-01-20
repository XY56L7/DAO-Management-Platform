import { Routes } from '@angular/router';

export const PROPOSALS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./proposals-list/proposals-list.component').then(m => m.ProposalsListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./create-proposal/create-proposal.component').then(m => m.CreateProposalComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./proposal-detail/proposal-detail.component').then(m => m.ProposalDetailComponent)
  }
];
