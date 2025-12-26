import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

// --- Types ---
type Category = 'Deep thoughts' | 'About HER' | 'Poetic' | 'Random Opinion' | 'Politics' | 'Humour';

interface Thought {
  id: string;
  content: string;
  timestamp: number;
  category: Category;
  resonates: number;
}

const CATEGORIES: Category[] = ['Deep thoughts', 'About HER', 'Poetic', 'Random Opinion', 'Politics', 'Humour'];

// --- Sub-Components ---

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#fcfaf7] paper-texture flex flex-col items-center justify-center transition-opacity duration-700">
      <div className="max-w-xs w-full px-12 space-y-8 text-center">
        <h1 className="heading-font text-3xl font-black text-stone-900 tracking-tighter pulse-soft">
          RTTS
        </h1>
        <div className="w-full h-[1px] bg-stone-100 overflow-hidden relative">
          <div className="writing-line absolute inset-0"></div>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300">
          Compiling fragments
        </p>
      </div>
    </div>
  );
};

const ThoughtInput: React.FC<{ onAdd: (content: string, category: Category) => void }> = ({ onAdd }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('Random Opinion');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAdd(content, category);
    setContent('');
  };

  return (
    <div className="mb-20 animate-fade-in px-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's crossing your mind?"
            className="w-full h-48 p-8 bg-white border border-stone-200 rounded-[2.5rem] shadow-sm focus:shadow-xl focus:border-stone-900 transition-all thought-font text-2xl resize-none placeholder-stone-200"
          />
          <div className="absolute bottom-6 right-8 flex items-center gap-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="bg-stone-50 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-stone-100 outline-none focus:border-stone-900 cursor-pointer appearance-none hover:bg-stone-100 transition-colors"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <button
              type="submit"
              disabled={!content.trim()}
              className="bg-stone-900 text-white w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100 shadow-lg shadow-stone-900/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </form>
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
  const date = new Date(thought.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Using the user's specific domain for sharing links
    const shareUrl = `https://toluthinksalot.vercel.app/status/${thought.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative py-12 border-b border-stone-100 last:border-0 hover:bg-stone-50/50 transition-colors px-6 -mx-6 rounded-[2rem]">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 group-hover:text-stone-900 transition-colors">
              {thought.category}
            </span>
            <span className="w-1 h-1 rounded-full bg-stone-200" />
            <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{date}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              className={`p-2 transition-all rounded-full flex items-center gap-2 group/share ${copied ? 'bg-stone-900 text-white' : 'text-stone-300 hover:text-stone-900 hover:bg-stone-100'}`}
              title="Copy link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              {copied && <span className="text-[8px] font-bold uppercase tracking-widest pr-1 animate-fade-in">Copied</span>}
            </button>
            {isOwner && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(thought.id); }}
                className="opacity-0 group-hover:opacity-100 p-2 text-stone-300 hover:text-red-500 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            )}
          </div>
        </div>

        <p 
          onClick={() => onOpen(thought)}
          className="thought-font text-2xl md:text-3xl text-stone-800 leading-relaxed cursor-pointer hover:text-stone-900 transition-colors line-clamp-4"
        >
          {thought.content}
        </p>

        <div className="flex items-center gap-6">
          <button 
            onClick={(e) => { e.stopPropagation(); onResonate(thought.id); }}
            disabled={hasResonated}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${hasResonated ? 'text-stone-900 cursor-default' : 'text-stone-400 hover:text-stone-900'}`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill={hasResonated ? "currentColor" : "none"} 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="transition-transform duration-300"
            >
              <path d="m12 19-7-7 7-7 7 7-7 7z"/>
            </svg>
            {thought.resonates || 0} {hasResonated ? 'Resonated' : 'Resonate'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [reactedIds, setReactedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<Category | 'All'>('All');
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginKey, setLoginKey] = useState('');
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Deep Link Handling
  const parseUrlForPost = (currentThoughts: Thought[]) => {
    const path = window.location.pathname;
    const match = path.match(/\/status\/([a-z0-9]+)/);
    if (match && match[1]) {
      const postId = match[1];
      const thought = currentThoughts.find(t => t.id === postId);
      if (thought) {
        setSelectedThought(thought);
      }
    } else if (path === '/') {
      setSelectedThought(null);
    }
  };

  useEffect(() => {
    // Initial data load
    const saved = localStorage.getItem('tolu_thoughts');
    let loadedThoughts: Thought[] = [];
    if (saved) {
      try {
        loadedThoughts = JSON.parse(saved);
        setThoughts(loadedThoughts);
      } catch (e) {
        console.error("Failed to load thoughts", e);
      }
    }

    const savedReactions = localStorage.getItem('tolu_reacted_ids');
    if (savedReactions) {
      try {
        setReactedIds(JSON.parse(savedReactions));
      } catch (e) {
        console.error("Failed to load reactions", e);
      }
    }

    if (localStorage.getItem('tolu_auth') === 'true') setIsOwner(true);

    // Initial routing
    parseUrlForPost(loadedThoughts);

    // History handling
    const handlePopState = () => {
      parseUrlForPost(loadedThoughts);
    };
    window.addEventListener('popstate', handlePopState);

    // Simulate loading screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2200);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('tolu_thoughts', JSON.stringify(thoughts));
  }, [thoughts]);

  useEffect(() => {
    localStorage.setItem('tolu_reacted_ids', JSON.stringify(reactedIds));
  }, [reactedIds]);

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

  const deleteThought = (id: string) => {
    setThoughts(prev => prev.filter(t => t.id !== id));
    setReactedIds(prev => prev.filter(rid => rid !== id));
  };

  const resonate = (id: string) => {
    const alreadyResonated = reactedIds.includes(id);
    if (alreadyResonated) return;
    setReactedIds(prev => [...prev, id]);
    setThoughts(prev => prev.map(t => t.id === id ? { ...t, resonates: (t.resonates || 0) + 1 } : t));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginKey === 'admin') {
      setIsOwner(true);
      localStorage.setItem('tolu_auth', 'true');
      setShowLogin(false);
      setLoginKey('');
    }
  };

  const openThought = (thought: Thought) => {
    setSelectedThought(thought);
    window.history.pushState({ postId: thought.id }, '', `/status/${thought.id}`);
  };

  const closeThought = () => {
    setSelectedThought(null);
    window.history.pushState({}, '', '/');
  };

  const filteredThoughts = useMemo(() => 
    activeFilter === 'All' ? thoughts : thoughts.filter(t => t.category === activeFilter)
  , [thoughts, activeFilter]);

  return (
    <>
      {isLoading && <LoadingScreen />}
      
      <div className={`min-h-screen flex flex-col ${isLoading ? 'opacity-0' : 'animate-fade-in'}`}>
        {/* Verification Modal */}
        {showLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-6 animate-fade-in">
            <form onSubmit={handleLogin} className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-sm space-y-8">
              <div className="space-y-2">
                <h2 className="heading-font text-3xl font-bold tracking-tighter">Identity check</h2>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-400">Restricted archive access</p>
              </div>
              <input 
                type="password" 
                value={loginKey}
                onChange={(e) => setLoginKey(e.target.value)}
                placeholder="Archive Key"
                className="w-full px-8 py-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-2 focus:ring-stone-900 thought-font text-xl"
                autoFocus
              />
              <div className="flex flex-col gap-4">
                <button className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-stone-900/20 hover:bg-stone-800 active:scale-[0.98] transition-all">Verify Key</button>
                <button type="button" onClick={() => setShowLogin(false)} className="w-full text-stone-400 text-[10px] font-black uppercase tracking-widest hover:text-stone-900 transition-colors">Nevermind</button>
              </div>
            </form>
          </div>
        )}

        {/* Immersive Reading View */}
        {selectedThought && (
          <div className="fixed inset-0 z-[60] bg-[#fcfaf7] overflow-y-auto px-6 py-24 md:py-48 animate-fade-in paper-texture">
            <button 
              onClick={closeThought}
              className="fixed top-8 left-8 md:top-12 md:left-12 w-14 h-14 bg-white border border-stone-200 rounded-full flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all shadow-xl active:scale-90 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="max-w-2xl mx-auto space-y-16">
              <div className="flex flex-wrap items-center gap-6 pb-12 border-b border-stone-100">
                <span className="px-6 py-2 bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{selectedThought.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                    {new Date(selectedThought.timestamp).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="w-1 h-1 bg-stone-200 rounded-full" />
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{selectedThought.resonates} resonates</span>
                </div>
              </div>
              <p className="thought-font text-4xl md:text-5xl lg:text-6xl text-stone-900 leading-[1.3] md:leading-[1.2] whitespace-pre-wrap">
                {selectedThought.content}
              </p>
            </div>
          </div>
        )}

        <header className="pt-32 pb-20 text-center max-w-4xl mx-auto w-full px-6">
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
          {isOwner && <ThoughtInput onAdd={addThought} />}
          
          <div className="space-y-4 px-6">
            {filteredThoughts.length === 0 ? (
              <div className="py-48 text-center animate-fade-in">
                <p className="thought-font text-4xl text-stone-200 italic font-light">"Silence is just a thought awaiting its turn."</p>
              </div>
            ) : (
              filteredThoughts.map(t => (
                <ThoughtCard 
                  key={t.id} 
                  thought={t} 
                  onDelete={deleteThought} 
                  onResonate={resonate} 
                  onOpen={openThought}
                  isOwner={isOwner} 
                  hasResonated={reactedIds.includes(t.id)}
                />
              ))
            )}
          </div>
        </main>

        <footer className="py-32 text-center border-t border-stone-100 mt-auto bg-stone-50/30">
          <div className="max-w-2xl mx-auto px-6 space-y-10">
            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-stone-300">Curated Fragments</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                <a href="https://instagram.com/direct_strt" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-900 transition-colors text-[10px] font-black uppercase tracking-[0.2em]">Instagram</a>
                <a href="https://twitter.com/direct_strt" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-900 transition-colors text-[10px] font-black uppercase tracking-[0.2em]">Twitter</a>
                <a href="https://tiktok.com/@direct_strt" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-900 transition-colors text-[10px] font-black uppercase tracking-[0.2em]">TikTok</a>
              </div>
            </div>
            <div className="pt-12 flex items-center justify-center gap-3">
              <span className="text-[9px] text-stone-300 font-bold uppercase tracking-[0.3em]">
                &copy; {new Date().getFullYear()} Tolu Says
              </span>
              <button 
                onClick={() => isOwner ? (setIsOwner(false), localStorage.removeItem('tolu_auth')) : setShowLogin(true)}
                className={`w-2 h-2 rounded-full transition-all duration-700 ${isOwner ? 'bg-stone-900 scale-125' : 'bg-stone-200 hover:bg-stone-400'}`}
                aria-label="Admin Access"
              />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

// --- Root Rendering ---

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
