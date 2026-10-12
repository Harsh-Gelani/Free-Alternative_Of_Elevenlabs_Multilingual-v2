'use client';

import React from 'react';
import { Volume2, Sparkles, Mic, History, Code, Cpu } from 'lucide-react';

interface NavbarProps {
  onOpenVoiceLibrary: () => void;
  onOpenVoiceClone: () => void;
  onOpenHistory: () => void;
  onOpenApiExport: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenVoiceLibrary,
  onOpenVoiceClone,
  onOpenHistory,
  onOpenApiExport,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-studio-700/60 bg-studio-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Model Badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30">
            <Volume2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white sm:text-lg">ElevenLabs</span>
              <span className="rounded-md border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-300">
                Multilingual v2
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Cpu className="h-3 w-3 text-emerald-400" />
              <span>Local Neural Engine</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400">29 Languages Local</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenVoiceClone}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-600/10 px-3 py-1.5 text-xs font-medium text-purple-300 transition-all hover:bg-purple-600/20 hover:text-white"
          >
            <Mic className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clone Voice</span>
          </button>

          <button
            onClick={onOpenVoiceLibrary}
            className="flex items-center gap-1.5 rounded-lg border border-studio-700 bg-studio-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-studio-600 hover:bg-studio-800 hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Voice Library</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 rounded-lg border border-studio-700 bg-studio-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-studio-600 hover:bg-studio-800 hover:text-white"
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 rounded-full bg-purple-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenApiExport}
            className="flex items-center gap-1.5 rounded-lg border border-studio-700 bg-studio-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-studio-600 hover:bg-studio-800 hover:text-white"
          >
            <Code className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">API</span>
          </button>
        </div>
      </div>
    </header>
  );
};
