import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../AppIcon/AppIcon';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = {
  icon: string;
  title: string;
  message: string;
  actionIcon?: string | undefined;
  actionLabel?: string | undefined;
  onPress?: (() => void) | undefined;
};

export function EmptyState({
  icon,
  title,
  message,
  actionIcon,
  actionLabel,
  onPress,
}: Props): React.JSX.Element {
  const { colors, radii, spacing, typography } = useAppTheme();
  return (
    <View style={[styles.root, { gap: spacing.sm }]}>
      <View
        style={[styles.icon, { backgroundColor: colors.primarySoft, borderRadius: radii.pill }]}
      >
        <AppIcon type="icon" name={icon} size={32} color={colors.primary} />
      </View>
      <Text style={[typography.title, { color: colors.text, textAlign: 'center' }]}>{title}</Text>
      <Text style={[typography.label, { color: colors.textMuted, textAlign: 'center' }]}>
        {message}
      </Text>
      {onPress && actionLabel && actionIcon ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={[
            styles.action,
            {
              backgroundColor: colors.primarySoft,
              borderRadius: radii.pill,
              marginTop: spacing.sm,
            },
          ]}
        >
          <AppIcon type="icon" name={actionIcon} size={19} color={colors.primary} />
          <Text style={[typography.label, { color: colors.primary }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  icon: { alignItems: 'center', height: 68, justifyContent: 'center', marginBottom: 6, width: 68 },
  action: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 16,
  },
});
