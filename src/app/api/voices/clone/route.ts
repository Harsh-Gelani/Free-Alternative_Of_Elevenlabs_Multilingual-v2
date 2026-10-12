import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { PRESET_VOICES } from '@/lib/voices';
import { Voice } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string || 'Custom Cloned Voice';
    const description = formData.get('description') as string || 'Instantly cloned voice profile';
    const accent = formData.get('accent') as string || 'Custom';
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'An audio sample is required for voice cloning' },
        { status: 400 }
      );
    }

    const tempDir = os.tmpdir();
    const tempAudioPath = path.join(tempDir, `clone_input_${Date.now()}.wav`);
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(tempAudioPath, buffer);

    // Call Python acoustic analyzer
    const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'voice_cloner.py');

    let analysisResult: any = {
      gender: 'male',
      estimated_pitch_hz: 130,
      timbre: 'Warm & Natural',
      pitch_offset: '+0Hz',
      recommended_stability: 0.50,
      recommended_similarity: 0.85,
    };

    try {
      const pyOutput = await new Promise<string>((resolve, reject) => {
        const proc = spawn('python', [scriptPath, tempAudioPath]);
        let out = '';
        let err = '';
        proc.stdout.on('data', d => { out += d.toString(); });
        proc.stderr.on('data', d => { err += d.toString(); });
        proc.on('close', code => {
          if (code === 0 && out.trim()) {
            resolve(out.trim());
          } else {
            resolve(JSON.stringify(analysisResult));
          }
        });
      });

      const parsed = JSON.parse(pyOutput);
      if (parsed.success) {
        analysisResult = parsed;
      }
    } catch (e) {
      console.warn('Acoustic analysis fallback used:', e);
    } finally {
      try {
        if (fs.existsSync(tempAudioPath)) {
          fs.unlinkSync(tempAudioPath);
        }
      } catch {}
    }

    // Pick base neural template matching detected gender
    const baseTemplate = analysisResult.gender === 'female' ? PRESET_VOICES[1] : PRESET_VOICES[0];

    const clonedId = `cloned-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const newVoice: Voice = {
      id: clonedId,
      name,
      category: 'cloned',
      gender: analysisResult.gender,
      accent,
      description,
      useCase: 'Custom Cloned Voice',
      avatarColor: analysisResult.gender === 'female' ? 'from-fuchsia-600 to-rose-700' : 'from-indigo-600 to-cyan-700',
      baseNeuralVoice: baseTemplate.baseNeuralVoice,
      neuralVoiceMap: { ...baseTemplate.neuralVoiceMap },
      defaultSettings: {
        stability: analysisResult.recommended_stability || 0.50,
        similarity_boost: analysisResult.recommended_similarity || 0.85,
        style: 0.0,
        use_speaker_boost: true,
        speed: 1.0,
      },
      clonedMetrics: {
        pitchOffset: analysisResult.pitch_offset || '+0Hz',
        rateOffset: '+0%',
        timbre: analysisResult.timbre || 'Natural & Balanced',
        estimatedPitchHz: analysisResult.estimated_pitch_hz || 140,
      },
    };

    return NextResponse.json({
      success: true,
      voice: newVoice,
      analysis: analysisResult,
    });

  } catch (error: any) {
    console.error('Voice clone error:', error);
    return NextResponse.json(
      { error: error.message || 'Voice cloning failed' },
      { status: 500 }
    );
  }
}
