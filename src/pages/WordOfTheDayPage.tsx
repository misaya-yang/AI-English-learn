import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { wordsDatabase, type WordData, getWordOfTheDay, getPreviousWords } from '@/data/words';
import { cn } from '@/lib/utils';
import { speakEnglishText } from '@/services/tts';

// Generate mock previous words data for the last 30 days
const generatePreviousWordsData = (): { date: string; word: WordData }[] => {
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

const previousWordsData = generatePreviousWordsData();

export default function WordOfTheDayPage() {
  const [wordOfTheDay] = useState<WordData>(getWordOfTheDay());
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('definition');
  const [currentPage, setCurrentPage] = useState(0);
  const wordsPerPage = 10;

  const playAudio = (text: string) => {
    void speakEnglishText(text);
  };

  const shareWord = async (word: WordData) => {
    const shareData = {
      title: `Word of the Day: ${word.word}`,
      text: `${word.word} - ${word.definition}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Share cancelled or failed — no action needed
      }
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
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

  // Pagination for previous words
  const totalPages = Math.ceil(previousWordsData.length / wordsPerPage);
  const paginatedWords = previousWordsData.slice(
    currentPage * wordsPerPage,
    (currentPage + 1) * wordsPerPage
  );

  const renderWordCard = (word: WordData, date?: string) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden">
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
              <Button variant="outline" size="icon" onClick={() => shareWord(word)}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Tabs Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="definition">Definition</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
              <TabsTrigger value="more">More</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[240px] sm:h-[300px] mt-4">
              <TabsContent value="definition" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Definition / 定义</h3>
                    <div className="mb-4 p-4 bg-muted rounded-lg">
                      <p className="text-lg">{word.definition}</p>
                      <p className="text-muted-foreground mt-1">{word.definitionZh}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="examples" className="mt-0">
                <div className="space-y-4">
                  <h3 className="font-semibold mb-3">Example Sentences / 例句</h3>
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
                        Listen
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="related" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Synonyms / 同义词</h3>
                    <div className="flex flex-wrap gap-2">
                      {word.synonyms.map((syn) => (
                        <Badge key={syn} variant="secondary" className="text-sm">
                          {syn}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Antonyms / 反义词</h3>
                    <div className="flex flex-wrap gap-2">
                      {word.antonyms.map((ant) => (
                        <Badge key={ant} variant="outline" className="text-sm">
                          {ant}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Collocations / 搭配词</h3>
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
                      <h3 className="font-semibold mb-2">Etymology / 字源</h3>
                      <p className="text-muted-foreground">{word.etymology}</p>
                    </div>
                  )}

                  {word.memoryTip && (
                    <div>
                      <h3 className="font-semibold mb-2">Memory Tip / 记忆技巧</h3>
                      <p className="text-muted-foreground">{word.memoryTip}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">Topic / 主题</h3>
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">VocabDaily AI</span>
            </Link>
            <Link to="/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Start Learning
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Date Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <Calendar className="h-3 w-3 mr-1" />
            Word of the Day
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{today}</h1>
          <p className="text-muted-foreground">每日一字</p>
        </div>

        {/* Main Word Card */}
        {renderWordCard(wordOfTheDay)}

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button size="lg" variant="outline" className="rounded-xl">
                <BookmarkPlus className="h-5 w-5 mr-2" />
                Add to My Word Bank
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                <Sparkles className="h-5 w-5 mr-2" />
                Start Free Journey
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign up to save words, track progress, and practice with AI
          </p>
        </div>

        {/* Previous Words Section */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-emerald-600" />
            <h3 className="text-xl font-semibold">Previous Words / 往期单词</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {paginatedWords.map((item) => (
              <Card 
                key={item.date} 
                className="cursor-pointer hover:shadow-md transition-shadow"
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
              Page {currentPage + 1} of {totalPages}
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
              Word from {selectedDate}
            </DialogTitle>
          </DialogHeader>
          {selectedWord && renderWordCard(selectedWord, selectedDate || undefined)}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-background/80 backdrop-blur mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center">
                <BookOpen className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium">VocabDaily AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 VocabDaily AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
