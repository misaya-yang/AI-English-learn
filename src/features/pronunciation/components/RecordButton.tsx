import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SessionStatus } from '@/hooks/usePronunciationSession';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface RecordButtonProps {
  status: SessionStatus;
  onStart: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function RecordButton({ status, onStart, onCancel, disabled }: RecordButtonProps) {
  const { t } = useTranslation();
  const isListening = status === 'listening';
  const isScoring = status === 'scoring';
  const isBusy = isListening || isScoring;

  return (
    <Button
      size="lg"
      variant={isListening ? 'destructive' : 'default'}
      className={cn(
        'rounded-full w-16 h-16 p-0',
        isListening && 'animate-pulse',
      )}
      onClick={isBusy ? onCancel : onStart}
      disabled={disabled || isScoring}
      aria-label={isListening ? t('pronunciation.stopRecording') : t('pronunciation.startRecording')}
    >
      {isScoring ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : isListening ? (
        <Square className="h-6 w-6" />
      ) : (
        <Mic className="h-6 w-6" />
      )}
    </Button>
  );
}
