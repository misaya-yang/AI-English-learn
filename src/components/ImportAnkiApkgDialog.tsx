import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
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
import { APKG_LIMIT_TEXT } from '@/services/ankiApkgImport';

const AUTO_FIELD = '__auto__';

const MAPPING_FIELDS: Array<{ key: AnkiFieldMappingKey; label: { en: string; zh: string } }> = [
  { key: 'word', label: { en: 'Word', zh: '词面' } },
  { key: 'definition', label: { en: 'English definition', zh: '英文释义' } },
  { key: 'definitionZh', label: { en: 'Chinese definition', zh: '中文释义' } },
  { key: 'phonetic', label: { en: 'Phonetic', zh: '音标' } },
  { key: 'partOfSpeech', label: { en: 'Part of speech', zh: '词性' } },
  { key: 'examples', label: { en: 'Examples', zh: '例句' } },
  { key: 'topic', label: { en: 'Topic', zh: '主题' } },
  { key: 'tags', label: { en: 'Tags', zh: '标签' } },
];

interface ImportAnkiApkgDialogProps {
  onInspect: (file: File) => Promise<AnkiDeckSummary[]>;
  onImport: (file: File, options: AnkiImportOptions) => Promise<AnkiImportResult>;
  onSuccess?: (result: AnkiImportResult) => void;
  onError?: (errors: ImportRowError[]) => void;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function ImportAnkiApkgDialog({
  onInspect,
  onImport,
  onSuccess,
  onError,
  trigger,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: ImportAnkiApkgDialogProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');
  const [open, setOpen] = useState(false);
  const dialogOpen = controlledOpen ?? open;
  const setDialogOpen = onOpenChange ?? setOpen;
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

      setDialogOpen(false);
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
      open={dialogOpen}
      onOpenChange={(nextOpen) => {
        setDialogOpen(nextOpen);
        if (!nextOpen) {
          resetState();
        }
      }}
    >
      {!hideTrigger ? (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button variant="outline">
              <BookOpenCheck className="h-4 w-4 mr-2" />
              {isZh ? '导入 Anki (.apkg)' : 'Import Anki (.apkg)'}
            </Button>
          )}
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isZh ? 'Anki 卡组导入 (.apkg)' : 'Import Anki deck (.apkg)'}</DialogTitle>
          <DialogDescription>
            {isZh
              ? '导入你自己下载且有使用权的 .apkg。只读取文本字段，不导入音频和图片。'
              : 'Import a .apkg file you have rights to use. Only text fields are read; audio and images are not imported.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="anki-file">{isZh ? 'Anki 文件 (.apkg)' : 'Anki file (.apkg)'}</Label>
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
            <p className="text-xs leading-5 text-muted-foreground">
              {isZh
                ? `可导入 AnkiWeb 下载的个人牌组；请确认牌组允许你使用。文件上限 ${APKG_LIMIT_TEXT}。`
                : `You can import personal decks downloaded from AnkiWeb. Confirm you have permission to use the deck. File limit: ${APKG_LIMIT_TEXT}.`}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="anki-book-name">{isZh ? '词书名称' : 'Book name'}</Label>
            <Input
              id="anki-book-name"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              placeholder={isZh ? '例如：Anki 高频词' : 'e.g. Anki high-frequency words'}
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
              {isZh ? '1. 解析卡组' : '1. Inspect deck'}
            </Button>
            {decks.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {isZh ? `已解析 ${decks.length} 个 deck` : `Found ${decks.length} deck(s)`}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="anki-deck-select">{isZh ? '选择导入 deck' : 'Select deck to import'}</Label>
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
                <SelectValue placeholder={isZh ? '请先解析 .apkg 文件' : 'Inspect the .apkg file first'} />
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
                  <p className="font-medium">{isZh ? '导入预览' : 'Import preview'}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDeck.noteCount} notes · {selectedDeck.cardCount} cards · {isZh ? '映射信心' : 'mapping confidence'} {selectedDeck.mappingConfidence || 'low'}
                  </p>
                </div>
                <span className="rounded-md border border-border bg-background px-2 py-1 text-xs">
                  {isZh
                    ? `${selectedDeck.progressPreview?.coarseMappedCount ?? 0} 条可粗略映射进度`
                    : `${selectedDeck.progressPreview?.coarseMappedCount ?? 0} progress rows can be coarsely mapped`}
                </span>
              </div>

              {selectedDeckFieldNames.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">{isZh ? '字段' : 'Fields'}</p>
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
                      <p className="text-xs font-medium">{isZh ? '字段映射' : 'Field mapping'}</p>
                      <p className="text-xs text-muted-foreground">
                        {isZh ? '自动识别不准时，手动指定列。' : 'If auto-detection is wrong, choose fields manually.'}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Object.keys(fieldMapping).length > 0
                        ? (isZh ? `已指定 ${Object.keys(fieldMapping).length} 项` : `${Object.keys(fieldMapping).length} fields set`)
                        : (isZh ? '默认自动识别' : 'Auto-detect by default')}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {MAPPING_FIELDS.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label htmlFor={`anki-field-${field.key}`} className="text-xs">
                          {isZh ? field.label.zh : field.label.en}
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
                            <SelectItem value={AUTO_FIELD}>{isZh ? '自动识别' : 'Auto-detect'}</SelectItem>
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
                  <p className="text-xs text-muted-foreground">{isZh ? '样例' : 'Samples'}</p>
                  {selectedDeck.sampleRows.slice(0, 2).map((row, index) => (
                    <div key={`${row.word}-${index}`} className="rounded-md bg-background p-2 text-xs">
                      <span className="font-medium">{row.word || (isZh ? '未识别词面' : 'Unmapped word')}</span>
                      <span className="text-muted-foreground"> · {row.definition || (isZh ? '未识别释义' : 'Unmapped definition')}</span>
                      {row.definitionZh ? <span className="text-muted-foreground"> · {row.definitionZh}</span> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="anki-progress-mode">{isZh ? '进度映射' : 'Progress mapping'}</Label>
            <Select
              value={progressMode}
              onValueChange={(value) => setProgressMode(value as AnkiProgressMode)}
              disabled={isImporting}
            >
              <SelectTrigger id="anki-progress-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coarse">
                  {isZh ? '粗略导入：用 Anki 复习次数和间隔估算学习状态' : 'Coarse import: estimate learning status from Anki review count and interval'}
                </SelectItem>
                <SelectItem value="none">
                  {isZh ? '不导入进度：只导入词条内容' : 'No progress import: import word content only'}
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {isZh
                ? '粗略导入不会覆盖无关词条，只会给本次导入的词建立初始学习状态。'
                : 'Coarse import does not overwrite unrelated words; it only creates initial learning state for this import.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isInspecting || isImporting}>
            {isZh ? '取消' : 'Cancel'}
          </Button>
          <Button onClick={handleImport} disabled={!file || !selectedDeckId || isImporting || isInspecting}>
            {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {isZh ? '2. 导入所选 deck' : '2. Import selected deck'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
