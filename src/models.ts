
export interface Emotion {
  name: string;
  description: string;
  color: string; // Tailwind color class e.g., 'bg-blue-500'
  icon: string; // SVG path data
  scenarios: {
    self: StrategyCategory;
    friend: StrategyCategory;
    caused: StrategyCategory;
  };
}

export interface StrategyCategory {
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
