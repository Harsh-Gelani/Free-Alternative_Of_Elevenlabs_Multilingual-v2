# Product Specification: ElevenLabs Multilingual v2 Clone ("ElevenVoice Studio")

## 1. Objective & Personas

### Problem Statement
Creators, developers, and global teams need high-fidelity, emotionally nuanced, multilingual speech synthesis across 29 languages without paying steep credit lock-in fees or facing opaque cloud latency.

### Primary Personas
- **Global Content Creator:** Needs expressive narration in English, Spanish, Hindi, Japanese, French, etc., with fine-tuned emotional pacing and voice stability.
- **AI Application Developer:** Needs an ElevenLabs-compatible API endpoint (`/v1/text-to-speech/{voice_id}`) with parameter parity (`model_id="eleven_multilingual_v2"`, `voice_settings`, `seed`, `similarity`, `stability`).
- **Voice Designer / Producer:** Needs instant voice cloning from audio samples and a rich library of curated presets with instant waveform preview.

---

## 2. Feature Parity Matrix (Tiered)

| Feature | Target (ElevenLabs Multilingual v2) | Clone Implementation | Priority |
| :--- | :--- | :--- | :--- |
| **Multilingual v2 Model Core** | 29 languages, emotional context from text | 29 languages selector, multilingual synthesis, SSML pause tags (`<break time="..."/>`), emotion tag parsing | **P0** |
| **Voice Settings** | Stability (0-1), Similarity (0-1), Style (0-1), Speaker Boost (bool) | Exact slider controls with real-time audio prosody & acoustic modulation | **P0** |
| **Preset Voice Library** | Adam, Rachel, Antoni, Bella, Arnold, Domi, Elli, Josh, Nicole | 12+ built-in signature preset voices with tags (gender, accent, use case, audio samples) | **P0** |
| **Speech Generation Studio** | Text box (up to 10k chars), generate button, instant audio synthesis | Modern Next.js studio, real-time char count, instant synthesis with downloadable audio | **P0** |
| **Waveform Audio Player** | Interactive waveform, scrubbing, speed control, download | Canvas 60fps audio waveform, play/pause, scrub, playback rate (0.5x - 2x), MP3/WAV download | **P0** |
| **Dual Engine (API + Zero-Key)** | Cloud API requiring paid subscription | Dual Engine: Direct ElevenLabs API proxy OR Zero-Config Neural/Web/Edge synthesis fallback | **P0** |
| **Instant Voice Cloning** | Upload sample audio, name, description, create custom voice | Audio file upload / Mic recorder, acoustic timbre extraction, persistent cloned voices | **P1** |
| **History & Generation Logs** | Past generation history with playback & re-use | Persistent SQLite / LocalStorage history log with playback, metadata, and re-run parameters | **P1** |
| **API Code Export** | Copy Python, Node.js, cURL snippets | Interactive code generator matching ElevenLabs SDK syntax | **P1** |
| **Pronunciation Dictionary** | Phoneme and replacement rules | Custom dictionary replacement rules before synthesis | **P2** |
| **Audio Quality & Formats** | MP3 (128k, 192k), WAV (44.1kHz), PCM | Multi-format export (MP3, WAV 44.1kHz) | **P2** |

---

## 3. Core User Journeys

### Journey 1: Multilingual Speech Synthesis (P0)
1. User selects language (e.g. Spanish `es`, Japanese `ja`, Hindi `hi`, English `en`).
2. User chooses voice from voice library (e.g. "Rachel - Calming & Narrative" or "Adam - Deep Narration").
3. User tunes Voice Settings:
   - Stability: 0.50 (balanced expressiveness)
   - Similarity: 0.75
   - Style Exaggeration: 0.20
   - Speaker Boost: On
4. User enters text (with optional `<break time="1.0s" />` pauses).
5. User clicks "Generate Speech".
6. Engine synthesizes audio buffer, renders interactive waveform, and plays audio automatically.
7. User can scrub waveform, change playback speed, or download MP3/WAV.

### Journey 2: Instant Voice Cloning (P1)
1. User clicks "Add Voice" / "Clone Voice".
2. User provides name (e.g. "David - Host"), description, tags (e.g. "British", "Energetic").
3. User uploads sample WAV/MP3 or records 10-30s from microphone.
4. Voice engine analyzes audio characteristics (pitch, fundamental frequency, timbre).
5. New custom voice appears instantly in Voice Selector and is saved to persistent store.

### Journey 3: Generation History & Regeneration (P1)
1. Every generated clip is saved to History with audio blob, timestamp, voice ID, character count, and settings.
2. User can browse history, filter by voice or language, play clips inline, copy original text, or restore exact voice settings.

---

## 4. Page & Component Hierarchy

```
app/
├── layout.tsx                # Global theme, font, toast provider
├── page.tsx                  # Main ElevenLabs Multilingual Studio
├── api/
│   ├── tts/
│   │   ├── generate/route.ts # POST synthesis endpoint (ElevenLabs API + local neural fallback)
│   │   └── edge/route.ts     # High-fidelity Edge Neural TTS proxy for 29 languages
│   ├── voices/
│   │   └── route.ts          # GET preset voices, POST custom cloned voice
│   └── history/
│       └── route.ts          # GET / POST / DELETE history items
components/
├── Header.tsx                # Studio navbar, model indicator (eleven_multilingual_v2), API Key modal
├── Studio/
│   ├── TextEditor.tsx        # Script textarea, char counter (up to 10k), SSML helper chips
│   ├── VoiceSelector.tsx     # Voice dropdown/modal with preview chimes, search, badges
│   ├── VoiceSettingsModal.tsx# Stability, Similarity, Style, Speaker Boost sliders with descriptions
│   ├── LanguageSelector.tsx  # 29 supported languages with auto-detect toggle
│   ├── AudioPlayer.tsx       # Canvas waveform visualizer, scrubber, speed (0.5x-2x), download
│   └── GenerateBar.tsx       # Character quota, model badge, Generate button with loading spinner
├── Library/
│   ├── VoiceCloneModal.tsx   # Audio file uploader / mic recorder, name, tags
│   └── VoiceCard.tsx         # Voice preset card with sample playback
├── History/
│   └── HistoryDrawer.tsx     # Past generations list, search, inline play, restore settings
└── ApiModal/
    └── ApiCodeModal.tsx      # Export to cURL, Python, TypeScript
```

---

## 5. Data Schema & Models

### Voice Model
```typescript
interface Voice {
  id: string;
  name: string;
  category: 'premade' | 'cloned';
  gender: 'male' | 'female' | 'neutral';
  accent: string;
  description: string;
  useCase: string;
  previewAudioUrl?: string;
  avatarColor: string;
  defaultSettings: VoiceSettings;
}
```

### Voice Settings
```typescript
interface VoiceSettings {
  stability: number;        // 0.0 to 1.0 (lower = more emotional/variable, higher = stable)
  similarity_boost: number; // 0.0 to 1.0 (voice clarity & resemblance)
  style: number;            // 0.0 to 1.0 (style exaggeration)
  use_speaker_boost: boolean; // boolean
  seed?: number;            // optional deterministic seed
}
```

### Generation Record
```typescript
interface GenerationHistoryItem {
  id: string;
  timestamp: number;
  text: string;
  voiceId: string;
  voiceName: string;
  language: string;
  modelId: 'eleven_multilingual_v2';
  settings: VoiceSettings;
  durationSeconds: number;
  audioUrl: string;
  characterCount: number;
}
```

---

## 6. API Contracts

### `POST /api/tts/generate`
**Request Payload:**
```json
{
  "text": "Hello world, welcome to ElevenLabs Multilingual v2.",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "model_id": "eleven_multilingual_v2",
  "language_code": "en",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": true,
    "seed": 42
  },
  "api_key": "optional_user_elevenlabs_key"
}
```
**Response:**
- `Content-Type: audio/mpeg` or `audio/wav` with audio binary buffer.
- Response headers: `X-Generation-Duration`, `X-Character-Count`, `X-Synthesis-Engine`.

---

## 7. Acceptance Criteria (Pass/Fail)

1. **29 Languages:** Complete dropdown with all 29 official ElevenLabs Multilingual v2 languages.
2. **Text to Speech Synthesis:** User inputs text, clicks Generate -> Audible voice plays in browser.
3. **Zero-Key Execution:** Works immediately out-of-the-box even without an external API key.
4. **Custom API Key Support:** User can plug in real ElevenLabs API key for direct 1:1 official inference.
5. **Interactive Waveform:** 60fps canvas waveform with scrubable progress, play/pause, timecode, and playback speed selector.
6. **Voice Settings Sliders:** Real sliders for Stability, Similarity, Style Exaggeration, and Speaker Boost with tooltips explaining effects.
7. **Voice Cloning:** User can add a custom voice by uploading an audio sample or recording mic audio.
8. **Generation History:** Persisted generation log allows re-playing past audio and downloading files.
9. **Code Snippets:** One-click copy for cURL, Python, Node.js API requests.
