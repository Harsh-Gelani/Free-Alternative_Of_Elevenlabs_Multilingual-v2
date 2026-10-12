'use client';

import React, { useState, useRef } from 'react';
import { Voice } from '@/lib/types';
import {
  X,
  Upload,
  Mic,
  Square,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  BookOpen,
  Copy,
  Check,
  Play,
  Pause,
} from 'lucide-react';

interface VoiceCloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceCreated: (newVoice: Voice) => void;
}

const DEMO_SCRIPTS = [
  {
    id: 'script-1',
    category: 'Narration & Audiobooks',
    title: 'Warm & Cinematic Storytelling',
    durationEst: '8-10 seconds',
    text: 'The sun had dipped below the horizon, casting a warm golden glow across the quiet valley. As the evening breeze whispered through the ancient pines, every sound felt intimate, clear, and alive.',
  },
  {
    id: 'script-2',
    category: 'Podcast & Conversational',
    title: 'Natural & Confident Host',
    durationEst: '9-12 seconds',
    text: "Welcome back, everyone. Today we're exploring how natural storytelling and modern technology converge. When you speak with clarity and intention, listeners don't just hear the words—they truly connect.",
  },
  {
    id: 'script-3',
    category: 'Commercial & Executive',
    title: 'Crisp & Authoritative Voiceover',
    durationEst: '7-9 seconds',
    text: "Imagine a world where your ideas resonate with effortless power. Clear, persuasive, and unmistakably human. It's time to let your true voice be heard.",
  },
];

export const VoiceCloneModal: React.FC<VoiceCloneModalProps> = ({
  isOpen,
  onClose,
  onVoiceCreated,
}) => {
  const [name, setName] = useState('');
  const [accent, setAccent] = useState('American (Natural)');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recordedPreviewUrl, setRecordedPreviewUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Demo Script Teleprompter state
  const [selectedScriptIndex, setSelectedScriptIndex] = useState(0);
  const [copiedScript, setCopiedScript] = useState(false);

  // Mic recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const currentScript = DEMO_SCRIPTS[selectedScriptIndex];

  const handleCopyScript = () => {
    navigator.clipboard.writeText(currentScript.text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      setError(null);
      if (recordedPreviewUrl) {
        URL.revokeObjectURL(recordedPreviewUrl);
        setRecordedPreviewUrl(null);
      }
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const file = new File([audioBlob], `voice_sample_${Date.now()}.wav`, {
          type: 'audio/wav',
        });
        setAudioFile(file);
        const url = URL.createObjectURL(audioBlob);
        setRecordedPreviewUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      recordTimerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError('Microphone access denied or not supported.');
    }
  };

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    }
  };

  // Play/Pause recorded sample preview
  const togglePlayPreview = () => {
    if (!recordedPreviewUrl) return;
    if (isPlayingPreview && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      const audio = new Audio(recordedPreviewUrl);
      previewAudioRef.current = audio;
      audio.play();
      setIsPlayingPreview(true);
      audio.onended = () => setIsPlayingPreview(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      setRecordedPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Submit Voice Cloning
  const handleClone = async () => {
    if (!name.trim()) {
      setError('Please provide a name for your cloned voice.');
      return;
    }
    if (!audioFile) {
      setError('Please provide an audio sample (record using demo script or upload).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('accent', accent.trim());
      formData.append('description', description.trim() || 'Custom instant cloned voice');
      formData.append('audio', audioFile);

      const res = await fetch('/api/voices/clone', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to clone voice.');
      }

      setAnalysisResult(data.analysis);
      onVoiceCreated(data.voice);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Voice cloning failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-studio-700 bg-studio-900 p-6 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Instant Voice Cloning</h2>
            <p className="text-xs text-slate-400">
              Read the teleprompter script below or upload a voice sample for high-fidelity cloning
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {analysisResult && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>
              Voice acoustic profile extracted! Timbre: &quot;{analysisResult.timbre}&quot; ({analysisResult.gender}, {analysisResult.estimated_pitch_hz}Hz).
            </span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Voice Name & Accent */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-300">
                Voice Actor Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. David / My Voice"
                className="w-full rounded-lg border border-studio-700 bg-studio-800 p-2.5 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-300">
                Accent / Tone
              </label>
              <input
                type="text"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                placeholder="e.g. American / Deep / Warm"
                className="w-full rounded-lg border border-studio-700 bg-studio-800 p-2.5 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* TELEPROMPTER SCRIPT BOX */}
          <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-purple-400" />
                <span className="font-semibold text-purple-300">
                  Demo Teleprompter Script (Read Aloud)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-purple-400/80">
                  ~{currentScript.durationEst}
                </span>
                <button
                  onClick={handleCopyScript}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  title="Copy script"
                >
                  {copiedScript ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>

            {/* Script Selector Tabs */}
            <div className="flex gap-1.5 mb-2.5">
              {DEMO_SCRIPTS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScriptIndex(idx)}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                    selectedScriptIndex === idx
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-studio-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s.title.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Teleprompter Script Text */}
            <div className="rounded-lg border border-purple-500/20 bg-studio-950/70 p-3 leading-relaxed text-sm text-slate-100 font-serif italic selection:bg-purple-600">
              &quot;{currentScript.text}&quot;
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400">
              💡 Tip: Click &quot;Record Voice&quot; below, read this natural text smoothly, and stop. The model analyzes vocal timbre, pitch, and acoustic resonance.
            </p>
          </div>

          {/* RECORDING / UPLOAD CONTROLS */}
          <div>
            <label className="mb-1.5 block font-semibold text-slate-300">
              Voice Sample Capture *
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Record Mic with Live Pulse */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-studio-700 bg-studio-800/70 p-4 text-center">
                {isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="flex flex-col items-center text-rose-400 hover:text-rose-300 group"
                  >
                    <div className="relative mb-1">
                      <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-75" />
                      <Square className="h-6 w-6 fill-rose-500 text-rose-500 relative z-10" />
                    </div>
                    <span className="font-bold text-xs">Stop Recording ({recordDuration}s)</span>
                    <span className="text-[10px] text-rose-300 mt-0.5">Reading teleprompter...</span>
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    className="flex flex-col items-center text-purple-400 hover:text-purple-300 group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600/20 group-hover:bg-purple-600/30 mb-1 transition-colors">
                      <Mic className="h-5 w-5 text-purple-400" />
                    </div>
                    <span className="font-semibold text-slate-200 text-xs">Record Demo Script</span>
                    <span className="text-[10px] text-slate-400">Microphone capture</span>
                  </button>
                )}
              </div>

              {/* Upload File */}
              <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-studio-700 bg-studio-800/70 p-4 text-center cursor-pointer hover:border-purple-500/50 hover:bg-studio-800 transition-all">
                <Upload className="h-5 w-5 text-purple-400 mb-1" />
                <span className="font-semibold text-slate-200 text-xs">Upload Audio</span>
                <span className="text-[10px] text-slate-400">WAV, MP3, or M4A</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Audio Preview Pill */}
            {audioFile && (
              <div className="mt-2.5 flex items-center justify-between rounded-lg border border-purple-500/30 bg-purple-950/30 p-2 text-slate-200">
                <div className="flex items-center gap-2 truncate">
                  <button
                    onClick={togglePlayPreview}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-500 shrink-0"
                    title={isPlayingPreview ? 'Pause sample' : 'Listen to recorded sample'}
                  >
                    {isPlayingPreview ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3 ml-0.5" />
                    )}
                  </button>
                  <FileAudio className="h-4 w-4 text-purple-400 shrink-0" />
                  <span className="truncate text-[11px] font-medium">{audioFile.name}</span>
                </div>
                <button
                  onClick={() => {
                    setAudioFile(null);
                    setRecordedPreviewUrl(null);
                  }}
                  className="text-slate-400 hover:text-rose-400 text-xs ml-2"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-studio-700/60 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleClone}
            disabled={isLoading || !name.trim() || !audioFile}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-all ${
              isLoading || !name.trim() || !audioFile
                ? 'cursor-not-allowed bg-studio-700 text-slate-400'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Extracting Voice DNA...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Clone & Save Voice</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
