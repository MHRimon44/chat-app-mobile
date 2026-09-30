import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../theme/ThemeProvider';
export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): React.JSX.Element {
  const { colors, radii, spacing, typography } = useAppTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text
        style={[
          typography.caption,
          styles.title,
          { color: colors.textMuted, paddingHorizontal: spacing.xs },
        ]}
      >
        {title.toUpperCase()}
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg },
        ]}
      >
        {children}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  title: { fontWeight: '800', letterSpacing: 0.8 },
  card: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
});
