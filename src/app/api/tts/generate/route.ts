import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { PRESET_VOICES, getVoiceById, getNeuralVoiceForLanguage } from '@/lib/voices';
import { VoiceSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      voice_id = 'adam-multilingual',
      language_code = 'en',
      voice_settings = {},
      custom_voice,
    } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum limit of 10,000 characters' },
        { status: 400 }
      );
    }

    // Resolve voice model
    let targetVoice = PRESET_VOICES.find(v => v.id === voice_id);
    if (!targetVoice && custom_voice) {
      targetVoice = custom_voice;
    }
    if (!targetVoice) {
      targetVoice = PRESET_VOICES[0];
    }

    // Resolve native neural model and persona pitch calibration for selected language (out of 29)
    const { voiceCode: neuralVoice, pitchOffset: calibratedPitch } = getNeuralVoiceForLanguage(targetVoice, language_code);

    // Calculate rate parameter based on speed (0.5x to 2.0x)
    const speed = voice_settings.speed ?? targetVoice.defaultSettings.speed ?? 1.0;
    const speedPercent = Math.round((speed - 1.0) * 100);
    const rateStr = `${speedPercent >= 0 ? '+' : ''}${speedPercent}%`;

    // Calculate pitch parameter
    let pitchStr = calibratedPitch || '+0Hz';
    if (targetVoice.clonedMetrics?.pitchOffset) {
      pitchStr = targetVoice.clonedMetrics.pitchOffset;
    }

    // Volume & Speaker Boost
    const useSpeakerBoost = voice_settings.use_speaker_boost ?? targetVoice.defaultSettings.use_speaker_boost ?? true;
    const volumeStr = useSpeakerBoost ? '+10%' : '+0%';

    // Temp output file
    const tempDir = os.tmpdir();
    const filename = `eleven_synth_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
    const outputPath = path.join(tempDir, filename);

    // Path to python script
    const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'synthesizer.py');

    const synthPayload = {
      text: text.trim(),
      voice: neuralVoice,
      rate: rateStr,
      pitch: pitchStr,
      volume: volumeStr,
      stability: voice_settings.stability ?? targetVoice.defaultSettings.stability ?? 0.5,
      similarity: voice_settings.similarity_boost ?? targetVoice.defaultSettings.similarity_boost ?? 0.75,
      style: voice_settings.style ?? targetVoice.defaultSettings.style ?? 0.0,
      speaker_boost: useSpeakerBoost,
      human_prosody: voice_settings.human_breathing !== false,
      output_path: outputPath,
    };

    // Execute Python neural synthesizer locally
    const synthResult = await new Promise<{
      success: boolean;
      duration_seconds: number;
      file_size: number;
      characters_count: number;
      error?: string;
    }>((resolve, reject) => {
      const pyProc = spawn('python', [scriptPath]);
      let stdoutData = '';
      let stderrData = '';

      pyProc.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString('utf-8');
      });

      pyProc.stderr.on('data', (chunk) => {
        stderrData += chunk.toString('utf-8');
      });

      pyProc.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(stderrData || `Python synthesizer exited with code ${code}`));
        }
        try {
          const parsed = JSON.parse(stdoutData.trim());
          if (parsed.error) {
            return reject(new Error(parsed.error));
          }
          resolve(parsed);
        } catch (err) {
          reject(new Error(`Failed to parse synthesizer output: ${stdoutData} (error: ${err})`));
        }
      });

      // Send payload via stdin
      pyProc.stdin.write(JSON.stringify(synthPayload));
      pyProc.stdin.end();
    });

    // Read audio buffer
    if (!fs.existsSync(outputPath)) {
      return NextResponse.json(
        { error: 'Synthesized audio file was not generated.' },
        { status: 500 }
      );
    }

    const audioBuffer = fs.readFileSync(outputPath);
    const audioBase64 = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;

    // Clean up temp file
    try {
      fs.unlinkSync(outputPath);
    } catch {
      // ignore cleanup error
    }

    return NextResponse.json({
      success: true,
      audio_base64: audioBase64,
      duration_seconds: synthResult.duration_seconds,
      file_size: synthResult.file_size,
      character_count: text.length,
      voice_id: targetVoice.id,
      voice_name: targetVoice.name,
      language_code,
      model_id: 'eleven_multilingual_v2',
      settings: {
        stability: synthPayload.stability,
        similarity_boost: synthPayload.similarity,
        style: synthPayload.style,
        use_speaker_boost: synthPayload.speaker_boost,
        speed,
      },
    });

  } catch (error: any) {
    console.error('Synthesis error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal speech synthesis error' },
      { status: 500 }
    );
  }
}
