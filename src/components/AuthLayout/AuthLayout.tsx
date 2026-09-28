import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../Screen/Screen';
import { AppIcon } from '../AppIcon/AppIcon';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = PropsWithChildren<{
  title: string;
  subtitle: string;
  icon: string;
  eyebrow?: string;
  footer?: ReactNode;
}>;

export function AuthLayout({
  children,
  title,
  subtitle,
  icon,
  eyebrow = 'ALAP',
  footer,
}: Props): React.JSX.Element {
  const { colors, spacing, radii, shadows, typography } = useAppTheme();

  return (
    <Screen mode="auto" keyboardAvoiding padded={false}>
      <View pointerEvents="none" style={[styles.glowTop, { backgroundColor: colors.cyan }]} />
      <View pointerEvents="none" style={[styles.glowBottom, { backgroundColor: colors.accent }]} />

      <View style={[styles.content, { paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl }]}>
        <View style={styles.hero}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: colors.primarySoft, borderColor: colors.border },
            ]}
          >
            <AppIcon type="icon" name={icon} size={28} color={colors.primary} />
          </View>

          <Text style={[typography.label, styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
          <Text accessibilityRole="header" style={[typography.heading, styles.title, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[typography.body, styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radii.card,
              padding: spacing.xl,
              gap: spacing.lg,
            },
            shadows.sm,
          ]}
        >
          {children}
        </View>

        {footer ? <View style={[styles.footer, { marginTop: spacing.xl }]}>{footer}</View> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', overflow: 'hidden' },
  hero: { alignItems: 'center', marginBottom: 24 },
  iconWrap: {
    alignItems: 'center',
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    marginBottom: 16,
    width: 58,
    borderRadius: 18,
  },
  eyebrow: { letterSpacing: 2.2, marginBottom: 8 },
  title: { textAlign: 'center' },
  subtitle: { marginTop: 8, maxWidth: 340, textAlign: 'center' },
  card: { borderWidth: 1, width: '100%' },
  footer: { alignItems: 'center' },
  glowTop: {
    borderRadius: 999,
    height: 220,
    opacity: 0.08,
    position: 'absolute',
    right: -100,
    top: -90,
    width: 220,
  },
  glowBottom: {
    borderRadius: 999,
    bottom: -120,
    height: 260,
    left: -130,
    opacity: 0.07,
    position: 'absolute',
    width: 260,
  },
});
