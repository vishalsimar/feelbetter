import { APP_INITIALIZER, Provider } from '@angular/core';

// Increment this version string whenever you make a breaking change to the data structures stored in localStorage.
const STORAGE_VERSION = '3.0';

/**
 * This function runs before the Angular app initializes.
 * It checks if the data stored in localStorage is compatible with the current app version.
 * If not, it clears the old data to prevent errors.
 */
export function storageVersionInitializer(): () => void {
  return () => {
    const storedVersion = localStorage.getItem('feel-better-version');
    
    if (storedVersion !== STORAGE_VERSION) {
      console.warn(
        `Storage version mismatch. Found: ${storedVersion}, expected: ${STORAGE_VERSION}. Clearing incompatible data.`
      );
      
      // List of localStorage keys managed by the app that might have breaking changes.
      const appDataKeys = ['feel-better-journal', 'feel-better-strategies'];
      
      appDataKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.error(`Failed to remove item ${key} from localStorage`, e);
        }
      });
      
      // After clearing, set the new version number.
      localStorage.setItem('feel-better-version', STORAGE_VERSION);
    }
  };
}

/**
 * The Angular provider to hook the initializer function into the app's startup process.
 */
export const storageInitializerProvider: Provider = {
  provide: APP_INITIALIZER,
  useFactory: storageVersionInitializer,
  multi: true
};
