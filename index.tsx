
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
  image?: string; // Base64 string
}

const CATEGORIES: Category[] = ['Deep thoughts', 'About HER', 'Poetic', 'Random Opinion', 'Politics', 'Humour'];

// --- Audio Helpers ---
const playSubtleChime = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  
  // A soft E Major Triad for a calm, hopeful entry
  const frequencies = [329.63, 392.00, 493.88]; // E4, G4, B4 (Subtle major feel)
  
  const masterGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);
  filter.Q.setValueAtTime(0.7, now);

  masterGain.gain.setValueAtTime(0, now);
  // Swelling attack - increased from 0.08 to 0.25 for more presence
  masterGain.gain.linearRampToValueAtTime(0.25, now + 0.8);
  // Extremely long decay for a lingering soft tail
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + 4.0);

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = 'sine'; // Purest, softest waveform
    osc.frequency.setValueAtTime(freq, now);
    
    // Slight detune for a "lush" ethereal feel
    osc.detune.setValueAtTime(i * 2, now);
    
    oscGain.gain.setValueAtTime(0.15, now);
    
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + 4.5);
  });

  masterGain.connect(filter);
  filter.connect(ctx.destination);
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
      className={`${dimensions[size]} bg-stone-900 text-white rounded-[30%] flex items-center justify-center font-black heading-font select-none shadow-lg shadow-stone-900/10 ${className} ${onClick ? 'cursor-default active:scale-90 transition-transform duration-75' : ''}`}
    >
      T
    </div>
  );
};

const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-40 w-14 h-14 bg-stone-900 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      } hover:scale-110 active:scale-90 group`}
      aria-label="Scroll to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="group-hover:-translate-y-1 transition-transform"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
};

const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const startEntry = () => {
    setHasStarted(true);
    
    // Play subtle procedural chime
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    playSubtleChime(audioCtx);

    // Auto complete after animation
    setTimeout(() => {
      setIsFinishing(true);
      setTimeout(onComplete, 800);
    }, 2800);
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-[#fcfaf7] paper-texture flex flex-col items-center justify-center transition-all duration-1000 ${isFinishing ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'}`}>
      {!hasStarted ? (
        <button 
          onClick={startEntry}
          className="group flex flex-col items-center gap-10 animate-fade-in"
        >
          <div className="relative">
             <Logo size="lg" className="hover:scale-110 active:scale-95 transition-transform cursor-pointer" />
             <div className="absolute inset-0 bg-stone-900 rounded-[30%] animate-ping opacity-10 pointer-events-none"></div>
          </div>
          <div className="text-center space-y-4">
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300 group-hover:text-stone-900 transition-colors">Enter Archive</p>
             <p className="text-[9px] font-bold italic text-stone-200">Silence is just a thought awaiting its turn</p>
          </div>
        </button>
      ) : (
        <div className="max-w-xs w-full px-12 space-y-8 text-center flex flex-col items-center animate-fade-in">
          <div className="pulse-soft">
            <Logo size="lg" />
          </div>
          <h1 className="heading-font text-2xl font-black text-stone-900 tracking-tighter">
            Tolu Says
          </h1>
          <div className="w-full h-[1px] bg-stone-100 overflow-hidden relative">
            <div className="writing-line absolute inset-0"></div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300">
            Compiling fragments
          </p>
        </div>
      )}
    </div>
  );
};

const ThoughtInput: React.FC<{ onAdd: (content: string, category: Category, image?: string) => void }> = ({ onAdd }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('Random Opinion');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAdd(content, category, image || undefined);
    setContent('');
    setImage(null);
  };

  return (
    <div className="mb-20 animate-fade-in px-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white border border-stone-200 rounded-[2rem] shadow-sm focus-within:shadow-xl focus-within:border-stone-900 transition-all overflow-hidden">
          {image && (
            <div className="relative p-6 pb-0 group/img">
              <div className="relative overflow-hidden rounded-2xl bg-stone-50 border border-stone-100 shadow-inner">
                <img 
                  src={image} 
                  alt="Attachment preview" 
                  className="w-full max-h-64 object-cover" 
                />
                <button 
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-4 right-4 bg-stone-900/80 text-white p-2 rounded-full hover:bg-stone-900 transition-colors shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's crossing your mind?"
            className="w-full h-48 p-8 thought-font text-2xl resize-none placeholder-stone-200 bg-transparent border-0 ring-0 focus:ring-0"
          />
        </div>
        
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${image ? 'bg-stone-900 text-white shadow-lg' : 'bg-white border border-stone-100 text-stone-300 hover:text-stone-900 hover:border-stone-300'}`}
              title="Add Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </button>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="bg-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full border border-stone-100 outline-none focus:border-stone-900 cursor-pointer appearance-none hover:bg-stone-50 transition-colors shadow-sm"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <button
            type="submit"
            disabled={!content.trim()}
            className="bg-stone-900 text-white px-8 h-11 rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100 shadow-lg shadow-stone-900/20 font-black uppercase tracking-widest text-[10px]"
          >
            Post Thought
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </button>
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
  onImageShare: (thought: Thought) => void;
  isOwner: boolean;
  hasResonated: boolean;
}> = ({ thought, onDelete, onResonate, onOpen, onImageShare, isOwner, hasResonated }) => {
  const date = new Date(thought.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div className="group relative py-12 border-b border-stone-100 last:border-0 hover:bg-stone-50/30 px-6 -mx-6 rounded-[2.5rem] transition-all">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 group-hover:text-stone-900 transition-colors">
              {thought.category}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onImageShare(thought); }}
              className="px-5 py-2.5 bg-white border border-stone-100 text-stone-300 hover:text-stone-900 hover:border-stone-900 rounded-full transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md"
              title="Share as Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
              Archive
            </button>
            {isOwner && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(thought.id); }}
                className="opacity-0 group-hover:opacity-100 p-2 text-stone-300 hover:text-red-500 transition-all ml-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            )}
          </div>
        </div>

        {thought.image && (
          <div 
            onClick={() => onOpen(thought)} 
            className="cursor-pointer overflow-hidden rounded-[2rem] bg-stone-100/30 p-4 border border-stone-100 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500 transform hover:-translate-y-1"
          >
            <img src={thought.image} alt="Thought attachment" className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-sm" />
          </div>
        )}

        <p 
          onClick={() => onOpen(thought)}
          className="thought-font text-2xl md:text-3xl text-stone-800 leading-relaxed cursor-pointer hover:text-stone-900 transition-colors line-clamp-4 px-2"
        >
          {thought.content}
        </p>

        <div className="flex items-center gap-6 px-2">
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
          <span className="w-1 h-1 rounded-full bg-stone-200" />
          <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{date}</span>
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
  const [capturing, setCapturing] = useState<Thought | null>(null);
  
  const captureRef = useRef<HTMLDivElement>(null);
  const secretClickCount = useRef(0);
  const secretClickTimeout = useRef<number | null>(null);

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
    parseUrlForPost(loadedThoughts);

    const handlePopState = () => parseUrlForPost(loadedThoughts);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('tolu_thoughts', JSON.stringify(thoughts));
  }, [thoughts]);

  useEffect(() => {
    localStorage.setItem('tolu_reacted_ids', JSON.stringify(reactedIds));
  }, [reactedIds]);

  const addThought = (content: string, category: Category, image?: string) => {
    const newThought: Thought = {
      id: Math.random().toString(36).substring(2, 9),
      content,
      category,
      timestamp: Date.now(),
      resonates: 0,
      image
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

  const handleSecretTrigger = () => {
    secretClickCount.current++;
    console.debug(`Identity verification step ${secretClickCount.current}/5`);
    
    if (secretClickTimeout.current) window.clearTimeout(secretClickTimeout.current);
    
    if (secretClickCount.current >= 5) {
      if (isOwner) {
        setIsOwner(false);
        localStorage.removeItem('tolu_auth');
        alert("Session Ended");
      } else {
        setShowLogin(true);
      }
      secretClickCount.current = 0;
    } else {
      secretClickTimeout.current = window.setTimeout(() => {
        secretClickCount.current = 0;
      }, 1000);
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

  const resetAll = () => {
    setActiveFilter('All');
    closeThought();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageShare = async (thought: Thought) => {
    setCapturing(thought);
    setTimeout(async () => {
      if (!captureRef.current) return;
      try {
        const canvas = await html2canvas(captureRef.current, {
          backgroundColor: '#fcfaf7',
          scale: 3,
          useCORS: true,
          logging: false,
        });
        
        const dataUrl = canvas.toDataURL('image/png');
        
        if (navigator.share && navigator.canShare) {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `tolu-says-${thought.id}.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Random Things Tolu Says',
              text: `"${thought.content.substring(0, 50)}..."`
            });
            setCapturing(null);
            return;
          }
        }

        const link = document.createElement('a');
        link.download = `tolu-says-${thought.id}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Image generation failed', err);
      }
      setCapturing(null);
    }, 100);
  };

  const filteredThoughts = useMemo(() => 
    activeFilter === 'All' ? thoughts : thoughts.filter(t => t.category === activeFilter)
  , [thoughts, activeFilter]);

  const getDynamicFontSize = (content: string, hasImage?: boolean) => {
    const len = content.length;
    if (hasImage) {
      if (len < 50) return 'text-[92px] leading-[1.05]';
      if (len < 120) return 'text-[72px] leading-[1.15]';
      if (len < 250) return 'text-[56px] leading-[1.25]';
      return 'text-[44px] leading-[1.3]';
    }
    if (len < 50) return 'text-[110px] leading-[1.05]';
    if (len < 120) return 'text-[84px] leading-[1.15]';
    if (len < 250) return 'text-[64px] leading-[1.25]';
    if (len < 400) return 'text-[48px] leading-[1.35]';
    return 'text-[38px] leading-[1.4]';
  };

  return (
    <>
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      
      {/* Refined Share Card Template */}
      {capturing && (
        <div className="fixed -left-[4000px] top-0 pointer-events-none">
          <div 
            ref={captureRef}
            className={`w-[1400px] bg-[#fcfaf7] paper-texture flex flex-col p-32 justify-between relative overflow-hidden ${capturing.image ? 'min-h-[1600px]' : 'min-h-[1200px]'}`}
          >
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-3xl font-black uppercase tracking-[0.5em] text-stone-900 bg-white border border-stone-200 px-10 py-4 rounded-full shadow-sm">
                {capturing.category}
              </span>
              <Logo size="md" className="opacity-80" />
            </div>

            <div className={`relative z-10 flex flex-col justify-center gap-20 py-16 ${capturing.image ? 'flex-grow' : 'flex-grow justify-center'}`}>
              {capturing.image && (
                <div className="w-full flex justify-center">
                  <div className="bg-white p-6 shadow-2xl rounded-[3rem] border border-stone-100 rotate-1 transform-gpu">
                    <img src={capturing.image} alt="" className="w-full max-h-[800px] object-contain rounded-[2rem]" />
                  </div>
                </div>
              )}
              <div className={capturing.image ? 'text-center' : 'text-left'}>
                <p className={`thought-font text-stone-900 whitespace-pre-wrap italic font-semibold ${getDynamicFontSize(capturing.content, !!capturing.image)}`}>
                  {capturing.content}
                </p>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-12">
              <div className="flex items-end justify-between border-t-[4px] border-stone-900 pt-16">
                <div className="space-y-2">
                  <h3 className="heading-font text-6xl font-black tracking-tighter text-stone-900 leading-none uppercase">RTTS</h3>
                  <p className="text-xl font-bold uppercase tracking-[0.4em] text-stone-400">Archive Code: {capturing.id}</p>
                </div>
                
                <div className="text-right">
                  <span className="text-2xl font-black text-stone-900 uppercase tracking-[0.4em] block mb-2">
                    {new Date(capturing.timestamp).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <p className="text-xl font-black uppercase tracking-[0.6em] text-stone-300">ToluThinksALot.app</p>
                </div>
              </div>
            </div>

            <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none select-none">
              <div className="text-[300px] font-black heading-font absolute -bottom-40 -left-20 rotate-12">RTTS</div>
            </div>
          </div>
        </div>
      )}

      {capturing && (
        <div className="fixed inset-0 z-[110] bg-stone-900/60 backdrop-blur-md flex items-center justify-center animate-fade-in">
          <div className="bg-white p-14 rounded-[3.5rem] text-center space-y-8 shadow-2xl scale-in border border-stone-100">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-stone-100 border-t-stone-900 rounded-full animate-spin" />
              <Logo size="sm" className="absolute" />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-stone-900">Curating Card</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-300">Formatting memory fragment...</p>
            </div>
          </div>
        </div>
      )}

      <div className={`min-h-screen flex flex-col ${isLoading ? 'opacity-0' : 'animate-fade-in'}`}>
        {showLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-6 animate-fade-in">
            <form onSubmit={handleLogin} className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-sm space-y-8 border border-stone-100">
              <div className="space-y-2">
                <h2 className="heading-font text-3xl font-bold tracking-tighter">Identity check</h2>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-400">Restricted archive access</p>
              </div>
              <input 
                type="password" 
                value={loginKey}
                onChange={(e) => setLoginKey(e.target.value)}
                placeholder="Archive Key"
                className="w-full px-8 py-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-2 focus:ring-stone-900 thought-font text-xl transition-all"
                autoFocus
              />
              <div className="flex flex-col gap-4">
                <button className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-stone-900/20 hover:bg-stone-800 active:scale-[0.98] transition-all">Verify Key</button>
                <button type="button" onClick={() => setShowLogin(false)} className="w-full text-stone-400 text-[10px] font-black uppercase tracking-widest hover:text-stone-900 transition-colors">Nevermind</button>
              </div>
            </form>
          </div>
        )}

        {selectedThought && (
          <div className="fixed inset-0 z-[60] bg-[#fcfaf7] overflow-y-auto px-6 py-24 md:py-48 animate-fade-in paper-texture">
            <button 
              onClick={closeThought}
              className="fixed top-8 left-8 md:top-12 md:left-12 w-14 h-14 bg-white border border-stone-200 rounded-full flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all shadow-xl active:scale-90 group z-10"
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

              {selectedThought.image && (
                <div className="w-full overflow-hidden rounded-[2.5rem] shadow-2xl bg-white p-6 border border-stone-100">
                  <img src={selectedThought.image} alt="Fragment view" className="w-full h-auto rounded-3xl" />
                </div>
              )}

              <p className="thought-font text-4xl md:text-5xl lg:text-6xl text-stone-900 leading-[1.3] md:leading-[1.2] whitespace-pre-wrap italic">
                {selectedThought.content}
              </p>
              
              <div className="pt-12 flex justify-start">
                 <button 
                    onClick={() => handleImageShare(selectedThought)}
                    className="flex items-center gap-3 bg-stone-900 text-white px-10 py-5 rounded-full font-bold uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:scale-105 transition-all active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    Save Memory Card
                  </button>
              </div>
            </div>
          </div>
        )}

        <header className="pt-32 pb-20 text-center max-w-4xl mx-auto w-full px-6 flex flex-col items-center">
          <button onClick={resetAll} className="mb-12 hover:scale-110 active:scale-95 transition-all">
            <Logo size="lg" />
          </button>
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
          
          <div className="space-y-6 px-6">
            {filteredThoughts.length === 0 ? (
              <div className="py-48 text-center animate-fade-in">
                <p className="thought-font text-4xl text-stone-200 italic font-light">"Silence is just a thought awaiting its turn."</p>
              </div>
            ) : (
              filteredThoughts.map((t) => (
                <ThoughtCard 
                  key={t.id} 
                  thought={t} 
                  onDelete={deleteThought} 
                  onResonate={resonate} 
                  onOpen={openThought}
                  onImageShare={handleImageShare}
                  isOwner={isOwner} 
                  hasResonated={reactedIds.includes(t.id)}
                />
              ))
            )}
          </div>
        </main>

        <footer className="py-32 text-center border-t border-stone-100 mt-auto bg-stone-50/30">
          <div className="max-w-2xl mx-auto px-6 space-y-10 flex flex-col items-center">
            <div className="flex items-center gap-4">
               <Logo size="sm" className="opacity-50" onClick={handleSecretTrigger} />
               <span className="heading-font text-xl font-black text-stone-300 tracking-tighter select-none">
                 RTTS Signature
               </span>
            </div>
            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-stone-300">Curated Fragments</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                <a href="https://instagram.com/direct_strt" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-900 transition-colors text-[10px] font-black uppercase tracking-[0.2em]">Instagram</a>
                <a href="https://twitter.com/direct_strt" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-900 transition-colors text-[10px] font-black uppercase tracking-[0.2em]">Twitter</a>
                <a href="https://tiktok.com/@direct_strt" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-900 transition-colors text-[10px] font-black uppercase tracking-[0.2em]">TikTok</a>
              </div>
            </div>
            <div className="pt-12 flex items-center justify-center gap-3">
              <span className="text-[9px] text-stone-300 font-bold uppercase tracking-[0.3em] flex items-center">
                &copy; {new Date().getFullYear()} Tolu Says
              </span>
            </div>
          </div>
        </footer>
        
        <ScrollToTopButton />
      </div>
    </>
  );
};

// --- Root Rendering ---

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
