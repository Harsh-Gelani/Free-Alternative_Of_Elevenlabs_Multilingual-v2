'use client';

import React from 'react';
import { Sparkles, Loader2, Zap, AlertCircle } from 'lucide-react';

interface ControlBarProps {
  onGenerate: () => void;
  isGenerating: boolean;
  charCount: number;
  disabled: boolean;
  error?: string | null;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  onGenerate,
  isGenerating,
  charCount,
  disabled,
  error,
}) => {
  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-studio-700 bg-studio-900/90 p-4 shadow-lg">
        {/* Left: Usage & Model Spec */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">Local Neural Inference</span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400">
                0 Credits (Free)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Zero API Keys required • 100% Local PC Processing
            </p>
          </div>
        </div>

        {/* Right: Generate Action Button */}
        <div className="flex items-center gap-3">
          <span className="hidden lg:inline text-xs text-slate-500 font-mono">
            Ctrl + Enter
          </span>

          <button
            onClick={onGenerate}
            disabled={disabled || isGenerating}
            className={`flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-200 ${
              disabled || isGenerating
                ? 'cursor-not-allowed bg-studio-700/80 text-slate-400'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-600/30 active:scale-98'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-purple-200" />
                <span>Synthesizing Voice...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-purple-200" />
                <span>Generate Speech</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
