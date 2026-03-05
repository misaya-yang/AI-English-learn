import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Bookmark,
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

export default function VocabularyBankPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

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

  const queryParam = searchParams.get('q') || '';

  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [queryParam]);

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
      item.word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.word.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.word.definitionZh.includes(searchQuery);

    const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
    const matchesTopic = selectedTopic === 'all' || item.word.topic === selectedTopic;

    return matchesSearch && matchesStatus && matchesTopic;
  });

  const topics = useMemo(() => {
    return Array.from(new Set(vocabulary.map((item) => item.word.topic))).sort();
  }, [vocabulary]);

  const handleExport = () => {
    toast.info('导出功能即将支持（CSV/Anki）');
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Vocabulary</h1>
          <p className="text-muted-foreground">
            词书学习中心 • {filteredVocabulary.length} words
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
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export (CSV/Anki Soon)
          </Button>
        </div>
      </div>

      {/* Book Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            词书管理
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
                      <Badge variant="secondary">Built-in</Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                    {isActive && (
                      <Badge className="bg-emerald-600 text-white">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        当前词书
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {book.wordIds.length} words • Source: {book.source} • License: {book.license}
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
            placeholder="Search words... 搜索单词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="learning">Learning</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="mastered">Mastered</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedTopic} onValueChange={setSelectedTopic}>
          <SelectTrigger className="w-[160px]">
            <Tag className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
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
            <p className="text-sm text-muted-foreground">Total Words</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-emerald-600">{masteredCount}</p>
            <p className="text-sm text-muted-foreground">Mastered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-yellow-600">{reviewCount}</p>
            <p className="text-sm text-muted-foreground">In Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">{learningCount}</p>
            <p className="text-sm text-muted-foreground">Learning</p>
          </CardContent>
        </Card>
      </div>

      {/* Word List */}
      <div className="space-y-3">
        {filteredVocabulary.map((item) => {
          const status = item.progress?.status || 'new';
          const isCustomWord = !builtInWordIdSet.has(item.word.id);

          return (
            <Dialog key={item.word.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{item.word.word}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.word.partOfSpeech} • {item.word.phonetic}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={cn(statusColors[status], 'text-white')}>{statusLabels[status]}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            playAudio(item.word.word);
                          }}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm mt-2 line-clamp-1">{item.word.definition}</p>
                    <p className="text-xs text-muted-foreground">{item.word.definitionZh}</p>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        {item.word.topic}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.word.level}
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
                    {item.word.word}
                    <Button variant="ghost" size="icon" onClick={() => playAudio(item.word.word)}>
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {item.word.partOfSpeech} • {item.word.phonetic}
                  </p>

                  <div>
                    <h4 className="font-semibold mb-2">Definitions</h4>
                    <p className="text-sm">{item.word.definition}</p>
                    <p className="text-sm text-muted-foreground">{item.word.definitionZh}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Example</h4>
                    <p className="text-sm">{item.word.examples[0]?.en}</p>
                    <p className="text-sm text-muted-foreground">{item.word.examples[0]?.zh}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.word.synonyms.slice(0, 6).map((synonym) => (
                      <Badge key={synonym} variant="secondary">
                        {synonym}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-4">
                    {status !== 'mastered' && (
                      <Button variant="outline" className="flex-1" onClick={() => handleMarkAsMastered(item.word.id)}>
                        <Star className="h-4 w-4 mr-2" />
                        Mark Mastered
                      </Button>
                    )}
                    {status === 'new' && (
                      <Button variant="outline" className="flex-1" onClick={() => handleMarkAsLearned(item.word.id)}>
                        <Brain className="h-4 w-4 mr-2" />
                        Start Learning
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
                    {!isCustomWord && (
                      <Button variant="outline" size="icon">
                        <Bookmark className="h-4 w-4" />
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
          <h3 className="text-lg font-medium mb-2">No words found</h3>
          <p className="text-muted-foreground">Try adjusting your search or import a new word book.</p>
        </div>
      )}
    </div>
  );
}
