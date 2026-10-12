'use client';

import React, { useState } from 'react';
import { GenerationHistoryItem } from '@/lib/types';
import {
  X,
  Play,
  Pause,
  Download,
  Trash2,
  Clock,
  ArrowRight,
  FileAudio,
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GenerationHistoryItem[];
  onLoadItem: (item: GenerationHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onLoadItem,
  onDeleteItem,
  onClearHistory,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const playAudio = (item: GenerationHistoryItem) => {
    if (playingId === item.id && currentAudio) {
      currentAudio.pause();
      setPlayingId(null);
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(item.audioUrl);
    audio.play();
    setCurrentAudio(audio);
    setPlayingId(item.id);

    audio.onended = () => {
      setPlayingId(null);
    };
  };

  const handleDownload = (item: GenerationHistoryItem) => {
    const link = document.createElement('a');
    link.href = item.audioUrl;
    link.download = `eleven_${item.voiceName.toLowerCase()}_${item.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-studio-700 bg-studio-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-studio-700/80 p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Generation History ({history.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                title="Clear all generations"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.map((item) => {
            const isPlaying = playingId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-studio-700 bg-studio-850/70 p-3 text-xs shadow-sm transition-all hover:border-studio-600"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{item.voiceName}</span>
                    <span className="rounded bg-studio-700 px-1.5 py-0.2 text-[10px] text-slate-300">
                      {item.languageName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>

                <p className="mb-3 text-slate-300 line-clamp-2 leading-relaxed italic">
                  &quot;{item.text}&quot;
                </p>

                <div className="flex items-center justify-between border-t border-studio-700/60 pt-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playAudio(item)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-500 transition-colors"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                    </button>
                    <span className="text-slate-400 font-mono">
                      {item.durationSeconds}s • {item.characterCount} chars
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownload(item)}
                      className="rounded p-1 text-slate-400 hover:text-white"
                      title="Download MP3"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onLoadItem(item);
                        onClose();
                      }}
                      className="flex items-center gap-1 rounded bg-studio-700/80 px-2 py-1 text-[10px] font-medium text-slate-200 hover:bg-purple-600 hover:text-white transition-colors"
                      title="Restore text & settings"
                    >
                      Load
                      <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="rounded p-1 text-slate-400 hover:text-rose-400"
                      title="Delete from history"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {history.length === 0 && (
            <div className="flex h-48 flex-col items-center justify-center text-center text-slate-400">
              <FileAudio className="h-8 w-8 text-slate-600 mb-2" />
              <p className="text-xs font-medium">No history yet</p>
              <p className="text-[11px] text-slate-400">
                Audio synthesized in the studio will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
