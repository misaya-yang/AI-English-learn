import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { WordData } from '@/data/words';
import { fetchWordFromAPI } from '@/data/extendedWords';

interface AddWordDialogProps {
  onAddWord: (word: WordData) => void;
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const TOPICS = ['daily', 'business', 'technology', 'travel', 'academic', 'science', 'health', 'arts', 'food', 'sports'];

export function AddWordDialog({ onAddWord }: AddWordDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [wordData, setWordData] = useState<Partial<WordData>>({
    level: 'B1',
    topic: 'daily',
  });

  const handleSearch = async () => {
    if (!searchWord.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await fetchWordFromAPI(searchWord);
      if (result) {
        setWordData({
          ...wordData,
          ...result,
        });
        toast.success('Word found!');
      } else {
        toast.error('Word not found in dictionary');
      }
    } catch {
      toast.error('Error searching word');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = () => {
    if (!wordData.word || !wordData.definition) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newWord: WordData = {
      id: `custom-${Date.now()}`,
      word: wordData.word,
      phonetic: wordData.phonetic || '',
      partOfSpeech: wordData.partOfSpeech || 'n.',
      definition: wordData.definition,
      definitionZh: wordData.definitionZh || '',
      examples: wordData.examples || [],
      synonyms: wordData.synonyms || [],
      antonyms: wordData.antonyms || [],
      collocations: wordData.collocations || [],
      level: (wordData.level as WordData['level']) || 'B1',
      topic: wordData.topic || 'daily',
      etymology: wordData.etymology,
      memoryTip: wordData.memoryTip,
    };

    onAddWord(newWord);
    toast.success('Word added successfully!');
    setOpen(false);
    setSearchWord('');
    setWordData({ level: 'B1', topic: 'daily' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Word
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Word</DialogTitle>
          <DialogDescription>
            Search for a word from the dictionary or add it manually.
          </DialogDescription>
        </DialogHeader>

        {/* Search Section */}
        <div className="flex gap-2">
          <Input
            placeholder="Search word..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            variant="outline"
            onClick={handleSearch}
            disabled={isSearching || !searchWord.trim()}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="word">Word *</Label>
              <Input
                id="word"
                value={wordData.word || ''}
                onChange={(e) => setWordData({ ...wordData, word: e.target.value })}
                placeholder="e.g., example"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phonetic">Phonetic</Label>
              <Input
                id="phonetic"
                value={wordData.phonetic || ''}
                onChange={(e) => setWordData({ ...wordData, phonetic: e.target.value })}
                placeholder="/ɪɡˈzæmpəl/"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partOfSpeech">Part of Speech</Label>
              <Input
                id="partOfSpeech"
                value={wordData.partOfSpeech || ''}
                onChange={(e) => setWordData({ ...wordData, partOfSpeech: e.target.value })}
                placeholder="n., v., adj., adv."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select
                value={wordData.level}
                onValueChange={(value) => setWordData({ ...wordData, level: value as WordData['level'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CEFR_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Select
              value={wordData.topic}
              onValueChange={(value) => setWordData({ ...wordData, topic: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic.charAt(0).toUpperCase() + topic.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="definition">Definition (English) *</Label>
            <Textarea
              id="definition"
              value={wordData.definition || ''}
              onChange={(e) => setWordData({ ...wordData, definition: e.target.value })}
              placeholder="Enter the definition..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="definitionZh">Definition (Chinese)</Label>
            <Textarea
              id="definitionZh"
              value={wordData.definitionZh || ''}
              onChange={(e) => setWordData({ ...wordData, definitionZh: e.target.value })}
              placeholder="输入中文释义..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="examples">Example Sentences</Label>
            <Textarea
              id="examples"
              value={wordData.examples?.map(e => `${e.en}\n${e.zh}`).join('\n\n') || ''}
              onChange={(e) => {
                const lines = e.target.value.split('\n\n');
                const examples = lines.map(line => {
                  const [en, zh] = line.split('\n');
                  return { en: en || '', zh: zh || '' };
                }).filter(ex => ex.en);
                setWordData({ ...wordData, examples });
              }}
              placeholder="English sentence\n中文翻译\n\nAnother example\n另一个例子"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="synonyms">Synonyms (comma separated)</Label>
              <Input
                id="synonyms"
                value={wordData.synonyms?.join(', ') || ''}
                onChange={(e) => setWordData({ ...wordData, synonyms: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="synonym1, synonym2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="antonyms">Antonyms (comma separated)</Label>
              <Input
                id="antonyms"
                value={wordData.antonyms?.join(', ') || ''}
                onChange={(e) => setWordData({ ...wordData, antonyms: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="antonym1, antonym2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collocations">Collocations (comma separated)</Label>
            <Input
              id="collocations"
              value={wordData.collocations?.join(', ') || ''}
              onChange={(e) => setWordData({ ...wordData, collocations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="make an example, set an example"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memoryTip">Memory Tip</Label>
            <Textarea
              id="memoryTip"
              value={wordData.memoryTip || ''}
              onChange={(e) => setWordData({ ...wordData, memoryTip: e.target.value })}
              placeholder="A helpful tip to remember this word..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">
            Add Word
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
