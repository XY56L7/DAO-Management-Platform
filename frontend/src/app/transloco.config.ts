import { provideTransloco, TranslocoModule } from '@jsverse/transloco';
import { isDevMode } from '@angular/core';
import { TranslocoHttpLoader } from './transloco-loader';

export const translocoConfig = provideTransloco({
  config: {
    availableLangs: [
      { id: 'en', label: 'English' },
      { id: 'de', label: 'Deutsch' },
      { id: 'es', label: 'Español' },
      { id: 'hu', label: 'Magyar' }
    ],
    defaultLang: 'en',
    reRenderOnLangChange: true,
    prodMode: !isDevMode(),
  },
  loader: TranslocoHttpLoader
});
