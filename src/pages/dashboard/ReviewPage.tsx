import { useState, useEffect, useCallback, useMemo, type KeyboardEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserData } from '@/contexts/UserDataContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CoachReviewRail } from '@/features/coach/CoachReviewRail';
import {
  LearningCompletionState,
  LearningEmptyState,
  LearningMetricStrip,
  LearningRailSection,
  LearningShellFrame,
  LearningWorkspaceSurface,
  learningFrameClassName,
} from '@/features/learning/components/LearningWorkspace';
import {
  RotateCcw,
  Volume2,
  Check,
  X,
  Clock3,
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
import { LearningCockpitShell } from '@/features/learning/components/LearningCockpitShell';
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
      className={cn(learningFrameClassName, 'min-h-[360px] p-5 sm:p-6')}
    >
      {!isRevealed ? (
        <div
          role="button"
          tabIndex={0}
          onClick={onReveal}
          onKeyDown={handleRevealKeyDown}
          className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Badge className="rounded-md border border-border bg-muted px-3 py-1 text-muted-foreground hover:bg-muted">
            {word.level} · 第 {item.reviewCount + 1} 次复习
          </Badge>
          <p className="mt-6 text-[11px] text-muted-foreground">先回忆</p>
          <h2 className="mt-4 text-[2.9rem] font-semibold leading-none text-foreground sm:text-[4rem]">
            {word.word}
          </h2>
          <p className="mt-4 font-mono text-lg text-muted-foreground">{word.partOfSpeech} · {word.phonetic}</p>

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
            <span className="text-sm text-muted-foreground">先回忆，再揭晓答案</span>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] text-muted-foreground">答案已揭晓</p>
              <h2 className="mt-2 text-3xl font-semibold text-foreground">{word.word}</h2>
              <p className="mt-1 font-mono text-sm text-muted-foreground">{word.partOfSpeech} · {word.phonetic}</p>
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
              <section className="rounded-md border border-border bg-card p-4">
                <p className="text-[11px] text-muted-foreground">释义</p>
                <p className="mt-3 text-base leading-7 text-foreground">{word.definition}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{word.definitionZh}</p>
              </section>

              {word.examples[0] ? (
                <section className="rounded-md border border-border bg-card p-4">
                  <p className="text-[11px] text-muted-foreground">例句</p>
                  <p className="mt-3 text-sm leading-7 text-foreground">{word.examples[0].en}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{word.examples[0].zh}</p>
                </section>
              ) : null}
            </div>

            <section className="rounded-md border border-border bg-card p-4">
              <p className="text-[11px] text-muted-foreground">提示</p>
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
    labelZh: '忘记',
    labelEn: 'Again',
    delayZh: '马上重见',
    delayEn: '< 1 min',
    key: '1',
    accent: 'border-destructive/30 bg-destructive/5 text-destructive',
  },
  hard:  {
    labelZh: '较难',
    labelEn: 'Hard',
    delayZh: '短间隔复现',
    delayEn: '2 days',
    key: '2',
    accent: 'border-amber-500/25 bg-amber-500/10 text-amber-600',
  },
  good:  {
    labelZh: '良好',
    labelEn: 'Good',
    delayZh: '约 5 天后复习',
    delayEn: '5 days',
    key: '3',
    accent: 'border-green-500/30 bg-green-50 text-green-700',
  },
  easy:  {
    labelZh: '简单',
    labelEn: 'Easy',
    delayZh: '约 10 天后复习',
    delayEn: '10 days',
    key: '4',
    accent: 'border-sky-500/25 bg-sky-500/10 text-sky-700',
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
      // contributes a card on its own — buildReviewSession refuses to
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
    // LEARN-05 — emit session_ended on completion.
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
    // LEARN-02 — strict review_completed event for path-progress derivation.
    void recordEvent(userId, {
      kind: 'review_completed',
      payload: { wordId: currentItem.wordId, rating },
    });
    if (totalReviewed + 1 >= reviewTaskTarget) {
      completeMissionTask('task_review_today');
    }

    const interval = isZh ? ratingMeta[rating].delayZh : ratingMeta[rating].delayEn;
    toast.success(`${isZh ? '复习已记录' : 'Review recorded'} · ${isZh ? '下次' : 'Next'}: ${interval}`);

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
      <LearningShellFrame>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <LearningEmptyState
            icon={Check}
            eyebrow={isZh ? '复习队列' : 'Review queue'}
            title={isZh ? '当前没有到期复习' : 'No review cards due right now'}
            description={
              isZh
                ? '今天没有必须复习的卡片。可以做一次短练习；如果有补充复习，会显示在右侧。'
                : 'No cards are due right now. You can do a short Practice session; extra review items appear on the right.'
            }
            metrics={[
              { label: isZh ? '到期卡片' : 'Due cards', value: 0, accent: 'memory' },
            ]}
            actions={
              <>
                <Button variant="outline" className="rounded-md border-border bg-card text-foreground hover:bg-muted" asChild>
                  <Link to="/dashboard/today">{isZh ? '返回今日' : 'Back to Today'}</Link>
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md" asChild>
                  <Link to="/dashboard/practice">{isZh ? '做巩固练习' : 'Reinforce in Practice'}</Link>
                </Button>
              </>
            }
          />
          <div className="space-y-6">
            <LearningRailSection title={isZh ? '队列为什么为空' : 'Why the queue is empty'}>
              <LearningMetricStrip
                items={[
                  { label: isZh ? '到期卡' : 'Due cards', value: 0, accent: 'memory' },
                  { label: isZh ? '今日新词' : 'Today words', value: dailyWords.length },
                  { label: isZh ? '任务目标' : 'Mission target', value: reviewTaskTarget },
                ]}
                className="border-t-0 pt-0"
              />
              <div className="rounded-md border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">
                  {isZh ? '没有到期卡是正常状态。' : 'No due cards is normal.'}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {isZh
                    ? '复习卡会在到期时出现。现在更适合做一次短练习。'
                    : 'Review cards appear when they are due. For now, a short practice session is enough.'}
                </p>
              </div>
            </LearningRailSection>
            <CoachReviewRail language={language} />
          </div>
        </div>
      </LearningShellFrame>
    );
  }

  if (isComplete) {
    const accuracy = totalReviewed > 0 ? Math.round(((sessionStats.good + sessionStats.easy) / totalReviewed) * 100) : 0;

    return (
      <LearningShellFrame>
        <SessionRecapCard
          input={{
            kind: 'review',
            stats: sessionStats,
            language,
            coachReviews: { dueCount: dueCoachReviewCount },
          }}
        />
        <LearningCompletionState
          icon={Check}
          eyebrow={isZh ? '复习完成' : 'Review complete'}
          title="本轮复习已经完成"
          description="这一轮已经结束。"
          metrics={[
            { label: isZh ? '已复习' : 'Reviewed', value: totalReviewed, accent: 'memory' },
            { label: isZh ? '正确率' : 'Accuracy', value: `${accuracy}%`, accent: 'success' },
            { label: isZh ? '遗忘 / 较难' : 'Again / Hard', value: `${sessionStats.again} / ${sessionStats.hard}`, accent: 'warm' },
          ]}
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
        />
      </LearningShellFrame>
    );
  }

  return (
    <LearningCockpitShell
      language={language}
      eyebrow={language.startsWith('zh') ? '词汇复习' : 'Vocabulary review'}
      progress={Math.round(reviewedProgress)}
      progressLabel={language.startsWith('zh') ? '回合进度' : 'Round progress'}
      mission={{
        title: language.startsWith('zh')
          ? '先回忆，再揭晓答案。'
          : 'Recall first, then reveal.',
        description: language.startsWith('zh')
          ? '这里展示今天到期的复习卡。补充复习会放在右侧列表。'
          : 'This round shows cards due today. Extra review items are listed on the right.',
      }}
      metrics={[
        { label: language.startsWith('zh') ? '剩余卡片' : 'Remaining', value: remainingCount, accent: 'memory' },
        { label: language.startsWith('zh') ? '任务目标' : 'Mission target', value: reviewTaskTarget },
        { label: language.startsWith('zh') ? '当前卡片' : 'Current card', value: `${Math.min(currentIndex + 1, reviewItems.length)} / ${reviewItems.length}` },
        ...(isCurrentCardStubborn ? [{ label: language.startsWith('zh') ? '强化路径' : 'Reinforcement', value: `Lapse ${currentItem?.fsrs.lapses || 0}`, accent: 'warm' as const }] : []),
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <LearningWorkspaceSurface
            eyebrow={isZh ? '词汇卡片' : 'Vocabulary card'}
            title={isRevealed ? '答案已揭晓，给这次回忆打分' : '先在脑中回忆，再决定是否揭晓'}
            description={isRevealed ? '直接评分，然后继续。' : undefined}
          >
            <div className="space-y-5">
              {currentItem ? <ReviewCard item={currentItem} isRevealed={isRevealed} onReveal={handleReveal} /> : null}

              {currentRecoveryPlan && isRevealed ? (
                <section
                  data-testid="stubborn-recovery-panel"
                  className="rounded-md border border-amber-500/25 bg-amber-500/[0.06] p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Badge className="rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-700 hover:bg-amber-500/10">
                        {isZh ? '顽固词恢复' : 'Stubborn recovery'}
                      </Badge>
                      <h3 className="mt-3 text-lg font-semibold text-foreground">
                        {isZh ? currentRecoveryPlan.titleZh : currentRecoveryPlan.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {isZh ? currentRecoveryPlan.reasonZh : currentRecoveryPlan.reason}
                      </p>
                    </div>
                    {currentRecoveryOutcome ? (
                      <Badge variant="secondary" className="rounded-md">
                        {currentRecoveryOutcome === 'helped'
                          ? (isZh ? '已标记有帮助' : 'Marked helpful')
                          : (isZh ? '已标记仍混淆' : 'Marked still confusing')}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {[
                      {
                        label: isZh ? '助记钩子' : 'Mnemonic hook',
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
                      <div key={block.label} className="rounded-lg border border-border bg-card p-3">
                        <p className="text-[11px] font-medium text-amber-700">{block.label}</p>
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
                      {isZh ? '这个练法有帮助' : 'This helped'}
                    </Button>
                    <Button
                      variant={currentRecoveryOutcome === 'still_confusing' ? 'default' : 'outline'}
                      className="rounded-md"
                      onClick={() => handleRecoveryOutcome('still_confusing')}
                    >
                      <X className="mr-2 h-4 w-4" />
                      {isZh ? '还是容易混淆' : 'Still confusing'}
                    </Button>
                    <Button variant="outline" className="rounded-md" asChild>
                      <Link to={`/dashboard/chat?focus=stubborn-recovery&word=${encodeURIComponent(currentRecoveryPlan.wordId)}`}>
                        {isZh ? '打开答疑' : 'Open help'}
                      </Link>
                    </Button>
                  </div>
                </section>
              ) : null}

              {isRevealed ? (
                <div className="grid gap-3 lg:grid-cols-4">
                  {(Object.entries(ratingMeta) as Array<[keyof typeof ratingMeta, (typeof ratingMeta)[keyof typeof ratingMeta]]>).map(([rating, meta]) => (
                    <Button
                      key={rating}
                      variant="outline"
                      aria-keyshortcuts={meta.key}
	                className={cn(
	                        'h-auto flex-col items-start gap-1 rounded-lg border px-4 py-4 text-left hover:text-current hover-lift',
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
	                <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-muted-foreground">先回忆，再揭晓。</p>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md" onClick={handleReveal}>
                    {isZh ? '揭示答案' : 'Reveal answer'}
                    <kbd className="ml-2 rounded border border-primary-foreground/20 bg-primary-foreground/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                      Space
                    </kbd>
                  </Button>
                </div>
              )}
            </div>
          </LearningWorkspaceSurface>
        </div>

        <div className="space-y-6">
          <CoachReviewRail language={language} />

          <LearningRailSection title="本次统计">
            <LearningMetricStrip
              items={[
                { label: isZh ? '遗忘' : 'Again', value: sessionStats.again, accent: 'warm' },
                { label: isZh ? '较难' : 'Hard', value: sessionStats.hard, accent: 'warm' },
                { label: isZh ? '良好' : 'Good', value: sessionStats.good, accent: 'success' },
              ]}
              className="border-t-0 pt-0"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-md border border-border bg-card p-4">
                <p className="text-[11px] text-muted-foreground">已完成</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{totalReviewed} / {reviewItems.length}</p>
              </div>
              <div className="rounded-md border border-border bg-card p-4">
                <p className="text-[11px] text-muted-foreground">当前阶段</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{isRevealed ? '打分' : '先回忆'}</p>
              </div>
            </div>
          </LearningRailSection>

          <LearningRailSection title={isZh ? '评分指南' : 'Rating guide'}>
            <div className="space-y-3">
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <X className="h-4 w-4" />
                  <p className="text-sm font-semibold">{isZh ? '遗忘' : 'Again'}</p>
                </div>
                  <p className="mt-2 text-sm text-muted-foreground">马上重见</p>
                </div>
              <div className="rounded-md border border-amber-500/20 bg-amber-500/[0.06] p-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <Lightbulb className="h-4 w-4" />
                  <p className="text-sm font-semibold">{isZh ? '较难' : 'Hard'}</p>
                </div>
                  <p className="mt-2 text-sm text-muted-foreground">短间隔复现</p>
                </div>
              <div className="rounded-md border border-green-500/30 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="h-4 w-4" />
                  <p className="text-sm font-semibold">{isZh ? '良好 / 简单' : 'Good / Easy'}</p>
                </div>
                  <p className="mt-2 text-sm text-muted-foreground">拉长间隔</p>
                </div>
              {isCurrentCardStubborn ? (
                <div className="rounded-md border border-amber-500/20 bg-amber-500/[0.06] p-4">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Lightbulb className="h-4 w-4" />
                    <p className="text-sm font-semibold">{isZh ? '强化路径' : 'Reinforcement path'}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {currentRecoveryPlan
                      ? (isZh
                        ? '先完成这个练习，再给卡片评分。'
                        : 'Finish this drill before rating the card.')
                      : `这张卡已经遗忘 ${currentItem?.fsrs.lapses || 0} 次，系统会把它放进更短的强化复习回路。`}
                  </p>
                  {currentRecoveryOutcome ? (
                    <p className="mt-2 text-xs font-medium text-amber-700">
                      {currentRecoveryOutcome === 'helped'
                        ? (isZh ? '恢复反馈：有帮助' : 'Recovery feedback: helpful')
                        : (isZh ? '恢复反馈：仍混淆' : 'Recovery feedback: still confusing')}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </LearningRailSection>

          {currentItem ? (
            <LearningRailSection title={isZh ? '当前卡片' : 'Current card'}>
              <div className="rounded-md border border-border bg-card p-4 space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Clock3 className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium">第 {currentItem.reviewCount + 1} 次复习</p>
                </div>
                {isCurrentCardStubborn ? (
                  <Badge className="rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-600 hover:bg-amber-500/10">
                    顽固词强化中
                  </Badge>
                ) : null}

                {/* Memory strength bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] text-muted-foreground">记忆强度</p>
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
                <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                  复习间隔参数：{currentItem.fsrs.stability.toFixed(1)} 天 · 难度 {currentItem.fsrs.difficulty.toFixed(1)}
                </div>
              </div>
            </LearningRailSection>
          ) : null}

          {/* Memory cue */}
          {currentItem && isRevealed && !currentRecoveryPlan && (currentItem.word.memoryTip || currentItem.word.etymology) ? (
            <LearningRailSection title={isZh ? '记忆线索' : 'Memory cue'}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-md border border-[hsl(var(--accent-memory)/0.2)] bg-[hsl(var(--accent-memory)/0.08)] p-4"
              >
                <div className="flex items-center gap-2 text-[hsl(var(--accent-memory))] mb-2">
                  <Lightbulb className="h-4 w-4" />
                  <p className="text-sm font-semibold">{isZh ? '助记提示' : 'Memory hint'}</p>
                </div>
                <p className="text-sm leading-6 text-foreground">
                  {currentItem.word.memoryTip || currentItem.word.etymology}
                </p>
              </motion.div>
            </LearningRailSection>
          ) : null}
        </div>
      </div>
    </LearningCockpitShell>
  );
}
