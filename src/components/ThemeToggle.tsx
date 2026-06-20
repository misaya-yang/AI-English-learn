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
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label={copy.trigger}
          title={copy.trigger}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
