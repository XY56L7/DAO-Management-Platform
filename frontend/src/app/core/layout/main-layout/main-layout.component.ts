import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  private web3Service = inject(Web3Service);
  
  account = this.web3Service.account;
  isConnected = this.web3Service.isConnected;
  isSidebarOpen = signal(true);

  menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'D' },
    { label: 'Proposals', path: '/proposals', icon: 'P' },
    { label: 'Treasury', path: '/treasury', icon: 'T' },
    { label: 'Governance', path: '/governance', icon: 'G' },
    { label: 'Analytics', path: '/analytics', icon: 'A' }
  ];

  ngOnInit() {}

  async connectWallet() {
    try {
      await this.web3Service.connect();
    } catch (error) {}
  }

  disconnectWallet() {
    this.web3Service.disconnect();
  }

  toggleSidebar() {
    this.isSidebarOpen.update(value => !value);
  }

  formatAddress(address: string): string {
    return this.web3Service.formatAddress(address);
  }
}
