import { useState } from 'react';
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
}

export function ImportWordBookDialog({ onImport, onSuccess, onError }: ImportWordBookDialogProps) {
  const [open, setOpen] = useState(false);
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
      setPreviewError(error instanceof Error ? error.message : '无法预览文件');
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

      setOpen(false);
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
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            resetForm();
          }
        }}
      >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          导入词书
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>导入词书 (CSV/TSV)</DialogTitle>
          <DialogDescription>
            必填列：word, definition。可选列支持 definitionZh/level/topic/examples 等。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="book-name">词书名称</Label>
            <Input
              id="book-name"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              placeholder="例如：考研核心词"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-file">文件</Label>
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
                  <p className="text-muted-foreground">总行数</p>
                  <p className="text-sm font-semibold">{preview.totalRows}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">可导入</p>
                  <p className="text-sm font-semibold">{preview.successRows.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">重复</p>
                  <p className="text-sm font-semibold">{preview.duplicateCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">错误</p>
                  <p className="text-sm font-semibold">{preview.errorRows.length}</p>
                </div>
              </div>
              <p className="mt-2 text-muted-foreground">
                检测分隔符：{preview.delimiter === '\t' ? 'Tab' : 'Comma'}
              </p>
              {preview.successRows.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-muted-foreground">样例</p>
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
                  导入后会自动导出错误报告，方便你修正缺失字段。
                </p>
              )}
            </div>
          )}

          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground space-y-1">
            <p>多值字段请使用 | 分隔（例如 synonyms）。</p>
            <p>examples 格式：en::zh|en2::zh2</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isImporting}>
            取消
          </Button>
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            开始导入
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
