import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Screen } from './Screen';
import { colors, spacing, typography } from '../theme/tokens';

export function AuthLayout({
  children,
  subtitle,
  title,
}: PropsWithChildren<{ subtitle: string; title: string }>): React.JSX.Element {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {children}
      </ScrollView>
    </Screen>
  );
}
const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: spacing.md, justifyContent: 'center', paddingVertical: spacing.xl },
  title: { ...typography.heading, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.sm },
});
