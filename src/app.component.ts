import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Emotion, JournalEntry, Step, Strategy, ThoughtChallengerRecord } from './models';
import { EmotionService } from './emotion.service';
import { JournalService } from './journal.service';
import { StrategyService } from './strategy.service';

type View = 'home' | 'detail' | 'finder' | 'journal' | 'trends' | 'settings' | 'breathing' | 'thoughtChallenger';
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
  // Audio Cues
  private audioContext: AudioContext | null = null;
  audioEnabled = signal(false);

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

  constructor() {
    // Initialize theme from storage or, if not available, from the current DOM state
    // which was set by the anti-FOUC script in index.html.
    const storedTheme = localStorage.getItem(this.themeKey) as 'light' | 'dark' | null;
    if (storedTheme) {
      this.theme.set(storedTheme);
    } else {
      // Sync with the DOM state set by the FOUC script
      const isDark = document.documentElement.classList.contains('dark');
      this.theme.set(isDark ? 'dark' : 'light');
    }

    // This effect becomes the single source of truth for updating the DOM and localStorage
    // based on the signal's state.
    effect(() => {
      const currentTheme = this.theme();
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
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
    this.completedStepIds.set(new Set<string>()); // Reset checkboxes on new emotion
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

  getEmotionBgTint(emotionName: string): string {
    return this.emotions().find(e => e.name === emotionName)?.bgTint || 'bg-gray-100/50 dark:bg-gray-800/20';
  }

  getEmotionBorderColor(emotionName: string): string {
    const bgColor = this.getEmotionColor(emotionName);
    // e.g. "bg-amber-300 dark:bg-amber-500" -> "border-amber-300 dark:border-amber-500"
    return bgColor.replace(/bg-/g, 'border-');
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

  // --- Data Export ---
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

  // --- Strategies ---
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
      // It's a step
      this.strategyService.updateStepText(emotion.name, scenario, category, editing.strategyId, editing.stepId, editing.text.trim());
    } else {
      // It's a title
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
    
    if (from.scenario === toScenario && from.category === toCategory && from.index === toIndex) {
      this.draggedStrategy = null;
      return;
    }

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
  setBreathingPattern(inhale: number, hold: number, exhale: number): void {
    this.breathingInhaleDuration.set(inhale);
    this.breathingHoldDuration.set(hold);
    this.breathingExhaleDuration.set(exhale);
  }

  startBreathing(): void {
    if (this.breathingState() !== 'idle') return;
    this.initAudio(); // Ensure audio context is ready on user gesture
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

  // --- Audio Cues ---
  private initAudio(): void {
    if (!this.audioContext) {
      // Use casting to handle vendor prefixes for older browsers
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  toggleAudio(): void {
    this.audioEnabled.update(enabled => !enabled);
    if (this.audioEnabled()) {
      this.initAudio();
      // Play a small confirmation sound on enable
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

  // --- Mini-Tools ---
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
      // Keep the "Complete" message on screen until user closes.
      return;
    }
    const message = this.groundingToolMessages[step];
    this.toolTimeout = setTimeout(() => {
      this.groundingToolStep.update(s => s + 1);
      this.runGroundingStep();
    }, message.duration * 1000);
  }

  // --- Thought Challenger Methods ---
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
}