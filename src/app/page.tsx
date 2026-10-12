'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { VoiceSelector } from '@/components/Studio/VoiceSelector';
import { LanguageSelector } from '@/components/Studio/LanguageSelector';
import { VoiceSettings } from '@/components/Studio/VoiceSettings';
import { ScriptEditor } from '@/components/Studio/ScriptEditor';
import { WaveformPlayer } from '@/components/Studio/WaveformPlayer';
import { ControlBar } from '@/components/Studio/ControlBar';
import { VoiceLibraryModal } from '@/components/VoiceLibraryModal';
import { VoiceCloneModal } from '@/components/VoiceCloneModal';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { ApiExportModal } from '@/components/ApiExportModal';

import { PRESET_VOICES } from '@/lib/voices';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '@/lib/languages';
import { Voice, Language, VoiceSettings as VoiceSettingsType, GenerationHistoryItem } from '@/lib/types';
import {
  getSavedVoices,
  saveCustomVoice,
  deleteCustomVoice,
  getHistory,
  addHistoryItem,
  deleteHistoryItem,
  clearHistory,
} from '@/lib/storage';

export default function StudioPage() {
  // Voice & Language selection
  const [customVoices, setCustomVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(PRESET_VOICES[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);

  // Voice Settings
  const [settings, setSettings] = useState<VoiceSettingsType>(PRESET_VOICES[0].defaultSettings);

  // Script text & generation
  const [text, setText] = useState<string>(
    'Welcome to ElevenLabs Multilingual v2. This model generates lifelike, emotionally rich voiceovers across 29 languages. Running completely local on your PC with zero external APIs.'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // History
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);

  // Modals state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  // Initialize saved custom voices and history from local storage
  useEffect(() => {
    const saved = getSavedVoices();
    setCustomVoices(saved);
    const hist = getHistory();
    setHistory(hist);
  }, []);

  // Update voice settings when voice changes
  const handleSelectVoice = (voice: Voice) => {
    setSelectedVoice(voice);
    setSettings(voice.defaultSettings);
  };

  // Reset settings
  const handleResetSettings = () => {
    setSettings(selectedVoice.defaultSettings);
  };

  // Handle language switch
  const handleSelectLanguage = (lang: Language) => {
    setSelectedLanguage(lang);
  };

  // Load language sample
  const handleLoadSample = (sampleText: string) => {
    setText(sampleText);
  };

  // Voice cloning callback
  const handleVoiceCreated = (newVoice: Voice) => {
    const updated = saveCustomVoice(newVoice);
    setCustomVoices(updated);
    setSelectedVoice(newVoice);
    setSettings(newVoice.defaultSettings);
  };

  // Delete custom voice
  const handleDeleteCustomVoice = (id: string) => {
    const updated = deleteCustomVoice(id);
    setCustomVoices(updated);
    if (selectedVoice.id === id) {
      setSelectedVoice(PRESET_VOICES[0]);
      setSettings(PRESET_VOICES[0].defaultSettings);
    }
  };

  // History callbacks
  const handleLoadHistoryItem = (item: GenerationHistoryItem) => {
    setText(item.text);
    const matchedVoice = [...PRESET_VOICES, ...customVoices].find((v) => v.id === item.voiceId);
    if (matchedVoice) {
      setSelectedVoice(matchedVoice);
    }
    const matchedLang = getLanguageByCode(item.languageCode);
    if (matchedLang) {
      setSelectedLanguage(matchedLang);
    }
    setSettings(item.settings);
    setAudioUrl(item.audioUrl);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  // Execute Speech Synthesis
  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice_id: selectedVoice.id,
          model_id: 'eleven_multilingual_v2',
          language_code: selectedLanguage.code,
          voice_settings: settings,
          custom_voice: selectedVoice.category === 'cloned' ? selectedVoice : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Speech synthesis failed');
      }

      const generatedAudio = data.audio_base64;
      setAudioUrl(generatedAudio);

      // Save to generation history
      const historyRecord: GenerationHistoryItem = {
        id: `gen-${Date.now()}`,
        timestamp: Date.now(),
        text: text.trim(),
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        languageCode: selectedLanguage.code,
        languageName: selectedLanguage.name,
        modelId: 'eleven_multilingual_v2',
        settings,
        audioUrl: generatedAudio,
        fileSize: data.file_size || 0,
        durationSeconds: data.duration_seconds || 0,
        characterCount: text.length,
      };

      const updatedHistory = addHistoryItem(historyRecord);
      setHistory(updatedHistory);

    } catch (err: any) {
      console.error('Synthesis failed:', err);
      setError(err.message || 'Speech generation encountered an error.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Keyboard shortcut Ctrl + Enter to generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, selectedVoice, selectedLanguage, settings, isGenerating]);

  const allVoices = [...customVoices, ...PRESET_VOICES];

  return (
    <div className="min-h-screen bg-studio-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        onOpenVoiceLibrary={() => setIsLibraryOpen(true)}
        onOpenVoiceClone={() => setIsCloneOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenApiExport={() => setIsApiModalOpen(true)}
        historyCount={history.length}
      />

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Script & Waveform Output (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Script Text Editor */}
            <ScriptEditor
              text={text}
              onChange={setText}
              onClear={() => setText('')}
              characterLimit={10000}
            />

            {/* Action Bar (Generate Button & Status) */}
            <ControlBar
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              charCount={text.length}
              disabled={text.trim().length === 0}
              error={error}
            />

            {/* Waveform Player */}
            <WaveformPlayer
              audioUrl={audioUrl}
              voiceName={selectedVoice.name}
              languageName={selectedLanguage.name}
            />
          </div>

          {/* Right Column: Voice & Settings Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Voice Actor Selector */}
            <VoiceSelector
              selectedVoice={selectedVoice}
              allVoices={allVoices}
              onSelectVoice={handleSelectVoice}
              onOpenLibrary={() => setIsLibraryOpen(true)}
              onOpenClone={() => setIsCloneOpen(true)}
            />

            {/* Target Language Selector (29 Languages) */}
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onSelectLanguage={handleSelectLanguage}
              onLoadSample={handleLoadSample}
            />

            {/* ElevenLabs Multilingual v2 Voice Settings */}
            <VoiceSettings
              settings={settings}
              onChange={setSettings}
              onReset={handleResetSettings}
            />
          </div>
        </div>
      </main>

      {/* Modals & Drawers */}
      <VoiceLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        voices={allVoices}
        selectedVoiceId={selectedVoice.id}
        onSelectVoice={handleSelectVoice}
        onDeleteCustomVoice={handleDeleteCustomVoice}
        onOpenCloneModal={() => {
          setIsLibraryOpen(false);
          setIsCloneOpen(true);
        }}
      />

      <VoiceCloneModal
        isOpen={isCloneOpen}
        onClose={() => setIsCloneOpen(false)}
        onVoiceCreated={handleVoiceCreated}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadItem={handleLoadHistoryItem}
        onDeleteItem={handleDeleteHistory}
        onClearHistory={handleClearHistory}
      />

      <ApiExportModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        text={text}
        voice={selectedVoice}
        languageCode={selectedLanguage.code}
        settings={settings}
      />
    </div>
  );
}
