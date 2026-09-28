import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Conversation } from '../../@types/chat';
import type { Message } from '../../@types/message';
import { useAppTheme } from '../../theme/ThemeProvider';
import { AppIcon } from '../AppIcon/AppIcon';
import { Avatar } from '../Avatar/Avatar';

function formatActivity(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function ConversationRow({
  conversation,
  onHide,
  onPress,
  latestMessage,
  actorId,
}: {
  conversation: Conversation;
  onHide: () => void;
  onPress: () => void;
  latestMessage?: Message | undefined;
  actorId?: string | undefined;
}): React.JSX.Element {
  const { colors, spacing, typography } = useAppTheme();
  const unread = conversation.unreadCount ?? 0;
  const muted = conversation.notificationsEnabled === false || Boolean(conversation.muteUntil);

  return (
    <Pressable
      accessibilityRole="button"
      onLongPress={onHide}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { paddingVertical: spacing.sm },
        pressed ? { backgroundColor: colors.surfaceElevated } : null,
      ]}
    >
      <Avatar
        displayName={conversation.counterpart.displayName}
        imageUrl={conversation.counterpart.avatarUrl}
        size={56}
      />

      <View style={[styles.copy, { gap: spacing.xs }]}>
        <View style={styles.topLine}>
          <Text
            numberOfLines={1}
            style={[
              typography.bodyMedium,
              styles.name,
              { color: colors.text },
              unread > 0 ? styles.strong : null,
            ]}
          >
            {conversation.counterpart.displayName}
          </Text>
          <Text
            style={[
              typography.caption,
              { color: unread > 0 ? colors.primary : colors.textMuted },
              unread > 0 ? styles.strong : null,
            ]}
          >
            {formatActivity(conversation.activityAt)}
          </Text>
        </View>

        <View style={[styles.bottomLine, { gap: spacing.sm }]}>
          <Text
            numberOfLines={1}
            style={[
              styles.preview,
              typography.label,
              { color: unread > 0 ? colors.textSecondary : colors.textMuted },
              unread > 0 ? styles.previewUnread : null,
            ]}
          >
            {latestMessage
              ? `${latestMessage.senderId === actorId ? 'You: ' : ''}${
                  latestMessage.deletedAt ? 'Message deleted' : (latestMessage.text ?? 'Message')
                }`
              : 'No messages yet'}
          </Text>

          {muted ? (
            <AppIcon type="icon" name="bell-off-outline" size={16} color={colors.textMuted} />
          ) : null}

          {unread > 0 ? (
            <View
              accessibilityLabel={`${unread} unread messages`}
              style={[styles.badge, { backgroundColor: colors.primary }]}
            >
              <Text style={[typography.caption, styles.badgeText, { color: colors.onPrimary }]}>
                {unread > 99 ? '99+' : unread}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: 14, minHeight: 76 },
  copy: { flex: 1, minWidth: 0 },
  topLine: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  bottomLine: { alignItems: 'center', flexDirection: 'row' },
  name: { flex: 1 },
  preview: { flex: 1, fontWeight: '400' },
  previewUnread: { fontWeight: '600' },
  strong: { fontWeight: '800' },
  badge: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 22,
    minWidth: 22,
    paddingHorizontal: 6,
  },
  badgeText: { fontWeight: '800', lineHeight: 16 },
});
