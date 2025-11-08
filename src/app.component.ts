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
  theme = signal<'light' | 'dark'>('light');

  // Donation state
  readonly upiId = 'vishalsimar@upi';
  upiCopied = signal(false);

  // Computed value for strategies of the selected emotion
  selectedEmotionStrategies = computed(() => {
    const emotion = this.selectedEmotion();
    const strategies = this.userStrategies();
    if (!emotion || !strategies[emotion.name]) return null;
    return strategies[emotion.name];
  });

  // Strategy editing state
  editingStrategy = signal<{id: string, text: string} | null>(null);

  // Drag and drop state
  private draggedStrategy: { strategy: Strategy, from: { scenario: ScenarioKey, category: CategoryKey, index: number } } | null = null;


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
    if (confirm('Are you sure you want to delete this entry?')) {
        this.journalService.deleteEntry(id);
    }
  }

  getEmotionColor(emotionName: string): string {
    return this.emotions().find(e => e.name === emotionName)?.color || 'bg-gray-200';
  }

  setTheme(newTheme: 'light' | 'dark'): void {
    this.theme.set(newTheme);
  }

  copyUpiId(): void {
    navigator.clipboard.writeText(this.upiId).then(() => {
        this.upiCopied.set(true);
        setTimeout(() => this.upiCopied.set(false), 2000);
    });
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
    if (emotion) this.selectEmotion(emotion);
    this.resetFinder();
  }

  // --- Strategy Management ---
  addStrategy(scenario: ScenarioKey, category: CategoryKey): void {
    const emotionName = this.selectedEmotion()?.name;
    if (emotionName) {
      this.strategyService.addStrategy(emotionName, scenario, category);
      const strategies = this.selectedEmotionStrategies()?.[scenario]?.[category];
      if (strategies) {
        const newStrategy = strategies[strategies.length - 1];
        this.startEditing(newStrategy);
      }
    }
  }

  deleteStrategy(scenario: ScenarioKey, category: CategoryKey, strategyId: string): void {
    const emotionName = this.selectedEmotion()?.name;
    if (emotionName && confirm('Delete this strategy?')) {
      this.strategyService.deleteStrategy(emotionName, scenario, category, strategyId);
    }
  }

  startEditing(strategy: Strategy): void {
    this.editingStrategy.set({ id: strategy.id, text: strategy.text });
  }

  cancelEditing(): void {
    this.editingStrategy.set(null);
  }

  saveStrategy(scenario: ScenarioKey, category: CategoryKey): void {
    const editState = this.editingStrategy();
    const emotionName = this.selectedEmotion()?.name;
    if (editState && emotionName) {
      this.strategyService.updateStrategyText(emotionName, scenario, category, editState.id, editState.text);
      this.editingStrategy.set(null);
    }
  }
  
  // --- Drag and Drop Logic ---
  onDragStart(strategy: Strategy, scenario: ScenarioKey, category: CategoryKey, index: number): void {
    this.draggedStrategy = { strategy, from: { scenario, category, index } };
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Necessary to allow drop
  }

  onDrop(toScenario: ScenarioKey, toCategory: CategoryKey, toIndex: number): void {
    if (!this.draggedStrategy) return;
    const { strategy: draggedItem, from } = this.draggedStrategy;
    const emotionName = this.selectedEmotion()?.name;
    if (!emotionName) return;

    // Create a mutable copy of the strategies for the current emotion
    const strategies = this.selectedEmotionStrategies();
    if (!strategies) return;

    // Remove from old list
    const fromList = [...strategies[from.scenario][from.category]];
    fromList.splice(from.index, 1);

    // Add to new list
    let toList = [...strategies[toScenario][toCategory]];
    if (from.scenario === toScenario && from.category === toCategory) {
      toList = fromList; // If same list, use the already modified list
    }
    toList.splice(toIndex, 0, draggedItem);

    // Update state via service
    if (from.scenario === toScenario && from.category === toCategory) {
      this.strategyService.reorderStrategies(emotionName, toScenario, toCategory, toList);
    } else {
      // If moving between lists, it's a delete and an add in a new position
      this.strategyService.reorderStrategies(emotionName, from.scenario, from.category, fromList);
      this.strategyService.reorderStrategies(emotionName, toScenario, toCategory, toList);
    }

    this.draggedStrategy = null;
  }

  // --- Guided Breathing ---
  breathingState = signal<'idle' | 'in' | 'hold1' | 'out' | 'hold2'>('idle');
  breathingInstruction = signal('Get ready...');
  breathingCountdown = signal(4);
  private breathingTimer: any = null;

  startBreathing(): void {
    if (this.breathingState() !== 'idle') return;
    this.breathingState.set('in');
    this.breathingInstruction.set('Breathe In');
    this.breathingCountdown.set(4);
    this.runBreathingCycle();
  }

  stopBreathing(): void {
    clearTimeout(this.breathingTimer);
    this.breathingState.set('idle');
    this.breathingInstruction.set('Get ready...');
  }
  
  private runBreathingCycle(): void {
    this.breathingTimer = setTimeout(() => {
      this.breathingCountdown.update(c => c - 1);

      if (this.breathingCountdown() === 0) {
        switch (this.breathingState()) {
          case 'in':
            this.breathingState.set('hold1');
            this.breathingInstruction.set('Hold');
            this.breathingCountdown.set(4);
            break;
          case 'hold1':
            this.breathingState.set('out');
            this.breathingInstruction.set('Breathe Out');
            this.breathingCountdown.set(4);
            break;
          case 'out':
            this.breathingState.set('hold2');
            this.breathingInstruction.set('Hold');
            this.breathingCountdown.set(4);
            break;
          case 'hold2':
            this.breathingState.set('in');
            this.breathingInstruction.set('Breathe In');
            this.breathingCountdown.set(4);
            break;
        }
      }
      this.runBreathingCycle();
    }, 1000);
  }
}
