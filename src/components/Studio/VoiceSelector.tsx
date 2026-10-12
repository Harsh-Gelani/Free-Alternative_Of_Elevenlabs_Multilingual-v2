'use client';

import React, { useState } from 'react';
import { Voice } from '@/lib/types';
import { ChevronDown, Check, Sparkles, User, Mic } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: Voice;
  allVoices: Voice[];
  onSelectVoice: (voice: Voice) => void;
  onOpenLibrary: () => void;
  onOpenClone: () => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  allVoices,
  onSelectVoice,
  onOpenLibrary,
  onOpenClone,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Voice Actor
      </label>

      {/* Main trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-studio-700 bg-studio-900/90 p-3 text-left shadow-sm transition-all hover:border-purple-500/50 hover:bg-studio-850 focus:outline-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr ${selectedVoice.avatarColor} text-white font-bold text-sm shadow`}
          >
            {selectedVoice.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white truncate">{selectedVoice.name}</span>
              {selectedVoice.category === 'cloned' ? (
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300">
                  Cloned
                </span>
              ) : (
                <span className="rounded bg-studio-700/60 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                  {selectedVoice.gender}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">
              {selectedVoice.accent} • {selectedVoice.useCase}
            </p>
          </div>
        </div>

        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-xl border border-studio-700 bg-studio-900 p-2 shadow-2xl backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between px-2 pt-1 text-xs text-slate-400">
              <span>Select or Clone</span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenLibrary();
                }}
                className="text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                View All
              </button>
            </div>

            <div className="space-y-1">
              {allVoices.map((voice) => {
                const isSelected = voice.id === selectedVoice.id;
                return (
                  <button
                    key={voice.id}
                    onClick={() => {
                      onSelectVoice(voice);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg p-2 text-left transition-all ${
                      isSelected
                        ? 'bg-purple-600/20 text-white'
                        : 'text-slate-300 hover:bg-studio-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-tr ${voice.avatarColor} text-[11px] font-bold text-white`}
                      >
                        {voice.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-xs truncate">{voice.name}</span>
                          {voice.category === 'cloned' && (
                            <span className="rounded bg-indigo-500/20 px-1 py-0.2 text-[9px] text-indigo-300">
                              Clone
                            </span>
                          )}
                        </div>
                        <span className="block text-[11px] text-slate-400 truncate">
                          {voice.useCase}
                        </span>
                      </div>
                    </div>

                    {isSelected && <Check className="h-4 w-4 text-purple-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 border-t border-studio-700/60 pt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenClone();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-studio-800 p-2 text-xs font-medium text-purple-300 hover:bg-studio-700 hover:text-white transition-all"
              >
                <Mic className="h-3.5 w-3.5" />
                + Create New Cloned Voice
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
