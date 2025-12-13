
import { Injectable, signal, effect } from '@angular/core';
import { JournalEntry } from './models';

@Injectable({ providedIn: 'root' })
export class JournalService {
  private readonly storageKey = 'feel-better-journal';
  readonly journal = signal<JournalEntry[]>(this.loadFromStorage());

  constructor() {
    effect(() => {
      this.saveToStorage(this.journal());
    });
  }

  private loadFromStorage(): JournalEntry[] {
    try {
      const storedJournal = localStorage.getItem(this.storageKey);
      return storedJournal ? JSON.parse(storedJournal) : [];
    } catch (e) {
      console.error('Error loading journal from localStorage', e);
      return [];
    }
  }

  private saveToStorage(entries: JournalEntry[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(entries));
    } catch (e) {
      console.error('Error saving journal to localStorage', e);
    }
  }

  addEntry(entry: Omit<JournalEntry, 'id' | 'date'>): void {
    const newEntry: JournalEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    
    this.journal.update(entries => [newEntry, ...entries]);
  }

  deleteEntry(id: string): void {
    this.journal.update(entries => entries.filter(entry => entry.id !== id));
  }
}