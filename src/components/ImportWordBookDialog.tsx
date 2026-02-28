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
      setFile(null);
      setBookName('My Imported Book');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed';
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <FileText className="h-3 w-3" />
                <span>{file.name}</span>
              </div>
            )}
          </div>

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
