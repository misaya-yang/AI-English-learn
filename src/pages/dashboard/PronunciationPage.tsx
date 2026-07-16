import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Volume2, RefreshCw, AlertCircle, MessageSquare, Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motionPresets } from '@/lib/motion';
import { usePronunciationSession, type SessionStatus } from '@/hooks/usePronunciationSession';
import { isSpeechRecognitionSupported } from '@/services/pronunciationScorer';
import { speakEnglishText } from '@/services/tts';
import { ScoreRadial } from '@/features/pronunciation/components/ScoreRadial';
import { PhonemeIssueList } from '@/features/pronunciation/components/PhonemeIssueList';
import { useUserData } from '@/contexts/UserDataContext';

// ─── Practice word list (curated from user's vocabulary) ────────────────────

interface PracticeItem {
  id: string;
  word: string;
  phonetic: string;
  definition: string;
  definitionZh: string;
  exampleSentence: string;
}

function usePracticeItems(): PracticeItem[] {
  const { dailyWords } = useUserData();

  return useMemo(() => {
    const items: PracticeItem[] = dailyWords.slice(0, 20).map((w) => ({
      id: w.id,
      word: w.word,
      phonetic: w.phonetic || '',
      definition: w.definition,
      definitionZh: w.definitionZh || w.definition,
      exampleSentence: w.examples?.[0]?.en || `The word "${w.word}" is commonly used.`,
    }));

    if (items.length === 0) {
      // Fallback practice items
      return [
        { id: 'demo-1', word: 'pronunciation', phonetic: '/prəˌnʌnsiˈeɪʃən/', definition: 'the way in which a word is pronounced', definitionZh: '发音', exampleSentence: 'Her pronunciation of French words is excellent.' },
        { id: 'demo-2', word: 'vocabulary', phonetic: '/vəˈkæbjəˌleri/', definition: 'the body of words used in a language', definitionZh: '词汇', exampleSentence: 'Reading helps expand your vocabulary.' },
        { id: 'demo-3', word: 'fluency', phonetic: '/ˈfluːənsi/', definition: 'the ability to speak smoothly', definitionZh: '流利度', exampleSentence: 'She speaks English with great fluency.' },
        { id: 'demo-4', word: 'intonation', phonetic: '/ˌɪntəˈneɪʃən/', definition: 'the rise and fall of the voice', definitionZh: '语调', exampleSentence: 'Intonation can change the meaning of a sentence.' },
        { id: 'demo-5', word: 'articulate', phonetic: '/ɑːrˈtɪkjələt/', definition: 'to speak clearly', definitionZh: '清晰地表达', exampleSentence: 'He articulated his ideas clearly in the meeting.' },
      ];
    }

    return items;
  }, [dailyWords]);
}

// ─── Mode: word or sentence ─────────────────────────────────────────────────

type PracticeMode = 'word' | 'sentence';

function PronunciationRecordButton({
  status,
  onStart,
  onCancel,
}: {
  status: SessionStatus;
  onStart: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const isListening = status === 'listening';
  const isScoring = status === 'scoring';
  const isBusy = isListening || isScoring;

  return (
    <Button
      size="lg"
      variant={isListening ? 'destructive' : 'default'}
      className={`h-16 w-16 rounded-full p-0 ${isListening && !shouldReduceMotion ? 'animate-pulse' : ''}`}
      onClick={isBusy ? onCancel : onStart}
      disabled={isScoring}
      aria-label={isListening ? t('pronunciation.stopRecording') : t('pronunciation.startRecording')}
    >
      {isScoring ? (
        <Loader2 className={`h-6 w-6 ${shouldReduceMotion ? '' : 'animate-spin'}`} />
      ) : isListening ? (
        <Square className="h-6 w-6" />
      ) : (
        <Mic className="h-6 w-6" />
      )}
    </Button>
  );
}

function AccessibleScoreRadial({
  score,
  label,
  isZh,
}: {
  score: number;
  label: string;
  isZh: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={isZh ? `${label}：${score} 分，满分 100` : `${label}: ${score} out of 100`}
      className="flex justify-center"
    >
      <ScoreRadial score={score} label={label} />
    </div>
  );
}

export default function PronunciationPage() {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');
  const items = usePracticeItems();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<PracticeMode>('word');
  const session = usePronunciationSession();
  const supported = isSpeechRecognitionSupported();

  const item = items[currentIndex] ?? items[0];
  const targetText = item ? (mode === 'word' ? item.word : item.exampleSentence) : '';
  const completedItemIds = useMemo(
    () => new Set(session.records.map((record) => record.wordId)),
    [session.records],
  );
  const completedCount = completedItemIds.size;
  const progressPercent = items.length > 0
    ? Math.min(100, Math.round((completedCount / items.length) * 100))
    : 0;
  const fallbackPrompt = isZh
    ? '请和我进行一个英语口语文字练习。请扮演考官或对话伙伴，先给我一个简短情境，再根据我的回答追问，并最后总结 2 个发音或表达建议。'
    : 'Run a text-based English speaking practice with me. Act as an examiner or conversation partner, give me a short scenario, ask follow-up questions, and finish with 2 pronunciation or expression tips.';
  const fallbackHref = `/dashboard/chat?dailyPlan=speaking-fallback&reason=${encodeURIComponent('speaking fallback')}&focus=${encodeURIComponent(isZh ? '文字口语练习' : 'Text speaking practice')}&prompt=${encodeURIComponent(fallbackPrompt)}`;

  const handleNext = () => {
    session.reset();
    setCurrentIndex((i) => Math.min(i + 1, items.length - 1));
  };

  const handlePrev = () => {
    session.reset();
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const handleRecord = () => {
    if (!item) return;
    session.startListening(targetText, item.id, item.phonetic);
  };

  const handlePlayAudio = () => {
    speakEnglishText(targetText, { rate: 0.85 });
  };

  if (!supported) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-6">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">
          {isZh ? '浏览器不支持语音识别' : 'Speech Recognition Not Supported'}
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {isZh
            ? '请使用 Chrome、Edge 或 Safari 浏览器来使用发音练习功能。你也可以先进入文字口语练习，不需要麦克风。'
            : 'Please use Chrome, Edge, or Safari to use the pronunciation practice feature. You can also continue with text speaking practice without a microphone.'}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to={fallbackHref}>
              <MessageSquare className="mr-2 h-4 w-4" />
              {isZh ? '进入文字口语练习' : 'Start text speaking practice'}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-open-route mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <motion.section
        {...motionPresets.fadeIn}
        className="learning-open-hero pb-5"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] lg:items-stretch">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {isZh ? '发音' : 'Pronunciation'}
              </p>
              <h1 className="mt-2 text-2xl font-bold">
                {t('pronunciation.title')}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {t('pronunciation.subtitle')}
              </p>
            </div>

            <div className="learning-open-panel py-1">
              <p className="text-xs font-medium text-muted-foreground">
                {isZh ? '当前内容' : 'Current item'}
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-3xl font-bold">{targetText}</p>
                  {mode === 'word' && item?.phonetic ? (
                    <p className="mt-1 font-mono text-sm text-muted-foreground">{item.phonetic}</p>
                  ) : null}
                </div>
                <Button variant="glass" className="rounded-lg" onClick={handlePlayAudio}>
                  <Volume2 className="mr-2 h-4 w-4" />
                  {isZh ? '听标准音' : 'Hear model'}
                </Button>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item ? (isZh ? item.definitionZh : item.definition) : ''}
              </p>
            </div>
          </div>

          <div className="learning-open-panel py-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {isZh ? '录音反馈' : 'Recording feedback'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isZh ? '录完后查看准确度、流利度和语调。' : 'Record once, then check accuracy, fluency, and intonation.'}
                </p>
              </div>
              <div className="rounded-lg bg-[hsl(var(--paper-muted)/0.22)] px-4 py-2 text-right">
                <span className="block text-lg font-semibold text-foreground">80+</span>
                <span className="block text-[11px] text-muted-foreground">{isZh ? '目标分' : 'goal'}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: isZh ? '模式' : 'Mode', value: mode === 'word' ? (isZh ? '单词' : 'Word') : (isZh ? '句子' : 'Sentence') },
                { label: isZh ? '进度' : 'Progress', value: `${completedCount}/${items.length}` },
                { label: isZh ? '记录' : 'Records', value: session.records.length },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg bg-[hsl(var(--paper-muted)/0.22)] px-3 py-2 text-center">
                  <p className="text-base font-semibold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <Progress value={progressPercent} className="flex-1" />
        <span
          className="whitespace-nowrap text-xs text-muted-foreground"
          aria-label={
            isZh
              ? `已完成 ${completedCount} 个，共 ${items.length} 个练习`
              : `${completedCount} of ${items.length} practice items completed`
          }
        >
          {completedCount}/{items.length}
        </span>
      </div>

      {/* Mode tabs */}
      <Tabs value={mode} onValueChange={(v) => { setMode(v as PracticeMode); session.reset(); }}>
        <TabsList className="liquid-glass-control w-full rounded-lg p-1">
          <TabsTrigger value="word" className="flex-1">
            {t('pronunciation.wordMode')}
          </TabsTrigger>
          <TabsTrigger value="sentence" className="flex-1">
            {t('pronunciation.sentenceMode')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={mode}>
          {/* Target card */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {currentIndex + 1} / {items.length}
                </Badge>
                <Button variant="ghost" size="icon" onClick={handlePlayAudio} aria-label={t('word.listen')}>
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${item?.id ?? 'empty'}-${mode}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-3xl font-bold">{targetText}</p>
                  {mode === 'word' && item?.phonetic && (
                    <p className="text-sm text-muted-foreground mt-1 font-mono">
                      {item.phonetic}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    {item ? (isZh ? item.definitionZh : item.definition) : ''}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Record button */}
              <div className="flex justify-center pt-4">
                <PronunciationRecordButton
                  status={session.status}
                  onStart={handleRecord}
                  onCancel={session.cancelListening}
                />
              </div>

              {session.status === 'listening' && (
                <p className="animate-pulse text-sm text-muted-foreground motion-reduce:animate-none">
                  {t('pronunciation.listening')}
                </p>
              )}
              {session.status === 'scoring' && (
                <p className="text-sm text-muted-foreground">
                  {t('pronunciation.scoring')}
                </p>
              )}
              {session.status === 'error' && (
                <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-left">
                  <p className="text-sm font-medium text-destructive">{session.errorMessage}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isZh
                      ? '如果浏览器没有听到声音或拒绝了权限，可以重试，或先进入不需要麦克风的文字口语练习。'
                      : 'If the browser did not hear speech or permission was denied, retry here or continue with text speaking practice without a microphone.'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={session.reset}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t('pronunciation.tryAgain')}
                    </Button>
                    <Button asChild size="sm">
                      <Link to={fallbackHref}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {isZh ? '文字口语练习' : 'Text speaking practice'}
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {session.result && (
            <motion.div {...motionPresets.fadeInUp} className="mt-4 space-y-4">
              <Card>
                <CardHeader className="gap-2 pb-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        {isZh ? '发音结果' : 'Pronunciation result'}
                      </p>
                      <CardTitle className="mt-1 text-lg">
                        {isZh
                          ? `本次发音 ${session.result.overallScore}/100`
                          : `Pronunciation score ${session.result.overallScore}/100`}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="w-fit rounded-md text-sm">
                      {session.result.overallScore}/100
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {session.result.overallScore >= 80
                      ? (isZh ? '目标音已经比较清楚，可以继续练连读和语调。' : 'The target sound is clear. Continue with linking and intonation.')
                      : session.result.overallScore >= 60
                        ? (isZh ? '整体可懂度不错，优先处理最低分维度。' : 'Overall intelligibility is workable. Focus on the lowest dimension.')
                        : (isZh ? '先听标准音，再慢速重录并对齐音素和重音。' : 'Listen to the model, slow down, and retry with phoneme and stress alignment.')}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Recognized text */}
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      {t('pronunciation.youSaid')}
                    </p>
                    <p className="text-sm font-medium">{session.result.transcript}</p>
                  </div>

                  {/* Score radials */}
                  <div className="grid gap-3 min-[420px]:grid-cols-3">
                    <AccessibleScoreRadial
                      score={session.result.dimensions.accuracy}
                      label={t('pronunciation.accuracy')}
                      isZh={isZh}
                    />
                    <AccessibleScoreRadial
                      score={session.result.dimensions.fluency}
                      label={t('pronunciation.fluency')}
                      isZh={isZh}
                    />
                    <AccessibleScoreRadial
                      score={session.result.dimensions.intonation}
                      label={t('pronunciation.intonation')}
                      isZh={isZh}
                    />
                  </div>

                  {/* Phoneme issues */}
                  {(session.result.phonemeIssues?.length ?? 0) > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        {t('pronunciation.phonemeIssues')}
                      </h3>
                      <PhonemeIssueList issues={session.result.phonemeIssues} />
                    </div>
                  )}

                  {!session.result.hasAiFeedback && (
                    <div className="rounded-lg border border-border bg-muted/35 p-3 text-sm">
                      <p className="font-medium">
                        {isZh ? '本地分析模式' : 'Local analysis mode'}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {isZh
                          ? 'AI 音素反馈暂不可用，当前分数仅根据识别文本、语速和置信度本地计算。'
                          : 'AI phoneme feedback is unavailable. This score uses local transcript, pace, and confidence analysis only.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              {t('common.previous')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === items.length - 1}
            >
              {t('common.next')}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Session history */}
      {session.records.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('pronunciation.history')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {session.records.slice(0, 10).map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between rounded-lg border p-2.5 text-sm"
                >
                  <div>
                    <span className="font-medium">{rec.word}</span>
                    <span className="text-muted-foreground ml-2 font-mono text-xs">
                      {rec.phonetic}
                    </span>
                  </div>
                  <Badge
                    variant={rec.result.overallScore >= 70 ? 'default' : 'secondary'}
                  >
                    {rec.result.overallScore}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
