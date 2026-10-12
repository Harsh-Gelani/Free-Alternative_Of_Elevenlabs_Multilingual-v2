'use client';

import React, { useRef } from 'react';
import { Clock, Trash2, Sparkles, AlertCircle } from 'lucide-react';

interface ScriptEditorProps {
  text: string;
  onChange: (text: string) => void;
  onClear: () => void;
  characterLimit?: number;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  text,
  onChange,
  onClear,
  characterLimit = 10000,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertPause = (seconds: number) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const pauseTag = seconds >= 2.0 ? ' ... ... ' : seconds >= 1.0 ? ' ... ' : ' ... ';
    const updated = text.substring(0, start) + pauseTag + text.substring(end);
    onChange(updated);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + pauseTag.length, start + pauseTag.length);
    }, 10);
  };

  const isOverLimit = text.length > characterLimit;

  return (
    <div className="flex flex-col rounded-xl border border-studio-700 bg-studio-900/90 shadow-sm">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-studio-700/60 px-4 py-2.5 bg-studio-900">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Script (Natural Prosody & Cadence)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Insert Pause:</span>
          <button
            onClick={() => insertPause(0.5)}
            className="rounded border border-studio-700 bg-studio-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 hover:border-purple-500/50 hover:bg-studio-750 hover:text-purple-300 transition-all"
            title="Insert breath pause (0.5s)"
          >
            +0.5s
          </button>
          <button
            onClick={() => insertPause(1.0)}
            className="rounded border border-studio-700 bg-studio-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 hover:border-purple-500/50 hover:bg-studio-750 hover:text-purple-300 transition-all"
            title="Insert cadence pause (1.0s)"
          >
            +1.0s
          </button>
          <button
            onClick={() => insertPause(2.0)}
            className="rounded border border-studio-700 bg-studio-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 hover:border-purple-500/50 hover:bg-studio-750 hover:text-purple-300 transition-all"
            title="Insert long dramatic pause (2.0s)"
          >
            +2.0s
          </button>

          {text.length > 0 && (
            <button
              onClick={onClear}
              className="ml-2 flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear script"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Text Area */}
      <div className="relative p-4">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type or paste your text here to synthesize with ElevenLabs Multilingual v2... Supports up to 10,000 characters and emotion cues!"
          className="h-64 w-full resize-y bg-transparent font-sans text-sm text-slate-100 placeholder-slate-400 focus:outline-none sm:text-base leading-relaxed"
          maxLength={characterLimit}
        />
      </div>

      {/* Footer Info & Limit Counter */}
      <div className="flex items-center justify-between border-t border-studio-700/60 px-4 py-2 text-xs text-slate-400 bg-studio-950/40 rounded-b-xl">
        <div className="flex items-center gap-2">
          {isOverLimit && (
            <span className="flex items-center gap-1 text-rose-400">
              <AlertCircle className="h-3.5 w-3.5" />
              Character limit reached
            </span>
          )}
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Model: <code className="text-purple-400 font-mono">eleven_multilingual_v2</code>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">
            Words: {text.trim() ? text.trim().split(/\s+/).length : 0}
          </span>
          <span
            className={`font-mono text-xs ${
              isOverLimit ? 'font-bold text-rose-400' : 'text-slate-300'
            }`}
          >
            {text.length.toLocaleString()} / {characterLimit.toLocaleString()} chars
          </span>
        </div>
      </div>
    </div>
  );
};
