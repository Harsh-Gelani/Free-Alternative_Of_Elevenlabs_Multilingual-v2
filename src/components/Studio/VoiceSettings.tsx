'use client';

import React, { useState } from 'react';
import { VoiceSettings as VoiceSettingsType } from '@/lib/types';
import { Sliders, RotateCcw, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface VoiceSettingsProps {
  settings: VoiceSettingsType;
  onChange: (settings: VoiceSettingsType) => void;
  onReset: () => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  settings,
  onChange,
  onReset,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateSetting = <K extends keyof VoiceSettingsType>(
    key: K,
    value: VoiceSettingsType[K]
  ) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="rounded-xl border border-studio-700 bg-studio-900/90 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-purple-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Voice Settings (Multilingual v2)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset to default settings"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-slate-200"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Stability Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-200 flex items-center gap-1">
                Stability
                <span className="text-[10px] text-slate-400">({settings.stability.toFixed(2)})</span>
              </span>
              <span className="text-[11px] text-purple-400 font-medium">
                {settings.stability < 0.4 ? 'Emotional & Variable' : settings.stability > 0.65 ? 'High Long-Form Stability (Audiobook)' : 'Natural Pacing & Steady Cadence'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.stability}
              onChange={(e) => updateSetting('stability', parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-studio-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>Variable / Emotional</span>
              <span>Steady Cadence (Audiobook / 10k Chars)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              Multilingual v2 prioritizes long-form stability over extreme emotion, maintaining identical timbre across 10,000 characters.
            </p>
          </div>

          {/* Similarity Boost Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-200 flex items-center gap-1">
                Similarity Boost
                <span className="text-[10px] text-slate-400">({settings.similarity_boost.toFixed(2)})</span>
              </span>
              <span className="text-[11px] text-purple-400 font-medium">
                {settings.similarity_boost > 0.8 ? 'Strict Vocal Timbre Lock' : 'Balanced Fidelity'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.similarity_boost}
              onChange={(e) => updateSetting('similarity_boost', parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-studio-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>Flexible</span>
              <span>Strict Speaker Fingerprint</span>
            </div>
          </div>

          {/* Style Exaggeration Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-200 flex items-center gap-1">
                Style Exaggeration
                <span className="text-[10px] text-slate-400">({settings.style.toFixed(2)})</span>
              </span>
              <span className="text-[11px] text-purple-400 font-medium">
                {settings.style > 0.15 ? 'Dramatic / Expressive' : 'Neutral & Steady Delivery'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.style}
              onChange={(e) => updateSetting('style', parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-studio-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>0.0 Neutral Narration</span>
              <span>1.0 Dramatic Acting</span>
            </div>
          </div>

          {/* Speed / Pace Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-200 flex items-center gap-1">
                Speaking Speed
                <span className="text-[10px] text-slate-400">({settings.speed.toFixed(2)}x)</span>
              </span>
              <span className="text-[11px] text-purple-400 font-medium">
                {settings.speed === 1.0 ? 'Natural Cadence' : settings.speed > 1.0 ? 'Brisk' : 'Measured'}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={settings.speed}
              onChange={(e) => updateSetting('speed', parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-studio-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>0.5x Slow</span>
              <span>1.0x Normal</span>
              <span>2.0x Fast</span>
            </div>
          </div>

          {/* Syntax-Driven Pacing & Respiration Toggle */}
          <div className="flex items-center justify-between border-t border-studio-700/60 pt-3">
            <div>
              <span className="block text-xs font-medium text-purple-300">
                Syntax-Driven Pacing & Respiration
              </span>
              <span className="block text-[11px] text-slate-400">
                Parses punctuation and paragraph breaks to calculate natural human breathing spaces
              </span>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('human_breathing', settings.human_breathing === false ? true : false)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.human_breathing !== false ? 'bg-purple-600' : 'bg-studio-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.human_breathing !== false ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Speaker Boost / Studio Mastering Toggle */}
          <div className="flex items-center justify-between border-t border-studio-700/60 pt-3">
            <div>
              <span className="block text-xs font-medium text-slate-200">
                Speaker Boost & Studio Mastering
              </span>
              <span className="block text-[11px] text-slate-400">
                Applies broadcast compressor, Neumann proximity warmth (+2.4dB), and De-Esser
              </span>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('use_speaker_boost', !settings.use_speaker_boost)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.use_speaker_boost ? 'bg-purple-600' : 'bg-studio-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.use_speaker_boost ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
