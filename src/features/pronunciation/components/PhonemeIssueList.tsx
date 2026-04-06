import type { PhonemeIssue } from '@/services/pronunciationScorer';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface PhonemeIssueListProps {
  issues: PhonemeIssue[];
}

const severityColor: Record<PhonemeIssue['severity'], string> = {
  minor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  moderate: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  major: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export function PhonemeIssueList({ issues }: PhonemeIssueListProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  if (issues.length === 0) return null;

  return (
    <div className="space-y-2">
      {issues.map((issue, idx) => (
        <div
          key={`${issue.phoneme}-${issue.word}-${idx}`}
          className="flex items-start gap-3 rounded-lg border p-3"
        >
          <Badge variant="outline" className="shrink-0 font-mono text-sm">
            /{issue.phoneme}/
          </Badge>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {issue.word}
              <span className={`ml-2 inline-block rounded px-1.5 py-0.5 text-xs ${severityColor[issue.severity]}`}>
                {issue.severity}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isZh ? issue.tipZh : issue.tip}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
