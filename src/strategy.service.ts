import { Injectable, signal, effect, inject } from '@angular/core';
import { Strategy, Step, UserEmotionStrategies } from './models';
import { EmotionService } from './emotion.service';

@Injectable({ providedIn: 'root' })
export class StrategyService {
    private emotionService = inject(EmotionService);
    private readonly storageKey = 'feel-better-strategies';

    readonly strategies = signal<UserEmotionStrategies>(this.loadFromStorage());

    constructor() {
        effect(() => {
            this.saveToStorage(this.strategies());
        });
    }

    private loadFromStorage(): UserEmotionStrategies {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading strategies from localStorage', e);
        }
        return this.initializeDefaultStrategies();
    }
    
    private textToStrategy(text: string): Strategy {
        let steps: Step[] = [{ id: crypto.randomUUID(), text: 'Break this down into a small, actionable step.' }];

        // Add more detailed, helpful steps for a few example strategies
        if (text === 'Share your feeling with someone.') {
            steps = [
                { id: crypto.randomUUID(), text: 'Think of someone who will be happy for you.' },
                { id: crypto.randomUUID(), text: 'Reach out via text, call, or in person.' },
                { id: crypto.randomUUID(), text: 'Share what happened and how you feel.' },
            ];
        } else if (text === 'Take 10 deep, slow breaths.') {
             steps = [
                { id: crypto.randomUUID(), text: 'Find a comfortable seated position.' },
                { id: crypto.randomUUID(), text: 'Inhale slowly through your nose for a count of 4.' },
                { id: crypto.randomUUID(), text: 'Hold your breath for a count of 4.' },
                { id: crypto.randomUUID(), text: 'Exhale slowly through your mouth for a count of 6.' },
                { id: crypto.randomUUID(), text: 'Repeat this cycle 10 times.' },
            ];
        }

        return {
            id: crypto.randomUUID(),
            title: text,
            steps: steps
        };
    }

    private initializeDefaultStrategies(): UserEmotionStrategies {
        const defaultEmotions = this.emotionService.getEmotions();
        const initialStrategies: UserEmotionStrategies = {};

        for (const emotion of defaultEmotions) {
            initialStrategies[emotion.name] = {
                self: {
                    immediate: emotion.scenarios.self.immediate.map(text => this.textToStrategy(text)),
                    shortTerm: emotion.scenarios.self.shortTerm.map(text => this.textToStrategy(text)),
                    longTerm: emotion.scenarios.self.longTerm.map(text => this.textToStrategy(text)),
                },
                friend: {
                    immediate: emotion.scenarios.friend.immediate.map(text => this.textToStrategy(text)),
                    shortTerm: emotion.scenarios.friend.shortTerm.map(text => this.textToStrategy(text)),
                    longTerm: emotion.scenarios.friend.longTerm.map(text => this.textToStrategy(text)),
                },
                caused: {
                    immediate: emotion.scenarios.caused.immediate.map(text => this.textToStrategy(text)),
                    shortTerm: emotion.scenarios.caused.shortTerm.map(text => this.textToStrategy(text)),
                    longTerm: emotion.scenarios.caused.longTerm.map(text => this.textToStrategy(text)),
                }
            };
        }
        return initialStrategies;
    }

    private saveToStorage(strategies: UserEmotionStrategies): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(strategies));
        } catch (e) {
            console.error('Error saving strategies to localStorage', e);
        }
    }

    resetToDefaults(): void {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (e) {
            console.error('Error removing strategies from localStorage', e);
        }
        this.strategies.set(this.initializeDefaultStrategies());
    }

    private updateStrategyList(emotion: string, scenario: string, category: string, updateFn: (list: Strategy[]) => Strategy[]) {
        this.strategies.update(allStrategies => {
            const newStrategies = JSON.parse(JSON.stringify(allStrategies));
            const emotionStrategies = newStrategies[emotion];
            
            if (emotionStrategies && emotionStrategies[scenario] && emotionStrategies[scenario][category]) {
                const currentList = emotionStrategies[scenario][category];
                emotionStrategies[scenario][category] = updateFn(currentList);
            }
            
            return newStrategies;
        });
    }

    addStrategy(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm'): void {
        const newStrategy: Strategy = { 
            id: crypto.randomUUID(), 
            title: 'New Strategy...',
            steps: [{ id: crypto.randomUUID(), text: 'First step...' }]
        };
        this.updateStrategyList(emotion, scenario, category, list => [...list, newStrategy]);
    }
    
    deleteStrategy(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm', strategyId: string): void {
        this.updateStrategyList(emotion, scenario, category, list => list.filter(s => s.id !== strategyId));
    }

    updateStrategyTitle(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm', strategyId: string, newTitle: string): void {
        this.updateStrategyList(emotion, scenario, category, list => list.map(s => s.id === strategyId ? { ...s, title: newTitle } : s));
    }

    addStep(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm', strategyId: string): void {
        const newStep: Step = { id: crypto.randomUUID(), text: 'New step...' };
        this.updateStrategyList(emotion, scenario, category, list => 
            list.map(s => s.id === strategyId ? { ...s, steps: [...s.steps, newStep] } : s)
        );
    }
    
    deleteStep(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm', strategyId: string, stepId: string): void {
        this.updateStrategyList(emotion, scenario, category, list => 
            list.map(s => s.id === strategyId ? { ...s, steps: s.steps.filter(step => step.id !== stepId) } : s)
        );
    }

    updateStepText(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm', strategyId: string, stepId: string, newText: string): void {
        this.updateStrategyList(emotion, scenario, category, list => 
            list.map(s => s.id === strategyId 
              ? { ...s, steps: s.steps.map(step => step.id === stepId ? { ...step, text: newText } : step) } 
              : s
            )
        );
    }
    
    reorderStrategies(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm', updatedList: Strategy[]): void {
        this.updateStrategyList(emotion, scenario, category, () => updatedList);
    }
}