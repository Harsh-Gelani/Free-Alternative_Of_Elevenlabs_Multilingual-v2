export interface VoiceSettings {
  stability: number;          // 0.0 to 1.0 (lower = more emotional variance, higher = consistent)
  similarity_boost: number;   // 0.0 to 1.0 (fidelity / clarity)
  style: number;              // 0.0 to 1.0 (style exaggeration)
  use_speaker_boost: boolean; // boolean
  speed: number;              // 0.5 to 2.0 (playback/speaking rate)
  human_breathing?: boolean;  // Natural respiration pauses and human micro-prosody
}

export interface Voice {
  id: string;
  name: string;
  category: 'premade' | 'cloned';
  gender: 'male' | 'female' | 'neutral';
  accent: string;
  description: string;
  useCase: string;
  neuralVoiceMap: Record<string, string>; // Maps language code (e.g. 'en', 'hi', 'ja') to native neural voice model
  baseNeuralVoice: string;                // Default voice code
  avatarColor: string;
  sampleAudioUrl?: string;
  defaultSettings: VoiceSettings;
  clonedMetrics?: {
    pitchOffset: string;
    rateOffset: string;
    timbre: string;
    estimatedPitchHz: number;
  };
}

export interface Language {
  code: string;            // ISO 639-1 e.g. 'en', 'hi', 'ja', 'es'
  locale: string;          // e.g. 'en-US', 'hi-IN', 'ja-JP'
  name: string;            // e.g. 'English (US)', 'Hindi', 'Japanese'
  nativeName: string;      // e.g. 'English', 'हिन्दी', '日本語'
  flag: string;            // Flag emoji
  sampleText: string;      // Realistic preview prompt
}

export interface GenerationHistoryItem {
  id: string;
  timestamp: number;
  text: string;
  voiceId: string;
  voiceName: string;
  languageCode: string;
  languageName: string;
  modelId: 'eleven_multilingual_v2';
  settings: VoiceSettings;
  audioUrl: string;
  fileSize: number;
  durationSeconds: number;
  characterCount: number;
}

export interface SynthesisRequest {
  text: string;
  voice_id: string;
  model_id?: 'eleven_multilingual_v2';
  language_code?: string;
  voice_settings?: Partial<VoiceSettings>;
}

export interface SynthesisResponse {
  success: boolean;
  audio_base64?: string;
  audio_url?: string;
  duration_seconds: number;
  character_count: number;
  voice_id: string;
  voice_name: string;
  language_code: string;
  model_id: 'eleven_multilingual_v2';
  settings: VoiceSettings;
  error?: string;
}
