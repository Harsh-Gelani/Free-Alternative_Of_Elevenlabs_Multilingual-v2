'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

interface WaveformPlayerProps {
  audioUrl: string | null;
  voiceName?: string;
  languageName?: string;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioUrl,
  voiceName = 'Adam',
  languageName = 'English',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Web Audio API DSP Mastering Chain Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const lowshelfNodeRef = useRef<BiquadFilterNode | null>(null);
  const deEsserNodeRef = useRef<BiquadFilterNode | null>(null);
  const highshelfNodeRef = useRef<BiquadFilterNode | null>(null);
  const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Studio Mastering DSP Toggle (Enabled by default for true human voiceover sound)
  const [isStudioMastered, setIsStudioMastered] = useState(true);

  // Pseudo waveform bars
  const barsCount = 70;
  const waveformBars = useRef<number[]>(
    Array.from({ length: barsCount }, () => Math.max(0.18, Math.random() * 0.82 + 0.12))
  ).current;

  // Setup Web Audio API mastering chain
  const setupAudioGraph = (audio: HTMLAudioElement) => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const source = ctx.createMediaElementSource(audio);
        sourceNodeRef.current = source;

        // 1. Highpass (sub-rumble cut at 45Hz)
        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 45;

        // 2. Lowshelf Warmth (150Hz proximity effect, +2.4dB)
        const lowshelf = ctx.createBiquadFilter();
        lowshelf.type = 'lowshelf';
        lowshelf.frequency.value = 150;
        lowshelf.gain.value = 2.4;
        lowshelfNodeRef.current = lowshelf;

        // 3. De-Esser (6.5kHz notch dip to eliminate synthetic sibilance, -2.8dB)
        const deEsser = ctx.createBiquadFilter();
        deEsser.type = 'peaking';
        deEsser.frequency.value = 6500;
        deEsser.Q.value = 2.2;
        deEsser.gain.value = -2.8;
        deEsserNodeRef.current = deEsser;

        // 4. Highshelf Vocal Air (11.5kHz silky air sheen, +1.8dB)
        const highshelf = ctx.createBiquadFilter();
        highshelf.type = 'highshelf';
        highshelf.frequency.value = 11500;
        highshelf.gain.value = 1.8;
        highshelfNodeRef.current = highshelf;

        // 5. Broadcast Dynamics Compressor (glues speech into studio podcast master)
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.knee.value = 25;
        compressor.ratio.value = 3.5;
        compressor.attack.value = 0.015;
        compressor.release.value = 0.14;
        compressorNodeRef.current = compressor;

        // Connect chain: Source -> Highpass -> Lowshelf -> DeEsser -> Highshelf -> Compressor -> Destination
        source.connect(highpass);
        highpass.connect(lowshelf);
        lowshelf.connect(deEsser);
        deEsser.connect(highshelf);
        highshelf.connect(compressor);
        compressor.connect(ctx.destination);
      }
    } catch (e) {
      console.warn('Web Audio DSP not initialized:', e);
    }
  };

  // Toggle Studio Mastered DSP
  useEffect(() => {
    if (lowshelfNodeRef.current && deEsserNodeRef.current && highshelfNodeRef.current) {
      if (isStudioMastered) {
        lowshelfNodeRef.current.gain.value = 2.4;
        deEsserNodeRef.current.gain.value = -2.8;
        highshelfNodeRef.current.gain.value = 1.8;
      } else {
        // Flat raw bypass
        lowshelfNodeRef.current.gain.value = 0;
        deEsserNodeRef.current.gain.value = 0;
        highshelfNodeRef.current.gain.value = 0;
      }
    }
  }, [isStudioMastered]);

  // Audio lifecycle
  useEffect(() => {
    if (!audioUrl) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioUrl]);

  // Play/Pause
  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (!audioContextRef.current && audioRef.current) {
      setupAudioGraph(audioRef.current);
    }

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  // Scrubbing
  const handleScrub = (e: React.MouseEvent<HTMLElement>) => {
    if (!canvasRef.current || !audioRef.current || duration === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percent * duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  // Speed
  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Volume
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Canvas waveform rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / barsCount;
      const progress = duration > 0 ? currentTime / duration : 0;

      for (let i = 0; i < barsCount; i++) {
        const barHeight = waveformBars[i] * height * 0.85;
        const x = i * barWidth;
        const y = (height - barHeight) / 2;
        const isPlayed = i / barsCount <= progress;

        // Dynamic purple or studio-glow styling
        if (isPlayed) {
          ctx.fillStyle = isStudioMastered ? '#a855f7' : '#818cf8';
        } else {
          ctx.fillStyle = '#222538';
        }

        ctx.beginPath();
        ctx.roundRect(x + 1, y, Math.max(1, barWidth - 2), barHeight, [2, 2, 2, 2]);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentTime, duration, waveformBars, isStudioMastered]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `eleven_${voiceName.toLowerCase()}_${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!audioUrl) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-studio-700/60 bg-studio-900/40 p-6 text-center text-xs text-slate-400">
        <div>
          <p className="font-medium text-slate-300">No Audio Generated Yet</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Write your script above and click &quot;Generate Speech&quot; to synthesize lifelike human voice.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-studio-700 bg-studio-900/95 p-4 shadow-xl">
      {/* Waveform Canvas */}
      <div className="relative mb-3 cursor-pointer" onClick={handleScrub}>
        <canvas
          ref={canvasRef}
          width={600}
          height={64}
          className="h-16 w-full rounded-lg bg-studio-950/60 transition-all hover:brightness-110"
        />
      </div>

      {/* Acoustic Mastering Bar */}
      <div className="mb-3 flex items-center justify-between rounded-lg border border-purple-500/20 bg-purple-950/20 px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span className="font-semibold text-purple-200 text-[11px]">
            Studio Acoustic Master
          </span>
          <span className="hidden sm:inline text-[10px] text-slate-400">
            (Neumann Mic Warmth + De-Esser + Broadcast Compressor)
          </span>
        </div>

        <button
          onClick={() => setIsStudioMastered(!isStudioMastered)}
          className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase transition-all ${
            isStudioMastered
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-studio-800 text-slate-400 hover:text-white'
          }`}
        >
          {isStudioMastered ? 'Mastered (Human)' : 'Bypass (Raw)'}
        </button>
      </div>

      {/* Player Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Play/Pause & Time */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 transition-transform hover:scale-105 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>

          <div className="font-mono text-xs text-slate-300">
            <span>{formatTime(currentTime)}</span>
            <span className="text-slate-500"> / </span>
            <span className="text-slate-400">{formatTime(duration)}</span>
          </div>

          <div className="hidden sm:block text-xs text-slate-400 border-l border-studio-700/60 pl-3">
            <span className="text-slate-200 font-medium">{voiceName}</span>
            <span className="text-slate-500"> ({languageName})</span>
          </div>
        </div>

        {/* Playback Speed */}
        <div className="flex items-center gap-1 rounded-lg border border-studio-700/80 bg-studio-800/80 p-0.5 text-xs">
          {[0.75, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => handleRateChange(rate)}
              className={`rounded px-2 py-0.5 font-mono text-[11px] transition-all ${
                playbackRate === rate
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume & Download */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 accent-purple-500 cursor-pointer h-1 bg-studio-700 rounded"
            />
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-studio-700 bg-studio-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-purple-500/50 hover:bg-studio-700 hover:text-white transition-all shadow-sm"
            title="Download studio mastered MP3 audio"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
