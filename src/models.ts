export interface Emotion {
  name: string;
  description: string;
  color: string; // Tailwind color class e.g., 'bg-blue-500' for journal, trends, etc.
  homeStyle: string; // Tailwind classes for the home screen button.
  icon: string; // SVG path data
  oppositeAction?: {
    suggestion: string;
    rationale: string;
  };
  scenarios: {
    self: StrategyDefCategory;
    friend: StrategyDefCategory;
    caused: StrategyDefCategory;
  };
}

export interface StrategyDefCategory {
  title: string;
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
}

export interface JournalEntry {
  id: string;
  emotion: string;
  notes: string;
  date: string; // ISO string format
}

export interface Step {
  id: string;
  text: string;
}

// Models for user-customizable strategies
export interface Strategy {
  id: string;
  title: string;
  steps: Step[];
  toolId?: 'grounding';
}

export interface StrategyCategory {
  immediate: Strategy[];
  shortTerm: Strategy[];
  longTerm: Strategy[];
}

export interface UserEmotionStrategies {
    [emotionName: string]: {
        self: StrategyCategory;
        friend: StrategyCategory;
        caused: StrategyCategory;
    }
}

export interface ThoughtChallengerRecord {
  situation: string;
  emotion: string;
  initialIntensity: number;
  automaticThought: string;
  evidenceFor: string;
  evidenceAgainst: string;
  alternativeThought: string;
  finalIntensity: number;
}