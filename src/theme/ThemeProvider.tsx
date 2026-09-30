import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type AppColors } from './colors';
import { layout } from './layout';
import { radii, spacing } from './spacing';
import { shadows } from './shadows';
import { typography } from './typography';

export type ThemePreference = 'system' | 'light' | 'dark';
const STORAGE_KEY = '@chat/theme-preference';

export type AppTheme = Readonly<{
  dark: boolean;
  colors: AppColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  layout: typeof layout;
  shadows: typeof shadows;
}>;

type ThemeContextValue = AppTheme &
  Readonly<{
    preference: ThemePreference;
    navigationTheme: Theme;
    setPreference: (preference: ThemePreference) => Promise<void>;
  }>;

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren): React.JSX.Element {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'system' || stored === 'light' || stored === 'dark')
        setPreferenceState(stored);
    });
  }, []);

  const dark = preference === 'dark' || (preference === 'system' && systemScheme === 'dark');
  const colors = dark ? darkColors : lightColors;
  const value = useMemo<ThemeContextValue>(() => {
    const base = dark ? DarkTheme : DefaultTheme;
    return {
      preference,
      dark,
      colors,
      spacing,
      radii,
      typography,
      layout,
      shadows,
      navigationTheme: {
        ...base,
        dark,
        colors: {
          ...base.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.danger,
        },
      },
      setPreference: async (next) => {
        await AsyncStorage.setItem(STORAGE_KEY, next);
        setPreferenceState(next);
      },
    };
  }, [colors, dark, preference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (value === null) throw new Error('useAppTheme must be used within AppThemeProvider.');
  return value;
}
