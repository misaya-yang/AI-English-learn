import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SampleLessonProps {
  isZh: boolean;
  continueHref: string;
  requiresSignIn: boolean;
}

const sampleWord = {
  word: 'mitigate',
  partOfSpeech: 'v.',
  phonetic: '/ˈmɪtɪɡeɪt/',
  definition: {
    en: 'to make something less severe, harmful, or painful',
    zh: '减轻；缓和；降低严重性',
  },
  example: {
    en: 'Small daily habits can mitigate exam stress.',
    zh: '每天的小习惯可以减轻考试压力。',
  },
  collocation: 'mitigate risk',
};

const normalizeAnswer = (value: string): string => value.trim().toLowerCase();

export function SampleLesson({ isZh, continueHref, requiresSignIn }: SampleLessonProps) {
  const [answer, setAnswer] = useState('');
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const isCorrect = submittedAnswer !== null && normalizeAnswer(submittedAnswer) === sampleWord.word;
  const hasFeedback = submittedAnswer !== null;
  const promptSentence = isZh
    ? 'Small daily habits can ___ exam stress.'
    : 'Small daily habits can ___ exam stress.';
  const copy = {
    eyebrow: isZh ? '60 秒样课' : '60-second sample lesson',
    title: isZh ? '先试一次单词练习' : 'Try one word exercise',
    intro: isZh
      ? '先理解这个词，再用它补全一句话。完成后可以继续进入今日学习。'
      : 'Understand the word, then use it to complete one sentence before continuing to Today.',
    wordLabel: isZh ? '今日样词' : 'Sample word',
    promptLabel: isZh ? '应用练习' : 'Use the word',
    answerLabel: isZh ? '输入缺失的单词' : 'Type the missing word',
    answerPlaceholder: isZh ? '例如：mitigate' : 'e.g. mitigate',
    submit: hasFeedback ? (isZh ? '再次检查' : 'Check again') : (isZh ? '检查答案' : 'Check answer'),
    tryAgain: isZh ? '再试一次' : 'Try again',
    continue: requiresSignIn
      ? (isZh ? '免费开始并继续' : 'Start free and continue')
      : (isZh ? '继续到今日' : 'Continue to Today'),
    correctTitle: isZh ? '答对了' : 'Correct.',
    correctBody: requiresSignIn
      ? (isZh
        ? '这次公开样课已完成。创建账号后可以继续进入今日学习；本页不会保存学习进度。'
        : 'This public sample is complete. Create an account to continue to Today; this page does not save learning progress.')
      : (isZh
        ? '这次公开样课已完成，可以继续进入今日学习；本页不会修改已保存的进度。'
        : 'This public sample is complete. Continue to Today when ready; this page does not change saved progress.'),
    wrongTitle: isZh ? '还差一点' : 'Close, not quite.',
    wrongBody: isZh
      ? 'mitigate 表示“减轻”。先把例句读一遍，再重新输入这个词。'
      : 'Mitigate means “make less severe.” Read the example once, then type the word again.',
    loop: isZh
      ? ['完成 1 句', '查看反馈', '准备继续']
      : ['1 sentence completed', 'Feedback checked', 'Ready to continue'],
    sampleOnly: isZh
      ? '这是公开样课，不会写入账号或本地学习进度。'
      : 'This public sample does not write to account or local learning progress.',
  };
  const feedbackTone = isCorrect
    ? 'border-[hsl(var(--accent-practice)/0.34)] bg-[hsl(var(--accent-practice)/0.08)]'
    : 'border-[hsl(var(--danger)/0.42)] bg-[hsl(var(--danger)/0.08)]';

  const loopItems = copy.loop;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedAnswer(answer);
  };

  const handleTryAgain = () => {
    setSubmittedAnswer(null);
    setAnswer('');
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      <div className="space-y-4">
        <span className="inline-flex rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {copy.eyebrow}
        </span>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            {copy.title}
          </h1>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            {copy.intro}
          </p>
        </div>
        <div className="rounded-xl bg-[hsl(var(--paper-muted)/0.26)] px-4 py-4 sm:px-5">
          <p className="text-xs font-medium text-muted-foreground">{copy.wordLabel}</p>
          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <h2 className="text-4xl font-semibold text-foreground">{sampleWord.word}</h2>
            <span className="text-sm text-muted-foreground">{sampleWord.partOfSpeech}</span>
            <span className="text-sm text-muted-foreground">{sampleWord.phonetic}</span>
          </div>
          <p className="mt-4 text-base leading-7 text-foreground">
            {isZh ? sampleWord.definition.zh : sampleWord.definition.en}
          </p>
          <p className="mt-3 rounded-lg bg-muted/35 px-3 py-2 text-sm leading-6 text-muted-foreground">
            {isZh ? sampleWord.example.zh : sampleWord.example.en}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{sampleWord.collocation}</p>
        </div>
      </div>

      <div className="rounded-xl bg-[hsl(var(--paper-muted)/0.22)] px-4 py-4 sm:px-5 sm:py-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{copy.promptLabel}</p>
            <p className="mt-2 text-xl font-semibold leading-8 text-foreground">{promptSentence}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sample-answer">{copy.answerLabel}</Label>
            <Input
              id="sample-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder={copy.answerPlaceholder}
              autoComplete="off"
              aria-invalid={hasFeedback && !isCorrect}
              aria-describedby={hasFeedback ? 'sample-feedback' : 'sample-progress-note'}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" className="rounded-lg" disabled={!answer.trim()}>
              {copy.submit}
            </Button>
            {hasFeedback ? (
              <Button type="button" variant="glass" className="rounded-lg" onClick={handleTryAgain}>
                <RotateCcw className="mr-2 h-4 w-4" />
                {copy.tryAgain}
              </Button>
            ) : null}
          </div>
        </form>

        {hasFeedback ? (
          <div
            id="sample-feedback"
            data-testid="sample-feedback"
            data-feedback-kind={isCorrect ? 'correct' : 'incorrect'}
            className={cn('mt-5 rounded-lg px-4 py-3', feedbackTone)}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <span className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                isCorrect
                  ? 'bg-[hsl(var(--accent-practice)/0.14)] text-[hsl(var(--accent-practice))]'
                  : 'bg-[hsl(var(--danger)/0.14)] text-[hsl(var(--danger))]',
              )}>
                {isCorrect ? (
                  <Check data-testid="sample-feedback-icon-correct" className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <X data-testid="sample-feedback-icon-incorrect" className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  {isCorrect ? copy.correctTitle : copy.wrongTitle}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {isCorrect ? copy.correctBody : copy.wrongBody}
                </p>
                {isCorrect ? (
                  <>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {loopItems.map((item) => (
                        <span key={item} className="rounded-md bg-background/50 px-3 py-2 text-xs font-medium text-foreground">
                          {item}
                        </span>
                      ))}
                    </div>
                    <Button asChild className="mt-4 rounded-lg">
                      <Link to={continueHref}>
                        {copy.continue}
                      </Link>
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <p
            id="sample-progress-note"
            className="mt-5 border-t border-border/20 pt-4 text-xs leading-5 text-muted-foreground"
          >
            {copy.sampleOnly}
          </p>
        )}
      </div>
    </section>
  );
}
