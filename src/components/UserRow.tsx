import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { UserProfile } from '../chat/types';
import { colors, spacing, typography } from '../theme/tokens';
import { Avatar } from './Avatar';

export function UserRow({
  onPress,
  user,
}: {
  onPress: () => void;
  user: UserProfile;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      <Avatar displayName={user.displayName} />
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.name}>
          {user.displayName}
        </Text>
        <Text numberOfLines={1} style={styles.username}>
          {user.username === undefined ? 'No public username' : `@${user.username}`}
        </Text>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 72,
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.7 },
  copy: { flex: 1 },
  name: { ...typography.body, color: colors.text, fontWeight: '600' },
  username: { color: colors.textMuted },
});
