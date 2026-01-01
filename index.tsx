import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';

// --- Types ---
type Category = 'Deep thoughts' | 'About HER' | 'Poetic' | 'Random Opinion' | 'Politics' | 'Humour';

interface Thought {
  id: string;
  content: string;
  timestamp: number;
  category: Category;
  resonates: number;
  images?: string[];
}

const CATEGORIES: Category[] = ['Deep thoughts' , 'About HER', 'Poetic', 'Random Opinion', 'Politics', 'Humour'];

// --- Helpers ---

const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}m`;
  const years = Math.floor(days / 365);
  return `${years}y`;
};

const renderContent = (text: string) => {
  if (!text) return null;
  const escapeHTML = (str: string) => str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m] || m));

  const escaped = escapeHTML(text);
  const formatted = escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-stone-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-stone-600">$1</em>')
    .replace(/~~(.*?)~~/g, '<del class="line-through opacity-50">$1</del>')
    .split('\n')
    .map(line => {
      const listMatch = line.match(/^-\s+(.*)$/);
      if (listMatch) return `<div class="flex gap-2 my-1"><span class="text-stone-300 select-none">•</span><span>${listMatch[1]}</span></div>`;
      return line;
    })
    .join('\n');

  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
};

// --- Sub-Components ---

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg', className?: string, onClick?: () => void }> = ({ size = 'md', className = '', onClick }) => {
  const dimensions = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-20 h-20 text-4xl'
  };
  return (
    <div 
      onClick={onClick}
      className={`${dimensions[size]} bg-stone-900 text-white rounded-[30%] flex items-center justify-center font-black heading-font select-none shadow-lg shadow-stone-900/10 cursor-pointer ${className}`}
    >
      T
    </div>
  );
};

const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isFinishing, setIsFinishing] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFinishing(true);
      setTimeout(onComplete, 800);
    }, 2400);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return (
    <div className={`fixed inset-0 z-[100] bg-[#fcfaf7] paper-texture flex flex-col items-center justify-center transition-all duration-1000 ${isFinishing ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'}`}>
        <div className="max-w-xs w-full px-12 space-y-8 text-center flex flex-col items-center animate-fade-in">
          <div className="pulse-soft">
            <Logo size="lg" />
          </div>
          <h1 className="heading-font text-2xl font-black text-stone-900 tracking-tighter">Tolu Says</h1>
          <div className="w-full h-[1px] bg-stone-100 overflow-hidden relative">
            <div className="writing-line absolute inset-0"></div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300">Compiling fragments</p>
        </div>
    </div>
  );
};

const ThoughtCard: React.FC<{ 
  thought: Thought; 
  onDelete: (id: string) => void;
  onResonate: (id: string) => void;
  onOpen: (thought: Thought) => void;
  isOwner: boolean;
  hasResonated: boolean;
}> = ({ thought, onDelete, onResonate, onOpen, isOwner, hasResonated }) => {
  return (
    <div className="group relative py-12 border-b border-stone-100 last:border-0 hover:bg-stone-100/40 px-6 -mx-6 rounded-[2.5rem] transition-all">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 group-hover:text-stone-900 transition-colors">
            {thought.category}
          </span>
          {isOwner && (
            <button onClick={() => onDelete(thought.id)} className="opacity-0 group-hover:opacity-100 p-2 text-stone-300 hover:text-red-500 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          )}
        </div>
        <div 
          onClick={() => onOpen(thought)}
          className="thought-font text-xl md:text-2xl cursor-pointer hover:text-stone-900 transition-colors line-clamp-4 whitespace-pre-wrap"
        >
          {renderContent(thought.content)}
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onResonate(thought.id)}
            disabled={hasResonated}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${hasResonated ? 'text-stone-900' : 'text-stone-400 hover:text-stone-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={hasResonated ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            {thought.resonates || 0} {hasResonated ? 'Resonated' : 'Resonate'}
          </button>
          <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{formatRelativeTime(thought.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [reactedIds, setReactedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [activeFilter, setActiveFilter] = useState<Category | 'All'>('All');

  useEffect(() => {
    const saved = localStorage.getItem('tolu_thoughts');
    if (saved) setThoughts(JSON.parse(saved));
    const savedReactions = localStorage.getItem('tolu_reacted_ids');
    if (savedReactions) setReactedIds(JSON.parse(savedReactions));
    if (localStorage.getItem('tolu_auth') === 'true') setIsOwner(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('tolu_thoughts', JSON.stringify(thoughts));
  }, [thoughts]);

  const addThought = (content: string, category: Category) => {
    const newThought: Thought = {
      id: Math.random().toString(36).substring(2, 9),
      content,
      category,
      timestamp: Date.now(),
      resonates: 0
    };
    setThoughts([newThought, ...thoughts]);
  };

  const resonate = (id: string) => {
    if (reactedIds.includes(id)) return;
    setReactedIds(prev => [...prev, id]);
    setThoughts(prev => prev.map(t => t.id === id ? { ...t, resonates: (t.resonates || 0) + 1 } : t));
  };

  const deleteThought = (id: string) => {
    setThoughts(prev => prev.filter(t => t.id !== id));
  };

  const filteredThoughts = useMemo(() => 
    activeFilter === 'All' ? thoughts : thoughts.filter(t => t.category === activeFilter)
  , [thoughts, activeFilter]);

  return (
    <>
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      <div className={`min-h-screen flex flex-col ${isLoading ? 'opacity-0' : 'animate-fade-in'}`}>
        <header className="pt-32 pb-20 text-center max-w-4xl mx-auto w-full px-6 flex flex-col items-center">
          <Logo size="lg" className="mb-12" onClick={() => { setActiveFilter('All'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          
          <h1 className="heading-font text-6xl md:text-8xl font-black text-stone-900 mb-12 tracking-tighter leading-[0.9]">
            Random Things<br/>Tolu Says
          </h1>
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => setActiveFilter('All')}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'All' ? 'bg-stone-900 text-white shadow-xl scale-105' : 'bg-white border border-stone-100 text-stone-400 hover:border-stone-300'}`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === cat ? 'bg-stone-900 text-white shadow-xl scale-105' : 'bg-white border border-stone-100 text-stone-400 hover:border-stone-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-grow max-w-2xl mx-auto w-full pb-32">
          {isOwner && (
            <div className="mb-20 px-4">
              <textarea 
                className="w-full min-h-[12rem] p-8 thought-font text-xl bg-white border border-stone-200 rounded-[2rem] shadow-sm outline-none focus:border-stone-900 transition-all resize-none"
                placeholder="What's crossing your mind?"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    const target = e.target as HTMLTextAreaElement;
                    if (target.value.trim()) {
                      addThought(target.value, 'Random Opinion');
                      target.value = '';
                    }
                  }
                }}
              />
              <p className="mt-2 text-[10px] font-bold text-stone-300 uppercase tracking-widest text-right">Ctrl + Enter to Post</p>
            </div>
          )}
          <div className="space-y-6 px-6">
            {filteredThoughts.length === 0 ? (
              <div className="py-48 text-center">
                <p className="thought-font text-4xl text-stone-200 italic">"Silence is just a thought awaiting its turn."</p>
              </div>
            ) : (
              filteredThoughts.map((t) => (
                <ThoughtCard 
                  key={t.id} 
                  thought={t} 
                  onDelete={deleteThought} 
                  onResonate={resonate} 
                  onOpen={setSelectedThought}
                  isOwner={isOwner} 
                  hasResonated={reactedIds.includes(t.id)}
                />
              ))
            )}
          </div>
        </main>

        <footer className="py-32 text-center border-t border-stone-100 bg-stone-50/30">
          <div className="max-w-2xl mx-auto px-6 space-y-4">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-stone-300">Curated Fragments</p>
            <p className="text-[9px] text-stone-300 font-bold uppercase tracking-[0.3em]">&copy; {new Date().getFullYear()} Tolu Says</p>
          </div>
        </footer>
      </div>

      {selectedThought && (
        <div className="fixed inset-0 z-[60] bg-[#fcfaf7] overflow-y-auto px-6 py-24 md:py-48 animate-fade-in paper-texture">
          <button onClick={() => setSelectedThought(null)} className="fixed top-8 left-8 w-14 h-14 bg-white border border-stone-200 rounded-full flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="max-w-2xl mx-auto space-y-12">
            <div className="thought-font text-3xl md:text-5xl whitespace-pre-wrap leading-tight drop-cap">
              {renderContent(selectedThought.content)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<React.StrictMode><App /></React.StrictMode>);
}