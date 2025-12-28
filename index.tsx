
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

const CATEGORIES: Category[] = ['Deep thoughts' , 'About HER', 'Poetic', 'Random Opinion', 'Politics', 'Humour'];

// --- Audio Helpers ---

const playSubtleChime = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  const isMobile = window.innerWidth <= 768;
  const frequencies = [329.63, 392.00, 493.88];
  
  const masterGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);
  filter.Q.setValueAtTime(0.7, now);

  // Louder on mobile: set target volume higher for small screens
  const targetVolume = isMobile ? 0.6 : 0.35;

  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(targetVolume, now + 0.8);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + 4.0);

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
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
      className={`
        ${dimensions[size]} 
        bg-stone-900 text-white rounded-[30%] 
        flex items-center justify-center font-black heading-font 
        select-none shadow-lg shadow-stone-900/10 cursor-pointer 
        ${className}
      `}
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
    // Initialize audio on user interaction
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playSubtleChime(audioCtx);

    setTimeout(() => {
      setIsFinishing(true);
      setTimeout(onComplete, 800);
    }, 2800);
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-[#fcfaf7] paper-texture flex flex-col items-center justify-center transition-all duration-1000 ${isFinishing ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'}`}>
      {!hasStarted ? (
        <div className="group flex flex-col items-center gap-10 animate-fade-in">
          <Logo size="lg" />
          <button 
            onClick={startEntry}
            className="text-center space-y-4 group"
          >
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300 group-hover:text-stone-900 transition-colors">Enter Archive</p>
             <p className="text-[9px] font-bold italic text-stone-200">Silence is just a thought awaiting its turn</p>
          </button>
        </div>
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
            className="w-full h-48 p-8 thought-font text-xl resize-none placeholder-stone-300 bg-transparent border-0 ring-0 focus:ring-0"
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

const EditThoughtModal: React.FC<{ 
  thought: Thought; 
  onSave: (id: string, content: string, category: Category) => void;
  onClose: () => void;
}> = ({ thought, onSave, onClose }) => {
  const [content, setContent] = useState(thought.content);
  const [category, setCategory] = useState<Category>(thought.category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSave(thought.id, content, category);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-[#fcfaf7] paper-texture w-full max-w-xl rounded-[3rem] shadow-2xl p-10 space-y-8 animate-scale-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="heading-font text-2xl font-black tracking-tighter">Refine Fragment</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Memory Revision</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-300 hover:text-stone-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-stone-100 rounded-[2rem] shadow-sm focus-within:shadow-xl transition-all overflow-hidden p-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-40 thought-font text-xl resize-none bg-transparent"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="bg-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full border border-stone-100 outline-none focus:border-stone-900 cursor-pointer appearance-none shadow-sm"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <button
              type="submit"
              disabled={!content.trim() || (content === thought.content && category === thought.category)}
              className="bg-stone-900 text-white px-8 h-11 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg shadow-stone-900/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100"
            >
              Update Thought
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ThoughtCard: React.FC<{ 
  thought: Thought; 
  onDelete: (id: string) => void; 
  onEdit: (thought: Thought) => void;
  onResonate: (id: string) => void;
  onOpen: (thought: Thought) => void;
  onImageShare: (thought: Thought) => void;
  isOwner: boolean;
  hasResonated: boolean;
}> = ({ thought, onDelete, onEdit, onResonate, onOpen, onImageShare, isOwner, hasResonated }) => {
  const [isResonatingLocal, setIsResonatingLocal] = useState(false);
  const date = new Date(thought.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

  const handleResonateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasResonated) {
      setIsResonatingLocal(true);
      setTimeout(() => setIsResonatingLocal(false), 800);
      onResonate(thought.id);
    }
  };

  return (
    <div className="group relative py-12 border-b border-stone-100 last:border-0 hover:bg-stone-100/40 px-6 -mx-6 rounded-[2.5rem] transition-all">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 group-hover:text-stone-900 transition-colors">
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
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(thought); }}
                  className="p-2 text-stone-300 hover:text-stone-900 transition-all"
                  title="Edit Fragment"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(thought.id); }}
                  className="p-2 text-stone-300 hover:text-red-500 transition-all"
                  title="Remove Fragment"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
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
          className="thought-font thought-content-main text-xl md:text-2xl cursor-pointer hover:text-stone-900 transition-colors line-clamp-4 px-2"
        >
          {thought.content}
        </p>

        <div className="flex items-center gap-6 px-2">
          <button 
            onClick={handleResonateClick}
            disabled={hasResonated}
            className={`relative flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${hasResonated ? 'text-stone-900 cursor-default' : 'text-stone-400 hover:text-stone-900'}`}
          >
            {isResonatingLocal && (
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 animate-float-up text-[12px] text-stone-900 font-bold pointer-events-none">
                +1
              </span>
            )}
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
              className={`transition-all duration-300 ${isResonatingLocal ? 'animate-resonate-pop' : ''}`}
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
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
  const [editingThought, setEditingThought] = useState<Thought | null>(null);
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

  const updateThought = (id: string, content: string, category: Category) => {
    setThoughts(prev => prev.map(t => 
      t.id === id ? { ...t, content, category } : t
    ));
    setEditingThought(null);
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
      if (len < 50) return 'text-[72px] leading-[1.05]';
      if (len < 120) return 'text-[54px] leading-[1.15]';
      if (len < 250) return 'text-[42px] leading-[1.25]';
      return 'text-[32px] leading-[1.3]';
    }
    if (len < 50) return 'text-[90px] leading-[1.05]';
    if (len < 120) return 'text-[68px] leading-[1.15]';
    if (len < 250) return 'text-[50px] leading-[1.25]';
    if (len < 400) return 'text-[38px] leading-[1.35]';
    return 'text-[28px] leading-[1.4]';
  };

  return (
    <>
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      
      {/* Share Card Template */}
      {capturing && (
        <div className="fixed -left-[4000px] top-0 pointer-events-none">
          <div 
            ref={captureRef}
            className={`w-[1400px] bg-[#fcfaf7] paper-texture flex flex-col p-24 justify-between relative overflow-hidden border-[16px] border-stone-900 ${capturing.image ? 'min-h-[1600px]' : 'min-h-[1200px]'}`}
          >
            {/* Subtle Inner Decorative Border */}
            <div className="absolute inset-4 border-[2px] border-stone-200 pointer-events-none"></div>

            {/* Header Metadata */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <span className="bg-stone-900 text-white px-8 py-3 rounded-md text-2xl font-black uppercase tracking-[0.4em] transform -rotate-1">
                    {capturing.category}
                  </span>
                </div>
                <div className="flex flex-col gap-2 pt-4">
                  <p className="text-xl font-black uppercase tracking-[0.5em] text-stone-300">Archive Reference</p>
                  <p className="text-3xl font-bold text-stone-900">CODEX_{capturing.id.toUpperCase()}</p>
                </div>
              </div>
              <Logo size="md" className="shadow-none opacity-20" />
            </div>

            {/* Main Content Area */}
            <div className={`relative z-10 flex flex-col items-center gap-16 py-12 ${capturing.image ? 'justify-start' : 'justify-center flex-grow'}`}>
              {capturing.image && (
                <div className="w-full flex justify-center px-12">
                  <div className="bg-white p-8 shadow-2xl rounded-sm border border-stone-100 flex flex-col gap-6 w-full transform rotate-[0.5deg]">
                    <div className="overflow-hidden bg-stone-50">
                      <img src={capturing.image} alt="" className="w-full max-h-[850px] object-contain" />
                    </div>
                    <div className="flex justify-between items-center opacity-40">
                      <p className="text-lg font-mono uppercase tracking-widest">VISUAL_FRAGMENT_NO_{capturing.id.toUpperCase()}</p>
                      <p className="text-lg font-mono">{(new Date()).getFullYear()}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className={`px-12 w-full ${capturing.image ? 'text-center' : 'text-left'}`}>
                <p className={`thought-font text-stone-900 whitespace-pre-wrap font-medium leading-tight ${getDynamicFontSize(capturing.content, !!capturing.image)}`}>
                  {capturing.content}
                </p>
              </div>
            </div>

            {/* Footer Signature */}
            <div className="relative z-10 space-y-12">
              <div className="h-[2px] bg-stone-900 w-full opacity-10"></div>
              <div className="flex items-end justify-between">
                <div className="space-y-4">
                  <h3 className="heading-font text-7xl font-black tracking-tighter text-stone-900 leading-none">
                    RTTS
                  </h3>
                  <p className="text-2xl font-black uppercase tracking-[0.3em] text-stone-400">Random Things Tolu Says</p>
                </div>
                
                <div className="text-right space-y-4">
                  <div className="inline-block border-2 border-stone-900 px-6 py-2">
                    <span className="text-3xl font-black text-stone-900 uppercase tracking-[0.2em]">
                      {new Date(capturing.timestamp).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xl font-bold uppercase tracking-[0.5em] text-stone-300">ToluThinksALot.app</p>
                </div>
              </div>
            </div>

            {/* Massive Background Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] pointer-events-none select-none flex items-center justify-center overflow-hidden">
              <div className="text-[600px] font-black heading-font rotate-12 whitespace-nowrap">
                ARCHIVE_{capturing.id.toUpperCase()}
              </div>
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

        {editingThought && (
          <EditThoughtModal thought={editingThought} onSave={updateThought} onClose={() => setEditingThought(null)} />
        )}

        {selectedThought && (
          <div className="fixed inset-0 z-[60] bg-[#fcfaf7] overflow-y-auto px-6 py-24 md:py-48 animate-fade-in paper-texture">
            <button 
              onClick={closeThought}
              className="fixed top-8 left-8 md:top-12 md:left-12 w-14 h-14 bg-white border border-stone-200 rounded-full flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all shadow-xl active:scale-90 group z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="max-w-2xl mx-auto space-y-20">
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
              <div className="space-y-12">
                <p className={`thought-font thought-content-expanded text-3xl md:text-4xl lg:text-5xl whitespace-pre-wrap ${selectedThought.content.length > 50 ? 'drop-cap' : ''}`}>
                  {selectedThought.content}
                </p>
              </div>
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
          <Logo size="lg" className="mb-12" onClick={resetAll} />
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
                  onEdit={setEditingThought}
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
               <Logo size="sm" onClick={handleSecretTrigger} />
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
