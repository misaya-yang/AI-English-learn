import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');

  const copy = {
    trigger: isZh ? '切换外观' : 'Toggle appearance',
    light: isZh ? '浅色' : 'Light',
    dark: isZh ? '深色' : 'Dark',
    system: isZh ? '跟随系统' : 'System',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="glass"
          size="icon"
          className="glass-icon-button relative h-11 min-h-11 w-11 min-w-11 overflow-visible text-muted-foreground hover:text-foreground sm:h-9 sm:min-h-9 sm:w-9 sm:min-w-9"
          aria-label={copy.trigger}
          title={copy.trigger}
        >
          <span aria-hidden="true" className="pointer-events-none !absolute left-1/2 top-1/2 grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center">
            <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </span>
          <span className="sr-only">{copy.trigger}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')} className={theme === 'light' ? 'bg-muted' : ''}>
          <Sun className="mr-2 h-4 w-4" />
          {copy.light}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-muted' : ''}>
          <Moon className="mr-2 h-4 w-4" />
          {copy.dark}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className={theme === 'system' ? 'bg-muted' : ''}>
          <Monitor className="mr-2 h-4 w-4" />
          {copy.system}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
