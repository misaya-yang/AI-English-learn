import { useMemo, useState } from 'react';
import { Upload, Layers, Loader2, BookOpenCheck } from 'lucide-react';
import { toast } from 'sonner';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AnkiDeckSummary, AnkiImportOptions, AnkiImportResult, ImportRowError } from '@/data/wordBooks';

interface ImportAnkiApkgDialogProps {
  onInspect: (file: File) => Promise<AnkiDeckSummary[]>;
  onImport: (file: File, options: AnkiImportOptions) => Promise<AnkiImportResult>;
  onSuccess?: (result: AnkiImportResult) => void;
  onError?: (errors: ImportRowError[]) => void;
}

export function ImportAnkiApkgDialog({
  onInspect,
  onImport,
  onSuccess,
  onError,
}: ImportAnkiApkgDialogProps) {
  const [open, setOpen] = useState(false);
  const [bookName, setBookName] = useState('Imported Anki Deck');
  const [file, setFile] = useState<File | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [decks, setDecks] = useState<AnkiDeckSummary[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');

  const selectedDeck = useMemo(
    () => decks.find((deck) => deck.deckId === selectedDeckId) || null,
    [decks, selectedDeckId],
  );

  const resetState = () => {
    setBookName('Imported Anki Deck');
    setFile(null);
    setDecks([]);
    setSelectedDeckId('');
    setIsInspecting(false);
    setIsImporting(false);
  };

  const handleInspect = async () => {
    if (!file) {
      toast.error('Please select a .apkg file first');
      return;
    }

    setIsInspecting(true);
    try {
      const inspectedDecks = await onInspect(file);

      if (inspectedDecks.length === 0) {
        toast.error('No available deck found in this .apkg file');
        setDecks([]);
        setSelectedDeckId('');
        return;
      }

      setDecks(inspectedDecks);
      setSelectedDeckId(inspectedDecks[0].deckId);
      toast.success(`Found ${inspectedDecks.length} deck(s)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to inspect .apkg file';
      toast.error(message);
      setDecks([]);
      setSelectedDeckId('');
    } finally {
      setIsInspecting(false);
    }
  };

  const handleImport = async () => {
    if (!file || !selectedDeckId) {
      toast.error('Please inspect and select one deck first');
      return;
    }

    setIsImporting(true);
    try {
      const result = await onImport(file, {
        selectedDeckId,
        bookName: bookName.trim() || selectedDeck?.deckName || 'Imported Anki Deck',
        source: `Anki APKG Import: ${file.name}`,
        license: 'User provided',
        fileName: file.name,
        progressMode: 'coarse',
      });

      if (result.unmappedRows.length > 0) {
        onError?.(result.unmappedRows);
      }

      onSuccess?.(result);

      toast.success(
        `Imported ${result.successCount} words from ${result.selectedDeck?.deckName || 'selected deck'}`,
      );

      setOpen(false);
      resetState();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import Anki deck';
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          resetState();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <BookOpenCheck className="h-4 w-4 mr-2" />
          导入 Anki (.apkg)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Anki 卡组导入 (.apkg)</DialogTitle>
          <DialogDescription>
            首版仅导入文本字段（不含媒体），支持先解析 deck 再选择单个 deck 导入。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="anki-file">Anki 文件 (.apkg)</Label>
            <Input
              id="anki-file"
              type="file"
              accept=".apkg,application/octet-stream"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setDecks([]);
                setSelectedDeckId('');
              }}
            />
            <p className="text-xs text-muted-foreground">文件大小上限 50MB（本地浏览器解析）</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="anki-book-name">词书名称</Label>
            <Input
              id="anki-book-name"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              placeholder="例如：Anki 高频词"
            />
          </div>

          <div className="flex gap-2 items-center">
            <Button
              variant="secondary"
              type="button"
              onClick={handleInspect}
              disabled={!file || isInspecting || isImporting}
            >
              {isInspecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              1. 解析卡组
            </Button>
            {decks.length > 0 && (
              <span className="text-xs text-muted-foreground">已解析 {decks.length} 个 deck</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="anki-deck-select">选择导入 deck</Label>
            <Select value={selectedDeckId} onValueChange={setSelectedDeckId} disabled={decks.length === 0 || isImporting}>
              <SelectTrigger id="anki-deck-select">
                <Layers className="h-4 w-4 mr-2" />
                <SelectValue placeholder="请先解析 .apkg 文件" />
              </SelectTrigger>
              <SelectContent>
                {decks.map((deck) => (
                  <SelectItem key={deck.deckId} value={deck.deckId}>
                    {deck.deckName} ({deck.cardCount} cards / {deck.noteCount} notes)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isInspecting || isImporting}>
            取消
          </Button>
          <Button onClick={handleImport} disabled={!file || !selectedDeckId || isImporting || isInspecting}>
            {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            2. 导入所选 deck
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
