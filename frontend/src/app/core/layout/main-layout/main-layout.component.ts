import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Web3Service } from '../../services/web3.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslocoModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px) scale(0.95)' }),
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms cubic-bezier(0.4, 0.0, 1, 1)', style({ opacity: 0, transform: 'translateY(-10px) scale(0.95)' }))
      ])
    ])
  ]
})
export class MainLayoutComponent implements OnInit {
  private web3Service = inject(Web3Service);
  languageService = inject(LanguageService);
  
  account = this.web3Service.account;
  isConnected = this.web3Service.isConnected;
  isSidebarOpen = signal(true);
  showLanguageMenu = signal(false);

  menuItems = [
    { label: 'Home', path: '/home', icon: 'H' },
    { label: 'Dashboard', path: '/dashboard', icon: 'D' },
    { label: 'Proposals', path: '/proposals', icon: 'P' },
    { label: 'Treasury', path: '/treasury', icon: 'T' },
    { label: 'Governance', path: '/governance', icon: 'G' },
    { label: 'Analytics', path: '/analytics', icon: 'A' }
  ];

  ngOnInit() {
    this.languageService.initLanguage();
  }

  toggleLanguageMenu() {
    this.showLanguageMenu.update(value => !value);
  }

  changeLanguage(langId: string) {
    this.languageService.setLanguage(langId);
    this.showLanguageMenu.set(false);
  }

  getCurrentLanguageLabel(): string {
    const currentLang = this.languageService.getCurrentLanguage();
    return this.languageService.languages.find(l => l.id === currentLang)?.label || 'Language';
  }

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
