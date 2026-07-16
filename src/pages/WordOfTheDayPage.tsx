import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BookOpen,
  Volume2,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  History,
  BookmarkPlus,
  MessageCircleMore,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { wordsDatabase, type WordData, getWordOfTheDay } from '@/data/words';
import {
  buildWordShareCardSvg,
  buildWordShareFileName,
  buildWordShareText,
} from '@/features/share/wordShareCard';
import { speakEnglishText } from '@/services/tts';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { buildAuthRedirect } from '@/lib/authRedirect';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { BrandMark } from '@/features/marketing/BrandMark';
import { GlassSurface } from '@/components/ui/glass-surface';

const normalizeWordKey = (value: string): string => value.trim().toLowerCase();

const isShareAbort = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  return error.name === 'AbortError';
};

const downloadSvgFile = (fileName: string, svg: string): boolean => {
  if (typeof URL.createObjectURL !== 'function') return false;

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  link.click();
  URL.revokeObjectURL?.(url);
  return true;
};

// Public archive preview. This is deterministic marketing/sample content, not user history.
const generatePublicArchiveWordsData = (): { date: string; word: WordData }[] => {
  const words: { date: string; word: WordData }[] = [];
  const today = new Date();
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Select a word based on the date (deterministic)
    const wordIndex = (i * 7) % wordsDatabase.length;
    words.push({
      date: dateStr,
      word: wordsDatabase[wordIndex],
    });
  }
  
  return words;
};

const publicArchiveWordsData = generatePublicArchiveWordsData();

export default function WordOfTheDayPage() {
  const { isAuthenticated } = useAuth();
  const { addCustomWord, customWords, markWordAsLearned, progress } = useUserData();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');
  const [wordOfTheDay] = useState<WordData>(getWordOfTheDay());
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [todayActiveTab, setTodayActiveTab] = useState('definition');
  const [archiveActiveTab, setArchiveActiveTab] = useState('definition');
  const [currentPage, setCurrentPage] = useState(0);
  const wordsPerPage = 10;
  const copy = isZh
    ? {
        startLearning: '开始学习',
        dashboard: '进入今日',
        badge: '每日单词',
        subtitle: '每天一个词，先理解，再练一句。',
        definition: '定义',
        examples: '例句',
        related: '相关',
        more: '更多',
        definitionHeading: '定义',
        examplesHeading: '例句',
        relatedSynonyms: '同义词',
        relatedAntonyms: '反义词',
        collocations: '搭配',
        etymology: '词源',
        memoryTip: '记忆提示',
        topic: '主题',
        listen: '朗读',
        saveWord: '保存到我的词库',
        savedWord: '已在我的词库',
        practiceWord: '练这个词',
        coachWord: '打开答疑',
        startFree: '免费开始',
        anonSave: '注册后可以保存单词、追踪进度，并继续复习。',
        authSave: '已登录：保存后会进入词库，并记录后续复习。',
        savedToast: '已保存到你的词库，并加入后续复习',
        alreadySavedToast: '这个词已经在你的词库里',
        archiveTitle: '公开词库样例',
        archiveBody: '这些是公开样例词，不是你的个人学习历史。',
        page: '第',
        pageOf: '页，共',
        dialogTitle: '公开样例词',
        footerRights: '© 2026 VocabDaily。保留所有权利。',
        legalLabel: '法律链接',
        terms: '服务条款',
        privacy: '隐私政策',
        shareTitle: '每日单词',
        shareButton: '分享单词卡',
        shareFallbackToast: '分享文案已复制，单词卡已下载',
        shareCopiedToast: '分享文案已复制',
        shareDownloadedToast: '单词卡已下载',
        shareErrorToast: '暂时无法分享，请稍后再试',
        listenToWord: '朗读',
        previousPage: '上一页公开词库',
        nextPage: '下一页公开词库',
      }
    : {
        startLearning: 'Start Learning',
        dashboard: 'Go to Today',
        badge: 'Word of the Day',
        subtitle: 'One word a day. Understand it, then use it once.',
        definition: 'Definition',
        examples: 'Examples',
        related: 'Related',
        more: 'More',
        definitionHeading: 'Definition',
        examplesHeading: 'Example Sentences',
        relatedSynonyms: 'Synonyms',
        relatedAntonyms: 'Antonyms',
        collocations: 'Collocations',
        etymology: 'Etymology',
        memoryTip: 'Memory Tip',
        topic: 'Topic',
        listen: 'Listen',
        saveWord: 'Save to My Word Bank',
        savedWord: 'Saved to My Word Bank',
        practiceWord: 'Practice This Word',
        coachWord: 'Ask the coach',
        startFree: 'Start free',
        anonSave: 'Sign up to save words, track progress, and review later.',
        authSave: 'Signed in: saving creates a word-bank entry and a later review signal.',
        savedToast: 'Saved to your word bank and queued for later review',
        alreadySavedToast: 'This word is already in your word bank',
        archiveTitle: 'Public Word Archive',
        archiveBody: 'These are public sample words, not your personal learning history.',
        page: 'Page',
        pageOf: 'of',
        dialogTitle: 'Public archive word',
        footerRights: '© 2026 VocabDaily. All rights reserved.',
        legalLabel: 'Legal links',
        terms: 'Terms',
        privacy: 'Privacy',
        shareTitle: 'Word of the Day',
        shareButton: 'Share word card',
        shareFallbackToast: 'Share text copied and word card downloaded',
        shareCopiedToast: 'Share text copied',
        shareDownloadedToast: 'Word card downloaded',
        shareErrorToast: 'Unable to share right now. Please try again later.',
        listenToWord: 'Listen to',
        previousPage: 'Previous archive page',
        nextPage: 'Next archive page',
      };
  const savedWord = customWords.some(
    (item) => normalizeWordKey(item.word) === normalizeWordKey(wordOfTheDay.word) || item.id === wordOfTheDay.id,
  );
  const wordHasProgress = progress.some((item) => item.wordId === wordOfTheDay.id);
  const coachPrompt = isZh
    ? `请用中文解释每日单词 "${wordOfTheDay.word}"，给我一个记忆法、2 个高频搭配和 1 道小测。`
    : `Explain the word "${wordOfTheDay.word}", give me one mnemonic, two high-frequency collocations, and one quick quiz.`;
  const coachHref = `/dashboard/chat?focus=${encodeURIComponent(wordOfTheDay.word)}&prompt=${encodeURIComponent(coachPrompt)}`;
  const authCoachHref = isAuthenticated ? coachHref : buildAuthRedirect(coachHref, '/register');
  const practiceHref = `/dashboard/practice?word=${encodeURIComponent(wordOfTheDay.word)}`;

  const playAudio = (text: string) => {
    void speakEnglishText(text);
  };

  const shareWord = async (word: WordData) => {
    const publicUrl = `${window.location.origin}/word-of-the-day`;
    const shareText = buildWordShareText(word, {
      language: i18n.language || 'en',
      dateLabel: today,
      origin: publicUrl,
    });
    const shareCardSvg = buildWordShareCardSvg(word, {
      language: i18n.language || 'en',
      dateLabel: today,
      origin: publicUrl,
    });
    const shareCardFile = new File([shareCardSvg], buildWordShareFileName(word), {
      type: 'image/svg+xml',
    });
    const shareData = {
      title: `${copy.shareTitle}: ${word.word}`,
      text: shareText,
      url: publicUrl,
    };

    try {
      if (navigator.share) {
        if (navigator.canShare?.({ files: [shareCardFile] })) {
          await navigator.share({ ...shareData, files: [shareCardFile] });
          return;
        }
        await navigator.share(shareData);
        return;
      }
    } catch (error) {
      if (isShareAbort(error)) return;
    }

    try {
      let didCopy = false;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        didCopy = true;
      }

      const didDownload = downloadSvgFile(buildWordShareFileName(word), shareCardSvg);

      if (didCopy && didDownload) {
        toast.success(copy.shareFallbackToast);
      } else if (didCopy) {
        toast.success(copy.shareCopiedToast);
      } else if (didDownload) {
        toast.success(copy.shareDownloadedToast);
      } else {
        toast.error(copy.shareErrorToast);
      }
    } catch {
      toast.error(copy.shareErrorToast);
    }
  };

  const today = new Date().toLocaleDateString(isZh ? 'zh-CN' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePreviousWordClick = (date: string, word: WordData) => {
    setSelectedDate(date);
    setSelectedWord(word);
    setArchiveActiveTab('definition');
  };

  const closeDialog = () => {
    setSelectedWord(null);
    setSelectedDate(null);
  };

  const ensureWordInLearningLoop = () => {
    if (!savedWord) {
      addCustomWord(wordOfTheDay);
    }
    if (!wordHasProgress) {
      markWordAsLearned(wordOfTheDay.id);
    }
  };

  const handleSaveWord = () => {
    if (savedWord && wordHasProgress) {
      toast.info(copy.alreadySavedToast);
      return;
    }
    ensureWordInLearningLoop();
    toast.success(copy.savedToast);
  };

  const handlePracticeWord = () => {
    ensureWordInLearningLoop();
  };

  const totalPages = Math.ceil(publicArchiveWordsData.length / wordsPerPage);
  const paginatedWords = publicArchiveWordsData.slice(
    currentPage * wordsPerPage,
    (currentPage + 1) * wordsPerPage
  );

  const renderWordCard = ({
    word,
    date,
    tabValue,
    onTabValueChange,
  }: {
    word: WordData;
    date?: string;
    tabValue: string;
    onTabValueChange: (value: string) => void;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="rounded-xl bg-[hsl(var(--paper)/0.74)] px-4 py-5 md:px-5 md:py-6">
          {/* Word Header */}
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="rounded-md">{word.level}</Badge>
                <Badge variant="outline" className="rounded-md">{word.partOfSpeech}</Badge>
              </div>
              <h2 className="text-3xl font-semibold md:text-4xl">{word.word}</h2>
              <p className="mt-1 text-base text-muted-foreground">{word.phonetic}</p>
              {date && (
                <p className="text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {date}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="glass"
                size="icon"
                className="h-11 w-11 rounded-lg"
                aria-label={`${copy.listenToWord} ${word.word}`}
                title={`${copy.listenToWord} ${word.word}`}
                onClick={() => playAudio(word.word)}
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
	                variant="glass"
	                size="icon"
                className="h-11 w-11 rounded-lg"
                aria-label={copy.shareButton}
                title={copy.shareButton}
                data-testid="word-share-card-button"
                onClick={() => shareWord(word)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="my-4 h-px bg-border/20" aria-hidden="true" />

          {/* Tabs Content */}
          <Tabs value={tabValue} onValueChange={onTabValueChange} className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="definition">{copy.definition}</TabsTrigger>
              <TabsTrigger value="examples">{copy.examples}</TabsTrigger>
              <TabsTrigger value="related">{copy.related}</TabsTrigger>
              <TabsTrigger value="more">{copy.more}</TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="definition" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">{copy.definitionHeading}</h3>
                    <div className="mb-4 rounded-lg bg-muted/35 px-4 py-3">
                      <p className="text-base">{word.definition}</p>
                      <p className="text-muted-foreground mt-1">{word.definitionZh}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="examples" className="mt-0">
                <div className="space-y-4">
                  <h3 className="font-semibold mb-3">{copy.examplesHeading}</h3>
                  {word.examples.map((ex, index) => (
                    <div key={index} className="mb-4 rounded-lg bg-muted/35 px-4 py-3">
                      <p className="mb-2 text-base">"{ex.en}"</p>
                      <p className="text-muted-foreground">{ex.zh}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => playAudio(ex.en)}
                      >
                        <Volume2 className="h-4 w-4 mr-2" />
                        {copy.listen}
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="related" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">{copy.relatedSynonyms}</h3>
                    <div className="flex flex-wrap gap-2">
                      {word.synonyms.map((syn) => (
                        <Badge key={syn} variant="secondary" className="text-sm">
                          {syn}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">{copy.relatedAntonyms}</h3>
                    <div className="flex flex-wrap gap-2">
                      {word.antonyms.map((ant) => (
                        <Badge key={ant} variant="outline" className="text-sm">
                          {ant}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">{copy.collocations}</h3>
                    <div className="flex flex-wrap gap-2">
                      {word.collocations.map((col) => (
                        <Badge key={col} className="bg-primary/10 text-primary text-sm">
                          {col}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="more" className="mt-0">
                <div className="space-y-6">
                  {word.etymology && (
                    <div>
                      <h3 className="font-semibold mb-2">{copy.etymology}</h3>
                      <p className="text-muted-foreground">{word.etymology}</p>
                    </div>
                  )}

                  {word.memoryTip && (
                    <div>
                      <h3 className="font-semibold mb-2">{copy.memoryTip}</h3>
                      <p className="text-muted-foreground">{word.memoryTip}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">{copy.topic}</h3>
                    <Badge variant="outline">{word.topic}</Badge>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
	      </section>
    </motion.div>
  );

  return (
    <div className="study-premium-bg min-h-screen bg-background text-foreground">
      <header className="sticky top-3 z-30 px-3 sm:px-4">
        <GlassSurface variant="bar" className="mx-auto flex h-14 max-w-5xl items-center justify-between px-3 sm:h-16 sm:px-5">
          <BrandMark variant="compact" className="shrink-0" />
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <Button asChild variant="glassPrimary" className="hidden h-9 px-4 text-sm font-medium sm:inline-flex">
              <Link to={isAuthenticated ? '/dashboard/today' : '/register'}>
                {isAuthenticated ? copy.dashboard : copy.startLearning}
              </Link>
            </Button>
          </div>
        </GlassSurface>
      </header>

      <main id="main-content" className="container mx-auto max-w-5xl px-4 py-8">
        {/* Date Header */}
        <div className="mb-6 flex flex-col gap-3 pb-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3 rounded-md">
              <Calendar className="h-3 w-3 mr-1" />
              {copy.badge}
            </Badge>
            <h1 className="text-2xl font-semibold md:text-3xl">{isZh ? '今天的词' : "Today's word"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
          </div>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>

        {/* Main Word Card */}
        {renderWordCard({
          word: wordOfTheDay,
          tabValue: todayActiveTab,
          onTabValueChange: setTodayActiveTab,
        })}

        {/* CTA */}
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            {isAuthenticated ? (
              <>
                <Button asChild size="lg" className="h-11 rounded-lg shadow-none">
                  <Link to={practiceHref} onClick={handlePracticeWord}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    {copy.practiceWord}
                  </Link>
                </Button>
                <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                  <button type="button" className="inline-flex items-center text-muted-foreground hover:text-foreground" onClick={handleSaveWord}>
                    <BookmarkPlus className="mr-1.5 h-4 w-4" />
                    {savedWord ? copy.savedWord : copy.saveWord}
                  </button>
                  <Link className="inline-flex items-center text-muted-foreground hover:text-foreground" to={authCoachHref}>
                    <MessageCircleMore className="mr-1.5 h-4 w-4" />
                    {copy.coachWord}
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="h-11 rounded-lg shadow-none">
                  <Link to={buildAuthRedirect(practiceHref, '/register')}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    {copy.startFree}
                  </Link>
                </Button>
                <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                  <Link className="inline-flex items-center text-muted-foreground hover:text-foreground" to={buildAuthRedirect('/word-of-the-day', '/register')}>
                    <BookmarkPlus className="mr-1.5 h-4 w-4" />
                    {copy.saveWord}
                  </Link>
                  <Link className="inline-flex items-center text-muted-foreground hover:text-foreground" to={authCoachHref}>
                    <MessageCircleMore className="mr-1.5 h-4 w-4" />
                    {copy.coachWord}
                  </Link>
                </div>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isAuthenticated ? copy.authSave : copy.anonSave}
          </p>
        </div>

        {/* Public Archive Section */}
        <div className="mt-12">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">{copy.archiveTitle}</h3>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">{copy.archiveBody}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {paginatedWords.map((item) => (
	              <button
	                type="button"
	                key={item.date}
                aria-label={`${copy.dialogTitle}: ${item.word.word}, ${item.date}`}
                className="rounded-lg bg-[hsl(var(--paper-muted)/0.22)] px-3 py-3 text-left transition-colors hover:bg-muted/35"
	                onClick={() => handlePreviousWordClick(item.date, item.word)}
	              >
	                <div className="px-1">
	                  <p className="text-xs text-muted-foreground mb-1">{item.date}</p>
	                  <p className="font-semibold">{item.word.word}</p>
	                  <Badge variant="outline" className="mt-2 text-xs">
	                    {item.word.level}
	                  </Badge>
	                </div>
	              </button>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              aria-label={copy.previousPage}
              title={copy.previousPage}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {copy.page} {currentPage + 1} {copy.pageOf} {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              aria-label={copy.nextPage}
              title={copy.nextPage}
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </main>

      {/* Previous Word Dialog */}
      <Dialog open={!!selectedWord} onOpenChange={closeDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {copy.dialogTitle} {selectedDate}
            </DialogTitle>
          </DialogHeader>
          {selectedWord && renderWordCard({
            word: selectedWord,
            date: selectedDate || undefined,
            tabValue: archiveActiveTab,
            onTabValueChange: setArchiveActiveTab,
          })}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="mt-12 bg-transparent">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <BookOpen className="h-3 w-3" />
              </span>
              <span className="text-sm font-medium">VocabDaily</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {copy.footerRights}
            </p>
            <nav className="flex items-center gap-3 text-xs text-muted-foreground" aria-label={copy.legalLabel}>
              <Link to="/terms" className="transition-colors hover:text-foreground">
                {copy.terms}
              </Link>
              <span className="text-border" aria-hidden="true">/</span>
              <Link to="/privacy" className="transition-colors hover:text-foreground">
                {copy.privacy}
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
