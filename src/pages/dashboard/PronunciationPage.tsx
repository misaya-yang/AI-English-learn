import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RefreshCw, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motionPresets } from '@/lib/motion';
import { usePronunciationSession } from '@/hooks/usePronunciationSession';
import { isSpeechRecognitionSupported } from '@/services/pronunciationScorer';
import { speakEnglishText } from '@/services/tts';
import { ScoreRadial } from '@/features/pronunciation/components/ScoreRadial';
import { PhonemeIssueList } from '@/features/pronunciation/components/PhonemeIssueList';
import { RecordButton } from '@/features/pronunciation/components/RecordButton';
import { useUserData } from '@/contexts/UserDataContext';
import { LearningCompletionState } from '@/features/learning/components/LearningWorkspace';

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
  const completedCount = session.records.length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

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

  const pronunciationRecap = session.result ? (
    <LearningCompletionState
      icon={CheckCircle2}
      eyebrow={isZh ? '发音结果' : 'Pronunciation result'}
      title={isZh ? `本次发音 ${session.result.overallScore}/100` : `Pronunciation score ${session.result.overallScore}/100`}
      description={
        session.result.overallScore >= 80
          ? (isZh ? '目标音已经比较清楚，下一步可以切到句子模式练连读和语调。' : 'The target sound is clear. Switch to sentence mode for linking and intonation.')
          : session.result.overallScore >= 60
            ? (isZh ? '整体可懂度不错，继续看准确度、流利度和语调哪一项拖后腿。' : 'Overall intelligibility is workable. Check which dimension is holding the score back.')
            : (isZh ? '先听标准音，再慢速重录一遍，重点对齐音素和重音。' : 'Listen to the model, slow down, and retry with phoneme and stress alignment.')
      }
      metrics={[
        { label: isZh ? '总分' : 'Overall', value: `${session.result.overallScore}/100`, accent: session.result.overallScore >= 80 ? 'emerald' : session.result.overallScore >= 60 ? 'warm' : undefined },
        { label: isZh ? '准确度' : 'Accuracy', value: session.result.dimensions.accuracy },
        { label: isZh ? '流利度' : 'Fluency', value: session.result.dimensions.fluency },
        { label: isZh ? '语调' : 'Intonation', value: session.result.dimensions.intonation },
      ]}
      actions={
        <>
          <Button variant="outline" onClick={() => session.reset()} className="rounded-md border-border bg-card">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('pronunciation.tryAgain')}
          </Button>
          {currentIndex < items.length - 1 && (
            <Button onClick={handleNext} className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
              {t('common.next')}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </>
      }
    />
  ) : null;

  if (!supported) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-6">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">
          {isZh ? '浏览器不支持语音识别' : 'Speech Recognition Not Supported'}
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {isZh
            ? '请使用 Chrome、Edge 或 Safari 浏览器来使用发音练习功能。'
            : 'Please use Chrome, Edge, or Safari to use the pronunciation practice feature.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      {pronunciationRecap}

      <motion.section
        {...motionPresets.fadeIn}
        className="rounded-md border border-border bg-card p-4 sm:p-5"
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

            <div className="rounded-md border border-border bg-background p-4">
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
                <Button variant="outline" className="rounded-md" onClick={handlePlayAudio}>
                  <Volume2 className="mr-2 h-4 w-4" />
                  {isZh ? '听标准音' : 'Hear model'}
                </Button>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item ? (isZh ? item.definitionZh : item.definition) : ''}
              </p>
            </div>
          </div>

          <div className="rounded-md border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {isZh ? '录音反馈' : 'Recording feedback'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isZh ? '录完后查看准确度、流利度和语调。' : 'Record once, then check accuracy, fluency, and intonation.'}
                </p>
              </div>
              <div className="rounded-md border border-border bg-card px-4 py-3 text-right">
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
                <div key={stat.label} className="rounded-md border border-border bg-card p-3 text-center">
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
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {completedCount}/{items.length}
        </span>
      </div>

      {/* Mode tabs */}
      <Tabs value={mode} onValueChange={(v) => { setMode(v as PracticeMode); session.reset(); }}>
        <TabsList className="w-full">
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
                <RecordButton
                  status={session.status}
                  onStart={handleRecord}
                  onCancel={session.cancelListening}
                />
              </div>

              {session.status === 'listening' && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  {t('pronunciation.listening')}
                </p>
              )}
              {session.status === 'scoring' && (
                <p className="text-sm text-muted-foreground">
                  {t('pronunciation.scoring')}
                </p>
              )}
              {session.status === 'error' && (
                <p className="text-sm text-destructive">{session.errorMessage}</p>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {session.result && (
            <motion.div {...motionPresets.fadeInUp} className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t('pronunciation.results')}</CardTitle>
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
                  <div className="flex justify-around">
                    <ScoreRadial
                      score={session.result.dimensions.accuracy}
                      label={t('pronunciation.accuracy')}
                    />
                    <ScoreRadial
                      score={session.result.dimensions.fluency}
                      label={t('pronunciation.fluency')}
                    />
                    <ScoreRadial
                      score={session.result.dimensions.intonation}
                      label={t('pronunciation.intonation')}
                    />
                  </div>

                  {/* Overall */}
                  <div className="text-center">
                    <span className="text-3xl font-bold">
                      {session.result.overallScore}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">/ 100</span>
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
                    <p className="text-xs text-muted-foreground text-center">
                      {t('pronunciation.localOnly')}
                    </p>
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
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('common.previous')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === items.length - 1}
            >
              {t('common.next')}
              <ChevronRight className="h-4 w-4 ml-1" />
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
