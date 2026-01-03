import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, ElementRef, viewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Emotion, JournalEntry, Step, Strategy, ThoughtChallengerRecord } from './models';
import { EmotionService } from './emotion.service';
import { JournalService } from './journal.service';
import { StrategyService } from './strategy.service';

declare const d3: any;

type View = 'home' | 'detail' | 'finder' | 'journal' | 'trends' | 'settings' | 'breathing' | 'thoughtChallenger' | 'growth';
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
  private datePipe = inject(DatePipe);
  
  // View management
  currentView = signal<View>('home');
  selectedEmotion = signal<Emotion | null>(null);
  selectedScenario = signal<ScenarioKey>('self');

  // Data signals
  emotions = signal<Emotion[]>([]);
  availableColors: string[] = [];
  journalEntries = this.journalService.journal;
  userStrategies = this.strategyService.strategies;
  
  // Journal form state
  newJournalEmotion = signal<string>('');
  newJournalNotes = signal<string>('');

  // --- Theme Management ---
  private readonly colorModeKey = 'feel-better-color-mode';
  private readonly activeThemeKey = 'feel-better-active-theme';
  colorMode = signal<'light' | 'dark'>('light');
  activeTheme = signal<string>('playful');
  themes = [
    { id: 'playful', name: 'Playful', colors: ['#7e5bef', '#ff6bdf'] },
    { id: 'sunset', name: 'Sunset', colors: ['#ff8c42', '#ec4899'] },
    { id: 'ocean', name: 'Ocean', colors: ['#0284c7', '#ff6f61'] },
    { id: 'meadow', name: 'Meadow', colors: ['#22c55e', '#a3e635'] }
  ];

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

  // --- Strategy State ---
  editingTarget = signal<{ strategyId: string; stepId?: string; text: string } | null>(null);
  completedStepIds = signal(new Set<string>());
  expandedStrategyIds = signal(new Set<string>());

  // Drag and drop state
  private draggedStrategy: { strategy: Strategy, from: { scenario: ScenarioKey, category: CategoryKey, index: number } } | null = null;

  // --- Breathing exercise state ---
  breathingState = signal<'idle' | 'in' | 'hold' | 'out'>('idle');
  breathingInstruction = signal('Breathe');
  breathingCountdown = signal(0);
  private breathingInterval: any;
  breathingInhaleDuration = signal(4);
  breathingHoldDuration = signal(4);
  breathingExhaleDuration = signal(6);
  breathingPhaseDuration = signal(4); // For dynamic animation timing
  private audioContext: AudioContext | null = null;
  audioEnabled = signal(false);
  breathingSessionsCompleted = signal(this.loadStat('breathingSessionsCompleted'));

  // --- Mini Tools ---
  activeTool = signal<'none' | 'grounding'>('none');
  groundingToolStep = signal(0);
  readonly groundingToolMessages = [
    { title: 'See', instruction: 'Acknowledge 5 things you can see around you.', duration: 15 },
    { title: 'Feel', instruction: 'Acknowledge 4 things you can feel.', duration: 10 },
    { title: 'Hear', instruction: 'Acknowledge 3 things you can hear.', duration: 10 },
    { title: 'Smell', instruction: 'Acknowledge 2 things you can smell.', duration: 8 },
    { title: 'Taste', instruction: 'Acknowledge 1 thing you can taste.', duration: 5 }
  ];
  private toolTimeout: any;

  // Trends data
  trendsData = computed(() => {
    const entries = this.journalEntries();
    const emotionMap = new Map<string, string>();
    this.emotions().forEach(e => emotionMap.set(e.name, e.color));

    // Optimization: Group entries by date string once to avoid repeated filtering and date parsing.
    const entriesByDate = new Map<string, JournalEntry[]>();
    for (const entry of entries) {
        const dateString = new Date(entry.date).toDateString();
        if (!entriesByDate.has(dateString)) {
            entriesByDate.set(dateString, []);
        }
        entriesByDate.get(dateString)!.push(entry);
    }

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
        const entriesForDay = entriesByDate.get(dateString) || [];
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

  // --- Thought Challenger State ---
  thoughtChallengerStep = signal(0);
  thoughtChallengerData = signal<ThoughtChallengerRecord>({
    situation: '',
    emotion: '',
    initialIntensity: 5,
    automaticThought: '',
    evidenceFor: '',
    evidenceAgainst: '',
    alternativeThought: '',
    finalIntensity: 5,
  });

  // --- Growth Page ---
  journalingStreak = computed(() => {
    const entries = this.journalEntries();
    if (entries.length === 0) {
      return 0;
    }

    const uniqueTimestamps = Array.from(
      new Set<number>(entries.map(e => new Date(e.date).setHours(0, 0, 0, 0)))
    ).sort((a, b) => b - a);

    if (uniqueTimestamps.length === 0) {
      return 0;
    }
    
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 86400000; // Milliseconds in a day

    let startIndex = uniqueTimestamps.findIndex(ts => ts === today);
    if (startIndex === -1) {
      startIndex = uniqueTimestamps.findIndex(ts => ts === yesterday);
      if (startIndex === -1) {
        return 0;
      }
    }

    let streak = 1;
    let currentTs = uniqueTimestamps[startIndex];

    for (let i = startIndex + 1; i < uniqueTimestamps.length; i++) {
      const nextTs = uniqueTimestamps[i];
      const expectedTs = currentTs - 86400000;
      
      if (nextTs === expectedTs) {
        streak++;
        currentTs = nextTs;
      } else {
        break;
      }
    }

    return streak;
  });

  emotionDistribution = computed(() => {
    const entries = this.journalEntries();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoTs = thirtyDaysAgo.getTime(); // Get timestamp once for efficient comparison
    
    const recentEntries = entries.filter(e => new Date(e.date).getTime() > thirtyDaysAgoTs);
    const counts = new Map<string, number>();
    
    recentEntries.forEach(e => {
        counts.set(e.emotion, (counts.get(e.emotion) || 0) + 1);
    });
    
    const total = recentEntries.length;
    if (total === 0) return [];
    
    return Array.from(counts.entries()).map(([name, count]) => ({
      name,
      count,
      percentage: (count / total) * 100,
      color: this.emotions().find(e => e.name === name)?.color.split(' ')[0] || 'bg-gray-200'
    })).sort((a, b) => b.count - a.count);
  });
  
  chartContainer = viewChild<ElementRef>('chartContainer');

  // --- Daily Moment ---
  private readonly dailyMomentKey = 'feel-better-daily-moment';
  dailyMomentPrompt = signal('');
  dailyMomentDone = signal(false);
  private dailyPrompts = [
    "What's one small thing you're grateful for today?",
    "What is one thing you can do for your well-being in the next hour?",
    "Take a moment to notice your breath, just as it is.",
    "What are you looking forward to this week?",
    "Acknowledge one personal strength you've used recently.",
    "What is a sound you can hear right now? Focus on it for 15 seconds.",
    "Think of a happy memory. Let yourself feel the warmth.",
  ];

  constructor() {
    this.initializeTheme();
    this.initializeDailyMoment();
    this.emotions.set(this.emotionService.getEmotions());
    this.availableColors = this.emotionService.availableColors;
    this.newJournalEmotion.set(this.emotions()[0]?.name || '');

    effect(() => {
        if (this.currentView() === 'growth' && this.chartContainer()) {
            this.drawDonutChart();
        }
    });
  }

  private initializeTheme(): void {
    const storedMode = localStorage.getItem(this.colorModeKey) as 'light' | 'dark' | null;
    if (storedMode) {
      this.colorMode.set(storedMode);
    } else {
      this.colorMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    const storedTheme = localStorage.getItem(this.activeThemeKey);
    if (storedTheme) {
      this.activeTheme.set(storedTheme);
    }

    effect(() => {
      const mode = this.colorMode();
      const theme = this.activeTheme();
      const html = document.documentElement;

      if (mode === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
      localStorage.setItem(this.colorModeKey, mode);

      html.className = html.className.replace(/theme-\S+/g, '').trim();
      html.classList.add(`theme-${theme}`);
      localStorage.setItem(this.activeThemeKey, theme);
      
      if (this.currentView() === 'growth' && this.chartContainer()) {
          this.drawDonutChart();
      }
    });
  }

  private initializeDailyMoment(): void {
    const stored = localStorage.getItem(this.dailyMomentKey);
    const todayStr = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    if (stored) {
      try {
        const { date, done } = JSON.parse(stored);
        if (date === todayStr && done) {
          this.dailyMomentDone.set(true);
        }
      } catch (e) {
        console.error("Failed to parse daily moment data", e);
      }
    }
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    this.dailyMomentPrompt.set(this.dailyPrompts[dayOfYear % this.dailyPrompts.length]);
  }

  completeDailyMoment(): void {
    this.dailyMomentDone.set(true);
    const todayStr = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    localStorage.setItem(this.dailyMomentKey, JSON.stringify({ date: todayStr, done: true }));
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
    this.completedStepIds.set(new Set());
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

  private tailwindColorHexMap: { [key: string]: string } = {
    'slate': '#64748b', 'gray': '#6b7280', 'zinc': '#71717a', 'neutral': '#737373', 'stone': '#78716c',
    'red': '#ef4444', 'orange': '#f97316', 'amber': '#f59e0b', 'yellow': '#eab308', 'lime': '#84cc16', 'green': '#22c55e',
    'emerald': '#10b981', 'teal': '#14b8a6', 'cyan': '#06b6d4', 'sky': '#0ea5e9', 'blue': '#3b82f6', 'indigo': '#6366f1',
    'violet': '#8b5cf6', 'purple': '#a855f7', 'fuchsia': '#d946ef', 'pink': '#ec4899', 'rose': '#f43f5e'
  };
  
  getEmotionTailwindColor(emotionName: string): string {
    const colorName = this.emotionService.getCurrentColorNameForEmotion(emotionName);
    return this.tailwindColorHexMap[colorName] || '#9ca3af';
  }

  getEmotionBgTint(emotionName: string): string {
    return this.emotions().find(e => e.name === emotionName)?.bgTint || 'bg-gray-100/50 dark:bg-gray-800/20';
  }

  getEmotionBorderColor(emotionName: string): string {
    const bgColor = this.getEmotionColor(emotionName);
    return bgColor.replace(/bg-/g, 'border-');
  }

  setColorMode(mode: 'light' | 'dark'): void {
    this.colorMode.set(mode);
  }

  setActiveTheme(themeId: string): void {
    this.activeTheme.set(themeId);
  }

  getCurrentEmotionColor(emotionName: string): string {
    return this.emotionService.getCurrentColorNameForEmotion(emotionName);
  }

  isEmotionColorDefault(emotionName: string): boolean {
    const currentColor = this.emotionService.getCurrentColorNameForEmotion(emotionName);
    const defaultColor = this.emotionService.getDefaultColorName(emotionName);
    return currentColor === defaultColor;
  }

  updateEmotionColor(emotionName: string, colorName: string): void {
    this.emotionService.setEmotionColor(emotionName, colorName);
    this.emotions.set(this.emotionService.getEmotions());
    if (this.currentView() === 'growth' && this.chartContainer()) {
      this.drawDonutChart();
    }
  }

  resetEmotionColor(emotionName: string): void {
    this.emotionService.resetEmotionColor(emotionName);
    this.emotions.set(this.emotionService.getEmotions());
    if (this.currentView() === 'growth' && this.chartContainer()) {
      this.drawDonutChart();
    }
  }

  copyUpiId(): void {
    navigator.clipboard.writeText(this.upiId).then(() => {
      this.upiCopied.set(true);
      setTimeout(() => this.upiCopied.set(false), 2000);
    });
  }

  exportJournal(): void {
    const entries = this.journalEntries();
    if (entries.length === 0) {
        return;
    }
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feel-better-journal-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  startEditingTitle(strategy: Strategy): void {
    this.editingTarget.set({ strategyId: strategy.id, text: strategy.title });
  }

  startEditingStep(strategyId: string, step: Step): void {
    this.editingTarget.set({ strategyId: strategyId, stepId: step.id, text: step.text });
  }

  cancelEditing(): void {
    this.editingTarget.set(null);
  }

  saveEdit(scenario: ScenarioKey, category: CategoryKey): void {
    const editing = this.editingTarget();
    const emotion = this.selectedEmotion();
    if (!editing || !emotion || !editing.text.trim()) {
      this.cancelEditing();
      return;
    }

    if (editing.stepId) {
      this.strategyService.updateStepText(emotion.name, scenario, category, editing.strategyId, editing.stepId, editing.text.trim());
    } else {
      this.strategyService.updateStrategyTitle(emotion.name, scenario, category, editing.strategyId, editing.text.trim());
    }
    this.editingTarget.set(null);
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

  addStep(scenario: ScenarioKey, category: CategoryKey, strategyId: string): void {
    const emotion = this.selectedEmotion();
    if (emotion) {
        this.strategyService.addStep(emotion.name, scenario, category, strategyId);
    }
  }

  deleteStep(scenario: ScenarioKey, category: CategoryKey, strategyId: string, stepId: string): void {
    const emotion = this.selectedEmotion();
    if (emotion) {
        this.strategyService.deleteStep(emotion.name, scenario, category, strategyId, stepId);
    }
  }

  toggleStepCompleted(stepId: string): void {
    this.completedStepIds.update(ids => {
      const newSet = new Set(ids);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  }
  
  toggleStrategyExpansion(strategyId: string): void {
    this.expandedStrategyIds.update(ids => {
      const newSet = new Set(ids);
      if (newSet.has(strategyId)) {
        newSet.delete(strategyId);
      } else {
        newSet.add(strategyId);
      }
      return newSet;
    });
  }

  resetStepChecks(): void {
    this.completedStepIds.set(new Set());
  }

  onDragStart(strategy: Strategy, fromScenario: ScenarioKey, fromCategory: CategoryKey, fromIndex: number): void {
    this.draggedStrategy = { strategy, from: { scenario: fromScenario, category: fromCategory, index: fromIndex } };
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(toScenario: ScenarioKey, toCategory: CategoryKey, toIndex: number): void {
    if (!this.draggedStrategy) return;
    
    const { strategy, from } = this.draggedStrategy;
    const emotionName = this.selectedEmotion()?.name;

    if (!emotionName) return;
    
    if (from.scenario === toScenario && from.category === toCategory && from.index === toIndex) {
      this.draggedStrategy = null;
      return;
    }

    this.strategyService.strategies.update(allStrategies => {
      const newStrategies = JSON.parse(JSON.stringify(allStrategies));
      const emotionStrategies = newStrategies[emotionName];

      const fromList = emotionStrategies[from.scenario][from.category];
      fromList.splice(from.index, 1);

      const toList = emotionStrategies[toScenario][toCategory];
      toList.splice(toIndex, 0, strategy);

      return newStrategies;
    });

    this.draggedStrategy = null;
  }
  
  private saveStat(key: string, value: number) {
    localStorage.setItem(`feel-better-stat-${key}`, String(value));
  }
  private loadStat(key: string): number {
    return parseInt(localStorage.getItem(`feel-better-stat-${key}`) || '0', 10);
  }

  setBreathingPattern(inhale: number, hold: number, exhale: number): void {
    this.breathingInhaleDuration.set(inhale);
    this.breathingHoldDuration.set(hold);
    this.breathingExhaleDuration.set(exhale);
  }

  startBreathing(): void {
    if (this.breathingState() !== 'idle') return;
    this.initAudio();
    this.breathingState.set('in');
    this.runBreathingCycle();
  }

  stopBreathing(): void {
    if (this.breathingInterval) {
      clearInterval(this.breathingInterval);
    }
    if(this.breathingState() !== 'idle') {
      this.breathingSessionsCompleted.update(s => s + 1);
      this.saveStat('breathingSessionsCompleted', this.breathingSessionsCompleted());
    }
    this.breathingState.set('idle');
    this.breathingInstruction.set('Breathe');
  }

  private runBreathingCycle(): void {
    const cycle = [
      { state: 'in', instruction: 'Breathe In', duration: this.breathingInhaleDuration(), tone: 600 },
      { state: 'hold', instruction: 'Hold', duration: this.breathingHoldDuration(), tone: 800 },
      { state: 'out', instruction: 'Breathe Out', duration: this.breathingExhaleDuration(), tone: 400 },
    ] as const;

    let currentPhase = -1;

    const nextPhase = () => {
      if (this.breathingState() === 'idle') {
        return;
      }

      currentPhase = (currentPhase + 1) % cycle.length;
      const phase = cycle[currentPhase];
      this.playTone(phase.tone, 0.2);
      this.breathingState.set(phase.state);
      this.breathingInstruction.set(phase.instruction);
      this.breathingCountdown.set(phase.duration);
      this.breathingPhaseDuration.set(phase.duration);

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

  private initAudio(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  toggleAudio(): void {
    this.audioEnabled.update(enabled => !enabled);
    if (this.audioEnabled()) {
      this.initAudio();
      this.playTone(440, 0.1); 
    }
  }

  private playTone(frequency: number, duration: number): void {
    if (!this.audioContext || !this.audioEnabled()) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.001, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  startTool(toolId: 'grounding'): void {
    if (toolId === 'grounding') {
        this.activeTool.set('grounding');
        this.groundingToolStep.set(0);
        this.runGroundingStep();
    }
  }

  stopTool(): void {
    clearTimeout(this.toolTimeout);
    this.activeTool.set('none');
  }
  
  private runGroundingStep(): void {
    const step = this.groundingToolStep();
    if (step >= this.groundingToolMessages.length) {
      return;
    }
    const message = this.groundingToolMessages[step];
    this.toolTimeout = setTimeout(() => {
      this.groundingToolStep.update(s => s + 1);
      this.runGroundingStep();
    }, message.duration * 1000);
  }

  startThoughtChallenger(): void {
    this.thoughtChallengerStep.set(0);
    this.thoughtChallengerData.set({
      situation: '',
      emotion: this.emotions()[0]?.name || '',
      initialIntensity: 5,
      automaticThought: '',
      evidenceFor: '',
      evidenceAgainst: '',
      alternativeThought: '',
      finalIntensity: 5,
    });
    this.setView('thoughtChallenger');
  }

  setThoughtChallengerValue(field: keyof ThoughtChallengerRecord, value: any): void {
    this.thoughtChallengerData.update(data => ({ ...data, [field]: value }));
  }

  nextThoughtStep(): void {
    if (this.thoughtChallengerStep() < 7) {
      this.thoughtChallengerStep.update(s => s + 1);
    }
  }

  prevThoughtStep(): void {
    if (this.thoughtChallengerStep() > 0) {
      this.thoughtChallengerStep.update(s => s - 1);
    }
  }

  saveThoughtToJournal(): void {
    const data = this.thoughtChallengerData();
    const notes = `
Thought Record
--------------------
🔹 **Situation:**
${data.situation}

🧠 **Automatic Thought:**
"${data.automaticThought}"
*Initial Emotion: ${data.emotion} (Intensity: ${data.initialIntensity}/10)*

👍 **Evidence For:**
${data.evidenceFor.split('\n').map(l => l.trim() ? `- ${l}` : '').filter(Boolean).join('\n') || '- (None given)'}

👎 **Evidence Against:**
${data.evidenceAgainst.split('\n').map(l => l.trim() ? `- ${l}` : '').filter(Boolean).join('\n') || '- (None given)'}

✨ **Balanced Thought:**
"${data.alternativeThought}"
*Final Emotion: ${data.emotion} (Intensity: ${data.finalIntensity}/10)*
    `.trim();

    this.journalService.addEntry({
      emotion: data.emotion,
      notes: notes,
    });
    this.setView('journal');
  }

  // --- D3 Chart ---
  private drawDonutChart(): void {
    const container = this.chartContainer()?.nativeElement;
    if (!container) return;

    const data = this.emotionDistribution();
    d3.select(container).select('svg').remove();

    if (data.length === 0) {
        container.innerHTML = `<div class="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">Log entries to see your 30-day distribution.</div>`;
        return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = 10;
    const radius = Math.min(width, height) / 2 - margin;
    const isDarkMode = this.colorMode() === 'dark';

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
        .domain(data.map((d: any) => d.name))
        .range(data.map((d: any) => this.getEmotionTailwindColor(d.name)));

    const pie = d3.pie().value((d: any) => d.count).sort(null);
    const data_ready = pie(data);

    const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.85);
        
    const computedStyle = getComputedStyle(document.documentElement);
    const strokeColor = isDarkMode ? `rgb(${computedStyle.getPropertyValue('--bg-subtle')})` : `rgb(${computedStyle.getPropertyValue('--bg-default')})`;
    const centerTextColor = `rgb(${computedStyle.getPropertyValue('--text-default')})`;

    svg.selectAll('path')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('fill', (d: any) => color(d.data.name))
        .attr('stroke', strokeColor)
        .style('stroke-width', '2px')
        .style('opacity', 0.8)
        .transition()
        .duration(750)
        .attrTween('d', function(d: any) {
            const i = d3.interpolate({ startAngle: d.startAngle, endAngle: d.startAngle }, d);
            return function(t: any) { return arc(i(t)); };
        });
    
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .text('30 Days')
        .style('font-size', '1.2rem')
        .style('font-weight', 'bold')
        .style('fill', centerTextColor);
  }

}