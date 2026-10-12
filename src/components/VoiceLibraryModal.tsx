'use client';

import React, { useState } from 'react';
import { Voice } from '@/lib/types';
import { X, Search, Check, Sparkles, User, Trash2, Filter } from 'lucide-react';

interface VoiceLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: Voice[];
  selectedVoiceId: string;
  onSelectVoice: (voice: Voice) => void;
  onDeleteCustomVoice?: (id: string) => void;
  onOpenCloneModal: () => void;
}

export const VoiceLibraryModal: React.FC<VoiceLibraryModalProps> = ({
  isOpen,
  onClose,
  voices,
  selectedVoiceId,
  onSelectVoice,
  onDeleteCustomVoice,
  onOpenCloneModal,
}) => {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'premade' | 'cloned'>('all');

  if (!isOpen) return null;

  const filteredVoices = voices.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.accent.toLowerCase().includes(search.toLowerCase()) ||
      v.useCase.toLowerCase().includes(search.toLowerCase());

    const matchesGender = genderFilter === 'all' || v.gender === genderFilter;
    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;

    return matchesSearch && matchesGender && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-studio-700 bg-studio-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-studio-700/80 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Voice Library</h2>
              <p className="text-xs text-slate-400">
                Browse signature ElevenLabs Multilingual v2 voice actors & custom cloned voices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-studio-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-studio-700/60 p-4 bg-studio-950/40">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by voice name, accent, or style..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-studio-700 bg-studio-850 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Category Filter */}
            <div className="flex rounded-lg border border-studio-700 bg-studio-850 p-0.5 text-xs">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`rounded px-2.5 py-1 ${
                  categoryFilter === 'all'
                    ? 'bg-purple-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter('premade')}
                className={`rounded px-2.5 py-1 ${
                  categoryFilter === 'premade'
                    ? 'bg-purple-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Presets
              </button>
              <button
                onClick={() => setCategoryFilter('cloned')}
                className={`rounded px-2.5 py-1 ${
                  categoryFilter === 'cloned'
                    ? 'bg-purple-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cloned
              </button>
            </div>

            {/* Gender Filter */}
            <div className="flex rounded-lg border border-studio-700 bg-studio-850 p-0.5 text-xs">
              <button
                onClick={() => setGenderFilter('all')}
                className={`rounded px-2 py-1 ${
                  genderFilter === 'all'
                    ? 'bg-studio-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Genders
              </button>
              <button
                onClick={() => setGenderFilter('male')}
                className={`rounded px-2 py-1 ${
                  genderFilter === 'male'
                    ? 'bg-studio-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setGenderFilter('female')}
                className={`rounded px-2 py-1 ${
                  genderFilter === 'female'
                    ? 'bg-studio-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Female
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filteredVoices.map((voice) => {
              const isSelected = voice.id === selectedVoiceId;
              return (
                <div
                  key={voice.id}
                  className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-600/10'
                      : 'border-studio-700 bg-studio-850/60 hover:border-studio-600 hover:bg-studio-850'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${voice.avatarColor} text-base font-bold text-white shadow-md`}
                        >
                          {voice.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold text-white text-sm">{voice.name}</h3>
                            {voice.category === 'cloned' && (
                              <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-medium text-indigo-300">
                                Cloned
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {voice.accent}
                          </span>
                        </div>
                      </div>

                      {voice.category === 'cloned' && onDeleteCustomVoice && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustomVoice(voice.id);
                          }}
                          className="text-slate-400 hover:text-rose-400 p-1"
                          title="Delete cloned voice"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="mb-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {voice.description}
                    </p>

                    <div className="mb-4 flex flex-wrap gap-1.5">
                      <span className="rounded-md bg-studio-700/60 px-2 py-0.5 text-[10px] text-slate-300">
                        {voice.useCase}
                      </span>
                      <span className="rounded-md bg-studio-700/60 px-2 py-0.5 text-[10px] text-slate-400 capitalize">
                        {voice.gender}
                      </span>
                      {voice.clonedMetrics && (
                        <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300">
                          {voice.clonedMetrics.timbre}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectVoice(voice);
                      onClose();
                    }}
                    className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : 'border border-studio-700 bg-studio-800 text-slate-300 hover:border-purple-500 hover:bg-studio-750 hover:text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Selected Actor
                      </>
                    ) : (
                      'Select Actor'
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {filteredVoices.length === 0 && (
            <div className="flex h-48 flex-col items-center justify-center text-center text-slate-400">
              <p className="text-sm font-medium">No voices found matching filters</p>
              <button
                onClick={() => {
                  setSearch('');
                  setGenderFilter('all');
                  setCategoryFilter('all');
                }}
                className="mt-2 text-xs text-purple-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-studio-700/80 p-4 bg-studio-950/60">
          <span className="text-xs text-slate-400">
            Total voices: {voices.length} (Supports all 29 Multilingual v2 languages)
          </span>

          <button
            onClick={() => {
              onClose();
              onOpenCloneModal();
            }}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            + Create New Cloned Voice
          </button>
        </div>
      </div>
    </div>
  );
};
