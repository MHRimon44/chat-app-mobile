import type { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../Screen/Screen';
import { useAppTheme } from '../../theme/ThemeProvider';

export function AuthLayout({
  children,
  subtitle,
  title,
}: PropsWithChildren<{ subtitle: string; title: string }>): React.JSX.Element {
  const { colors, spacing, typography } = useAppTheme();
  return (
    <Screen mode="auto" keyboardAvoiding>
      <View
        style={{ flex: 1, gap: spacing.md, justifyContent: 'center', paddingVertical: spacing.xxl }}
      >
        <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[typography.body, { color: colors.textMuted, marginBottom: spacing.sm }]}>
          {subtitle}
        </Text>
        {children}
      </View>
    </Screen>
  );
}
