'use client';

import React, { useState } from 'react';
import { Language } from '@/lib/types';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';
import { Globe, ChevronDown, Check, Search, FileText } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onLoadSample: (sampleText: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onLoadSample,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(search.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      lang.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Target Language (29 Supported)
        </label>
        <button
          onClick={() => onLoadSample(selectedLanguage.sampleText)}
          className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 hover:underline"
          title="Insert natural sample script for this language"
        >
          <FileText className="h-3 w-3" />
          Load Sample
        </button>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-studio-700 bg-studio-900/90 p-3 text-left shadow-sm transition-all hover:border-purple-500/50 hover:bg-studio-850 focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" role="img" aria-label={selectedLanguage.name}>
            {selectedLanguage.flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{selectedLanguage.name}</span>
              <span className="text-xs text-slate-400">({selectedLanguage.nativeName})</span>
            </div>
            <span className="text-[11px] font-mono text-purple-400 uppercase">
              ISO: {selectedLanguage.code}
            </span>
          </div>
        </div>

        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-xl border border-studio-700 bg-studio-900 p-2 shadow-2xl backdrop-blur-xl">
            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search 29 languages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-studio-700 bg-studio-800 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              {filteredLanguages.map((lang) => {
                const isSelected = lang.code === selectedLanguage.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`flex w-full items-center justify-between rounded-lg p-2 text-left transition-all ${
                      isSelected
                        ? 'bg-purple-600/20 text-white'
                        : 'text-slate-300 hover:bg-studio-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{lang.flag}</span>
                      <div>
                        <span className="font-medium text-xs text-white">{lang.name}</span>
                        <span className="ml-1.5 text-[11px] text-slate-400">({lang.nativeName})</span>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-purple-400" />}
                  </button>
                );
              })}
              {filteredLanguages.length === 0 && (
                <div className="p-3 text-center text-xs text-slate-400">
                  No matching language found.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
