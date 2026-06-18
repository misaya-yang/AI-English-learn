import { useState, useEffect, useCallback, useMemo, type KeyboardEvent } from 'react';
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
}

function ReviewCard({ item, isRevealed, onReveal }: ReviewCardProps) {
  const { word } = item;

  const playAudio = (text: string) => {
    void speakEnglishText(text);
  };

  const handleRevealKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onReveal();
  };

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="study-sheet min-h-[360px] overflow-hidden"
    >
      {!isRevealed ? (
        <div
          role="button"
          tabIndex={0}
          onClick={onReveal}
          onKeyDown={handleRevealKeyDown}
          className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="rounded-md border border-[hsl(var(--paper-line)/0.8)] bg-[hsl(var(--paper-muted)/0.5)] px-2.5 py-1 text-xs text-muted-foreground">
            {word.level} / 第 {item.reviewCount + 1} 次复习
          </span>
          <p className="study-label mt-6">回忆</p>
          <h2 className="lexical-type mt-4 text-[3.2rem] leading-none text-foreground sm:text-[4.4rem]">
            {word.word}
          </h2>
          <p className="mt-4 font-mono text-lg text-muted-foreground">{word.partOfSpeech} / {word.phonetic}</p>

          <div className="mt-8 flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-md border-border bg-card text-foreground hover:bg-muted"
              onClick={(event) => {
                event.stopPropagation();
                playAudio(word.word);
              }}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
            <span className="text-sm text-muted-foreground">回忆后看答案</span>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
          <div>
              <p className="study-label">答案</p>
              <h2 className="lexical-type mt-2 text-4xl leading-none text-foreground">{word.word}</h2>
              <p className="mt-2 font-mono text-sm text-muted-foreground">{word.partOfSpeech} / {word.phonetic}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-md border border-border bg-card text-foreground hover:bg-muted"
              onClick={() => playAudio(word.word)}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-6 grid flex-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_0.8fr]">
            <div className="space-y-4">
              <section className="border-t border-[hsl(var(--paper-line)/0.72)] pt-4">
                <p className="study-label">释义</p>
                <p className="mt-3 text-base leading-7 text-foreground">{word.definition}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{word.definitionZh}</p>
              </section>

              {word.examples[0] ? (
                <section className="border-t border-[hsl(var(--paper-line)/0.72)] pt-4">
                  <p className="study-label">例句</p>
                  <p className="mt-3 text-sm leading-7 text-foreground">{word.examples[0].en}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{word.examples[0].zh}</p>
                </section>
              ) : null}
            </div>

            <section className="border-t border-[hsl(var(--paper-line)/0.72)] pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <p className="study-label">线索</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {word.synonyms.slice(0, 5).map((synonym) => (
                  <span key={synonym} className="rounded-md border border-primary/40 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                    {synonym}
                  </span>
                ))}
                {word.collocations.slice(0, 4).map((collocation) => (
                  <span key={collocation} className="rounded-md border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
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
    accent: 'border-amber-500/25 bg-amber-500/10 text-amber-600',
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

  const handleRate = useCallback(async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentItem) return;
    if (!sessionQueue) {
      setSessionQueue(reviewItems);
    }

    setSessionStats((prev) => ({
      ...prev,
      [rating]: prev[rating] + 1,
    }));

    reviewWord(currentItem.wordId, rating);
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

    toast.success(outcome === 'helped' ? '已记录：这个练习有帮助' : '已记录：仍然混淆，稍后继续练');
  }, [currentRecoveryPlan, userId]);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      // Ignore when focus is inside an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
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
    setSessionQueue(null);
    setCurrentIndex(0);
    setIsRevealed(false);
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
    setRecoveryOutcomes({});
  };

  if (reviewItems.length === 0) {
    return (
      <StudyShell>
        <StudySheet
          eyebrow={isZh ? '复习' : 'Review'}
          title={isZh ? '没有到期词' : 'No cards due'}
          description={isZh ? '今天先去练习。' : 'Practice first today.'}
          actions={
            <>
              <Button variant="outline" className="rounded-md border-border bg-transparent text-foreground hover:bg-muted" asChild>
                <Link to="/dashboard/today">{isZh ? '返回今日' : 'Back to Today'}</Link>
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md" asChild>
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
              <Button variant="outline" className="rounded-md border-border bg-card text-foreground hover:bg-muted" onClick={handleRestart}>
                <RotateCcw className="mr-2 h-4 w-4" />
                {isZh ? '再次复习' : 'Review again'}
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md" asChild>
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
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <StudyStatRows
            items={[
              { label: isZh ? '剩余' : 'Left', value: remainingCount },
              { label: isZh ? '目标' : 'Target', value: reviewTaskTarget },
              { label: isZh ? '进度' : 'Progress', value: `${Math.round(reviewedProgress)}%`, tone: 'practice' },
            ]}
            className="min-w-[260px]"
          />
        </div>
        <Progress value={Math.round(reviewedProgress)} className="mt-5 h-1.5 bg-muted [&_[data-slot=progress-indicator]]:bg-[hsl(var(--accent-practice))]" />
      </StudySheet>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-6">
          <QuestionSheet
            meta={isZh ? '复习' : 'Review'}
            title={isRevealed ? (isZh ? '给这次回忆打分' : 'Rate this card') : (isZh ? '回忆这个词' : 'Recall this word')}
            prompt={isRevealed ? (isZh ? '评分后继续。' : 'Rate, then continue.') : (isZh ? '想好后再看答案。' : 'Reveal after you recall.')}
          >
            <div className="space-y-5">
              {currentItem ? <ReviewCard item={currentItem} isRevealed={isRevealed} onReveal={handleReveal} /> : null}

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
                  <p>想好后再看答案。</p>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md" onClick={handleReveal}>
                    {isZh ? '看答案' : 'Reveal'}
                    <kbd className="ml-2 rounded border border-primary-foreground/20 bg-primary-foreground/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold">
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
          <StudyRailSection title={isZh ? '统计' : 'Stats'}>
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
              <div className="rounded-md border border-border bg-card p-4 space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <p className="text-sm font-medium">第 {currentItem.reviewCount + 1} 次复习</p>
                </div>
                {isCurrentCardStubborn ? (
                  <span className="rounded-md border border-[hsl(var(--warning)/0.28)] bg-[hsl(var(--warning)/0.1)] px-2.5 py-1 text-xs text-[hsl(var(--warning))]">
                    需要多复习
                  </span>
                ) : null}

                {/* Memory strength bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] text-muted-foreground">记忆</p>
                    <p className="text-xs font-semibold text-foreground">
                      {Math.round(currentItem.fsrs.retrievability * 100)}%
                    </p>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={cn(
                        'h-full rounded-full transition-colors',
                        currentItem.fsrs.retrievability >= 0.75 ? 'bg-[hsl(var(--success))]' :
                        currentItem.fsrs.retrievability >= 0.5  ? 'bg-amber-500' :
                        currentItem.fsrs.retrievability >= 0.25 ? 'bg-orange-500' :
                                                                   'bg-red-500',
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(currentItem.fsrs.retrievability * 100)}%` }}
                      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                  {currentItem.fsrs.lastReviewAt
                    ? `上次复习：${new Date(currentItem.fsrs.lastReviewAt).toLocaleString('zh-CN')}`
                    : '今日首次接触这张卡'}
                </p>
              </div>
            </StudyRailSection>
          ) : null}

          {currentItem && isRevealed && !currentRecoveryPlan && (currentItem.word.memoryTip || currentItem.word.etymology) ? (
            <StudyRailSection title={isZh ? '线索' : 'Cue'}>
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
