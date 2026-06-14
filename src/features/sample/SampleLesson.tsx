import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SampleLessonProps {
  isZh: boolean;
  saveProgressHref: string;
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

export function SampleLesson({ isZh, saveProgressHref }: SampleLessonProps) {
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
      ? '先看词义，再填一次空。答完后可以保存到今日学习。'
      : 'Read the word, fill the blank, then save it to today if you want.',
    wordLabel: isZh ? '今日样词' : 'Sample word',
    promptLabel: isZh ? '回想练习' : 'Recall prompt',
    answerLabel: isZh ? '输入缺失的单词' : 'Type the missing word',
    answerPlaceholder: isZh ? '例如：mitigate' : 'e.g. mitigate',
    submit: hasFeedback ? (isZh ? '再次检查' : 'Check again') : (isZh ? '检查答案' : 'Check answer'),
    tryAgain: isZh ? '再试一次' : 'Try again',
    save: isZh ? '保存这次进度' : 'Save this progress',
    correctTitle: isZh ? '答对了' : 'Correct.',
    correctBody: isZh
      ? '登录后，这个词可以加入你的复习队列。'
      : 'After sign-in, this word can be added to your review queue.',
    wrongTitle: isZh ? '还差一点' : 'Close, not quite.',
    wrongBody: isZh
      ? 'mitigate 表示“减轻”。先把例句读一遍，再重新输入这个词。'
      : 'Mitigate means “make less severe.” Read the example once, then type the word again.',
    loop: isZh
      ? ['回想 1 次', '生成反馈', '准备复习卡']
      : ['1 recall', 'Feedback generated', 'Review card prepared'],
  };
  const feedbackTone = isCorrect
    ? 'border-[hsl(var(--accent-practice)/0.28)] bg-[hsl(var(--accent-practice)/0.08)]'
    : 'border-amber-500/25 bg-amber-500/10';

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
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
      <div className="space-y-5">
        <span className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
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
        <div className="rounded-lg border border-border bg-[hsl(var(--surface-raised))] p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">{copy.wordLabel}</p>
          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <h2 className="text-4xl font-semibold text-foreground">{sampleWord.word}</h2>
            <span className="text-sm text-muted-foreground">{sampleWord.partOfSpeech}</span>
            <span className="text-sm text-muted-foreground">{sampleWord.phonetic}</span>
          </div>
          <p className="mt-4 text-base leading-7 text-foreground">
            {isZh ? sampleWord.definition.zh : sampleWord.definition.en}
          </p>
          <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm leading-6 text-muted-foreground">
            {isZh ? sampleWord.example.zh : sampleWord.example.en}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{sampleWord.collocation}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-[hsl(var(--surface-raised))] p-5 shadow-[0_1px_0_hsl(var(--border)/0.7),0_22px_48px_-38px_hsl(var(--shadow-studio)/0.34)] sm:p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
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
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
              {copy.submit}
            </Button>
            {hasFeedback ? (
              <Button type="button" variant="outline" className="rounded-md" onClick={handleTryAgain}>
                <RotateCcw className="mr-2 h-4 w-4" />
                {copy.tryAgain}
              </Button>
            ) : null}
          </div>
        </form>

        {hasFeedback ? (
          <div
            data-testid="sample-feedback"
            className={cn('mt-5 rounded-lg border p-4', feedbackTone)}
            role="status"
          >
            <div className="flex items-start gap-3">
              <span className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                isCorrect ? 'bg-[hsl(var(--accent-practice))] text-white' : 'bg-amber-500 text-white',
              )}>
                <Check className="h-4 w-4" />
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
                        <span key={item} className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs font-medium text-foreground">
                          {item}
                        </span>
                      ))}
                    </div>
                    <Button asChild className="mt-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link to={saveProgressHref}>
                        {copy.save}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
