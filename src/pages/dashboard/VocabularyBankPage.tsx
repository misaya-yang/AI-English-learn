import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useUserData } from '@/contexts/UserDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { wordsDatabase, type WordData } from '@/data/words';
import type { UserProgress } from '@/data/localStorage';
import type { AnkiDeckSummary, AnkiImportOptions, AnkiImportResult, ImportResult, ImportRowError } from '@/data/wordBooks';
import { toast } from 'sonner';
import { speakEnglishText } from '@/services/tts';
import { exportToCSV, exportToAnkiTSV, downloadFile } from '@/services/wordBookExport';
import { useTranslation } from 'react-i18next';
import { buildLexicalSummary, toLexicalEntry } from '@/features/lexicon/lexicalEntry';

interface VocabularyItem {
  word: WordData;
  progress: UserProgress | null;
}

const statusColors: Record<string, string> = {
  new: 'bg-gray-500',
  learning: 'bg-blue-500',
  review: 'bg-yellow-500',
  mastered: 'bg-emerald-500',
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
  const masteredCount = vocabulary.filter((item) => (item.progress?.status || 'new') === 'mastered').length;
  const learningCount = vocabulary.filter((item) => (item.progress?.status || 'new') === 'learning').length;
  const reviewCount = vocabulary.filter((item) => (item.progress?.status || 'new') === 'review').length;
  const featuredItem = filteredVocabulary[0] || vocabulary[0] || null;
  const featuredEntry = featuredItem ? toLexicalEntry(featuredItem.word) : null;
  const featuredSense = featuredEntry?.senses[0];
  const featuredExample = featuredSense?.examples[0];
  const featuredStatus = featuredItem?.progress?.status || 'new';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{isZh ? '词典' : 'Lexicon'}</h1>
          <p className="text-muted-foreground">
            {isZh
              ? `词典内核、词书与可复习词汇资产 · ${filteredVocabulary.length} 个词条`
              : `Dictionary kernel, word books, and review-ready lexical assets · ${filteredVocabulary.length} words`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <AddWordDialog onAddWord={handleAddWord} />
          <ImportAnkiApkgDialog
            onInspect={handleInspectAnki}
            onImport={handleImportAnki}
            onSuccess={(result) => {
              toast.success(
                `Anki 导入完成：${result.successCount} 词，映射进度 ${result.mappedProgressCount} 条`,
              );
            }}
            onError={(errors) => {
              if (errors.length > 0) {
                toast.warning(`Anki 导入有 ${errors.length} 条无法映射，已生成错误报告`);
                downloadImportErrors(errors);
              }
            }}
          />
          <ImportWordBookDialog
            onImport={handleImportBook}
            onSuccess={(result) => {
              if (result.createdBookId) {
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
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </DialogTrigger>
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

      <section className="premium-hero-panel overflow-hidden rounded-lg border border-border bg-card p-5">
        {featuredEntry && featuredSense ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:items-stretch">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-md border border-border bg-[hsl(var(--accent-memory)/0.1)] text-[hsl(var(--accent-memory))] hover:bg-[hsl(var(--accent-memory)/0.1)]">
                  {isZh ? '词汇资产焦点' : 'Lexical asset focus'}
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
                  <h2 className="text-4xl font-semibold text-foreground sm:text-5xl">
                    {featuredEntry.headword}
                  </h2>
                  <p className="mt-2 font-mono text-sm text-muted-foreground">
                    {featuredSense.partOfSpeech || '-'} · {featuredEntry.phonetic || '-'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-md border-border bg-card text-foreground hover:bg-muted"
                  onClick={() => playAudio(featuredEntry.headword)}
                  aria-label={isZh ? '播放发音' : 'Play pronunciation'}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-background/70 p-4">
                  <p className="text-xs text-muted-foreground">{isZh ? '核心释义' : 'Core meaning'}</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {featuredSense.definition || (isZh ? '暂无英文释义' : 'No English definition yet')}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {featuredSense.definitionZh || (isZh ? '暂无中文释义' : 'No Chinese definition yet')}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/70 p-4">
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

              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild className="rounded-md">
                  <Link to={`/dashboard/practice?source=lexicon&wordId=${encodeURIComponent(featuredEntry.id)}&q=${encodeURIComponent(featuredEntry.headword)}`}>
                    <Brain className="mr-2 h-4 w-4" />
                    {isZh ? '用这个词练一次' : 'Practice this word'}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-md border-border bg-card text-foreground hover:bg-muted">
                  <Link to={`/dashboard/review?source=lexicon&wordId=${encodeURIComponent(featuredEntry.id)}`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    {isZh ? '加入复习回合' : 'Open in review'}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: isZh ? '当前词书' : 'Active book', value: activeBook?.name || '-' },
                { label: isZh ? '词条总数' : 'Total words', value: totalWords },
                { label: isZh ? '待复习' : 'In review', value: reviewCount },
              ].map((item) => (
                <div key={item.label} className="premium-panel-soft rounded-lg border border-border bg-background/70 p-4">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="mt-2 truncate text-lg font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col items-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-[hsl(var(--accent-memory)/0.1)] text-[hsl(var(--accent-memory))]">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              {isZh ? '先建立你的第一个词汇资产' : 'Create your first lexical asset'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isZh
                ? '导入词书或添加一个自定义词后，这里会展示可学习的词条预览、例句和下一步练习入口。'
                : 'Import a word book or add a custom word, then this area will show a learnable preview and next action.'}
            </p>
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
                className={cn(
                  'border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3',
                  isActive && 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20',
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
                      <Badge className="bg-emerald-600 text-white">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        当前词书
                      </Badge>
                    )}
                  </div>
	                  <p className="text-xs text-muted-foreground">
	                    {book.wordIds.length} {isZh ? '个词' : 'words'} · {isZh ? '来源' : 'Source'}: {book.source} · {isZh ? '许可' : 'License'}: {book.license}
	                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!isActive && (
                    <Button size="sm" variant="outline" onClick={() => setActiveBook(book.id)}>
                      设为当前
                    </Button>
                  )}
                  {!book.isBuiltIn && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteBook(book.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      删除
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
	          <Input
	            placeholder={isZh ? '搜索单词、释义或中文解释...' : 'Search words, meanings, or notes...'}
	            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[160px]">
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
          <SelectTrigger className="w-[160px]">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{totalWords}</p>
            <p className="text-sm text-muted-foreground">总词数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-emerald-600">{masteredCount}</p>
            <p className="text-sm text-muted-foreground">已掌握</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-yellow-600">{reviewCount}</p>
            <p className="text-sm text-muted-foreground">复习中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">{learningCount}</p>
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

          return (
            <Dialog key={item.word.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{entry.headword}</h3>
                        <p className="text-sm text-muted-foreground">
                          {sense.partOfSpeech || '-'} • {entry.phonetic || '-'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
	                        <Badge className={cn(statusColors[status], 'text-white')}>
                            {isZh ? (statusLabelsZh[status] || status) : (statusLabels[status] || status)}
                          </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            playAudio(entry.headword);
                          }}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm mt-2 line-clamp-1">{buildLexicalSummary(entry, i18n.language)}</p>
                    <p className="text-xs text-muted-foreground">
                      {sense.collocations.length > 0
                        ? `${isZh ? '搭配' : 'Collocations'}: ${sense.collocations.slice(0, 2).join(' / ')}`
                        : (isZh ? '暂无搭配，可先从释义和例句开始。' : 'No collocations yet; start from definition and examples.')}
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
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    {entry.headword}
                    <Button variant="ghost" size="icon" onClick={() => playAudio(entry.headword)}>
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {sense.partOfSpeech || '-'} • {entry.phonetic || '-'} • {entry.cefrLevel} • {entry.topic}
                  </p>

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
                        {isZh ? '导入词暂时没有例句，仍可先做词义回想训练。' : 'This imported word has no example yet. You can still start meaning recall.'}
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
                        <div key={template.type} className="rounded-lg border border-border bg-muted/40 p-3">
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
                        {isZh ? '开始 Lexicon drill' : 'Start Lexicon drill'}
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
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteWord(item.word.id)}
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
