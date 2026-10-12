'use client';

import React, { useState } from 'react';
import { Voice, VoiceSettings } from '@/lib/types';
import { X, Copy, Check, Terminal, Code } from 'lucide-react';

interface ApiExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  voice: Voice;
  languageCode: string;
  settings: VoiceSettings;
}

export const ApiExportModal: React.FC<ApiExportModalProps> = ({
  isOpen,
  onClose,
  text,
  voice,
  languageCode,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'curl' | 'python' | 'javascript'>('python');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleText = text.trim() || 'Hello from ElevenLabs Multilingual v2 clone!';

  const curlCode = `curl -X POST "http://localhost:3001/api/tts/generate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": ${JSON.stringify(sampleText)},
    "voice_id": "${voice.id}",
    "model_id": "eleven_multilingual_v2",
    "language_code": "${languageCode}",
    "voice_settings": {
      "stability": ${settings.stability},
      "similarity_boost": ${settings.similarity_boost},
      "style": ${settings.style},
      "use_speaker_boost": ${settings.use_speaker_boost},
      "speed": ${settings.speed}
    }
  }' \\
  --output "output.mp3"`;

  const pythonCode = `import requests

url = "http://localhost:3001/api/tts/generate"

payload = {
    "text": ${JSON.stringify(sampleText)},
    "voice_id": "${voice.id}",
    "model_id": "eleven_multilingual_v2",
    "language_code": "${languageCode}",
    "voice_settings": {
        "stability": ${settings.stability},
        "similarity_boost": ${settings.similarity_boost},
        "style": ${settings.style},
        "use_speaker_boost": ${settings.use_speaker_boost ? 'True' : 'False'},
        "speed": ${settings.speed}
    }
}

response = requests.post(url, json=payload)
data = response.json()

if data.get("success"):
    import base64
    audio_base64 = data["audio_base64"].split(",")[1]
    with open("output.mp3", "wb") as f:
        f.write(base64.b64decode(audio_base64))
    print(f"Speech generated successfully: {data['duration_seconds']}s")
else:
    print("Error:", data.get("error"))`;

  const jsCode = `async function generateSpeech() {
  const response = await fetch("http://localhost:3001/api/tts/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: ${JSON.stringify(sampleText)},
      voice_id: "${voice.id}",
      model_id: "eleven_multilingual_v2",
      language_code: "${languageCode}",
      voice_settings: {
        stability: ${settings.stability},
        similarity_boost: ${settings.similarity_boost},
        style: ${settings.style},
        use_speaker_boost: ${settings.use_speaker_boost},
        speed: ${settings.speed}
      }
    })
  });

  const data = await response.json();
  if (data.success) {
    const audio = new Audio(data.audio_base64);
    audio.play();
  }
}

generateSpeech();`;

  const getCode = () => {
    switch (activeTab) {
      case 'curl':
        return curlCode;
      case 'python':
        return pythonCode;
      case 'javascript':
        return jsCode;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-studio-700 bg-studio-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-studio-700/80 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">API & Code Export</h2>
              <p className="text-xs text-slate-400">
                1:1 ElevenLabs Multilingual v2 payload executed 100% locally on your machine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-studio-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center justify-between border-b border-studio-700/60 px-5 pt-3 bg-studio-950/40">
          <div className="flex gap-2">
            {(['python', 'javascript', 'curl'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 rounded-lg border border-studio-700 bg-studio-800 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-studio-700 hover:text-white transition-all mb-2"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code View */}
        <div className="p-5">
          <pre className="max-h-96 overflow-x-auto rounded-xl border border-studio-800 bg-studio-950 p-4 font-mono text-xs text-purple-200/90 leading-relaxed">
            {getCode()}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-studio-700/80 p-4 text-xs text-slate-400 bg-studio-950/60 rounded-b-2xl">
          <span>
            Model ID: <code className="text-purple-400 font-mono">eleven_multilingual_v2</code>
          </span>
          <span className="text-emerald-400 font-medium">
            Local endpoint active on port 3001
          </span>
        </div>
      </div>
    </div>
  );
};
