import { cn } from '@/lib/utils';

interface ScoreRadialProps {
  score: number;
  label: string;
  size?: number;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function getStrokeColor(score: number): string {
  if (score >= 80) return 'stroke-green-500';
  if (score >= 60) return 'stroke-yellow-500';
  if (score >= 40) return 'stroke-orange-500';
  return 'stroke-red-500';
}

export function ScoreRadial({ score, label, size = 80, className }: ScoreRadialProps) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <svg width={size} height={size} viewBox="0 0 80 80" className="-rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          className={cn('transition-all duration-700 ease-out', getStrokeColor(score))}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className={cn('text-lg font-bold -mt-[52px]', getScoreColor(score))}>
        {score}
      </span>
      <span className="text-xs text-muted-foreground mt-5">{label}</span>
    </div>
  );
}
