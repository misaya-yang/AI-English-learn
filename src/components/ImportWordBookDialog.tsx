import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, Loader2 } from 'lucide-react';
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
import type { ImportResult, ImportRowError } from '@/data/wordBooks';
import { parseWordBookText, type ParseWordBookResult } from '@/services/bookImport';

interface ImportWordBookDialogProps {
  onImport: (file: File, bookName: string) => Promise<ImportResult> | ImportResult;
  onSuccess?: (result: ImportResult) => void;
  onError?: (errors: ImportRowError[]) => void;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function ImportWordBookDialog({
  onImport,
  onSuccess,
  onError,
  trigger,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: ImportWordBookDialogProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language.startsWith('zh');
  const [open, setOpen] = useState(false);
  const dialogOpen = controlledOpen ?? open;
  const setDialogOpen = onOpenChange ?? setOpen;
  const [bookName, setBookName] = useState('My Imported Book');
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<ParseWordBookResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setPreviewError(null);
    setBookName('My Imported Book');
  };

  const handleFileChange = async (nextFile: File | null) => {
    setFile(nextFile);
    setPreview(null);
    setPreviewError(null);

    if (!nextFile) return;

    try {
      const text = await nextFile.text();
      setPreview(parseWordBookText(text, {
        delimiter: nextFile.name.toLowerCase().endsWith('.tsv') ? '\t' : undefined,
      }));
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : (isZh ? '无法预览文件' : 'Unable to preview file'));
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a CSV/TSV file first');
      return;
    }

    setIsImporting(true);
    try {
      const result = await onImport(file, bookName.trim() || 'My Imported Book');

      if (result.errorRows.length > 0) {
        onError?.(result.errorRows);
      }

      onSuccess?.(result);

      toast.success(
        `Imported ${result.successCount}/${result.totalRows} rows (${result.duplicateCount} duplicates).`,
      );

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed';
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
            resetForm();
          }
        }}
      >
      {!hideTrigger ? (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              {isZh ? '导入词书' : 'Import word book'}
            </Button>
          )}
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isZh ? '导入词书 (CSV/TSV)' : 'Import word book (CSV/TSV)'}</DialogTitle>
          <DialogDescription>
            {isZh
              ? '必填列：word, definition。可选列支持 definitionZh/level/topic/examples 等。'
              : 'Required columns: word and definition. Optional columns include definitionZh, level, topic, examples, and more.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="book-name">{isZh ? '词书名称' : 'Book name'}</Label>
            <Input
              id="book-name"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              placeholder={isZh ? '例如：考研核心词' : 'e.g. IELTS Core Vocabulary'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-file">{isZh ? '文件' : 'File'}</Label>
            <Input
              id="book-file"
              type="file"
              accept=".csv,.tsv,text/csv,text/tab-separated-values"
              onChange={(e) => void handleFileChange(e.target.files?.[0] || null)}
            />
            {file && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <FileText className="h-3 w-3" />
                <span>{file.name}</span>
              </div>
            )}
          </div>

          {previewError && (
            <div className="rounded-md border border-destructive/35 bg-destructive/10 p-3 text-xs text-destructive">
              {previewError}
            </div>
          )}

          {preview && (
            <div className="rounded-md border border-border bg-muted/35 p-3 text-xs">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div>
                  <p className="text-muted-foreground">{isZh ? '总行数' : 'Total rows'}</p>
                  <p className="text-sm font-semibold">{preview.totalRows}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{isZh ? '可导入' : 'Importable'}</p>
                  <p className="text-sm font-semibold">{preview.successRows.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{isZh ? '重复' : 'Duplicates'}</p>
                  <p className="text-sm font-semibold">{preview.duplicateCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{isZh ? '错误' : 'Errors'}</p>
                  <p className="text-sm font-semibold">{preview.errorRows.length}</p>
                </div>
              </div>
              <p className="mt-2 text-muted-foreground">
                {isZh ? '检测分隔符' : 'Detected delimiter'}: {preview.delimiter === '\t' ? 'Tab' : 'Comma'}
              </p>
              {preview.successRows.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-muted-foreground">{isZh ? '样例' : 'Samples'}</p>
                  {preview.successRows.slice(0, 2).map((row) => (
                    <div key={`${row.row}-${row.key}`} className="rounded-md bg-background p-2">
                      <span className="font-medium">{row.word.word}</span>
                      <span className="text-muted-foreground"> · {row.word.definition}</span>
                    </div>
                  ))}
                </div>
              )}
              {preview.errorRows.length > 0 && (
                <p className="mt-2 text-muted-foreground">
                  {isZh
                    ? '导入后会自动导出错误报告，方便你修正缺失字段。'
                    : 'After import, an error report will be exported so you can fix missing fields.'}
                </p>
              )}
            </div>
          )}

          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground space-y-1">
            <p>{isZh ? '多值字段请使用 | 分隔（例如 synonyms）。' : 'Use | to separate multi-value fields such as synonyms.'}</p>
            <p>{isZh ? 'examples 格式：en::zh|en2::zh2' : 'Examples format: en::zh|en2::zh2'}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isImporting}>
            {isZh ? '取消' : 'Cancel'}
          </Button>
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {isZh ? '开始导入' : 'Start import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
