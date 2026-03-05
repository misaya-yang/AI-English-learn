const VOICE_NAME_PRIORITY = [
  'Microsoft Aria',
  'Microsoft Jenny',
  'Microsoft Guy',
  'Google US English',
  'Google UK English Female',
  'Google UK English Male',
  'Samantha',
  'Daniel',
  'Serena',
  'Moira',
  'Karen',
];

const HIGH_QUALITY_HINTS = ['neural', 'premium', 'enhanced', 'natural', 'wavenet'];

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesReadyPromise: Promise<SpeechSynthesisVoice[]> | null = null;

const supportsSpeechSynthesis = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

const getVoicesNow = (): SpeechSynthesisVoice[] => {
  if (!supportsSpeechSynthesis()) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    cachedVoices = voices;
  }
  return voices;
};

const waitForVoices = async (timeoutMs = 500): Promise<SpeechSynthesisVoice[]> => {
  if (!supportsSpeechSynthesis()) return [];
  const existing = getVoicesNow();
  if (existing.length > 0) return existing;
  if (voicesReadyPromise) return voicesReadyPromise;

  voicesReadyPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(getVoicesNow());
      voicesReadyPromise = null;
    };

    const onVoicesChanged = () => finish();
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    window.setTimeout(finish, timeoutMs);
  });

  return voicesReadyPromise;
};

const scoreVoice = (voice: SpeechSynthesisVoice, language: string): number => {
  const normalizedName = voice.name.toLowerCase();
  const normalizedLang = voice.lang.toLowerCase();
  const targetLang = language.toLowerCase();
  let score = 0;

  if (normalizedLang === targetLang) score += 120;
  if (normalizedLang.startsWith(targetLang.split('-')[0])) score += 70;
  if (voice.default) score += 15;

  for (let index = 0; index < VOICE_NAME_PRIORITY.length; index += 1) {
    if (normalizedName.includes(VOICE_NAME_PRIORITY[index].toLowerCase())) {
      score += Math.max(8, 80 - index * 5);
    }
  }

  if (HIGH_QUALITY_HINTS.some((hint) => normalizedName.includes(hint))) {
    score += 25;
  }

  if (normalizedName.includes('compact') || normalizedName.includes('espeak')) {
    score -= 40;
  }

  return score;
};

const isLikelyEnglishVoice = (voice: SpeechSynthesisVoice): boolean => {
  const lang = voice.lang.toLowerCase();
  if (lang.startsWith('en')) return true;
  const name = voice.name.toLowerCase();
  return name.includes('english') || name.includes('en-us') || name.includes('en-gb');
};

const pickBestVoice = (voices: SpeechSynthesisVoice[], language: string): SpeechSynthesisVoice | null => {
  if (voices.length === 0) return null;
  const englishCandidates = voices.filter((voice) => isLikelyEnglishVoice(voice));
  const pool = englishCandidates.length > 0 ? englishCandidates : voices;
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -Infinity;

  for (const voice of pool) {
    const currentScore = scoreVoice(voice, language);
    if (currentScore > bestScore) {
      bestScore = currentScore;
      best = voice;
    }
  }

  return best;
};

export const speakEnglishText = async (
  text: string,
  options?: {
    language?: string;
    rate?: number;
    pitch?: number;
  },
): Promise<boolean> => {
  const content = text.trim();
  if (!content || !supportsSpeechSynthesis()) {
    return false;
  }

  const language = options?.language || 'en-US';
  const voices = cachedVoices.length > 0 ? cachedVoices : await waitForVoices();
  const chosen = pickBestVoice(voices, language);
  if (!chosen) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(content);
  utterance.lang = chosen.lang || language;
  utterance.voice = chosen;
  utterance.rate = options?.rate ?? 0.96;
  utterance.pitch = options?.pitch ?? 1;
  utterance.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
};
