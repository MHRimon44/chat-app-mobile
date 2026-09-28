import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../AppIcon/AppIcon';
import { Avatar } from '../Avatar/Avatar';
import { useAppTheme } from '../../theme/ThemeProvider';
type Props = {
  displayName: string;
  username?: string | undefined;
  email?: string | undefined;
  onPress: () => void;
};
export function ProfileSettingsCard({
  displayName,
  username,
  email,
  onPress,
}: Props): React.JSX.Element {
  const { colors, radii, spacing, typography } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        {
          backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
          borderColor: colors.border,
          borderRadius: radii.lg,
          padding: spacing.lg,
        },
      ]}
    >
      <Avatar displayName={displayName} size={64} />
      <View style={styles.text}>
        <Text numberOfLines={1} style={[typography.title, { color: colors.text }]}>
          {displayName}
        </Text>
        <Text numberOfLines={1} style={[typography.caption, { color: colors.textMuted }]}>
          {username ? `@${username}` : (email ?? 'View and edit your profile')}
        </Text>
      </View>
      <AppIcon type="icon" name="chevron-right" size={24} color={colors.textMuted} />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 14,
  },
  text: { flex: 1, gap: 3 },
});
