import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Emotion, JournalEntry, Strategy } from './models';
import { EmotionService } from './emotion.service';
import { JournalService } from './journal.service';
import { StrategyService } from './strategy.service';

type View = 'home' | 'detail' | 'finder' | 'journal' | 'trends' | 'settings' | 'breathing';
type ScenarioKey = 'self' | 'friend' | 'caused';
type CategoryKey = 'immediate' | 'shortTerm' | 'longTerm';

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
  private strategyService = inject(StrategyService);
  
  // View management
  currentView = signal<View>('home');
  selectedEmotion = signal<Emotion | null>(null);
  selectedScenario = signal<ScenarioKey>('self');

  // Data signals
  emotions = signal<Emotion[]>([]);
  journalEntries = this.journalService.journal;
  userStrategies = this.strategyService.strategies;
  
  // Journal form state
  newJournalEmotion = signal<string>('');
  newJournalNotes = signal<string>('');

  // Theme management
  private readonly themeKey = 'feel-better-theme';
  theme = signal<'light' | 'dark'>('dark');

  // Donation state
  readonly upiId = 'vishalsimar@upi';
  upiCopied = signal(false);

  // Journal Entry Expansion
  readonly journalPreviewCharLimit = 200;
  expandedJournalEntries = signal(new Set<string>());

  // Computed value for strategies of the selected emotion
  selectedEmotionStrategies = computed(() => {
    const emotion = this.selectedEmotion();
    const strategies = this.userStrategies();
    if (!emotion || !strategies[emotion.name]) return null;
    return strategies[emotion.name];
  });

  // Strategy editing state
  editingStrategy = signal<{id: string, text: string} | null>(null);
  checkedStrategyIds = signal(new Set<string>());

  // Drag and drop state
  private draggedStrategy: { strategy: Strategy, from: { scenario: ScenarioKey, category: CategoryKey, index: number } } | null = null;

  // Breathing exercise state
  breathingState = signal<'idle' | 'in' | 'hold' | 'out'>('idle');
  breathingInstruction = signal('Breathe');
  breathingCountdown = signal(0);
  private breathingInterval: any;

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

    const calendarDays: {date: number | null, colors: string[]}[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarDays.push({ date: null, colors: [] });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(today.getFullYear(), today.getMonth(), i);
        const dateString = date.toDateString();
        const entriesForDay = entries.filter(e => new Date(e.date).toDateString() === dateString);
        const colorsForDay = entriesForDay.map(e => emotionMap.get(e.emotion) || 'bg-gray-200');
        calendarDays.push({ date: i, colors: colorsForDay.reverse() });
    }

    return {
        monthName: today.toLocaleString('default', { month: 'long' }),
        year: today.getFullYear(),
        days: calendarDays,
        weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
  });
  
  // --- Feeling Finder ---
  finderStep = signal(0);
  finderAnswers = signal<{ energy?: 'high' | 'low', focus?: 'inward' | 'outward' }>({});
  
  suggestedEmotions = computed(() => {
    const answers = this.finderAnswers();
    if (!answers.energy || !answers.focus) return [];

    if (answers.energy === 'high' && answers.focus === 'outward') return ['Joy', 'Surprise', 'Anger'];
    if (answers.energy === 'high' && answers.focus === 'inward') return ['Anticipation', 'Trust'];
    if (answers.energy === 'low' && answers.focus === 'inward') return ['Sadness', 'Fear'];
    if (answers.energy === 'low' && answers.focus === 'outward') return ['Disgust'];

    return [];
  });

  constructor() {
    const storedTheme = localStorage.getItem(this.themeKey) as 'light' | 'dark' | null;
    if (storedTheme) this.theme.set(storedTheme);

    effect(() => {
      const currentTheme = this.theme();
      document.documentElement.classList.toggle('dark', currentTheme === 'dark');
      localStorage.setItem(this.themeKey, currentTheme);
    });
    
    this.emotions.set(this.emotionService.getEmotions());
    this.newJournalEmotion.set(this.emotions()[0]?.name || '');
  }

  setView(view: View): void {
    if (view !== 'breathing') {
      this.stopBreathing();
    }
    this.currentView.set(view);
    window.scrollTo(0, 0);
  }

  selectEmotion(emotion: Emotion): void {
    this.selectedEmotion.set(emotion);
    this.selectedScenario.set('self');
    this.setView('detail');
    this.checkedStrategyIds.set(new Set<string>()); // Reset checkboxes on new emotion
  }

  selectScenario(scenario: ScenarioKey): void {
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
    this.journalService.deleteEntry(id);
  }

  toggleJournalEntry(id: string): void {
    this.expandedJournalEntries.update(expanded => {
      const newSet = new Set(expanded);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  getEmotionColor(emotionName: string): string {
    return this.emotions().find(e => e.name === emotionName)?.color || 'bg-gray-200';
  }

  // --- Theme ---
  setTheme(theme: 'light' | 'dark'): void {
    this.theme.set(theme);
  }

  // --- Donation ---
  copyUpiId(): void {
    navigator.clipboard.writeText(this.upiId).then(() => {
      this.upiCopied.set(true);
      setTimeout(() => this.upiCopied.set(false), 2000);
    });
  }

  setFinderAnswer(key: 'energy' | 'focus', value: string): void {
    this.finderAnswers.update(a => ({ ...a, [key]: value }));
    this.finderStep.update(s => s + 1);
  }

  resetFinder(): void {
    this.finderStep.set(0);
    this.finderAnswers.set({});
  }

  selectSuggestedEmotion(emotionName: string): void {
    const emotion = this.emotions().find(e => e.name === emotionName);
    if (emotion) {
      this.selectEmotion(emotion);
    }
    this.resetFinder();
  }

  // --- Strategies ---
  startEditing(strategy: Strategy): void {
    this.editingStrategy.set({ ...strategy });
  }

  cancelEditing(): void {
    this.editingStrategy.set(null);
  }

  saveStrategy(scenario: ScenarioKey, category: CategoryKey): void {
    const editing = this.editingStrategy();
    const emotion = this.selectedEmotion();
    if (editing && emotion && editing.text.trim()) {
      this.strategyService.updateStrategyText(emotion.name, scenario, category, editing.id, editing.text.trim());
    }
    this.editingStrategy.set(null);
  }

  addStrategy(scenario: ScenarioKey, category: CategoryKey): void {
    const emotion = this.selectedEmotion();
    if (emotion) {
      this.strategyService.addStrategy(emotion.name, scenario, category);
    }
  }

  deleteStrategy(scenario: ScenarioKey, category: CategoryKey, strategyId: string): void {
    const emotion = this.selectedEmotion();
    if (emotion) {
      this.strategyService.deleteStrategy(emotion.name, scenario, category, strategyId);
    }
  }

  toggleStrategyChecked(strategyId: string): void {
    this.checkedStrategyIds.update(ids => {
      const newSet = new Set(ids);
      if (newSet.has(strategyId)) {
        newSet.delete(strategyId);
      } else {
        newSet.add(strategyId);
      }
      return newSet;
    });
  }

  resetStrategyChecks(): void {
    this.checkedStrategyIds.set(new Set());
  }

  // --- Drag and Drop ---
  onDragStart(strategy: Strategy, fromScenario: ScenarioKey, fromCategory: CategoryKey, fromIndex: number): void {
    this.draggedStrategy = { strategy, from: { scenario: fromScenario, category: fromCategory, index: fromIndex } };
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault(); // This is necessary to allow dropping
  }

  onDrop(toScenario: ScenarioKey, toCategory: CategoryKey, toIndex: number): void {
    if (!this.draggedStrategy) return;
    
    const { strategy, from } = this.draggedStrategy;
    const emotionName = this.selectedEmotion()?.name;

    if (!emotionName) return;

    this.strategyService.strategies.update(allStrategies => {
      const newStrategies = JSON.parse(JSON.stringify(allStrategies));
      const emotionStrategies = newStrategies[emotionName];

      // Remove from source
      const fromList = emotionStrategies[from.scenario][from.category];
      fromList.splice(from.index, 1);

      // Add to destination
      const toList = emotionStrategies[toScenario][toCategory];
      toList.splice(toIndex, 0, strategy);

      return newStrategies;
    });

    this.draggedStrategy = null;
  }
  
  // --- Breathing ---
  startBreathing(): void {
    if (this.breathingState() !== 'idle') return;
    this.breathingState.set('in');
    this.runBreathingCycle();
  }

  stopBreathing(): void {
    if (this.breathingInterval) {
      clearInterval(this.breathingInterval);
    }
    this.breathingState.set('idle');
    this.breathingInstruction.set('Breathe');
  }

  private runBreathingCycle(): void {
    const cycle = [
      { state: 'in', instruction: 'Breathe In', duration: 4 },
      { state: 'hold', instruction: 'Hold', duration: 4 },
      { state: 'out', instruction: 'Breathe Out', duration: 6 },
    ] as const;

    let currentPhase = -1;

    const nextPhase = () => {
      if (this.breathingState() === 'idle') {
        return;
      }

      currentPhase = (currentPhase + 1) % cycle.length;
      const phase = cycle[currentPhase];
      this.breathingState.set(phase.state);
      this.breathingInstruction.set(phase.instruction);
      this.breathingCountdown.set(phase.duration);

      this.breathingInterval = setInterval(() => {
        this.breathingCountdown.update(c => c - 1);
        if (this.breathingCountdown() <= 0) {
          clearInterval(this.breathingInterval);
          nextPhase();
        }
      }, 1000);
    };

    nextPhase();
  }
}
