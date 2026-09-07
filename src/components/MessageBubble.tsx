import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Message } from '../messages/types';
import { colors, radii, spacing } from '../theme/tokens';

export function MessageBubble({
  message,
  own,
  onLongPress,
  onRetry,
  onToggleReaction,
  receiptLabel,
}: {
  message: Message;
  own: boolean;
  onLongPress: () => void;
  onRetry: () => void;
  onToggleReaction: (emoji: string, active: boolean) => void;
  receiptLabel?: string | undefined;
}): React.JSX.Element {
  return (
    <View style={[styles.row, own ? styles.ownRow : styles.otherRow]}>
      <Pressable
        accessibilityRole="button"
        onLongPress={onLongPress}
        style={[styles.bubble, own ? styles.ownBubble : styles.otherBubble]}
      >
        {message.replyToMessageId === undefined ? null : <Text style={styles.reply}>Reply</Text>}
        <Text style={[styles.text, own ? styles.ownText : null]}>
          {message.text === null ? 'Message deleted' : message.text}
        </Text>
        <Text style={[styles.meta, own ? styles.ownMeta : null]}>
          {message.localStatus === 'sending'
            ? 'Sending…'
            : message.localStatus === 'failed'
              ? 'Not sent'
              : new Date(message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
          {receiptLabel === undefined ? '' : ` · ${receiptLabel}`}
        </Text>
      </Pressable>
      {message.reactions.length === 0 ? null : (
        <View style={styles.reactions}>
          {message.reactions.map((reaction) => (
            <Pressable
              accessibilityRole="button"
              key={reaction.emoji}
              onPress={() => onToggleReaction(reaction.emoji, !reaction.reactedByMe)}
              style={[styles.reaction, reaction.reactedByMe ? styles.reacted : null]}
            >
              <Text>
                {reaction.emoji} {reaction.count}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {message.localStatus === 'failed' ? (
        <Pressable accessibilityRole="button" onPress={onRetry}>
          <Text style={styles.retry}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { marginVertical: spacing.xs, maxWidth: '82%' },
  ownRow: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherRow: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: {
    borderRadius: radii.md,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  ownBubble: { backgroundColor: colors.primary },
  otherBubble: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  text: { color: colors.text, fontSize: 16, lineHeight: 22 },
  ownText: { color: colors.surface },
  meta: { color: colors.textMuted, fontSize: 11, textAlign: 'right' },
  ownMeta: { color: '#E4E4FF' },
  reply: {
    borderLeftColor: colors.border,
    borderLeftWidth: 2,
    color: colors.textMuted,
    paddingLeft: spacing.sm,
  },
  reactions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingTop: spacing.xs },
  reaction: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  reacted: { borderColor: colors.primary },
  retry: { color: colors.danger, fontWeight: '700', padding: spacing.xs },
});
