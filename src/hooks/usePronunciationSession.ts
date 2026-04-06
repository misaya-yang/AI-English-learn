import { useState, useCallback, useRef } from 'react';
import {
  createRecognition,
  isSpeechRecognitionSupported,
  listenOnce,
  scoreWithAi,
  type PronunciationResult,
  type PronunciationRecord,
} from '@/services/pronunciationScorer';

export type SessionStatus = 'idle' | 'listening' | 'scoring' | 'done' | 'error';

interface UsePronunciationSessionReturn {
  /** Whether the browser supports speech recognition */
  supported: boolean;
  /** Current session status */
  status: SessionStatus;
  /** Start listening for the given text */
  startListening: (word: string, wordId: string, phonetic: string) => void;
  /** Cancel ongoing listen */
  cancelListening: () => void;
  /** Latest pronunciation result */
  result: PronunciationResult | null;
  /** All records from this session */
  records: PronunciationRecord[];
  /** Error message if status === 'error' */
  errorMessage: string | null;
  /** Reset session state */
  reset: () => void;
}

export function usePronunciationSession(): UsePronunciationSessionReturn {
  const supported = isSpeechRecognitionSupported();
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [records, setRecords] = useState<PronunciationRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancelListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // already stopped
    }
    abortRef.current?.abort();
    setStatus('idle');
  }, []);

  const startListening = useCallback(
    (word: string, wordId: string, phonetic: string) => {
      if (!supported) {
        setErrorMessage('Speech recognition is not supported in this browser.');
        setStatus('error');
        return;
      }

      setStatus('listening');
      setResult(null);
      setErrorMessage(null);

      const recognition = createRecognition('en-US');
      recognitionRef.current = recognition;
      const abortController = new AbortController();
      abortRef.current = abortController;

      listenOnce(recognition)
        .then(async (listenResult) => {
          if (abortController.signal.aborted) return;
          setStatus('scoring');

          const scored = await scoreWithAi(word, listenResult, abortController.signal);
          if (abortController.signal.aborted) return;

          setResult(scored);

          const record: PronunciationRecord = {
            id: `pron-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            wordId,
            word,
            phonetic,
            result: scored,
            createdAt: new Date().toISOString(),
          };
          setRecords((prev) => [record, ...prev]);
          setStatus('done');
        })
        .catch((err: unknown) => {
          if (abortController.signal.aborted) return;
          const msg = err instanceof Error ? err.message : 'Unknown error';
          setErrorMessage(msg);
          setStatus('error');
        });
    },
    [supported],
  );

  const reset = useCallback(() => {
    cancelListening();
    setResult(null);
    setErrorMessage(null);
    setStatus('idle');
  }, [cancelListening]);

  return {
    supported,
    status,
    startListening,
    cancelListening,
    result,
    records,
    errorMessage,
    reset,
  };
}
