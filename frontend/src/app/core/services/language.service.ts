import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export interface Language {
  id: string;
  label: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translocoService = inject(TranslocoService);

  languages: Language[] = [
    { id: 'en', label: 'English', flag: '\u{1F1EC}\u{1F1E7}' },
    { id: 'de', label: 'Deutsch', flag: '\u{1F1E9}\u{1F1EA}' },
    { id: 'es', label: 'Español', flag: '\u{1F1EA}\u{1F1F8}' },
    { id: 'hu', label: 'Magyar', flag: '\u{1F1ED}\u{1F1FA}' }
  ];

  getCurrentLanguage(): string {
    return this.translocoService.getActiveLang();
  }

  setLanguage(langId: string): void {
    this.translocoService.setActiveLang(langId);
    localStorage.setItem('preferred-language', langId);
  }

  initLanguage(): void {
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && this.languages.some(l => l.id === savedLang)) {
      this.translocoService.setActiveLang(savedLang);
    }
  }
}
