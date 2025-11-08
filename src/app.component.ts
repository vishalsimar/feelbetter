
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Emotion, JournalEntry } from './models';
import { EmotionService } from './emotion.service';
import { JournalService } from './journal.service';

type View = 'home' | 'detail' | 'finder' | 'journal' | 'trends';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class AppComponent {
  private emotionService = inject(EmotionService);
  private journalService = inject(JournalService);
  
  // View management
  currentView = signal<View>('home');
  selectedEmotion = signal<Emotion | null>(null);
  selectedScenario = signal<'self' | 'friend' | 'caused'>('self');

  // Data signals
  emotions = signal<Emotion[]>([]);
  journalEntries = this.journalService.journal;
  
  // Journal form state
  newJournalEmotion = signal<string>('');
  newJournalNotes = signal<string>('');

  // Trends data
  trendsData = computed(() => {
    const entries = this.journalEntries();
    const emotionMap = new Map<string, string>();
    this.emotions().forEach(e => emotionMap.set(e.name, e.color));

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const daysInMonth = endDate.getDate();
    const firstDayOfWeek = startDate.getDay();

    const calendarDays: {date: number | null, color: string | null}[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarDays.push({ date: null, color: null });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(today.getFullYear(), today.getMonth(), i);
        const entry = entries.find(e => new Date(e.date).toDateString() === date.toDateString());
        calendarDays.push({ date: i, color: entry ? emotionMap.get(entry.emotion) || null : null });
    }

    return {
        monthName: today.toLocaleString('default', { month: 'long' }),
        year: today.getFullYear(),
        days: calendarDays,
        weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
  });

  constructor() {
    this.emotions.set(this.emotionService.getEmotions());
    this.newJournalEmotion.set(this.emotions()[0]?.name || '');
  }

  setView(view: View): void {
    this.currentView.set(view);
    window.scrollTo(0, 0);
  }

  selectEmotion(emotion: Emotion): void {
    this.selectedEmotion.set(emotion);
    this.selectedScenario.set('self');
    this.setView('detail');
  }

  selectScenario(scenario: 'self' | 'friend' | 'caused'): void {
    this.selectedScenario.set(scenario);
  }

  submitJournalEntry(): void {
    if (this.newJournalNotes().trim() && this.newJournalEmotion()) {
      this.journalService.addEntry({
        emotion: this.newJournalEmotion(),
        notes: this.newJournalNotes(),
      });
      this.newJournalNotes.set('');
    }
  }

  deleteJournalEntry(id: string): void {
    if (confirm('Are you sure you want to delete this entry?')) {
        this.journalService.deleteEntry(id);
    }
  }

  getEmotionColor(emotionName: string): string {
    return this.emotions().find(e => e.name === emotionName)?.color || 'bg-gray-200';
  }

  // --- Feeling Finder Logic ---
  finderStep = signal(0);
  finderAnswers = signal<{ energy: string | null; focus: string | null }>({ energy: null, focus: null });

  setFinderAnswer(question: 'energy' | 'focus', answer: string) {
    this.finderAnswers.update(a => ({...a, [question]: answer}));
    this.finderStep.update(s => s + 1);
  }

  resetFinder() {
    this.finderStep.set(0);
    this.finderAnswers.set({ energy: null, focus: null });
  }

  suggestedEmotions = computed(() => {
    const answers = this.finderAnswers();
    if (answers.energy === 'high' && answers.focus === 'outward') return ['Joy', 'Anger', 'Surprise'];
    if (answers.energy === 'high' && answers.focus === 'inward') return ['Love', 'Fear'];
    if (answers.energy === 'low' && answers.focus === 'outward') return ['Calm', 'Sadness'];
    if (answers.energy === 'low' && answers.focus === 'inward') return ['Shame', 'Sadness'];
    return [];
  });
  
  selectSuggestedEmotion(emotionName: string) {
    const emotion = this.emotionService.getEmotionByName(emotionName);
    if (emotion) {
      this.selectEmotion(emotion);
    }
    this.resetFinder();
  }
}
