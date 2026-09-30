import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { UserProfile } from '../../@types/chat';
import { useAppTheme } from '../../theme/ThemeProvider';
import { AppIcon } from '../AppIcon/AppIcon';
import { Avatar } from '../Avatar/Avatar';

export function UserRow({
  onPress,
  user,
}: {
  onPress: () => void;
  user: UserProfile;
}): React.JSX.Element {
  const { colors, radii, spacing, typography } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? colors.primarySoft : colors.surface,
          borderColor: colors.border,
          borderRadius: radii.lg,
          marginBottom: spacing.sm,
          padding: spacing.md,
        },
      ]}
    >
      <Avatar displayName={user.displayName} imageUrl={user.avatarUrl} userId={user.id} size={50} />
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[typography.body, styles.name, { color: colors.text }]}>
          {user.displayName}
        </Text>
        <Text numberOfLines={1} style={[typography.caption, { color: colors.textMuted }]}>
          {user.username === undefined ? 'No public username' : `@${user.username}`}
        </Text>
        {user.bio ? (
          <Text numberOfLines={1} style={[typography.caption, { color: colors.textSecondary }]}>
            {user.bio}
          </Text>
        ) : null}
      </View>
      <AppIcon type="icon" name="chevron-right" size={22} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row' },
  copy: { flex: 1, gap: 2, marginHorizontal: 12, minWidth: 0 },
  name: { fontWeight: '700' },
});
