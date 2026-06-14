import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Sparkles,
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
  const [activeTab, setActiveTab] = useState('definition');
  const [currentPage, setCurrentPage] = useState(0);
  const wordsPerPage = 10;
  const copy = isZh
    ? {
        startLearning: '开始学习',
        dashboard: '进入今日任务',
        badge: '每日单词',
        subtitle: '每天一个高价值词，练完再进入你的真实复习队列。',
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
        coachWord: '让教练讲这个词',
        startFree: '免费开始',
        anonSave: '注册后可以保存单词、追踪进度，并让 AI 教练安排复习。',
        authSave: '已登录：保存后会进入词库，并生成后续复习信号。',
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
      }
    : {
        startLearning: 'Start Learning',
        dashboard: 'Go to Today',
        badge: 'Word of the Day',
        subtitle: 'One high-value word each day before you enter your real review queue.',
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
        coachWord: 'Ask Coach About This Word',
        startFree: 'Start Free Journey',
        anonSave: 'Sign up to save words, track progress, and practice with AI.',
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

  const renderWordCard = (word: WordData, date?: string) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden rounded-xl border-border bg-card">
        <CardContent className="p-6 md:p-8">
          {/* Word Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge>{word.level}</Badge>
                <Badge variant="outline">{word.partOfSpeech}</Badge>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">{word.word}</h2>
              <p className="text-lg text-muted-foreground mt-1">{word.phonetic}</p>
              {date && (
                <p className="text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {date}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => playAudio(word.word)}>
                <Volume2 className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={copy.shareButton}
                title={copy.shareButton}
                data-testid="word-share-card-button"
                onClick={() => shareWord(word)}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Tabs Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="definition">{copy.definition}</TabsTrigger>
              <TabsTrigger value="examples">{copy.examples}</TabsTrigger>
              <TabsTrigger value="related">{copy.related}</TabsTrigger>
              <TabsTrigger value="more">{copy.more}</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[240px] sm:h-[300px] mt-4">
              <TabsContent value="definition" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">{copy.definitionHeading}</h3>
                    <div className="mb-4 p-4 bg-muted rounded-lg">
                      <p className="text-lg">{word.definition}</p>
                      <p className="text-muted-foreground mt-1">{word.definitionZh}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="examples" className="mt-0">
                <div className="space-y-4">
                  <h3 className="font-semibold mb-3">{copy.examplesHeading}</h3>
                  {word.examples.map((ex, index) => (
                    <div key={index} className="mb-4 p-4 bg-muted rounded-lg">
                      <p className="text-lg mb-2">"{ex.en}"</p>
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
                        <Badge key={col} className="bg-emerald-100 text-emerald-800 text-sm">
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
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold tracking-tight">VocabDaily</span>
            </Link>
            <Button asChild className="h-9 rounded-md px-4 text-sm font-medium shadow-sm">
              <Link to={isAuthenticated ? '/dashboard/today' : '/register'}>
                {isAuthenticated ? copy.dashboard : copy.startLearning}
              </Link>
            </Button>
            <div className="hidden items-center gap-1 sm:flex">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Date Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <Calendar className="h-3 w-3 mr-1" />
            {copy.badge}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{today}</h1>
          <p className="text-muted-foreground">{copy.subtitle}</p>
        </div>

        {/* Main Word Card */}
        {renderWordCard(wordOfTheDay)}

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="h-11 rounded-md"
                  onClick={handleSaveWord}
                >
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  {savedWord ? copy.savedWord : copy.saveWord}
                </Button>
                <Button asChild size="lg" className="h-11 rounded-md bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                  <Link to={practiceHref} onClick={handlePracticeWord}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {copy.practiceWord}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 rounded-md">
                  <Link to={authCoachHref}>
                    <MessageCircleMore className="h-4 w-4 mr-2" />
                    {copy.coachWord}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" variant="outline" className="h-11 rounded-md">
                  <Link to={buildAuthRedirect('/word-of-the-day', '/register')}>
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    {copy.saveWord}
                  </Link>
                </Button>
                <Button asChild size="lg" className="h-11 rounded-md bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                  <Link to={buildAuthRedirect(practiceHref, '/register')}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {copy.startFree}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 rounded-md">
                  <Link to={authCoachHref}>
                    <MessageCircleMore className="h-4 w-4 mr-2" />
                    {copy.coachWord}
                  </Link>
                </Button>
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
              <History className="h-5 w-5 text-emerald-600" />
              <h3 className="text-xl font-semibold">{copy.archiveTitle}</h3>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">{copy.archiveBody}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {paginatedWords.map((item) => (
              <Card
                key={item.date}
                className="cursor-pointer rounded-lg border-border bg-card transition-shadow hover:shadow-sm"
                onClick={() => handlePreviousWordClick(item.date, item.word)}
              >
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{item.date}</p>
                  <p className="font-semibold">{item.word.word}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {item.word.level}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {copy.page} {currentPage + 1} {copy.pageOf} {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
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
          {selectedWord && renderWordCard(selectedWord, selectedDate || undefined)}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="mt-12 border-t border-border bg-card/30">
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
