import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useUserData } from '@/contexts/UserDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddWordDialog } from '@/components/AddWordDialog';
import { ImportAnkiApkgDialog } from '@/components/ImportAnkiApkgDialog';
import { ImportWordBookDialog } from '@/components/ImportWordBookDialog';
import {
  Search,
  Filter,
  Download,
  Volume2,
  Brain,
  Star,
  Tag,
  CheckCircle2,
  Trash2,
  BookOpen,
  MoreHorizontal,
  Plus,
  Upload,
  BookOpenCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { wordsDatabase, type WordData } from '@/data/words';
import type { UserProgress } from '@/data/localStorage';
import { BUILT_IN_WORD_BOOK_IDS, type AnkiDeckSummary, type AnkiImportOptions, type AnkiImportResult, type ImportResult, type ImportRowError } from '@/data/wordBooks';
import { getIeltsAnkiDeck } from '@/data/ieltsAnkiCards';
import { toast } from 'sonner';
import { speakEnglishText } from '@/services/tts';
import { exportToCSV, exportToAnkiTSV, downloadFile } from '@/services/wordBookExport';
import { useTranslation } from 'react-i18next';
import { buildLexicalSummary, toLexicalEntry } from '@/features/lexicon/lexicalEntry';

interface VocabularyItem {
  word: WordData;
  progress: UserProgress | null;
}

interface LastImportSummary {
  source: 'csv' | 'anki';
  successCount: number;
  mappedProgressCount?: number;
  errorCount: number;
}

const statusColors: Record<string, string> = {
  new: 'bg-muted text-muted-foreground',
  learning: 'bg-[hsl(var(--accent-practice)/0.12)] text-foreground',
  review: 'bg-[hsl(var(--warning)/0.12)] text-foreground',
  mastered: 'bg-[hsl(var(--success)/0.12)] text-foreground',
};

const statusLabels: Record<string, string> = {
  new: 'New',
  learning: 'Learning',
  review: 'Review',
  mastered: 'Mastered',
};

const statusLabelsZh: Record<string, string> = {
  new: '新词',
  learning: '学习中',
  review: '复习中',
  mastered: '已掌握',
};

export default function VocabularyBankPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');

  const {
    wordBooks,
    activeBook,
    setActiveBook,
    importWordBook,
    inspectAnkiApkg,
    importAnkiApkg,
    deleteWordBook,
    customWords,
    addCustomWord,
    removeCustomWord,
    progress,
    markWordAsLearned,
    markWordAsMastered,
  } = useUserData();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const builtInWordIdSet = useMemo(() => new Set(wordsDatabase.map((word) => word.id)), []);

  const allWordsById = useMemo(() => {
    const map = new Map<string, WordData>();

    for (const word of wordsDatabase) {
      map.set(word.id, word);
    }

    for (const word of customWords) {
      map.set(word.id, word);
    }

    return map;
  }, [customWords]);

  const vocabulary = useMemo(() => {
    const idsFromBooks = new Set<string>();
    for (const book of wordBooks) {
      for (const wordId of book.wordIds) {
        idsFromBooks.add(wordId);
      }
    }

    for (const customWord of customWords) {
      idsFromBooks.add(customWord.id);
    }

    const items: VocabularyItem[] = [];
    idsFromBooks.forEach((wordId) => {
      const word = allWordsById.get(wordId);
      if (!word) return;

      const wordProgress = progress.find((item) => item.wordId === wordId) || null;
      items.push({ word, progress: wordProgress });
    });

    return items;
  }, [wordBooks, customWords, allWordsById, progress]);

  const filteredVocabulary = vocabulary.filter((item) => {
    const status = item.progress?.status || 'new';

    const matchesSearch =
      (item.word.word ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.word.definition ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.word.definitionZh ?? '').includes(searchQuery);

    const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
    const matchesTopic = selectedTopic === 'all' || item.word.topic === selectedTopic;

    return matchesSearch && matchesStatus && matchesTopic;
  });

  const topics = useMemo(() => {
    return Array.from(new Set(vocabulary.map((item) => item.word.topic).filter(Boolean))).sort();
  }, [vocabulary]);

  const [exportOpen, setExportOpen] = useState(false);
  const [addWordOpen, setAddWordOpen] = useState(false);
  const [importAnkiOpen, setImportAnkiOpen] = useState(false);
  const [importBookOpen, setImportBookOpen] = useState(false);
  const [lastImportSummary, setLastImportSummary] = useState<LastImportSummary | null>(null);

  const handleExport = (format: 'csv' | 'csv-progress' | 'anki') => {
    const words = filteredVocabulary.map((v) => v.word);
    if (words.length === 0) {
      toast.warning('没有可导出的单词');
      return;
    }

    const bookName = activeBook?.name || 'vocabulary';
    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === 'csv' || format === 'csv-progress') {
      const progressMap = new Map(progress.map((p) => [p.wordId, p]));
      const content = exportToCSV(words, progressMap, {
        includeProgress: format === 'csv-progress',
      });
      downloadFile(content, `${bookName}-${timestamp}.csv`, 'text/csv;charset=utf-8');
      toast.success(`已导出 ${words.length} 个单词为 CSV`);
    } else {
      const content = exportToAnkiTSV(words);
      downloadFile(content, `${bookName}-${timestamp}.txt`, 'text/plain;charset=utf-8');
      toast.success(`已导出 ${words.length} 个单词（Anki 可导入格式）`);
    }

    setExportOpen(false);
  };

  const playAudio = (word: string) => {
    void speakEnglishText(word);
  };

  const handleMarkAsLearned = (wordId: string) => {
    markWordAsLearned(wordId);
    toast.success('Word marked as learned');
  };

  const handleMarkAsMastered = (wordId: string) => {
    markWordAsMastered(wordId);
    toast.success('Word marked as mastered');
  };

  const handleImportBook = async (file: File, bookName: string): Promise<ImportResult> => {
    const content = await file.text();
    return importWordBook(content, {
      fileName: file.name,
      bookName,
      source: `User Upload: ${file.name}`,
      license: 'User provided',
      delimiter: file.name.toLowerCase().endsWith('.tsv') ? '\t' : ',',
    });
  };

  const downloadImportErrors = (errors: ImportRowError[]) => {
    const json = JSON.stringify(errors, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `wordbook-import-errors-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleDeleteBook = (bookId: string) => {
    const ok = deleteWordBook(bookId);
    if (ok) {
      toast.success('Custom book deleted');
    } else {
      toast.error('Built-in books cannot be deleted');
    }
  };

  const handleInspectAnki = async (file: File): Promise<AnkiDeckSummary[]> => {
    return inspectAnkiApkg(file);
  };

  const handleImportAnki = async (file: File, options: AnkiImportOptions): Promise<AnkiImportResult> => {
    return importAnkiApkg(file, options);
  };

  const handleAddWord = (word: WordData) => {
    addCustomWord(word);
    toast.success('Word added to your custom book');
  };

  const handleDeleteWord = (wordId: string) => {
    removeCustomWord(wordId);
    toast.success('Custom word deleted');
  };

  const totalWords = vocabulary.length;
  const newCount = vocabulary.filter((item) => (item.progress?.status || 'new') === 'new').length;
  const masteredCount = vocabulary.filter((item) => (item.progress?.status || 'new') === 'mastered').length;
  const learningCount = vocabulary.filter((item) => (item.progress?.status || 'new') === 'learning').length;
  const needsReviewCount = vocabulary.filter((item) => {
    const status = item.progress?.status || 'new';
    const incorrectCount = item.progress?.incorrectCount ?? 0;
    const correctCount = item.progress?.correctCount ?? 0;
    return status === 'review' || incorrectCount > correctCount;
  }).length;
  const featuredItem = filteredVocabulary[0] || vocabulary[0] || null;
  const featuredEntry = featuredItem ? toLexicalEntry(featuredItem.word) : null;
  const featuredSense = featuredEntry?.senses[0];
  const featuredExample = featuredSense?.examples[0];
  const featuredStatus = featuredItem?.progress?.status || 'new';
  const ieltsAnkiDeck = useMemo(() => getIeltsAnkiDeck(), []);
  const ieltsAnkiBook = wordBooks.find((book) => book.id === BUILT_IN_WORD_BOOK_IDS.IELTS_ANKI_FOUNDATION) || null;
  const isIeltsAnkiActive = activeBook?.id === BUILT_IN_WORD_BOOK_IDS.IELTS_ANKI_FOUNDATION;
  const firstIeltsCard = ieltsAnkiDeck.cards[0];

  return (
    <div className="vocab-lexicon-route max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{isZh ? '词典' : 'Lexicon'}</h1>
          <p className="text-muted-foreground">
            {isZh
              ? `${filteredVocabulary.length} 个词条`
              : `${filteredVocabulary.length} words`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="glass"
                size="icon"
                className="h-11 w-11 rounded-lg"
                aria-label={isZh ? '词典工具' : 'Dictionary tools'}
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onSelect={() => setAddWordOpen(true)}>
                <Plus className="h-4 w-4" />
                {isZh ? '添加单词' : 'Add word'}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setImportAnkiOpen(true)}>
                <BookOpenCheck className="h-4 w-4" />
                {isZh ? '导入 Anki (.apkg)' : 'Import Anki (.apkg)'}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setImportBookOpen(true)}>
                <Upload className="h-4 w-4" />
                {isZh ? '导入词书' : 'Import word book'}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setExportOpen(true)}>
                <Download className="h-4 w-4" />
                {isZh ? '导出当前筛选' : 'Export current filter'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AddWordDialog
            onAddWord={handleAddWord}
            open={addWordOpen}
            onOpenChange={setAddWordOpen}
            hideTrigger
          />
          <ImportAnkiApkgDialog
            onInspect={handleInspectAnki}
            onImport={handleImportAnki}
            open={importAnkiOpen}
            onOpenChange={setImportAnkiOpen}
            hideTrigger
            onSuccess={(result) => {
              setLastImportSummary({
                source: 'anki',
                successCount: result.successCount,
                mappedProgressCount: result.mappedProgressCount,
                errorCount: result.unmappedRows.length,
              });
              toast.success(
                `Anki 导入完成：${result.successCount} 词，映射进度 ${result.mappedProgressCount} 条`,
              );
            }}
            onError={(errors) => {
              if (errors.length > 0) {
                toast.warning(`Anki 导入有 ${errors.length} 条无法映射，已导出错误报告`);
                downloadImportErrors(errors);
              }
            }}
          />
          <ImportWordBookDialog
            onImport={handleImportBook}
            open={importBookOpen}
            onOpenChange={setImportBookOpen}
            hideTrigger
            onSuccess={(result) => {
              if (result.createdBookId) {
                setLastImportSummary({
                  source: 'csv',
                  successCount: result.successCount,
                  errorCount: result.errorRows.length,
                });
                toast.success('词书导入成功并已设为当前词书');
              }
            }}
            onError={(errors) => {
              if (errors.length > 0) {
                toast.warning(`有 ${errors.length} 行导入失败，请检查格式`);
                downloadImportErrors(errors);
              }
            }}
          />
          <Dialog open={exportOpen} onOpenChange={setExportOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>导出词汇</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                将导出当前筛选的 {filteredVocabulary.length} 个单词
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => handleExport('csv')}>
                  CSV（仅单词）
                </Button>
                <Button variant="outline" onClick={() => handleExport('csv-progress')}>
                  CSV（含学习进度）
                </Button>
                <Button variant="outline" onClick={() => handleExport('anki')}>
                  Anki 导入格式（TXT）
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {lastImportSummary && (
        <section className="rounded-lg bg-[hsl(var(--accent-practice)/0.07)] px-4 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {lastImportSummary.source === 'anki' ? 'Anki 已导入' : '词书已导入'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {lastImportSummary.successCount} 个词已设为当前词书
                {typeof lastImportSummary.mappedProgressCount === 'number'
                  ? ` · ${lastImportSummary.mappedProgressCount} 条学习进度已映射`
                  : ''}
                {lastImportSummary.errorCount > 0 ? ` · ${lastImportSummary.errorCount} 条错误已导出报告` : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <Link className="text-primary hover:text-primary/80" to="/dashboard/today">今天学这本</Link>
              <Link className="text-muted-foreground hover:text-foreground" to="/dashboard/review">复习到期词</Link>
              <button className="text-muted-foreground hover:text-foreground" type="button" onClick={() => setExportOpen(true)}>
                导出备份
              </button>
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="ielts-anki-heading" className="lexicon-unframed-section py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-md bg-[hsl(var(--accent-exam)/0.12)] text-foreground hover:bg-[hsl(var(--accent-exam)/0.12)]">
                IELTS
              </Badge>
              <Badge variant="outline" className="rounded-md">
                {ieltsAnkiDeck.cards.length} {isZh ? '张卡片' : 'cards'}
              </Badge>
              <Badge variant="outline" className="rounded-md">
                B2-C1
              </Badge>
            </div>
            <h2 id="ielts-anki-heading" className="mt-3 text-xl font-semibold text-foreground">
              {isZh ? 'IELTS Anki 卡片' : 'IELTS Anki cards'}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {isZh
                ? '一组雅思写作和口语常用表达，包含释义、例句、搭配和中文提示。'
                : 'IELTS writing and speaking expressions with meanings, examples, collocations, and Chinese notes.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium">
              <Link className="text-primary hover:text-primary/80" to="/dashboard/today">
                {isZh ? '今天学这套' : 'Study today'}
              </Link>
              {firstIeltsCard ? (
                <Link
                  className="text-primary hover:text-primary/80"
                  to={`/dashboard/practice?source=ielts-anki&wordId=${encodeURIComponent(firstIeltsCard.id)}&q=${encodeURIComponent(firstIeltsCard.word)}`}
                >
                  {isZh ? '练第一张' : 'Practice first card'}
                </Link>
              ) : null}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={isZh ? 'IELTS 卡片动作' : 'IELTS deck actions'}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {ieltsAnkiBook ? (
                <DropdownMenuItem
                  disabled={isIeltsAnkiActive}
                  onSelect={() => setActiveBook(BUILT_IN_WORD_BOOK_IDS.IELTS_ANKI_FOUNDATION)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isIeltsAnkiActive ? (isZh ? '正在使用' : 'Active deck') : (isZh ? '设为当前词书' : 'Set as active')}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem asChild>
                <Link to="/dashboard/today">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {isZh ? '今天学这套' : 'Study today'}
                </Link>
              </DropdownMenuItem>
              {firstIeltsCard ? (
                <DropdownMenuItem asChild>
                  <Link to={`/dashboard/practice?source=ielts-anki&wordId=${encodeURIComponent(firstIeltsCard.id)}&q=${encodeURIComponent(firstIeltsCard.word)}`}>
                    <Brain className="mr-2 h-4 w-4" />
                    {isZh ? '练第一张' : 'Practice first card'}
                  </Link>
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {ieltsAnkiDeck.cards.slice(0, 3).map((card) => (
            <article key={card.id} className="lexicon-row-panel py-2 pl-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-foreground">{card.word}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{card.partOfSpeech} · {card.phonetic}</p>
                </div>
                <Badge variant="outline" className="rounded-md">
                  {card.difficulty}
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground">{card.meaning}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{card.chineseHint}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge className="rounded-md bg-muted text-muted-foreground hover:bg-muted">
                  {card.ieltsTag}
                </Badge>
                {card.collocations.slice(0, 2).map((item) => (
                  <Badge key={item} variant="outline" className="rounded-md">
                    {item}
                  </Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="lexicon-unframed-section py-5">
        {featuredEntry && featuredSense ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:items-stretch">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-md bg-[hsl(var(--accent-memory)/0.1)] text-[hsl(var(--accent-memory))] hover:bg-[hsl(var(--accent-memory)/0.1)]">
                  {isZh ? '当前词条' : 'Current entry'}
                </Badge>
                <Badge variant="outline" className="rounded-md">
                  {isZh ? (statusLabelsZh[featuredStatus] || featuredStatus) : (statusLabels[featuredStatus] || featuredStatus)}
                </Badge>
                <Badge variant="outline" className="rounded-md">
                  {featuredEntry.cefrLevel}
                </Badge>
              </div>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                    {featuredEntry.headword}
                  </h2>
                  <p className="mt-2 font-mono text-sm text-muted-foreground">
                    {featuredSense.partOfSpeech || '-'} · {featuredEntry.phonetic || '-'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="glass-icon-button h-11 w-11 rounded-lg border-transparent bg-transparent text-foreground hover:border-primary/20 hover:bg-muted"
                  onClick={() => playAudio(featuredEntry.headword)}
                  aria-label={isZh ? `播放 ${featuredEntry.headword} 发音` : `Play pronunciation for ${featuredEntry.headword}`}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="lexicon-row-panel py-2 pl-4">
                  <p className="text-xs text-muted-foreground">{isZh ? '核心释义' : 'Core meaning'}</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {featuredSense.definition || (isZh ? '暂无英文释义' : 'No English definition yet')}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {featuredSense.definitionZh || (isZh ? '暂无中文释义' : 'No Chinese definition yet')}
                  </p>
                </div>
                <div className="lexicon-row-panel py-2 pl-4">
                  <p className="text-xs text-muted-foreground">{isZh ? '可练例句' : 'Practice example'}</p>
                  {featuredExample ? (
                    <>
                      <p className="mt-2 text-sm leading-6 text-foreground">{featuredExample.en}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{featuredExample.zh}</p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {isZh ? '这个词条还没有例句，可以先从释义回想和拼写练习开始。' : 'No example yet; start from meaning recall and spelling.'}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-medium">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="glass"
                      size="icon"
                  className="h-10 w-10 rounded-lg"
                      aria-label={isZh ? '词条动作' : 'Entry actions'}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    <DropdownMenuItem asChild>
                      <Link to={`/dashboard/practice?source=lexicon&wordId=${encodeURIComponent(featuredEntry.id)}&q=${encodeURIComponent(featuredEntry.headword)}`}>
                        <Brain className="mr-2 h-4 w-4" />
                        {isZh ? '用这个词练一次' : 'Practice this word'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/dashboard/review?source=lexicon&wordId=${encodeURIComponent(featuredEntry.id)}`}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        {isZh ? '加入复习回合' : 'Open in review'}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: isZh ? '当前词书' : 'Active book', value: activeBook?.name || '-' },
                { label: isZh ? '词条总数' : 'Total words', value: totalWords },
                { label: isZh ? '需要复习' : 'Needs review', value: needsReviewCount },
              ].map((item) => (
                <div key={item.label} className="lexicon-row-panel py-2 pl-4">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="mt-2 truncate text-lg font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col items-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--accent-memory)/0.1)] text-[hsl(var(--accent-memory))]">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              {isZh ? '添加第一个词' : 'Add your first word'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isZh
                ? '导入词书或添加自定义词后，这里会显示释义、例句和练习入口。'
                : 'Import a word book or add a custom word to see definitions, examples, and practice actions.'}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-5 h-10 w-10 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={isZh ? '开始添加词条' : 'Start adding words'}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem onSelect={() => setAddWordOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {isZh ? '添加单词' : 'Add word'}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setImportBookOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  {isZh ? '导入词书' : 'Import word book'}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setImportAnkiOpen(true)}>
                  <BookOpenCheck className="mr-2 h-4 w-4" />
                  {isZh ? '导入 Anki' : 'Import Anki'}
                </DropdownMenuItem>
                {wordBooks.filter((book) => book.isBuiltIn).slice(0, 2).map((book) => (
                  <DropdownMenuItem key={book.id} onSelect={() => setActiveBook(book.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isZh ? `使用 ${book.name}` : `Use ${book.name}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </section>

      {/* Book Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {isZh ? '词典与词书管理' : 'Dictionary and word books'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {wordBooks.map((book) => {
            const isActive = activeBook?.id === book.id;

            return (
              <div
                key={book.id}
                data-testid={`word-book-row-${book.id}`}
                className={cn(
                  'rounded-lg bg-[hsl(var(--paper-muted)/0.18)] px-3 py-3 transition-colors flex flex-col md:flex-row md:items-start md:justify-between gap-3',
                  isActive && 'bg-muted/30 px-3',
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{book.name}</p>
                    {book.isBuiltIn ? (
                      <Badge variant="secondary">内置</Badge>
                    ) : (
                      <Badge variant="outline">自定义</Badge>
                    )}
                    {isActive && (
                      <Badge className="rounded-md bg-[hsl(var(--accent-memory)/0.14)] text-foreground hover:bg-[hsl(var(--accent-memory)/0.18)]">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {isZh ? '当前词书' : 'Active'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {book.levelRange.map((level) => (
                      <Badge key={level} variant="outline" className="rounded-md text-xs">
                        {level}
                      </Badge>
                    ))}
                    {book.topicTags.slice(0, 4).map((topic) => (
                      <Badge key={topic} variant="secondary" className="rounded-md text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {book.wordIds.length} {isZh ? '个词' : 'words'} · {isZh ? '版本' : 'Version'} {book.version}
                  </p>
                  <p className="max-w-3xl text-xs text-muted-foreground">
                    {isZh ? '来源' : 'Source'}: {book.source} · {isZh ? '许可' : 'License'}: {book.license}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!isActive || !book.isBuiltIn ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label={isZh ? `${book.name} 词书动作` : `${book.name} book actions`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {!isActive ? (
                          <DropdownMenuItem onSelect={() => setActiveBook(book.id)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {isZh ? '设为当前' : 'Set active'}
                          </DropdownMenuItem>
                        ) : null}
                        {!book.isBuiltIn ? (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => handleDeleteBook(book.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isZh ? '删除' : 'Delete'}
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="liquid-glass-bar flex flex-col gap-3 rounded-lg border border-transparent bg-background/70 p-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
	          <Input
	            placeholder={isZh ? '搜索单词、释义或中文解释...' : 'Search words, meanings, or notes...'}
	            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-lg border-border/70 bg-card pl-10"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="liquid-glass-control w-full rounded-lg border-transparent bg-transparent md:w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
	            <SelectItem value="all">{isZh ? '全部状态' : 'All status'}</SelectItem>
	            <SelectItem value="new">{isZh ? '新词' : 'New'}</SelectItem>
	            <SelectItem value="learning">{isZh ? '学习中' : 'Learning'}</SelectItem>
	            <SelectItem value="review">{isZh ? '复习中' : 'Review'}</SelectItem>
	            <SelectItem value="mastered">{isZh ? '已掌握' : 'Mastered'}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedTopic} onValueChange={setSelectedTopic}>
          <SelectTrigger className="liquid-glass-control w-full rounded-lg border-transparent bg-transparent md:w-[160px]">
            <Tag className="h-4 w-4 mr-2" />
            <SelectValue placeholder="分类" />
          </SelectTrigger>
          <SelectContent>
	            <SelectItem value="all">{isZh ? '全部主题' : 'All topics'}</SelectItem>
            {topics.map((topic) => (
              <SelectItem key={topic} value={topic}>
                {topic.charAt(0).toUpperCase() + topic.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{totalWords}</p>
            <p className="text-sm text-muted-foreground">总词数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{newCount}</p>
            <p className="text-sm text-muted-foreground">新词</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-[hsl(var(--success))]">{masteredCount}</p>
            <p className="text-sm text-muted-foreground">已掌握</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-[hsl(var(--warning))]">{needsReviewCount}</p>
            <p className="text-sm text-muted-foreground">需要复习</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-[hsl(var(--accent-practice))]">{learningCount}</p>
            <p className="text-sm text-muted-foreground">学习中</p>
          </CardContent>
        </Card>
      </div>

      {/* Word List */}
      <div className="space-y-3">
        {filteredVocabulary.map((item) => {
          const status = item.progress?.status || 'new';
          const isCustomWord = !builtInWordIdSet.has(item.word.id);
          const entry = toLexicalEntry(item.word);
          const sense = entry.senses[0];
          const firstExample = sense.examples[0];
          const sourceBooks = wordBooks.filter((book) => book.wordIds.includes(item.word.id));
          const sourceBookLabel = sourceBooks.length > 0
            ? sourceBooks.map((book) => book.name).join(' / ')
            : (activeBook?.name || (isZh ? '未归属词书' : 'No source book'));

          return (
            <Dialog key={item.word.id}>
              <DialogTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={isZh ? `打开 ${entry.headword} 词条详情` : `Open ${entry.headword} details`}
                  className="cursor-pointer rounded-lg px-3 py-4 transition-colors hover:bg-muted/30"
                >
                  <div className="px-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{entry.headword}</h3>
                        <p className="text-sm text-muted-foreground">
                          {sense.partOfSpeech || '-'} • {entry.phonetic || '-'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
	                        <Badge className={cn('rounded-md px-2.5 py-1 text-xs', statusColors[status])}>
                            {isZh ? (statusLabelsZh[status] || status) : (statusLabels[status] || status)}
                          </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            playAudio(entry.headword);
                          }}
                          aria-label={isZh ? `播放 ${entry.headword} 发音` : `Play pronunciation for ${entry.headword}`}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm mt-2 line-clamp-1">{buildLexicalSummary(entry, i18n.language)}</p>
                    <p className="text-xs text-muted-foreground">
                      {sense.collocations.length > 0
                        ? `${isZh ? '搭配' : 'Collocations'}: ${sense.collocations.slice(0, 2).join(' / ')}`
                        : (isZh ? '暂无搭配，可以从释义和例句开始。' : 'No collocations yet; start from definition and examples.')}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        {entry.topic}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {entry.cefrLevel}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        IELTS {entry.ieltsRelevance}
                      </Badge>
                      {isCustomWord && (
                        <Badge variant="secondary" className="text-xs">
                          Custom
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    {entry.headword}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => playAudio(entry.headword)}
                      aria-label={isZh ? `播放 ${entry.headword} 发音` : `Play pronunciation for ${entry.headword}`}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </DialogTitle>
                  <DialogDescription>
                    {isZh
                      ? '查看这个词的释义、例句、来源词书和下一步练习动作。'
                      : 'Review definitions, examples, source book, and next practice actions for this word.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {sense.partOfSpeech || '-'} • {entry.phonetic || '-'} • {entry.cefrLevel} • {entry.topic}
                  </p>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg bg-[hsl(var(--paper-muted)/0.22)] px-3 py-2">
                      <p className="text-xs text-muted-foreground">{isZh ? '学习状态' : 'Learning status'}</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {isZh ? (statusLabelsZh[status] || status) : (statusLabels[status] || status)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[hsl(var(--paper-muted)/0.22)] px-3 py-2">
                      <p className="text-xs text-muted-foreground">{isZh ? '来源词书' : 'Source book'}</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{sourceBookLabel}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{isZh ? '词义 / Sense' : 'Sense'}</h4>
                    <p className="text-sm">{sense.definition || (isZh ? '暂无英文释义' : 'No English definition yet')}</p>
                    <p className="text-sm text-muted-foreground">{sense.definitionZh || (isZh ? '暂无中文释义' : 'No Chinese definition yet')}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{isZh ? '例句 / Examples' : 'Examples'}</h4>
                    {firstExample ? (
                      <>
                        <p className="text-sm">{firstExample.en}</p>
                        <p className="text-sm text-muted-foreground">{firstExample.zh}</p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {isZh ? '导入词暂时没有例句，仍可做词义回想。' : 'This imported word has no example yet. You can still start meaning recall.'}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{isZh ? '搭配 / Collocations' : 'Collocations'}</h4>
                    <div className="flex flex-wrap gap-2">
                      {sense.collocations.length > 0 ? sense.collocations.slice(0, 6).map((collocation) => (
                        <Badge key={collocation} variant="secondary">
                          {collocation}
                        </Badge>
                      )) : (
                        <span className="text-sm text-muted-foreground">{isZh ? '暂无搭配' : 'No collocations yet'}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{isZh ? '混淆提醒 / Common mistakes' : 'Common mistakes'}</h4>
                    {entry.commonMistakes.length > 0 ? (
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {entry.commonMistakes.map((mistake) => (
                          <li key={mistake}>• {mistake}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {isZh ? '暂无常见错误记录。' : 'No common mistake note yet.'}
                      </p>
                    )}
                  </div>

                  {(entry.memoryTip || entry.etymology) ? (
                    <div>
                      <h4 className="font-semibold mb-2">{isZh ? '记忆线索 / Memory note' : 'Memory note'}</h4>
                      <p className="text-sm text-muted-foreground">{entry.memoryTip || entry.etymology}</p>
                    </div>
                  ) : null}

                  <div>
                    <h4 className="font-semibold mb-2">{isZh ? '训练模板 / Drills' : 'Drills'}</h4>
                    <div className="space-y-2">
                      {entry.trainingTemplates.map((template) => (
                        <div key={template.type} className="rounded-lg bg-muted/30 px-3 py-2">
                          <p className="text-sm font-medium">{isZh ? template.label.zh : template.label.en}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {isZh ? template.promptZh : template.prompt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:flex-wrap">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to={`/dashboard/practice?source=lexicon&wordId=${encodeURIComponent(entry.id)}&q=${encodeURIComponent(entry.headword)}`}>
                        <Brain className="h-4 w-4 mr-2" />
                        {isZh ? '开始练习' : 'Practice this word'}
                      </Link>
                    </Button>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to={`/dashboard/review?source=lexicon&wordId=${encodeURIComponent(entry.id)}`}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        {isZh ? '加入复习回合' : 'Open review'}
                      </Link>
                    </Button>
                    {status !== 'mastered' && (
                      <Button variant="outline" className="flex-1" onClick={() => handleMarkAsMastered(item.word.id)}>
                        <Star className="h-4 w-4 mr-2" />
                        标记已掌握
                      </Button>
                    )}
                    {status === 'new' && (
                      <Button variant="outline" className="flex-1" onClick={() => handleMarkAsLearned(item.word.id)}>
                        <Brain className="h-4 w-4 mr-2" />
                        开始学习
                      </Button>
                    )}
                    {isCustomWord && (
                      <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteWord(item.word.id)}
                        aria-label={isZh ? `删除自定义词 ${entry.headword}` : `Delete custom word ${entry.headword}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>

      {filteredVocabulary.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">未找到词汇</h3>
          <p className="text-muted-foreground">调整筛选条件或导入新词书。</p>
        </div>
      )}
    </div>
  );
}
