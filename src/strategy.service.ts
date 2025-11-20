
import { Injectable, signal, effect, inject } from '@angular/core';
import { Strategy, Step, UserEmotionStrategies } from './models';
import { EmotionService } from './emotion.service';

@Injectable({ providedIn: 'root' })
export class StrategyService {
    private emotionService = inject(EmotionService);
    private readonly storageKey = 'feel-better-strategies';

    private strategyDetailsMap = new Map<string, { title: string; steps: string[] }>([
        // Joy
        ['Share your feeling with someone.', { title: 'Share Your Joy', steps: ['Think of someone who will be happy for you.', 'Reach out via text, call, or in person.', 'Share what happened and how you feel.'] }],
        ['Smile and savor the moment.', { title: 'Savor the Moment', steps: ['Find a quiet spot for one minute.', 'Close your eyes and focus on the physical feeling of joy.', 'Smile gently.', 'Mentally note the details of what is making you happy.'] }],
        ['Listen to uplifting music.', { title: 'Uplifting Music', steps: ['Pick a song you associate with happy memories.', 'Put on headphones to fully immerse yourself.', 'Allow yourself to move: tap your feet, nod, or dance.'] }],
        ['Write down what you\'re grateful for.', { title: 'Gratitude Journaling', steps: ['Open a notebook or notes app.', 'List 3-5 specific things you are grateful for right now.', 'For each item, write why it\'s meaningful to you.'] }],

        // Sadness
        ['Allow yourself to cry if you need to.', { title: 'Permit Your Tears', steps: ['Find a safe, private space.', 'Acknowledge that crying is a natural and healthy release.', 'Don\'t judge your feelings; just let them flow.', 'Have a glass of water afterward to rehydrate.'] }],
        ['Wrap yourself in a warm blanket.', { title: 'Seek Physical Comfort', steps: ['Find your softest, most comforting blanket.', 'Wrap it tightly around yourself.', 'Focus on the sensation of warmth and pressure, which can be physiologically calming.'] }],
        ['Drink a warm, comforting beverage.', { title: 'Sip Something Warm', steps: ['Prepare a warm, non-caffeinated drink like herbal tea.', 'Hold the warm mug in your hands and feel the heat.', 'Sip slowly, focusing on the comforting sensation.'] }],
        ['Talk to a trusted friend or family member.', { title: 'Connect With Someone', steps: ['Think of someone you trust who is a good listener.', 'Send a simple message: "Do you have a moment? I\'m feeling a bit down."', 'Share what you\'re comfortable sharing.'] }],
        ['Go for a gentle walk in nature.', { title: 'Walk in Nature', steps: ['Put on comfortable shoes.', 'Walk for 10-15 minutes in a park or green space.', 'Pay attention to your senses: the air, the sounds, the sights.'] }],

        // Anger
        ['Take 10 deep, slow breaths.', { title: 'Deep Breathing', steps: ['Find a comfortable seated position.', 'Inhale slowly through your nose for a count of 4.', 'Hold your breath for a count of 4.', 'Exhale slowly through your mouth for a count of 6.', 'Repeat this cycle 5-10 times.'] }],
        ['Count to 20 before reacting.', { title: 'Pause and Count', steps: ['Stop what you are doing.', 'Turn away from the trigger if possible.', 'Slowly count to 20, focusing only on the numbers.', 'Re-evaluate your urge to react after the pause.'] }],
        ['Leave the situation for a few minutes.', { title: 'Take a Time-Out', steps: ['State calmly, "I need to take a break for a few minutes."', 'Physically remove yourself from the situation.', 'Go to a different room or step outside.', 'Return only when you feel calmer.'] }],
        ['Engage in physical activity like running or punching a pillow.', { title: 'Release Physical Energy', steps: ['Choose a safe, intense physical activity (e.g., brisk walk, running).', 'Engage in the activity for 5-10 minutes.', 'Focus on the physical sensations, letting the energy move through you.'] }],
        ['Write down your feelings in a journal.', { title: 'Expressive Writing', steps: ['Open a journal or a blank document.', 'Write nonstop for 5 minutes about what is making you angry.', 'Do not censor yourself. The goal is to get it out.', 'You can delete or tear up the paper afterwards.'] }],
        
        // Fear
        ['Focus on your breathing; inhale for 4, hold for 4, exhale for 6.', { title: 'Controlled Breathing', steps: ['Inhale slowly through your nose for a count of 4.', 'Gently hold your breath for a count of 4.', 'Exhale slowly and completely through your mouth for a count of 6.', 'Repeat 5-10 times. A longer exhale calms the nervous system.'] }],
        ['Ground yourself: name 5 things you see, 4 you feel, 3 you hear.', { title: '5-4-3-2-1 Grounding', steps: ['Look around and name 5 things you can SEE.', 'Acknowledge 4 things you can physically FEEL (e.g., your feet on the floor).', 'Listen and identify 3 things you can HEAR.', 'Identify 2 things you can SMELL.', 'Name 1 thing you can TASTE.'] }],
        ['Hold a piece of ice.', { title: 'Intense Sensation', steps: ['Safely get a piece of ice from the freezer.', 'Hold it in the palm of your hand.', 'Focus all your attention on the intense cold sensation.', 'This strong physical feeling can interrupt an overwhelming emotion.'] }],
        ['Talk about your fear with someone you trust.', { title: 'Voice Your Fear', steps: ['Think of someone who makes you feel safe.', 'Reach out and tell them you are feeling scared.', 'Putting the fear into words can make it feel more manageable.'] }],
        
        // Disgust
        ['Physically move away from the source of disgust.', { title: 'Create Distance', steps: ['Identify the source of your disgust.', 'Calmly and immediately move to a different space.', 'This creates both physical and psychological distance.'] }],
        ['Focus on a neutral or pleasant sensation.', { title: 'Shift Your Focus', steps: ['After creating distance, find something pleasant to focus on.', 'Look at a picture you like, listen to a calming song, or smell something nice.', 'This helps reset your emotional state.'] }],
        
        // Anticipation
        ['Take a few deep breaths to manage excitement or anxiety.', { title: 'Manage Anticipation', steps: ['Acknowledge the feeling of anticipation without judgment.', 'Use the "Controlled Breathing" technique (Inhale 4, Hold 4, Exhale 6).', 'If your mind is racing, try the 5-4-3-2-1 Grounding technique to focus on the present.'] }],
    ]);

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
        const details = this.strategyDetailsMap.get(text);
        
        let title = text;
        let steps: Step[];

        if (details) {
            title = details.title;
            steps = details.steps.map(stepText => ({
                id: crypto.randomUUID(),
                text: stepText
            }));
        } else {
            steps = [{ id: crypto.randomUUID(), text: 'Break this down into a small, actionable step.' }];
        }
        
        return {
            id: crypto.randomUUID(),
            title: title,
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
