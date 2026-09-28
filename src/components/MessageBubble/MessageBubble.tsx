import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo, useRef } from 'react';
import type { Message } from '../../@types/message';
import { useAppTheme } from '../../theme/ThemeProvider';
import { AppIcon } from '../AppIcon/AppIcon';

export function MessageBubble({
  message,
  own,
  onSwipeLeft,
  onLongPress,
  onRetry,
  onToggleReaction,
  receiptLabel,
}: {
  message: Message;
  own: boolean;
  onSwipeLeft: () => void;
  onLongPress: () => void;
  onRetry: () => void;
  onToggleReaction: (emoji: string, active: boolean) => void;
  receiptLabel?: string | undefined;
}): React.JSX.Element {
  const { colors, radii, spacing, typography } = useAppTheme();
  const deleted = message.text === null;
  const translateX = useRef(new Animated.Value(0)).current;
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          gesture.dx < -8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: (_event, gesture) => {
          translateX.setValue(Math.max(-72, Math.min(0, gesture.dx)));
        },
        onPanResponderRelease: (_event, gesture) => {
          if (gesture.dx < -48) onSwipeLeft();
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        },
      }),
    [onSwipeLeft, translateX],
  );

  return (
    <View
      style={[
        styles.row,
        { marginVertical: spacing.xs },
        own ? styles.ownRow : styles.otherRow,
      ]}
    >
      <View style={styles.swipeWrap}>
        <View style={[styles.swipeHint, { backgroundColor: colors.primarySoft, borderRadius: radii.pill }]}>
          <AppIcon type="icon" name="reply-outline" size={20} color={colors.primary} />
        </View>
        <Animated.View {...panResponder.panHandlers} style={{ transform: [{ translateX }] }}>
      <Pressable
        accessibilityRole="button"
        delayLongPress={300}
        onLongPress={onLongPress}
        style={[
          styles.bubble,
          {
            backgroundColor: own ? colors.primary : colors.surfaceElevated,
            borderColor: own ? colors.primary : colors.border,
            borderRadius: radii.lg,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
          own ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        {message.replyToMessageId === undefined ? null : (
          <View style={[styles.reply, { borderLeftColor: own ? colors.onPrimary : colors.primary }]}>
            <Text
              numberOfLines={1}
              style={[typography.caption, { color: own ? colors.onPrimary : colors.textMuted }]}
            >
              Replying to a message
            </Text>
          </View>
        )}

        <Text
          style={[
            typography.body,
            { color: own ? colors.onPrimary : deleted ? colors.textMuted : colors.text },
            deleted ? styles.deleted : undefined,
          ]}
        >
          {deleted ? 'Message deleted' : message.text}
        </Text>

        <View style={styles.metaRow}>
          <Text
            style={[
              styles.meta,
              { color: own ? 'rgba(255,255,255,0.78)' : colors.textMuted },
            ]}
          >
            {message.localStatus === 'sending'
              ? 'Sending…'
              : message.localStatus === 'failed'
                ? 'Not sent'
                : new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
          </Text>
          {receiptLabel ? (
            <View style={styles.receipt}>
              <AppIcon
                type="icon"
                name={receiptLabel === 'Seen' ? 'check-all' : 'check'}
                size={14}
                color={own ? colors.onPrimary : colors.textMuted}
              />
              <Text style={[styles.meta, { color: own ? colors.onPrimary : colors.textMuted }]}>
                {receiptLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
        </Animated.View>
      </View>

      {message.reactions.length === 0 ? null : (
        <View style={[styles.reactions, { gap: spacing.xs }]}>
          {message.reactions.map((reaction) => (
            <Pressable
              accessibilityRole="button"
              key={reaction.emoji}
              onPress={() => onToggleReaction(reaction.emoji, !reaction.reactedByMe)}
              style={[
                styles.reaction,
                {
                  backgroundColor: colors.surface,
                  borderColor: reaction.reactedByMe ? colors.primary : colors.border,
                  borderRadius: radii.pill,
                },
              ]}
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
          <Text style={[typography.caption, { color: colors.danger, padding: spacing.xs }]}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { maxWidth: '84%' },
  ownRow: { alignItems: 'flex-end', alignSelf: 'flex-end' },
  otherRow: { alignItems: 'flex-start', alignSelf: 'flex-start' },
  swipeWrap: { position: 'relative' },
  swipeHint: { alignItems: 'center', height: 38, justifyContent: 'center', position: 'absolute', right: 4, top: '50%', transform: [{ translateY: -19 }], width: 38 },
  bubble: { borderWidth: StyleSheet.hairlineWidth },
  ownBubble: { borderBottomRightRadius: 5 },
  otherBubble: { borderBottomLeftRadius: 5 },
  reply: { borderLeftWidth: 2, marginBottom: 4, paddingLeft: 7 },
  deleted: { fontStyle: 'italic' },
  metaRow: { alignItems: 'center', flexDirection: 'row', gap: 4, justifyContent: 'flex-end' },
  meta: { fontSize: 10 },
  receipt: { alignItems: 'center', flexDirection: 'row', gap: 2 },
  reactions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: -3 },
  reaction: { borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
});
