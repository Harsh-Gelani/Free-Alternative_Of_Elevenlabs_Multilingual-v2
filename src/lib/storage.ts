import { Voice, GenerationHistoryItem } from './types';

const STORAGE_KEYS = {
  CLONED_VOICES: 'eleven_cloned_voices_v1',
  GENERATION_HISTORY: 'eleven_generation_history_v1',
  LAST_SETTINGS: 'eleven_last_settings_v1',
};

export const getSavedVoices = (): Voice[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CLONED_VOICES);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to read saved voices:', err);
    return [];
  }
};

export const saveCustomVoice = (voice: Voice): Voice[] => {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSavedVoices();
    const updated = [voice, ...current.filter(v => v.id !== voice.id)];
    localStorage.setItem(STORAGE_KEYS.CLONED_VOICES, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save voice:', err);
    return [];
  }
};

export const deleteCustomVoice = (id: string): Voice[] => {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSavedVoices();
    const updated = current.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.CLONED_VOICES, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete voice:', err);
    return [];
  }
};

export const getHistory = (): GenerationHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GENERATION_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to read history:', err);
    return [];
  }
};

export const addHistoryItem = (item: GenerationHistoryItem): GenerationHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const current = getHistory();
    // Cap history at 50 items to keep storage lean
    const updated = [item, ...current].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.GENERATION_HISTORY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save history item:', err);
    return [];
  }
};

export const deleteHistoryItem = (id: string): GenerationHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const current = getHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.GENERATION_HISTORY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete history item:', err);
    return [];
  }
};

export const clearHistory = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.GENERATION_HISTORY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
};
