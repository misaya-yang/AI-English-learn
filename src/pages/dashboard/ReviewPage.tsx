import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserData } from '@/contexts/UserDataContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  InlineStudyNote,
  QuestionSheet,
  StudyRail,
  StudyRailSection,
  StudySheet,
  StudyShell,
  StudyStatRows,
} from '@/features/learning/components/StudyWorkbook';
import {
  RotateCcw,
  Volume2,
  Check,
  X,
  Lightbulb,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { wordsDatabase } from '@/data/words';
import { speakEnglishText } from '@/services/tts';
import { initCard, isStubbornWord } from '@/services/fsrs';
import { ensureFSRS } from '@/services/fsrsMigration';
import { buildReviewSession, type ReviewSessionItem } from '@/features/learning/reviewQueue';
import { createEvidenceEvent, recordEvidence } from '@/services/evidenceEvents';
import { recordEvent, recordLearningEvent } from '@/services/learningEvents';
import {
  buildStubbornRecoveryPlan,
  type StubbornRecoveryOutcome,
} from '@/features/learning/stubbornRecovery';
import { SessionRecapCard } from '@/features/learning/components/SessionRecapCard';
import { getDueCoachReviews } from '@/services/coachReviewQueue';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type ReviewItem = ReviewSessionItem;

interface ReviewCardProps {
  item: ReviewItem;
  isRevealed: boolean;
  onReveal: () => void;
  isZh: boolean;
}

function ReviewCard({ item, isRevealed, onReveal, isZh }: ReviewCardProps) {
  const { word } = item;
  const usesCompactHeadword = word.word.length > 18 || word.word.includes(' ');

  const playAudio = (text: string) => {
    void speakEnglishText(text);
  };

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[280px] overflow-hidden sm:min-h-[360px]"
    >
      {!isRevealed ? (
        <div className="flex h-full w-full flex-col items-center justify-center text-center">
          <button
            type="button"
            data-testid="review-recall-surface"
            onClick={onReveal}
            aria-label={isZh ? `回忆 ${word.word}，然后查看答案` : `Recall ${word.word}, then reveal the answer`}
            className="flex min-h-[210px] w-full flex-1 flex-col items-center justify-center rounded-lg px-3 text-center transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-[280px]"
          >
            <span className="rounded-md border border-[hsl(var(--paper-line)/0.8)] bg-[hsl(var(--paper-muted)/0.5)] px-2.5 py-1 text-xs text-muted-foreground">
              {word.level} / {isZh ? `第 ${item.reviewCount + 1} 次复习` : `review ${item.reviewCount + 1}`}
            </span>
            <span className="study-label mt-5 sm:mt-6">{isZh ? '回忆' : 'Recall'}</span>
            <span className={cn(
              'lexical-type mt-3 max-w-full break-words leading-none text-foreground sm:mt-4',
              usesCompactHeadword ? 'text-[2.35rem] sm:text-[3.4rem]' : 'text-[2.8rem] sm:text-[4.4rem]',
            )}>
              {word.word}
            </span>
            <span className="mt-3 font-mono text-base text-muted-foreground sm:mt-4 sm:text-lg">{word.partOfSpeech} / {word.phonetic}</span>
            <span className="mt-5 text-sm text-muted-foreground sm:mt-7">{isZh ? '回忆后看答案' : 'Reveal after recall'}</span>
          </button>

          <div className="mt-3 flex items-center gap-3">
            <Button
              variant="glass"
              size="icon"
              className="glass-icon-button h-11 w-11 rounded-md text-foreground hover:text-foreground"
              onClick={() => playAudio(word.word)}
              aria-label={isZh ? '播放发音' : 'Play pronunciation'}
            >
              <Volume2 className="h-5 w-5" aria-hidden="true" />
            </Button>
            <span className="text-sm text-muted-foreground">{isZh ? '播放发音' : 'Play pronunciation'}</span>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
          <div>
              <p className="study-label">{isZh ? '答案' : 'Answer'}</p>
              <h2 className="lexical-type mt-2 text-4xl leading-none text-foreground">{word.word}</h2>
              <p className="mt-2 font-mono text-sm text-muted-foreground">{word.partOfSpeech} / {word.phonetic}</p>
            </div>
            <Button
              variant="glass"
              size="icon"
              className="glass-icon-button rounded-md text-foreground hover:text-foreground"
              onClick={() => playAudio(word.word)}
              aria-label={isZh ? '播放发音' : 'Play pronunciation'}
            >
              <Volume2 className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-6 grid flex-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_0.8fr]">
            <div className="space-y-4">
              <section className="pt-2">
                <p className="study-label">{isZh ? '释义' : 'Meaning'}</p>
                <p className="mt-3 text-base leading-7 text-foreground">{word.definition}</p>
                {isZh ? <p className="mt-2 text-sm leading-7 text-muted-foreground">{word.definitionZh}</p> : null}
              </section>

              {word.examples[0] ? (
                <section className="pt-2">
                  <p className="study-label">{isZh ? '例句' : 'Example'}</p>
                  <p className="mt-3 text-sm leading-7 text-foreground">{word.examples[0].en}</p>
                  {isZh ? <p className="mt-2 text-sm leading-7 text-muted-foreground">{word.examples[0].zh}</p> : null}
                </section>
              ) : null}
            </div>

            <section className="rounded-xl bg-[hsl(var(--paper-muted)/0.28)] p-4 lg:p-5">
              <p className="study-label">{isZh ? '线索' : 'Clues'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {word.synonyms.slice(0, 5).map((synonym) => (
                  <span key={synonym} className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {synonym}
                  </span>
                ))}
                {word.collocations.slice(0, 4).map((collocation) => (
                  <span key={collocation} className="rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {collocation}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </motion.section>
  );
}

const ratingMeta = {
  again: {
    labelZh: '忘了',
    labelEn: 'Again',
    delayZh: '马上重见',
    delayEn: '< 1 min',
    key: '1',
    accent: 'border-destructive/30 bg-destructive/5 text-destructive',
  },
  hard:  {
    labelZh: '有点难',
    labelEn: 'Hard',
    delayZh: '短间隔复现',
    delayEn: '2 days',
    key: '2',
    accent: 'border-[hsl(var(--warning)/0.32)] bg-[hsl(var(--warning)/0.10)] text-[hsl(var(--warning))]',
  },
  good:  {
    labelZh: '记得',
    labelEn: 'Good',
    delayZh: '约 5 天后复习',
    delayEn: '5 days',
    key: '3',
    accent: 'border-[hsl(var(--success)/0.35)] bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]',
  },
  easy:  {
    labelZh: '很熟',
    labelEn: 'Easy',
    delayZh: '约 10 天后复习',
    delayEn: '10 days',
    key: '4',
    accent: 'border-[hsl(var(--accent-practice)/0.35)] bg-[hsl(var(--accent-practice)/0.1)] text-[hsl(var(--accent-practice))]',
  },
} as const;

export default function ReviewPage() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const { dailyWords, reviewWord, dueWords, dailyMission, completeMissionTask, progress = [], customWords = [] } = useUserData();
  const { i18n } = useTranslation();
  const language = i18n.language;
  const isZh = language.startsWith('zh');
  const [searchParams] = useSearchParams();
  const focusWordId = searchParams.get('wordId') || undefined;
  const focusQuery = searchParams.get('q')?.trim().toLowerCase() || undefined;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [sessionQueue, setSessionQueue] = useState<ReviewItem[] | null>(null);
  const [dueCoachReviewCount, setDueCoachReviewCount] = useState(0);
  const [recoveryOutcomes, setRecoveryOutcomes] = useState<Record<string, StubbornRecoveryOutcome>>({});
  const ratedWordIdRef = useRef<string | null>(null);

  const totalReviewed = sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy;
  const reviewWordCatalog = useMemo(() => {
    const seen = new Set<string>();
    const out: typeof dailyWords = [];

    for (const word of [...dailyWords, ...customWords, ...wordsDatabase]) {
      if (!word?.id || seen.has(word.id)) continue;
      seen.add(word.id);
      out.push(word);
    }

    return out;
  }, [customWords, dailyWords]);
  const baseReviewItems = useMemo(
    () => buildReviewSession({
      dueWords,
      // dailyWords is included so a "due" entry from today's bundle still
      // resolves a WordData. The full wordsDatabase covers the rest. Neither
      // contributes a card on its own; buildReviewSession refuses to
      // fall back to fillers (LEARN-04).
      wordCatalog: reviewWordCatalog,
    }),
    [dueWords, reviewWordCatalog],
  );
  const focusedReviewItem = useMemo(() => {
    if (!focusWordId && !focusQuery) return null;
    const word = reviewWordCatalog.find((item) => (
      (focusWordId && item.id === focusWordId) ||
      (focusQuery && item.word.toLowerCase() === focusQuery)
    ));
    if (!word) return null;

    const wordProgress = progress.find((item) => item.wordId === word.id);
    return {
      wordId: word.id,
      word,
      reviewCount: wordProgress?.reviewCount ?? 0,
      fsrs: wordProgress ? ensureFSRS(wordProgress) : initCard(),
    };
  }, [focusQuery, focusWordId, progress, reviewWordCatalog]);
  const reviewItems = useMemo(
    () => sessionQueue ?? (
      focusedReviewItem
        ? [focusedReviewItem, ...baseReviewItems.filter((item) => item.wordId !== focusedReviewItem.wordId)]
        : baseReviewItems
    ),
    [baseReviewItems, focusedReviewItem, sessionQueue],
  );
  const isComplete = reviewItems.length > 0 && currentIndex >= reviewItems.length;

  useEffect(() => {
    if (!isComplete) return;
    void getDueCoachReviews(userId).then((items) => setDueCoachReviewCount(items.length));
    // LEARN-05: emit session_ended on completion.
    void recordEvent(userId, {
      kind: 'session_ended',
      payload: { surface: 'review', total: totalReviewed },
    });
  }, [isComplete, userId, totalReviewed]);
  const reviewTaskTarget =
    Number(
      dailyMission?.tasks.find((task) => task.id === 'task_review_today')?.meta?.target,
    ) || reviewItems.length;
  const reviewedProgress = reviewItems.length > 0 ? (totalReviewed / reviewItems.length) * 100 : 0;

  const currentItem = reviewItems[currentIndex];
  const remainingCount = Math.max(reviewItems.length - totalReviewed, 0);
  const isCurrentCardStubborn = currentItem ? isStubbornWord(currentItem.fsrs) : false;
  const currentRecoveryPlan = currentItem ? buildStubbornRecoveryPlan(currentItem) : null;
  const currentRecoveryOutcome = currentRecoveryPlan ? recoveryOutcomes[currentRecoveryPlan.wordId] : undefined;

  const handleReveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const handleRate = useCallback((rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentItem || ratedWordIdRef.current === currentItem.wordId) return;
    ratedWordIdRef.current = currentItem.wordId;

    try {
      if (!sessionQueue) {
        setSessionQueue(reviewItems);
      }

      reviewWord(currentItem.wordId, rating);
      setSessionStats((prev) => ({
        ...prev,
        [rating]: prev[rating] + 1,
      }));

      void recordEvidence(
        createEvidenceEvent({
          type: 'review.rated',
          userId,
          wordId: currentItem.wordId,
          rating,
        }),
      );
      // LEARN-02: strict review_completed event for path-progress derivation.
      void recordEvent(userId, {
        kind: 'review_completed',
        payload: { wordId: currentItem.wordId, rating },
      });
      if (totalReviewed + 1 >= reviewTaskTarget) {
        completeMissionTask('task_review_today');
      }

      const interval = isZh ? ratingMeta[rating].delayZh : ratingMeta[rating].delayEn;
      toast.success(`${isZh ? '已记录' : 'Saved'}. ${isZh ? '下次' : 'Next'}: ${interval}`);

      if (currentIndex < reviewItems.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsRevealed(false);
        return;
      }

      setCurrentIndex(reviewItems.length);
    } catch {
      ratedWordIdRef.current = null;
      toast.error(isZh ? '评分未保存，请重试' : 'Rating was not saved. Please try again.');
    }
  }, [currentIndex, currentItem, reviewItems, reviewWord, sessionQueue, totalReviewed, reviewTaskTarget, completeMissionTask, userId, isZh]);

  const handleRecoveryOutcome = useCallback((outcome: StubbornRecoveryOutcome) => {
    if (!currentRecoveryPlan) return;

    setRecoveryOutcomes((prev) => ({
      ...prev,
      [currentRecoveryPlan.wordId]: outcome,
    }));

    const payload = {
      wordId: currentRecoveryPlan.wordId,
      outcome,
      trigger: currentRecoveryPlan.trigger,
      lapses: currentRecoveryPlan.metrics.lapses,
      difficulty: currentRecoveryPlan.metrics.difficulty,
      source: 'review_stubborn_recovery',
    };

    void recordEvidence(
      createEvidenceEvent({
        type: 'review.recovery_marked',
        userId,
        wordId: currentRecoveryPlan.wordId,
        outcome,
        trigger: currentRecoveryPlan.trigger,
        lapses: currentRecoveryPlan.metrics.lapses,
        difficulty: currentRecoveryPlan.metrics.difficulty,
      }),
    );
    void recordLearningEvent({
      userId,
      eventName: 'review.stubborn_recovery',
      payload,
    });
    void recordEvent(userId, {
      kind: outcome === 'helped' ? 'mistake_resolved' : 'practice_wrong',
      payload,
    });

    toast.success(outcome === 'helped'
      ? (isZh ? '已记录：这个练习有帮助' : 'Recorded: this drill helped')
      : (isZh ? '已记录：仍然混淆，稍后继续练' : 'Recorded: still confusing, practice again later'));
  }, [currentRecoveryPlan, isZh, userId]);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      const target = e.target instanceof HTMLElement ? e.target : null;
      const isInteractiveTarget = target?.isContentEditable || Boolean(target?.closest(
        'input, textarea, select, button, a, [contenteditable], [role="button"], [role="link"]',
      ));
      if (
        e.defaultPrevented ||
        e.isComposing ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        isInteractiveTarget
      ) return;
      if (isComplete || reviewItems.length === 0 || !currentItem) return;

      if (!isRevealed) {
        if (e.code === 'Space') { e.preventDefault(); handleReveal(); }
      } else {
        if (e.key === '1') handleRate('again');
        else if (e.key === '2') handleRate('hard');
        else if (e.key === '3') handleRate('good');
        else if (e.key === '4') handleRate('easy');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isRevealed, isComplete, currentItem, reviewItems.length, handleReveal, handleRate]);

  const handleRestart = () => {
    ratedWordIdRef.current = null;
    setSessionQueue(null);
    setCurrentIndex(0);
    setIsRevealed(false);
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
    setRecoveryOutcomes({});
  };

  if (reviewItems.length === 0) {
    const previewWords = dailyWords.slice(0, 5);
    const nextSteps = [
      {
        label: isZh ? '先浏览今日词表' : 'Scan today’s word set',
        note: isZh
          ? `今天有 ${dailyWords.length} 个新词，先建立一遍熟悉感。`
          : `${dailyWords.length} new words are ready for a first pass.`,
      },
      {
        label: isZh ? '完成一轮主动练习' : 'Complete one active practice',
        note: isZh
          ? '用拼写、听力或选择题先形成记忆线索。'
          : 'Build memory cues with spelling, listening, or a short quiz.',
      },
      {
        label: isZh ? '到期后再回到复习' : 'Return when cards become due',
        note: isZh
          ? '系统会按学习记录安排下一次真正需要回忆的词。'
          : 'The schedule will surface words when active recall is useful.',
      },
    ];

    return (
      <StudyShell>
        <StudySheet
          eyebrow={isZh ? '复习' : 'Review'}
          title={isZh ? '没有到期词' : 'No cards due'}
          description={isZh
            ? '复习队列已经清空。下面直接接着今天的新词与主动练习，不需要停在空页面。'
            : 'Your review queue is clear. Continue with today’s words and active practice below.'}
          actions={
            <>
              <Button variant="outline" className="rounded-md bg-transparent text-foreground hover:bg-muted" asChild>
                <Link to="/dashboard/today">{isZh ? '返回今日' : 'Back to Today'}</Link>
              </Button>
              <Button className="rounded-md" asChild>
                <Link to="/dashboard/practice">{isZh ? '去练习' : 'Practice'}</Link>
              </Button>
            </>
          }
        >
          <StudyStatRows
            items={[
              { label: isZh ? '到期' : 'Due', value: 0, tone: 'default' },
              { label: isZh ? '新词' : 'New words', value: dailyWords.length, tone: 'practice' },
              { label: isZh ? '目标' : 'Target', value: reviewTaskTarget },
            ]}
          />

          <div className="mt-5 grid gap-4 border-t border-[hsl(var(--paper-line)/0.72)] pt-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
            <section className="rounded-xl bg-[hsl(var(--paper-muted)/0.34)] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="study-label">{isZh ? '今日词表' : 'Today’s words'}</p>
                  <h2 className="mt-2 text-lg font-semibold text-foreground">
                    {isZh ? '先认识，再进入练习' : 'Preview before practice'}
                  </h2>
                </div>
                <span className="study-number text-2xl text-[hsl(var(--accent-practice))]">
                  {dailyWords.length}
                </span>
              </div>

              {previewWords.length > 0 ? (
                <div className="mt-4 divide-y divide-[hsl(var(--paper-line)/0.62)]">
                  {previewWords.map((word) => (
                    <div key={word.id} className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] sm:items-baseline sm:gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{word.word}</p>
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                          {word.partOfSpeech} / {word.phonetic}
                        </p>
                      </div>
                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {isZh ? word.definitionZh : word.definition}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <InlineStudyNote
                  className="mt-4"
                  title={isZh ? '今日词表正在准备' : 'Today’s set is being prepared'}
                >
                  {isZh
                    ? '可以先进入练习页，系统会在词表准备好后自动同步。'
                    : 'You can start in Practice while the daily set finishes preparing.'}
                </InlineStudyNote>
              )}
            </section>

            <section className="rounded-xl border border-[hsl(var(--paper-line)/0.72)] p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Lightbulb className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="study-label">{isZh ? '建议顺序' : 'Suggested route'}</p>
                  <h2 className="mt-1 text-lg font-semibold text-foreground">
                    {isZh ? '接下来约 8–12 分钟' : 'Your next 8–12 minutes'}
                  </h2>
                </div>
              </div>

              <ol className="mt-5 space-y-4">
                {nextSteps.map((step, index) => (
                  <li key={step.label} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
                    <span className="study-number flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{step.label}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </StudySheet>
      </StudyShell>
    );
  }

  if (isComplete) {
    const accuracy = totalReviewed > 0 ? Math.round(((sessionStats.good + sessionStats.easy) / totalReviewed) * 100) : 0;

    return (
      <StudyShell>
        <SessionRecapCard
          input={{
            kind: 'review',
            stats: sessionStats,
            language,
            coachReviews: { dueCount: dueCoachReviewCount },
          }}
        />
        <StudySheet
          title={isZh ? '复习完成' : 'Review done'}
          description={isZh ? '这一轮已经结束。' : 'This round is done.'}
          actions={
            <>
              <Button variant="outline" className="rounded-md bg-card text-foreground hover:bg-muted" onClick={handleRestart}>
                <RotateCcw className="mr-2 h-4 w-4" />
                {isZh ? '再次复习' : 'Review again'}
              </Button>
              <Button className="rounded-md" asChild>
                <Link to="/dashboard/practice">{isZh ? '继续练习' : 'Continue in Practice'}</Link>
              </Button>
            </>
          }
        >
          <StudyStatRows
            items={[
              { label: isZh ? '已复习' : 'Reviewed', value: totalReviewed, tone: 'practice' },
              { label: isZh ? '正确率' : 'Accuracy', value: `${accuracy}%`, tone: 'success' },
              { label: isZh ? '遗忘 / 较难' : 'Again / Hard', value: `${sessionStats.again} / ${sessionStats.hard}`, tone: 'warning' },
            ]}
          />
        </StudySheet>
      </StudyShell>
    );
  }

  return (
    <StudyShell>
      <StudySheet
        eyebrow={isZh ? `第 ${Math.min(currentIndex + 1, reviewItems.length)} / ${reviewItems.length} 张` : `${Math.min(currentIndex + 1, reviewItems.length)} / ${reviewItems.length}`}
        title={isZh ? '先回忆，再评分' : 'Recall, then rate'}
        description={isZh ? '看答案前先想一遍。' : 'Recall before revealing.'}
      >
        <div data-testid="review-session-summary-mobile" className="grid grid-cols-3 gap-2 sm:hidden">
          {[
            { label: isZh ? '剩余' : 'Left', value: remainingCount },
            { label: isZh ? '目标' : 'Target', value: reviewTaskTarget },
            { label: isZh ? '进度' : 'Progress', value: `${Math.round(reviewedProgress)}%` },
          ].map((item) => (
            <div key={item.label} className="flex min-h-16 flex-col items-center justify-center rounded-lg bg-[hsl(var(--paper-muted)/0.34)] px-2 text-center">
              <span className="text-[11px] text-muted-foreground">{item.label}</span>
              <span className="study-number mt-1 text-xl text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
        <StudyStatRows
          items={[
            { label: isZh ? '剩余' : 'Left', value: remainingCount },
            { label: isZh ? '目标' : 'Target', value: reviewTaskTarget },
            { label: isZh ? '进度' : 'Progress', value: `${Math.round(reviewedProgress)}%`, tone: 'practice' },
          ]}
          className="hidden min-w-[260px] sm:block"
        />
        <Progress value={Math.round(reviewedProgress)} className="mt-3 h-1.5 bg-muted sm:mt-5 [&_[data-slot=progress-indicator]]:bg-[hsl(var(--accent-practice))]" />
      </StudySheet>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-6">
          <QuestionSheet
            meta={isZh ? '复习' : 'Review'}
            title={isRevealed ? (isZh ? '给这次回忆打分' : 'Rate this card') : (isZh ? '回忆这个词' : 'Recall this word')}
            prompt={isRevealed ? (isZh ? '评分后继续。' : 'Rate, then continue.') : (isZh ? '想好后再看答案。' : 'Reveal after you recall.')}
          >
            <div className="space-y-5">
              {currentItem ? <ReviewCard item={currentItem} isRevealed={isRevealed} onReveal={handleReveal} isZh={isZh} /> : null}

              {currentRecoveryPlan && isRevealed ? (
                <InlineStudyNote
                  testId="stubborn-recovery-panel"
                  title={isZh ? currentRecoveryPlan.titleZh : currentRecoveryPlan.title}
                  tone="warning"
                >
                  <p>{isZh ? currentRecoveryPlan.reasonZh : currentRecoveryPlan.reason}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {[
                      {
                        label: isZh ? '助记' : 'Mnemonic',
                        body: isZh ? currentRecoveryPlan.mnemonicZh : currentRecoveryPlan.mnemonic,
                      },
                      {
                        label: isZh ? '搭配替换' : 'Collocation swap',
                        body: isZh ? currentRecoveryPlan.collocationDrillZh : currentRecoveryPlan.collocationDrill,
                      },
                      {
                        label: isZh ? '混淆提醒' : 'Confusion guard',
                        body: isZh ? currentRecoveryPlan.confusingNoteZh : currentRecoveryPlan.confusingNote,
                      },
                      {
                        label: isZh ? '短句产出' : 'Production task',
                        body: isZh ? currentRecoveryPlan.productionTaskZh : currentRecoveryPlan.productionTask,
                      },
                    ].map((block) => (
                      <div key={block.label} className="rounded-lg border border-[hsl(var(--paper-line)/0.78)] bg-[hsl(var(--paper-muted)/0.42)] p-3">
                        <p className="text-xs font-medium text-foreground">{block.label}</p>
                        <p className="mt-2 text-sm leading-6 text-foreground">{block.body}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button
                      variant={currentRecoveryOutcome === 'helped' ? 'default' : 'outline'}
                      className="rounded-md"
                      onClick={() => handleRecoveryOutcome('helped')}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {isZh ? '有帮助' : 'Helpful'}
                    </Button>
                    <Button
                      variant={currentRecoveryOutcome === 'still_confusing' ? 'default' : 'outline'}
                      className="rounded-md"
                      onClick={() => handleRecoveryOutcome('still_confusing')}
                    >
                      <X className="mr-2 h-4 w-4" />
                      {isZh ? '仍混淆' : 'Still hard'}
                    </Button>
                  </div>
                </InlineStudyNote>
              ) : null}

              {isRevealed ? (
                <div className="grid gap-3 lg:grid-cols-4">
                  {(Object.entries(ratingMeta) as Array<[keyof typeof ratingMeta, (typeof ratingMeta)[keyof typeof ratingMeta]]>).map(([rating, meta]) => (
                    <Button
                      key={rating}
                      variant="outline"
                      aria-keyshortcuts={meta.key}
	                className={cn(
                        'h-auto flex-col items-start gap-1 rounded-lg border px-4 py-4 text-left hover:text-current',
                        meta.accent,
	                      )}
                      onClick={() => handleRate(rating)}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
	                        <span className="text-base font-semibold">{isZh ? meta.labelZh : meta.labelEn}</span>
                        <kbd className="rounded border border-current/20 bg-current/10 px-1.5 py-0.5 font-mono text-[10px] font-bold opacity-70">
                          {meta.key}
                        </kbd>
                      </div>
	                      <span className="text-xs opacity-80">
                          {isZh ? '下次' : 'Next'}: {isZh ? meta.delayZh : meta.delayEn}
                        </span>
                    </Button>
                  ))}
                </div>
              ) : (
                <InlineStudyNote title={isZh ? '先回忆' : 'Recall first'}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p>{isZh ? '想好后再看答案。' : 'Think it through before revealing the answer.'}</p>
                  <Button className="rounded-md px-5" onClick={handleReveal}>
                    {isZh ? '看答案' : 'Reveal'}
                    <kbd className="ml-2 rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary/75">
                      Space
                    </kbd>
                  </Button>
                  </div>
                </InlineStudyNote>
              )}
            </div>
          </QuestionSheet>
        </div>

        <StudyRail>
          <StudyRailSection title={isZh ? '本轮' : 'This round'}>
            <StudyStatRows
              items={[
                { label: isZh ? '忘了' : 'Again', value: sessionStats.again, tone: 'warning' },
                { label: isZh ? '有点难' : 'Hard', value: sessionStats.hard, tone: 'warning' },
                { label: isZh ? '记得' : 'Good', value: sessionStats.good, tone: 'success' },
                { label: isZh ? '已完成' : 'Done', value: `${totalReviewed} / ${reviewItems.length}`, tone: 'practice' },
              ]}
            />
          </StudyRailSection>

          {currentItem ? (
            <StudyRailSection title={isZh ? '当前卡' : 'Current card'}>
              <div className="rounded-md bg-[hsl(var(--paper-muted)/0.34)] p-4 space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <p className="text-sm font-medium">
                    {isZh ? `第 ${currentItem.reviewCount + 1} 次复习` : `Review ${currentItem.reviewCount + 1}`}
                  </p>
                </div>
                {isCurrentCardStubborn ? (
                  <span className="rounded-md border border-[hsl(var(--warning)/0.28)] bg-[hsl(var(--warning)/0.1)] px-2.5 py-1 text-xs text-[hsl(var(--warning))]">
                    {isZh ? '需要多复习' : 'Needs extra practice'}
                  </span>
                ) : null}

                {/* Memory strength bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] text-muted-foreground">{isZh ? '记忆' : 'Memory'}</p>
                    <p className="text-xs font-semibold text-foreground">
                      {Math.round(currentItem.fsrs.retrievability * 100)}%
                    </p>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={cn(
                        'h-full rounded-full transition-colors',
                        currentItem.fsrs.retrievability >= 0.75 ? 'bg-[hsl(var(--success))]' :
                        currentItem.fsrs.retrievability >= 0.5  ? 'bg-[hsl(var(--warning))]' :
                        currentItem.fsrs.retrievability >= 0.25 ? 'bg-[hsl(var(--accent-exam))]' :
                                                                   'bg-destructive',
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(currentItem.fsrs.retrievability * 100)}%` }}
                      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                  {currentItem.fsrs.lastReviewAt
                    ? (isZh
                      ? `上次复习：${new Date(currentItem.fsrs.lastReviewAt).toLocaleString('zh-CN')}`
                      : `Last reviewed: ${new Date(currentItem.fsrs.lastReviewAt).toLocaleString('en-US')}`)
                    : (isZh ? '今日首次接触这张卡' : 'First time seeing this card today')}
                </p>
              </div>
            </StudyRailSection>
          ) : null}

          {currentItem && isRevealed && !currentRecoveryPlan && (currentItem.word.memoryTip || currentItem.word.etymology) ? (
            <StudyRailSection title={isZh ? '助记' : 'Hint'}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-md border border-[hsl(var(--accent-memory)/0.2)] bg-[hsl(var(--accent-memory)/0.08)] p-4"
              >
                <div className="flex items-center gap-2 text-[hsl(var(--accent-memory))] mb-2">
                  <Lightbulb className="h-4 w-4" />
                  <p className="text-sm font-semibold">{isZh ? '助记' : 'Memory hint'}</p>
                </div>
                <p className="text-sm leading-6 text-foreground">
                  {currentItem.word.memoryTip || currentItem.word.etymology}
                </p>
              </motion.div>
            </StudyRailSection>
          ) : null}
        </StudyRail>
      </div>
    </StudyShell>
  );
}
