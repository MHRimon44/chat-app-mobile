import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Conversation } from '../chat/types';
import { colors, spacing, typography } from '../theme/tokens';
import { Avatar } from './Avatar';

export function ConversationRow({
  conversation,
  onHide,
  onPress,
}: {
  conversation: Conversation;
  onHide: () => void;
  onPress: () => void;
}): React.JSX.Element {
  const unread = conversation.unreadCount ?? 0;
  return (
    <Pressable
      accessibilityRole="button"
      onLongPress={onHide}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      <Avatar displayName={conversation.counterpart.displayName} />
      <View style={styles.copy}>
        <View style={styles.heading}>
          <Text numberOfLines={1} style={[styles.name, unread > 0 ? styles.unreadName : null]}>
            {conversation.counterpart.displayName}
          </Text>
          <Text style={styles.time}>{new Date(conversation.activityAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.heading}>
          <Text numberOfLines={1} style={styles.preview}>
            {conversation.counterpart.username === undefined
              ? 'Start a conversation'
              : `@${conversation.counterpart.username}`}
          </Text>
          {unread > 0 ? (
            <View accessibilityLabel={`${unread} unread messages`} style={styles.badge}>
              <Text style={styles.badgeText}>{Math.min(unread, 99)}</Text>
            </View>
          ) : null}
        </View>
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
    minHeight: 76,
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.7 },
  copy: { flex: 1, gap: spacing.xs },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  name: { ...typography.body, color: colors.text, flex: 1 },
  unreadName: { fontWeight: '700' },
  time: { color: colors.textMuted, fontSize: 12 },
  preview: { color: colors.textMuted, flex: 1 },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: { color: colors.surface, fontSize: 12, fontWeight: '700' },
});
