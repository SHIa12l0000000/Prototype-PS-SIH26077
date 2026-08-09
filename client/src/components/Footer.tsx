import React from 'react';
import { Cpu, Github, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full glass-panel border-t border-slate-800/80 py-8 px-4 lg:px-8 mt-12 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-200 text-sm">TechPulse AI</span>
            <p className="text-[11px] text-slate-500">Production-ready React + TypeScript + Express Full-Stack Application</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <a href="https://techpulse-ai-production-4086.up.railway.app/api/health" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 flex items-center gap-1">
            <span>API Health Check</span> <ExternalLink className="w-3 h-3" />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 flex items-center gap-1">
            <Github className="w-3.5 h-3.5" /> <span>GitHub</span>
          </a>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <span>Engineered with</span>
          <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
          <span>using Vite, Express & Tailwind CSS v4</span>
        </div>

      </div>
    </footer>
  );
};

