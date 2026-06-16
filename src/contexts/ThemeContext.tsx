import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
};

const getSystemResolvedTheme = (): ResolvedTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
  resolvedTheme: 'light',
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
const THEME_VERSION = '2026-06-workbench-light-v2';

const normalizeTheme = (value: string | null, fallback: Theme): Theme =>
  value === 'dark' || value === 'light' || value === 'system' ? value : fallback;

const getInitialTheme = (storageKey: string, fallback: Theme): Theme => {
  const versionKey = `${storageKey}-version`;
  const storedTheme = localStorage.getItem(storageKey);
  const storedVersion = localStorage.getItem(versionKey);

  if (storedVersion !== THEME_VERSION && storedTheme && storedTheme !== 'light') {
    localStorage.setItem(storageKey, 'light');
    localStorage.setItem(versionKey, THEME_VERSION);
    return 'light';
  }

  localStorage.setItem(versionKey, THEME_VERSION);
  return normalizeTheme(storedTheme, fallback);
};

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'vocabdaily-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => getInitialTheme(storageKey, defaultTheme)
  );
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemResolvedTheme());
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      localStorage.setItem(`${storageKey}-version`, THEME_VERSION);
      setTheme(theme);
    },
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
