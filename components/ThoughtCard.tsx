
import React, { useState, useEffect } from 'react';
import { Thought } from '../types';

interface ThoughtCardProps {
  thought: Thought;
  onDelete: (id: string) => void;
  onResonate: (id: string) => void;
  onShowToast: (message: string) => void;
  onOpenFullView: (thought: Thought) => void;
  isOwner: boolean;
}

const TRUNCATE_LIMIT = 300;

const ThoughtCard: React.FC<ThoughtCardProps> = ({ 
  thought, 
  onDelete, 
  onResonate, 
  onShowToast, 
  onOpenFullView,
  isOwner 
}) => {
  const [hasResonated, setHasResonated] = useState(false);
  const [isResonateAnimating, setIsResonateAnimating] = useState(false);
  const [isCopyAnimating, setIsCopyAnimating] = useState(false);

  useEffect(() => {
    const resonatedIds = JSON.parse(localStorage.getItem('resonated_thoughts') || '[]');
    if (resonatedIds.includes(thought.id)) {
      setHasResonated(true);
    }
  }, [thought.id]);

  const dateObj = new Date(thought.timestamp);
  const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const handleResonate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasResonated) return;

    const resonatedIds = JSON.parse(localStorage.getItem('resonated_thoughts') || '[]');
    if (!resonatedIds.includes(thought.id)) {
      resonatedIds.push(thought.id);
      localStorage.setItem('resonated_thoughts', JSON.stringify(resonatedIds));
    }

    onResonate(thought.id);
    setHasResonated(true);
    setIsResonateAnimating(true);
    setTimeout(() => setIsResonateAnimating(false), 600);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `"${thought.content}"\n\n— via Tolu Says\n${window.location.href}`;
    
    setIsCopyAnimating(true);
    setTimeout(() => setIsCopyAnimating(false), 600);

    try {
      await navigator.clipboard.writeText(shareText);
      onShowToast('Fragment copied to clipboard');
    } catch (err) {
      onShowToast('Unable to copy');
    }
  };

  const isLong = thought.content.length > TRUNCATE_LIMIT;
  const displayContent = isLong ? thought.content.slice(0, TRUNCATE_LIMIT).trim() + '...' : thought.content;

  return (
    <div 
      className="fade-in group relative bg-white/40 border border-stone-100 p-10 md:p-14 rounded-[3rem] hover:bg-white hover:border-stone-200 transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] cursor-default overflow-hidden flex flex-col"
    >
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-black">{date} · {time}</span>
          </div>
          <div className="inline-block px-3 py-1 bg-stone-900 text-stone-50 text-[9px] font-black uppercase tracking-[0.15em] rounded">
            {thought.category}
          </div>
        </div>
        
        {isOwner && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(thought.id); }}
            className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-500 transition-all duration-300 p-2 -mr-2 scale-90 hover:scale-110"
            title="Remove thought"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>
      
      <div className="space-y-6 flex-grow">
        <p className="thought-font text-2xl md:text-3xl text-stone-900 leading-[1.4] whitespace-pre-wrap break-words overflow-wrap-anywhere font-medium">
          {displayContent}
        </p>
        
        {isLong && (
          <button 
            onClick={() => onOpenFullView(thought)}
            className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-900 hover:tracking-[0.3em] transition-all flex items-center gap-2 group/more mt-4"
          >
            Read more
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/more:translate-x-1"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </button>
        )}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-6 pt-10 border-t border-stone-50">
        <div className="flex flex-wrap gap-3">
          {thought.tags.map(tag => (
            <span key={tag} className="text-[9px] uppercase tracking-[0.2em] font-black text-stone-400">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopy}
            className={`group/btn flex items-center gap-3 px-6 py-2.5 rounded-full border transition-all duration-500 bg-transparent border-stone-100 text-stone-400 hover:border-stone-300 hover:text-stone-900 active:scale-95 ${isCopyAnimating ? 'ring-4 ring-stone-900/5' : ''}`}
            title="Copy thought details"
          >
            <div className={`transition-transform duration-300 ${isCopyAnimating ? 'scale-125' : ''}`}>
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
               </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.1em]">
              Copy
            </span>
          </button>

          <button 
            onClick={handleResonate}
            disabled={hasResonated}
            className={`group/btn flex items-center gap-3 px-6 py-2.5 rounded-full border transition-all duration-500 ${
              hasResonated 
                ? 'bg-stone-50 border-stone-200 text-stone-600 cursor-default' 
                : 'bg-transparent border-stone-100 text-stone-400 hover:border-stone-300 hover:text-stone-900 active:scale-95'
            } ${isResonateAnimating ? 'ring-4 ring-stone-900/5 animate-pulse' : ''}`}
          >
            <div className={`relative transition-transform duration-300 ${isResonateAnimating ? 'scale-150' : ''}`}>
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={hasResonated ? 'fill-current' : ''}>
                 <path d="m12 19-7-7 7-7 7 7-7 7z"/>
               </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.1em]">
              {hasResonated ? 'Resonated' : 'Resonate'}
            </span>
            {thought.resonates > 0 && (
              <span className={`text-[10px] font-bold ${hasResonated ? 'text-stone-900' : 'text-stone-300'}`}>
                {thought.resonates}
              </span>
            )}
          </button>
        </div>
      </div>
      <style>{`
        .overflow-wrap-anywhere {
          overflow-wrap: anywhere;
        }
      `}</style>
    </div>
  );
};

export default ThoughtCard;
