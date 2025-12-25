
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

export interface AIReflection {
  summary: string;
  themes: string[];
  sentiment: string;
  zenQuote: string;
}
