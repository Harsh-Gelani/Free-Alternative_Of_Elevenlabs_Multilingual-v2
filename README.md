# ElevenLabs Multilingual v2 Clone (Voice Output Model)

> 100% Local, zero-external-API clone of **ElevenLabs Multilingual v2** (`eleven_multilingual_v2`) text-to-speech engine running directly on your Windows PC.

---

## 🌟 Key Capabilities

- **29 Supported Languages:**
  - English (US, UK, AU, CA), Japanese, Chinese (Mandarin), German, Hindi, French, Korean, Portuguese, Italian, Spanish, Indonesian, Dutch, Turkish, Filipino, Polish, Swedish, Bulgarian, Romanian, Arabic, Czech, Greek, Finnish, Croatian, Malay, Slovak, Danish, Tamil, Ukrainian, and Russian.
- **Zero API Keys & 100% Free:**
  - Powered by local neural synthesis (`edge-tts` / Azure neural speech models). Runs completely offline without credit limits or external subscriptions.
- **10,000 Character Support:**
  - Handles long-form scripts and audiobooks with automatic sentence chunking and prosody preservation.
- **Voice Settings Parity:**
  - **Stability** (0.0 to 1.0): Control emotional expressiveness vs. consistent delivery.
  - **Similarity** (0.0 to 1.0): Fine-tune target voice clarity and resemblance.
  - **Style Exaggeration** (0.0 to 1.0): Inject dramatic energy or neutral pacing.
  - **Speaking Speed** (0.5x to 2.0x): Adjust tempo from deliberate slow to accelerated.
  - **Speaker Boost**: High-frequency presence enhancement.
- **SSML & Natural Breaks:**
  - Full support for pause tags like `<break time="1.0s" />` directly in text.
- **Signature Voice Actors:**
  - Adam (Deep Narration), Rachel (Calm Audiobooks), Antoni (Dynamic Storytelling), Bella (Soft & Sweet), Arnold (Crisp E-Learning), Elli (Youthful Animation), George (British Documentary), Freya (British Elegance).
- **Instant Voice Cloning Studio:**
  - Record or upload 1-5 second audio samples to extract F0 pitch, speaking tempo, and acoustic timbre. Single cloned voice speaks across all 29 languages!
- **Interactive Waveform Player:**
  - 60fps canvas waveform visualizer, scrubber, speed control (0.75x - 1.5x), volume control, and one-click MP3 download.
- **API & Code Snippet Generator:**
  - Ready-to-copy code in cURL, Python (`requests`), and Node.js (`fetch`).

---

## 🚀 Quick Start

### 1. Requirements
- Node.js 18+ (tested on Node v24)
- Python 3.10+ (tested on Python 3.11 with `edge-tts`, `numpy`, `scipy`)

### 2. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser.

### 3. Production Build & Start
```bash
npm run build
npm run start
```

---

## 📡 API Endpoint

### `POST /api/tts/generate`

#### Request Payload:
```json
{
  "text": "In the heart of the ancient forest, shadows danced among towering pines.",
  "voice_id": "adam-multilingual",
  "model_id": "eleven_multilingual_v2",
  "language_code": "en",
  "voice_settings": {
    "stability": 0.50,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": true,
    "speed": 1.0
  }
}
```

#### Response:
```json
{
  "success": true,
  "audio_base64": "data:audio/mp3;base64,...",
  "duration_seconds": 6.5,
  "file_size": 39024,
  "character_count": 76,
  "voice_id": "adam-multilingual",
  "voice_name": "Adam",
  "language_code": "en",
  "model_id": "eleven_multilingual_v2"
}
```
