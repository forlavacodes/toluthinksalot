
export type Category = 'Deep thoughts' | 'About HER' | 'Poetic' | 'Random Opinion' | 'Politics' | 'Humour';

export interface Thought {
  id: string;
  content: string;
  timestamp: number;
  category: Category;
  mood?: string;
  tags: string[];
  resonates: number;
}

// Added AIReflection interface to support AI analysis output structure
export interface AIReflection {
  summary: string;
  themes: string[];
  sentiment: string;
  zenQuote: string;
}
