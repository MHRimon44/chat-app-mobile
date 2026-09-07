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

export type ThemePreference = 'system' | 'light' | 'dark';
const STORAGE_KEY = '@chat/theme-preference';

type ThemeContextValue = Readonly<{
  preference: ThemePreference;
  dark: boolean;
  navigationTheme: Theme;
  setPreference: (preference: ThemePreference) => Promise<void>;
}>;

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren): React.JSX.Element {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'system' || stored === 'light' || stored === 'dark') {
        setPreferenceState(stored);
      }
    });
  }, []);

  const dark = preference === 'dark' || (preference === 'system' && systemScheme === 'dark');
  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      dark,
      navigationTheme: dark ? DarkTheme : DefaultTheme,
      setPreference: async (next) => {
        await AsyncStorage.setItem(STORAGE_KEY, next);
        setPreferenceState(next);
      },
    }),
    [dark, preference],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (value === null) throw new Error('useAppTheme must be used within AppThemeProvider.');
  return value;
}
