
import React, { useState } from 'react';
import { AIReflection, Thought } from '../types';
import { analyzeThoughts } from '../services/geminiService';

interface AIAssistantProps {
  thoughts: Thought[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ thoughts }) => {
  const [reflection, setReflection] = useState<AIReflection | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReflect = async () => {
    setLoading(true);
    const result = await analyzeThoughts(thoughts);
    setReflection(result);
    setLoading(false);
  };

  if (thoughts.length < 3) return null;

  return (
    <div className="mt-20 mb-32 px-6 fade-in">
      {!reflection ? (
        <button
          onClick={handleReflect}
          disabled={loading}
          className="w-full py-12 rounded-[2.5rem] border-2 border-dashed border-stone-200 text-stone-400 hover:border-stone-900 hover:text-stone-900 transition-all flex flex-col items-center justify-center gap-4 group bg-transparent hover:bg-stone-50/50"
        >
          <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-stone-50 transition-all">
             {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full"></div>
             ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M12 8v4l3 3"/></svg>
             )}
          </div>
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.3em] font-bold block mb-1">Synthesize Fragments</span>
            <span className="text-[10px] text-stone-300 tracking-wider">Let intelligence weave your patterns</span>
          </div>
        </button>
      ) : (
        <div className="bg-stone-900 text-stone-50 p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden">
          {/* Subtle decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-stone-800 rounded-full -mr-32 -mt-32 opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-stone-700 rounded-full -ml-32 -mb-32 opacity-10 blur-3xl"></div>

          <div className="relative z-10 space-y-10">
            <div className="flex justify-between items-center border-b border-stone-800 pb-6">
              <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-500">Mindscape Analysis</h3>
              <button 
                onClick={() => setReflection(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-full border border-stone-800 hover:bg-stone-800 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
               <h4 className="text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold">The Essence</h4>
               <p className="thought-font text-3xl md:text-4xl italic leading-snug text-stone-100">
                "{reflection.zenQuote}"
               </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 pt-4">
              <div className="space-y-3">
                <h4 className="text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold">Synthesis</h4>
                <p className="text-sm text-stone-400 leading-relaxed font-light">{reflection.summary}</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold">Resonating Mood</h4>
                  <span className="inline-block text-xs font-medium text-stone-200 bg-stone-800 px-4 py-1.5 rounded-full">
                    {reflection.sentiment}
                  </span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[9px] uppercase tracking-[0.2em] text-stone-500 font-bold">Emerging Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {reflection.themes.map(theme => (
                      <span key={theme} className="text-[10px] uppercase tracking-wider bg-stone-50/5 text-stone-300 px-3 py-1 rounded-md border border-stone-800">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
