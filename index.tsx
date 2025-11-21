
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';

import { AppComponent } from './src/app.component';
import { storageInitializerProvider } from './src/storage-initializer';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    storageInitializerProvider,
  ],
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.