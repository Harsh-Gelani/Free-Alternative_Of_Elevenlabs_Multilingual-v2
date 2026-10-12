#!/usr/bin/env python3
"""
Voice Cloner & Acoustic Profile Analyzer
Extracts fundamental frequency (F0), spectral centroid, speaking rate,
and timbre metrics to build an instant cross-lingual cloned voice profile.
"""

import sys
import json
import wave
import numpy as np
from scipy import signal

def analyze_audio(filepath):
    try:
        # Read WAV file
        with wave.open(filepath, 'rb') as wf:
            n_channels = wf.getnchannels()
            sample_width = wf.getsampwidth()
            framerate = wf.getframerate()
            n_frames = wf.getnframes()

            raw_data = wf.readframes(n_frames)

            if sample_width == 1:
                dtype = np.uint8
            elif sample_width == 2:
                dtype = np.int16
            elif sample_width == 4:
                dtype = np.int32
            else:
                dtype = np.int16

            audio_data = np.frombuffer(raw_data, dtype=dtype)

            # If stereo or multichannel, average to mono
            if n_channels > 1:
                audio_data = audio_data.reshape(-1, n_channels).mean(axis=1)

            # Normalize float
            max_val = np.iinfo(dtype).max if dtype != np.uint8 else 255
            norm_audio = audio_data.astype(np.float32) / max_val

            duration = n_frames / float(framerate)
            if duration < 0.5:
                return {
                    "error": "Audio sample is too short. Please provide at least 1-2 seconds of clear speech."
                }

            # Frame-based autocorrelation to estimate F0 (Pitch)
            # Focus on human speech frequency range: 75 Hz to 350 Hz
            frame_len = int(framerate * 0.04) # 40ms frame
            hop_len = int(framerate * 0.02)   # 20ms hop

            pitches = []
            min_lag = int(framerate / 350.0)
            max_lag = int(framerate / 75.0)

            for i in range(0, len(norm_audio) - frame_len, hop_len):
                frame = norm_audio[i:i + frame_len]
                # Check frame energy to skip silence
                energy = np.sqrt(np.mean(frame**2))
                if energy < 0.015:
                    continue

                # Autocorrelation
                corr = np.correlate(frame, frame, mode='full')
                corr = corr[len(corr)//2:]

                if len(corr) > max_lag:
                    corr_search = corr[min_lag:max_lag]
                    if len(corr_search) > 0:
                        peak_idx = np.argmax(corr_search) + min_lag
                        if corr[peak_idx] > 0.3 * corr[0]:
                            pitch_hz = framerate / float(peak_idx)
                            pitches.append(pitch_hz)

            if len(pitches) > 0:
                mean_f0 = float(np.median(pitches))
            else:
                mean_f0 = 140.0 # Default baseline

            # Spectral Centroid (Timbre Brightness)
            freqs, times, spec = signal.spectrogram(norm_audio, framerate, nperseg=frame_len)
            magnitudes = np.abs(spec)
            centroids = np.sum(freqs[:, np.newaxis] * magnitudes, axis=0) / (np.sum(magnitudes, axis=0) + 1e-9)
            mean_centroid = float(np.mean(centroids))

            # Determine Gender & Tone Register
            if mean_f0 < 155.0:
                gender = "male"
                baseline_pitch = 120.0
            else:
                gender = "female"
                baseline_pitch = 210.0

            # Pitch offset in Hz compared to baseline
            pitch_offset_hz = int(np.clip(mean_f0 - baseline_pitch, -40, 40))
            pitch_str = f"{'+' if pitch_offset_hz >= 0 else ''}{pitch_offset_hz}Hz"

            # Timbre descriptor based on centroid & F0
            if mean_f0 < 120.0 and mean_centroid < 1800:
                timbre = "Deep & Resonant"
                accent_profile = "Authoritative / Narration"
            elif mean_f0 > 220.0 or mean_centroid > 2600:
                timbre = "Crisp & Energetic"
                accent_profile = "Vibrant / Commercial"
            elif gender == "male":
                timbre = "Warm & Natural"
                accent_profile = "Conversational / Podcast"
            else:
                timbre = "Smooth & Melodic"
                accent_profile = "Engaging / Storytelling"

            # Stability & Similarity recommendations based on variance
            f0_std = float(np.std(pitches)) if len(pitches) > 1 else 15.0
            recommended_stability = float(np.clip(0.4 + (f0_std / 50.0) * 0.3, 0.3, 0.85))

            return {
                "success": True,
                "duration_seconds": round(duration, 2),
                "estimated_pitch_hz": round(mean_f0, 1),
                "gender": gender,
                "timbre": timbre,
                "accent_profile": accent_profile,
                "pitch_offset": pitch_str,
                "recommended_stability": round(recommended_stability, 2),
                "recommended_similarity": 0.85,
                "sample_rate": framerate
            }

    except Exception as e:
        return {
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input file provided."}))
        sys.exit(1)

    file_path = sys.argv[1]
    result = analyze_audio(file_path)
    print(json.dumps(result))
