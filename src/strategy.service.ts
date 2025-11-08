import { Injectable, signal, effect, inject } from '@angular/core';
import { Strategy, UserEmotionStrategies } from './models';
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

    private initializeDefaultStrategies(): UserEmotionStrategies {
        const defaultEmotions = this.emotionService.getEmotions();
        const initialStrategies: UserEmotionStrategies = {};

        for (const emotion of defaultEmotions) {
            initialStrategies[emotion.name] = {
                self: {
                    immediate: emotion.scenarios.self.immediate.map(text => ({ id: crypto.randomUUID(), text })),
                    shortTerm: emotion.scenarios.self.shortTerm.map(text => ({ id: crypto.randomUUID(), text })),
                    longTerm: emotion.scenarios.self.longTerm.map(text => ({ id: crypto.randomUUID(), text })),
                },
                friend: {
                    immediate: emotion.scenarios.friend.immediate.map(text => ({ id: crypto.randomUUID(), text })),
                    shortTerm: emotion.scenarios.friend.shortTerm.map(text => ({ id: crypto.randomUUID(), text })),
                    longTerm: emotion.scenarios.friend.longTerm.map(text => ({ id: crypto.randomUUID(), text })),
                },
                caused: {
                    immediate: emotion.scenarios.caused.immediate.map(text => ({ id: crypto.randomUUID(), text })),
                    shortTerm: emotion.scenarios.caused.shortTerm.map(text => ({ id: crypto.randomUUID(), text })),
                    longTerm: emotion.scenarios.caused.longTerm.map(text => ({ id: crypto.randomUUID(), text })),
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

    private updateStrategyList(emotion: string, scenario: string, category: string, updateFn: (list: Strategy[]) => Strategy[]) {
        this.strategies.update(allStrategies => {
            const newStrategies = { ...allStrategies };
            const emotionStrategies = { ...newStrategies[emotion] };
            const scenarioStrategies = { ...emotionStrategies[scenario] };
            const currentList = scenarioStrategies[category];
            
            scenarioStrategies[category] = updateFn(currentList);
            emotionStrategies[scenario] = scenarioStrategies;
            newStrategies[emotion] = emotionStrategies;
            
            return newStrategies;
        });
    }

    addStrategy(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm'): void {
        const newStrategy: Strategy = { id: crypto.randomUUID(), text: 'New strategy...' };
        this.updateStrategyList(emotion, scenario, category, list => [...list, newStrategy]);
    }
    
    deleteStrategy(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm', strategyId: string): void {
        this.updateStrategyList(emotion, scenario, category, list => list.filter(s => s.id !== strategyId));
    }

    updateStrategyText(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm', strategyId: string, newText: string): void {
        this.updateStrategyList(emotion, scenario, category, list => list.map(s => s.id === strategyId ? { ...s, text: newText } : s));
    }
    
    reorderStrategies(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm', updatedList: Strategy[]): void {
        this.updateStrategyList(emotion, scenario, category, () => updatedList);
    }
}
