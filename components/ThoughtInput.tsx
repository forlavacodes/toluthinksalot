
import React, { useState, useRef, useEffect } from 'react';
import { Category } from '../types';

interface ThoughtInputProps {
  onAdd: (content: string, category: Category) => void;
}

const CATEGORIES: Category[] = ['Deep thoughts', 'About HER', 'Poetic', 'Random Opinion', 'Politics', 'Humour'];

const ThoughtInput: React.FC<ThoughtInputProps> = ({ onAdd }) => {
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Random Opinion');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAdd(content.trim(), selectedCategory);
      setContent('');
    }
  };

  return (
    <div className="input-blur-overlay sticky top-0 z-20 py-10 border-b border-stone-200/40 mb-12">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-6">
        <div className="relative group">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Capture a wandering fragment..."
            className="w-full thought-font text-2xl md:text-3xl bg-transparent border-none focus:ring-0 placeholder-stone-200 resize-none overflow-hidden min-h-[60px] transition-all duration-300 text-stone-900 italic font-medium"
            autoFocus
          />
          
          <div className={`transition-all duration-700 overflow-hidden ${content.length > 0 ? 'h-auto opacity-100 mt-6' : 'h-0 opacity-0'}`}>
            <div className="mb-6 flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${selectedCategory === cat ? 'bg-stone-900 border-stone-900 text-white shadow-lg' : 'bg-transparent border-stone-200 text-stone-400 hover:border-stone-900 hover:text-stone-900'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <span className="text-[10px] text-stone-400 uppercase tracking-[0.3em] font-black">
                   {content.length} CHARS
                 </span>
              </div>
              <button
                type="submit"
                disabled={!content.trim()}
                className="bg-stone-900 text-stone-50 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3 rounded-full disabled:bg-stone-100 disabled:text-stone-300 disabled:cursor-not-allowed hover:bg-stone-800 transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-stone-900/10"
              >
                Log Fragment
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ThoughtInput;
