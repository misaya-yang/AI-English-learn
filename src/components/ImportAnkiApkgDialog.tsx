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
import type {
  AnkiDeckSummary,
  AnkiFieldMapping,
  AnkiFieldMappingKey,
  AnkiImportOptions,
  AnkiImportResult,
  AnkiProgressMode,
  ImportRowError,
} from '@/data/wordBooks';

const AUTO_FIELD = '__auto__';

const MAPPING_FIELDS: Array<{ key: AnkiFieldMappingKey; label: string }> = [
  { key: 'word', label: '词面' },
  { key: 'definition', label: '英文释义' },
  { key: 'definitionZh', label: '中文释义' },
  { key: 'phonetic', label: '音标' },
  { key: 'partOfSpeech', label: '词性' },
  { key: 'examples', label: '例句' },
  { key: 'topic', label: '主题' },
  { key: 'tags', label: '标签' },
];

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
  const [progressMode, setProgressMode] = useState<AnkiProgressMode>('coarse');
  const [fieldMapping, setFieldMapping] = useState<AnkiFieldMapping>({});

  const selectedDeck = useMemo(
    () => decks.find((deck) => deck.deckId === selectedDeckId) || null,
    [decks, selectedDeckId],
  );
  const selectedDeckFieldNames = selectedDeck?.fieldNames ?? [];

  const resetState = () => {
    setBookName('Imported Anki Deck');
    setFile(null);
    setDecks([]);
    setSelectedDeckId('');
    setProgressMode('coarse');
    setFieldMapping({});
    setIsInspecting(false);
    setIsImporting(false);
  };

  const updateFieldMapping = (key: AnkiFieldMappingKey, value: string) => {
    setFieldMapping((current) => {
      const next = { ...current };
      if (value === AUTO_FIELD) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
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
      setFieldMapping({});
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
        progressMode,
        fieldMapping,
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
                setFieldMapping({});
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
            <Select
              value={selectedDeckId}
              onValueChange={(value) => {
                setSelectedDeckId(value);
                setFieldMapping({});
              }}
              disabled={decks.length === 0 || isImporting}
            >
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

          {selectedDeck && (
            <div className="rounded-md border border-border bg-muted/35 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">导入预览</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDeck.noteCount} notes · {selectedDeck.cardCount} cards · 映射信心 {selectedDeck.mappingConfidence || 'low'}
                  </p>
                </div>
                <span className="rounded-md border border-border bg-background px-2 py-1 text-xs">
                  {selectedDeck.progressPreview?.coarseMappedCount ?? 0} 条可粗略映射进度
                </span>
              </div>

              {selectedDeckFieldNames.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">字段</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedDeckFieldNames.slice(0, 8).map((fieldName) => (
                      <span key={fieldName} className="rounded-md bg-background px-2 py-1 text-xs">
                        {fieldName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedDeckFieldNames.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium">字段映射</p>
                      <p className="text-xs text-muted-foreground">自动识别不准时，手动指定列。</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Object.keys(fieldMapping).length > 0 ? `已指定 ${Object.keys(fieldMapping).length} 项` : '默认自动识别'}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {MAPPING_FIELDS.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label htmlFor={`anki-field-${field.key}`} className="text-xs">
                          {field.label}
                        </Label>
                        <Select
                          value={fieldMapping[field.key] || AUTO_FIELD}
                          onValueChange={(value) => updateFieldMapping(field.key, value)}
                          disabled={isImporting}
                        >
                          <SelectTrigger id={`anki-field-${field.key}`} className="h-9 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={AUTO_FIELD}>自动识别</SelectItem>
                            {selectedDeckFieldNames.map((fieldName) => (
                              <SelectItem key={`${field.key}-${fieldName}`} value={fieldName}>
                                {fieldName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDeck.sampleRows && selectedDeck.sampleRows.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-muted-foreground">样例</p>
                  {selectedDeck.sampleRows.slice(0, 2).map((row, index) => (
                    <div key={`${row.word}-${index}`} className="rounded-md bg-background p-2 text-xs">
                      <span className="font-medium">{row.word || '未识别词面'}</span>
                      <span className="text-muted-foreground"> · {row.definition || '未识别释义'}</span>
                      {row.definitionZh ? <span className="text-muted-foreground"> · {row.definitionZh}</span> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="anki-progress-mode">进度映射</Label>
            <Select
              value={progressMode}
              onValueChange={(value) => setProgressMode(value as AnkiProgressMode)}
              disabled={isImporting}
            >
              <SelectTrigger id="anki-progress-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coarse">粗略导入：用 Anki 复习次数和间隔估算学习状态</SelectItem>
                <SelectItem value="none">不导入进度：只导入词条内容</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              粗略导入不会覆盖无关词条，只会给本次导入的词建立初始学习状态。
            </p>
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
