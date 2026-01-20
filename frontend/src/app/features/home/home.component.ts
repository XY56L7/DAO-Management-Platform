import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  features = [
    {
      title: 'Decentralized Governance',
      description: 'Create and vote on proposals with transparent on-chain execution.'
    },
    {
      title: 'Treasury Management',
      description: 'Multi-signature treasury with secure fund management and tracking.'
    },
    {
      title: 'Token Locking',
      description: 'Lock tokens to increase voting power and participate in governance.'
    },
    {
      title: 'Vote Delegation',
      description: 'Delegate your voting power to trusted community members.'
    }
  ];

  howToSteps = [
    {
      step: 1,
      title: 'Connect Your Wallet',
      description: 'Click "Connect Wallet" and approve the MetaMask connection.'
    },
    {
      step: 2,
      title: 'Get Governance Tokens',
      description: 'Acquire DGOV tokens to participate in DAO governance.'
    },
    {
      step: 3,
      title: 'Lock Tokens (Optional)',
      description: 'Lock tokens in the Governance section to increase your voting power.'
    },
    {
      step: 4,
      title: 'Vote on Proposals',
      description: 'Browse active proposals and cast your vote (For, Against, or Abstain).'
    },
    {
      step: 5,
      title: 'Create Proposals',
      description: 'Submit your own proposals to improve the DAO.'
    }
  ];
}
