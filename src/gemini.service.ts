
import { Injectable, inject } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { JournalEntryInsight } from './models';
import { StrategyService } from './strategy.service';
import { EmotionService } from './emotion.service';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI;
  private strategyService = inject(StrategyService);
  private emotionService = inject(EmotionService);
  private allStrategiesCache: { emotion: string, title: string }[] | null = null;

  constructor() {
    // IMPORTANT: This relies on `process.env.API_KEY` being set in the execution environment.
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private getAllStrategies(): { emotion: string, title: string }[] {
    if (this.allStrategiesCache) {
      return this.allStrategiesCache;
    }

    const strategies: { emotion: string, title: string }[] = [];
    const emotions = this.emotionService.getEmotions();
    const userStrategies = this.strategyService.strategies();

    for (const emotion of emotions) {
      const scenarios = userStrategies[emotion.name];
      if (scenarios) {
        const selfStrategies = scenarios.self;
        for (const strategy of selfStrategies.immediate) {
          strategies.push({ emotion: emotion.name, title: strategy.title });
        }
        for (const strategy of selfStrategies.shortTerm) {
          strategies.push({ emotion: emotion.name, title: strategy.title });
        }
        for (const strategy of selfStrategies.longTerm) {
          strategies.push({ emotion: emotion.name, title: strategy.title });
        }
      }
    }
    this.allStrategiesCache = [...new Set(strategies.map(s => JSON.stringify(s)))].map(s => JSON.parse(s));
    return this.allStrategiesCache;
  }

  async getJournalInsight(journalText: string): Promise<JournalEntryInsight | null> {
    const availableStrategies = this.getAllStrategies();
    
    const systemInstruction = `You are an expert in Cognitive Behavioral Therapy (CBT) and emotional wellness, acting as a gentle, non-judgmental assistant. Your role is to analyze a user's journal entry and provide a brief, supportive reflection.
    1.  **Summarize:** In one single, empathetic sentence, summarize the core feeling or situation of the journal entry.
    2.  **Identify Theme:** Identify the primary cognitive or emotional theme. Examples: "Self-Criticism", "Worrying about the future", "Processing a difficult memory", "Feeling disconnected", "Celebrating a success".
    3.  **Suggest Strategy:** From the provided list of available strategies, select the ONE strategy that is most relevant to the journal entry's theme.
    
    You MUST respond in JSON format. Do not include any markdown formatting.`;

    const contents = `
      Here is the user's journal entry:
      ---
      ${journalText}
      ---
      Here is the list of available strategies in the format { "emotion": "...", "title": "..." }:
      ${JSON.stringify(availableStrategies)}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: 'A one-sentence empathetic summary.' },
              theme: { type: Type.STRING, description: 'The primary cognitive or emotional theme.' },
              suggestedStrategy: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'The title of the most relevant strategy from the list.' },
                  emotion: { type: Type.STRING, description: 'The emotion associated with the chosen strategy from the list.' }
                },
                required: ['title', 'emotion']
              }
            },
            required: ['summary', 'theme', 'suggestedStrategy']
          }
        }
      });
      
      const jsonStr = response.text.trim();
      const parsed = JSON.parse(jsonStr) as JournalEntryInsight;

      // Validate that the suggested strategy actually exists
      if(availableStrategies.some(s => s.title === parsed.suggestedStrategy.title && s.emotion === parsed.suggestedStrategy.emotion)) {
        return parsed;
      } else {
        console.warn("Gemini suggested a strategy that does not exist. Falling back.");
        // Fallback: Pick a generic strategy if the model hallucinates
        parsed.suggestedStrategy = { emotion: 'Sadness', title: 'Controlled Breathing' };
        return parsed;
      }
      
    } catch (error) {
      console.error('Error getting insight from Gemini:', error);
      return null;
    }
  }
}
