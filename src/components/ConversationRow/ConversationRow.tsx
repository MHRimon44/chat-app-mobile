import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useRef } from 'react';
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
  isOpen,
  onOpen,
  onClose,
}: {
  conversation: Conversation;
  onHide: () => void;
  onPress: () => void;
  latestMessage?: Message | undefined;
  actorId?: string | undefined;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}): React.JSX.Element {
  const { colors, radii, spacing, typography } = useAppTheme();
  const unread = conversation.unreadCount ?? 0;
  const muted = conversation.notificationsEnabled === false || Boolean(conversation.muteUntil);
  const translateX = useRef(new Animated.Value(0)).current;
  const actionWidth = 68;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: isOpen ? -actionWidth : 0,
      useNativeDriver: true,
    }).start();
  }, [isOpen, translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          gesture.dx < -8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          if (!isOpen) onOpen();
        },
        onPanResponderMove: (_event, gesture) => {
          const start = isOpen ? -actionWidth : 0;
          translateX.setValue(Math.max(-actionWidth, Math.min(0, start + gesture.dx)));
        },
        onPanResponderRelease: (_event, gesture) => {
          const shouldOpen = isOpen ? gesture.dx < 36 : gesture.dx < -36;
          if (shouldOpen) onOpen();
          else onClose();
        },
        onPanResponderTerminate: () => {
          if (isOpen) onOpen();
          else onClose();
        },
      }),
    [isOpen, onClose, onOpen, translateX],
  );

  const hideConversation = (): void => {
    onClose();
    onHide();
  };

  return (
    <View style={styles.swipeContainer}>
      <Pressable
        accessibilityLabel="Hide conversation"
        accessibilityRole="button"
        onPress={hideConversation}
        style={[
          styles.hideAction,
          {
            backgroundColor: colors.danger,
            borderRadius: radii.lg,
            width: actionWidth - 6,
          },
        ]}
      >
        <AppIcon type="icon" name="eye-off-outline" size={23} color={colors.onPrimary} />
      </Pressable>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.animatedRow,
          { backgroundColor: colors.background, transform: [{ translateX }] },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (isOpen) {
              onClose();
              return;
            }
            onPress();
          }}
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: { overflow: 'hidden', position: 'relative' },
  animatedRow: { zIndex: 1 },
  hideAction: {
    alignItems: 'center',
    bottom: 6,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 6,
  },
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
