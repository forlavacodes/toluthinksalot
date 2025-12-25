
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Thought, Category } from './types';
import ThoughtInput from './components/ThoughtInput';
import ThoughtCard from './components/ThoughtCard';
import AIAssistant from './components/AIAssistant';

const TAGLINES = [
  "A Reservoir of Unfiltered Thoughts",
  "Fleeting Fragments of a Wandering Mind",
  "The Architecture of Quiet Moments",
  "Digital Ink on Ephemeral Paper",
  "Where Chaos Finds its Rhythm"
];

const CATEGORIES: Category[] = ['Deep thoughts', 'About HER', 'Poetic', 'Random Opinion', 'Politics', 'Humour'];

const ReadingView: React.FC<{ 
  thought: Thought; 
  onClose: () => void;
  onResonate: (id: string) => void;
  onShowToast: (msg: string) => void;
}> = ({ thought, onClose, onResonate, onShowToast }) => {
  const dateObj = new Date(thought.timestamp);
  const formattedDate = dateObj.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const [hasResonated, setHasResonated] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    const resonatedIds = JSON.parse(localStorage.getItem('resonated_thoughts') || '[]');
    if (resonatedIds.includes(thought.id)) {
      setHasResonated(true);
    }
  }, [thought.id]);

  const wordCount = thought.content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleResonate = () => {
    if (hasResonated) return;
    const resonatedIds = JSON.parse(localStorage.getItem('resonated_thoughts') || '[]');
    if (!resonatedIds.includes(thought.id)) {
      resonatedIds.push(thought.id);
      localStorage.setItem('resonated_thoughts', JSON.stringify(resonatedIds));
    }
    onResonate(thought.id);
    setHasResonated(true);
  };

  const handleCopy = async () => {
    const shareText = `"${thought.content}"\n\n— via Tolu Says\n${window.location.href}`;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(shareText);
      onShowToast('Fragment details copied');
    } catch (err) {
      onShowToast('Copy failed');
    }
    setTimeout(() => setIsCopying(false), 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto selection:bg-stone-900 selection:text-white animate-reading-entry">
      {/* Decorative Aura - Pushed to background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-white">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-50/50 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-stone-100/80 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative max-w-2xl mx-auto px-8 py-24 md:py-32">
        {/* Floating Close Button - Keep it separate from text flow */}
        <button 
          onClick={onClose}
          className="fixed top-8 left-8 md:top-12 md:left-12 group flex items-center gap-4 text-stone-400 hover:text-stone-900 transition-all z-[120]"
        >
          <div className="w-12 h-12 rounded-full border border-stone-200 bg-white flex items-center justify-center group-hover:border-stone-900 group-hover:bg-stone-900 group-hover:text-white transition-all duration-500 transform group-active:scale-90 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
        </button>

        <header className="mb-16 space-y-8 relative z-10">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="px-5 py-2 bg-stone-900 text-stone-50 text-[10px] font-black uppercase tracking-[0.25em] rounded-full shadow-lg shadow-stone-900/10">
              {thought.category}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">
              <span>{wordCount} words</span>
              <span className="w-1 h-1 rounded-full bg-stone-200" />
              <span>{readingTime} min read</span>
            </div>
          </div>
          
          <div className="space-y-3 pt-6 border-t border-stone-100">
            <h1 className="text-[11px] text-stone-400 font-black uppercase tracking-[0.5em] italic block">Archive Fragment {thought.id.slice(0, 4)}</h1>
            <p className="text-[11px] text-stone-400 font-medium uppercase tracking-[0.3em] block">
              Captured {formattedDate} — {formattedTime}
            </p>
          </div>
        </header>

        <article className="mb-20 relative z-10">
          <p className="thought-font text-3xl md:text-4xl lg:text-5xl text-stone-900 leading-[1.6] md:leading-[1.7] whitespace-pre-wrap break-words overflow-wrap-anywhere font-medium">
            {thought.content}
          </p>
        </article>

        {/* Action bar - Strictly part of the bottom flow, never overlapping */}
        <div className="mt-32 pt-12 border-t-2 border-stone-50 flex flex-wrap items-center gap-4 relative z-10">
           <button 
            onClick={handleCopy}
            className={`flex items-center gap-3 px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border-2 ${isCopying ? 'bg-stone-50 border-stone-100 text-stone-400' : 'bg-white border-stone-100 text-stone-900 hover:border-stone-900 hover:bg-stone-50 shadow-md hover:shadow-lg'}`}
           >
              {isCopying ? 'Copied' : 'Copy Fragment'}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
           </button>
           
           <button 
            onClick={handleResonate}
            disabled={hasResonated}
            className={`flex items-center gap-3 px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border-2 ${hasResonated ? 'bg-stone-50 border-stone-100 text-stone-300 cursor-default' : 'bg-white border-stone-100 text-stone-900 hover:border-stone-900 hover:bg-stone-50 shadow-md hover:shadow-lg'}`}
           >
              {hasResonated ? 'Resonated' : 'Resonate'}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={hasResonated ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7 7 7-7 7z"/></svg>
           </button>
        </div>

        <div className="mt-20 flex flex-wrap gap-4 relative z-10 opacity-40 hover:opacity-100 transition-opacity">
          {thought.tags.map(tag => (
            <span key={tag} className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] cursor-default">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes readingEntry {
          from { opacity: 0; filter: blur(15px); }
          to { opacity: 1; filter: blur(0); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-reading-entry {
          animation: readingEntry 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-pulse-slow {
          animation: pulseSlow 20s ease-in-out infinite;
        }
        .overflow-wrap-anywhere {
          overflow-wrap: anywhere;
        }
      `}</style>
    </div>
  );
};

const Hero: React.FC<{ 
  activeFilter: Category | 'All';
  onFilterChange: (filter: Category | 'All') => void;
}> = ({ activeFilter, onFilterChange }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [taglineIndex, setTaglineIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const cycleTagline = () => {
    setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
  };

  return (
    <header ref={heroRef} className="relative pt-32 pb-16 px-6 text-center overflow-hidden perspective-1000">
      <div 
        className="absolute top-1/4 left-1/4 w-32 h-32 bg-stone-200/20 rounded-full blur-2xl transition-transform duration-700 pointer-events-none"
        style={{ transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)` }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-100/10 rounded-full blur-3xl transition-transform duration-1000 pointer-events-none"
        style={{ transform: `translate(${mousePos.x * -60}px, ${mousePos.y * -60}px)` }}
      />

      <div className="relative inline-block">
        <div 
          className="flex flex-col md:flex-row items-center justify-center gap-8 transition-transform duration-300 ease-out"
          style={{ 
            transform: `rotateY(${mousePos.x * 10}deg) rotateX(${mousePos.y * -10}deg)` 
          }}
        >
          <h1 className="heading-font text-5xl md:text-7xl font-black text-stone-900 leading-none tracking-tighter select-none">
            Random Things <br className="md:hidden" /> Tolu Says
          </h1>
        </div>
      </div>

      <div className="mt-12 relative group">
        <p 
          onClick={cycleTagline}
          className="text-[12px] uppercase tracking-[0.5em] text-stone-400 font-black cursor-pointer select-none transition-all duration-300 group-hover:text-stone-900 hover:tracking-[0.6em] inline-block px-4 py-2"
        >
          {TAGLINES[taglineIndex]}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mt-12 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto px-4 fade-in">
        <button 
          onClick={() => onFilterChange('All')}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'All' ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/10' : 'bg-stone-100/50 text-stone-400 hover:bg-stone-200'}`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => onFilterChange(cat)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === cat ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/10' : 'bg-stone-100/50 text-stone-400 hover:bg-stone-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </header>
  );
};

const Footer: React.FC<{ onAuth: () => void; isOwner: boolean }> = ({ onAuth, isOwner }) => (
  <footer className="py-24 px-6 text-center border-t border-stone-100/50 mt-12 mb-12">
    <div className="max-w-2xl mx-auto space-y-12">
      <div className="space-y-4">
        <p className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-black italic">
          You can find me on
        </p>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
          <a 
            href="https://instagram.com/direct_strt" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-1.5"
          >
            <span className="text-[9px] uppercase tracking-widest font-black text-stone-300 group-hover:text-stone-900 transition-colors">Ig</span>
            <span className="heading-font text-xl font-bold text-stone-900 transition-transform group-hover:scale-105">@direct_strt</span>
          </a>
          <a 
            href="https://x.com/direct_strt" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-1.5"
          >
            <span className="text-[9px] uppercase tracking-widest font-black text-stone-300 group-hover:text-stone-900 transition-colors">x</span>
            <span className="heading-font text-xl font-bold text-stone-900 transition-transform group-hover:scale-105">@direct_strt</span>
          </a>
          <a 
            href="https://tiktok.com/@direct_strt" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-1.5"
          >
            <span className="text-[9px] uppercase tracking-widest font-black text-stone-300 group-hover:text-stone-900 transition-colors">tiktok</span>
            <span className="heading-font text-xl font-bold text-stone-900 transition-transform group-hover:scale-105">@direct_strt</span>
          </a>
        </div>
      </div>
      <div className="pt-8">
        <p className="text-[9px] uppercase tracking-[0.2em] text-stone-300 font-medium select-none inline-flex items-center gap-0.5">
          &copy; {new Date().getFullYear()} Tolu Says — Capturing the fleeting
          <button 
            onClick={onAuth}
            className={`w-3 h-3 flex items-center justify-center rounded-full transition-all duration-700 group/admin ${isOwner ? 'opacity-100' : 'opacity-20 hover:opacity-100'}`}
            aria-label="Admin Access"
          >
            <div className={`w-1 h-1 rounded-full ${isOwner ? 'bg-stone-900' : 'bg-stone-200 group-hover/admin:bg-stone-400'}`} />
          </button>
        </p>
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [activeFilter, setActiveFilter] = useState<Category | 'All'>('All');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginKey, setLoginKey] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  
  // Undo & Toast state
  const [lastDeletedThought, setLastDeletedThought] = useState<Thought | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const savedThoughts = localStorage.getItem('tolu_thoughts');
    const savedAuth = localStorage.getItem('tolu_auth');
    
    if (savedThoughts) {
      try {
        setThoughts(JSON.parse(savedThoughts));
      } catch (e) {
        console.error("Failed to load thoughts");
      }
    }
    
    if (savedAuth === 'true') {
      setIsOwner(true);
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('tolu_thoughts', JSON.stringify(thoughts));
    }
  }, [thoughts, isLoaded]);

  // Lock scroll when reading view is open
  useEffect(() => {
    if (selectedThought) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [selectedThought]);

  const handleAuthAction = () => {
    if (isOwner) {
      setIsOwner(false);
      localStorage.removeItem('tolu_auth');
    } else {
      setShowLoginModal(true);
    }
  };

  const triggerToast = (message: string, duration: number = 5000) => {
    setToastMessage(message);
    setShowToast(true);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setShowToast(false);
      setToastMessage(null);
      setLastDeletedThought(null);
    }, duration);
  };

  const submitLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    const secret = loginKey.trim();
    const validKey = process.env.ADMIN_KEY || 'admin';
    
    if (secret === validKey) {
      setIsOwner(true);
      localStorage.setItem('tolu_auth', 'true');
      setShowLoginModal(false);
      setLoginKey('');
      setLoginError(false);
      triggerToast('Identity Verified');
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const addThought = (content: string, category: Category) => {
    if (!isOwner) return;
    const hashtags = content.match(/#\w+/g)?.map(t => t.slice(1).toLowerCase()) || [];
    
    const newThought: Thought = {
      id: crypto.randomUUID(),
      content,
      category,
      timestamp: Date.now(),
      tags: [...new Set(hashtags)],
      resonates: 0
    };
    setThoughts([newThought, ...thoughts]);
  };

  const deleteThought = (id: string) => {
    if (!isOwner) return;
    const thoughtToDelete = thoughts.find(t => t.id === id);
    if (thoughtToDelete) {
      setLastDeletedThought(thoughtToDelete);
      setThoughts(prev => prev.filter(t => t.id !== id));
      triggerToast('Fragment archived');
    }
  };

  const handleUndo = () => {
    if (lastDeletedThought) {
      setThoughts(prev => [lastDeletedThought, ...prev].sort((a, b) => b.timestamp - a.timestamp));
      setShowToast(false);
      setLastDeletedThought(null);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    }
  };

  const resonateThought = (id: string) => {
    setThoughts(prev => prev.map(t => 
      t.id === id ? { ...t, resonates: (t.resonates || 0) + 1 } : t
    ));
  };

  const filteredThoughts = useMemo(() => {
    if (activeFilter === 'All') return thoughts;
    return thoughts.filter(t => t.category === activeFilter);
  }, [thoughts, activeFilter]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-stone-200 relative">
      {/* Universal Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] fade-in">
          <div className="bg-stone-900 text-stone-50 px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
              {toastMessage}
            </span>
            {lastDeletedThought && (
              <>
                <div className="w-px h-4 bg-stone-700"></div>
                <button 
                  onClick={handleUndo}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200 hover:text-amber-100 transition-colors"
                >
                  Undo
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reading View Full-screen Overlay */}
      {selectedThought && (
        <ReadingView 
          thought={selectedThought} 
          onClose={() => setSelectedThought(null)} 
          onResonate={resonateThought}
          onShowToast={triggerToast}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-md fade-in">
          <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl w-full max-sm border border-stone-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-stone-900" />
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-10 right-10 text-stone-300 hover:text-stone-900 transition-colors"
              aria-label="Close login"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            
            <div className="mb-10">
              <h2 className="heading-font text-3xl font-bold text-stone-900 mb-2 leading-tight">Identity Verification</h2>
              <p className="text-[10px] text-stone-400 uppercase tracking-[0.25em] font-bold">Unlocking Tolu's Private Archive</p>
            </div>
            
            <form onSubmit={submitLogin} className="space-y-6">
              <input 
                type="password"
                value={loginKey}
                onChange={(e) => setLoginKey(e.target.value)}
                placeholder="Secret Key"
                autoFocus
                className={`w-full px-7 py-5 bg-stone-50 border ${loginError ? 'border-red-200 animate-shake bg-red-50/30' : 'border-stone-100'} rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none transition-all thought-font text-2xl placeholder-stone-200`}
              />
              {loginError && (
                <p className="text-red-400 text-[10px] uppercase tracking-widest font-bold text-center animate-pulse">
                  Invalid Fragment Key
                </p>
              )}
              <button 
                type="submit"
                className="w-full bg-stone-900 text-stone-50 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-stone-800 transition-all active:scale-[0.98] shadow-xl shadow-stone-900/10"
              >
                Access Brain Dump
              </button>
            </form>
          </div>
        </div>
      )}

      <Hero 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter} 
      />

      <main className="flex-grow max-w-2xl w-full mx-auto pb-12">
        {isOwner ? (
          <div className="fade-in px-6">
            <ThoughtInput onAdd={addThought} />
          </div>
        ) : (
          <div className="h-[2px] bg-stone-200/30 w-20 mx-auto mb-20 rounded-full"></div>
        )}

        <div className="px-6 space-y-16">
          {filteredThoughts.length === 0 ? (
            <div className="pt-12 pb-48 text-center fade-in">
              <div className="mb-10 flex justify-center opacity-[0.03] scale-150">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 19L12 5M12 5L7 10M12 5L17 10" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="thought-font text-5xl text-stone-300 italic font-light leading-relaxed max-w-lg mx-auto">
                {activeFilter === 'All' 
                  ? '"The quiet between heartbeats, where words learn to breathe."' 
                  : `"Silence drifts through the halls of ${activeFilter.toLowerCase()}."`}
              </p>
              <p className="text-[11px] text-stone-400 mt-12 uppercase tracking-[0.4em] font-black italic">Awaiting a new spark</p>
            </div>
          ) : (
            <>
              <div className="space-y-16">
                {filteredThoughts.map(thought => (
                  <ThoughtCard 
                    key={thought.id} 
                    thought={thought} 
                    onDelete={deleteThought}
                    onResonate={resonateThought}
                    onShowToast={triggerToast}
                    onOpenFullView={setSelectedThought}
                    isOwner={isOwner}
                  />
                ))}
              </div>
              <AIAssistant thoughts={thoughts} />
            </>
          )}
        </div>
      </main>

      <Footer onAuth={handleAuthAction} isOwner={isOwner} />

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.25s cubic-bezier(.36,.07,.19,.97) both;
        }
        .fade-in {
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
