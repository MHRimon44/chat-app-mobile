import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Conversation } from '../../@types/chat';
import { Avatar } from '../../components/Avatar/Avatar';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { AppIcon } from '../../components/AppIcon/AppIcon';
import { Screen } from '../../components/Screen/Screen';
import { useToast } from '../../components/Toast/ToastProvider';
import {
  useLazyListHiddenConversationsQuery,
  useUnhideConversationMutation,
} from '../../services/api/chatApi';
import { useAppTheme } from '../../theme/ThemeProvider';
import { mergeUniqueById } from '../../utils/listHelpers';

export function HiddenChatsScreen(): React.JSX.Element {
  const { colors, radii, spacing, typography } = useAppTheme();
  const { showToast } = useToast();
  const [items, setItems] = useState<Conversation[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [loadHidden, request] = useLazyListHiddenConversationsQuery();
  const [unhide] = useUnhideConversationMutation();

  const loadInitial = useCallback(async (): Promise<void> => {
    setInitialLoading(true);
    try {
      const page = await loadHidden({}, false).unwrap();
      setItems([...page.data]);
      setCursor(page.page.nextCursor);
      setHasMore(page.page.hasMore);
    } catch {
      showToast({
        type: 'error',
        title: 'Could not load hidden chats',
        message: 'Please try again.',
      });
    } finally {
      setInitialLoading(false);
    }
  }, [loadHidden, showToast]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const loadMore = async (): Promise<void> => {
    if (!hasMore || cursor === null || request.isFetching) return;
    try {
      const page = await loadHidden({ cursor }, false).unwrap();
      setItems((current) => mergeUniqueById(current, page.data));
      setCursor(page.page.nextCursor);
      setHasMore(page.page.hasMore);
    } catch {
      // Keep the already loaded hidden chats visible.
    }
  };

  const restore = async (conversation: Conversation): Promise<void> => {
    if (restoringId !== null) return;
    setRestoringId(conversation.id);
    try {
      await unhide(conversation.id).unwrap();
      setItems((current) => current.filter((item) => item.id !== conversation.id));
      showToast({
        type: 'success',
        title: 'Chat restored',
        message: `${conversation.counterpart.displayName} is back in your chats.`,
      });
    } catch {
      showToast({ type: 'error', title: 'Could not restore chat', message: 'Please try again.' });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Screen
      padded={false}
      header={{ title: 'Hidden chats', showBack: true }}
      keyboardAvoiding={false}
    >
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: spacing.lg },
          items.length === 0 ? styles.empty : null,
        ]}
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.35}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.divider }]} />
        )}
        renderItem={({ item }) => (
          <View style={[styles.row, { paddingVertical: spacing.md }]}>
            <Avatar
              displayName={item.counterpart.displayName}
              imageUrl={item.counterpart.avatarUrl}
              userId={item.counterpart.id}
              size={50}
            />
            <View style={styles.copy}>
              <Text numberOfLines={1} style={[typography.bodyMedium, { color: colors.text }]}>
                {item.counterpart.displayName}
              </Text>
              <Text numberOfLines={1} style={[typography.caption, { color: colors.textMuted }]}>
                @{item.counterpart.username ?? 'user'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Restore chat with ${item.counterpart.displayName}`}
              disabled={restoringId !== null}
              onPress={() => void restore(item)}
              style={({ pressed }) => [
                styles.restore,
                {
                  backgroundColor: colors.primarySoft,
                  borderRadius: radii.pill,
                  opacity: pressed || restoringId !== null ? 0.6 : 1,
                },
              ]}
            >
              {restoringId === item.id ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <AppIcon type="icon" name="eye-outline" size={18} color={colors.primary} />
              )}
              <Text style={[typography.label, { color: colors.primary }]}>Restore</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          initialLoading ? (
            <ActivityIndicator accessibilityLabel="Loading hidden chats" color={colors.primary} />
          ) : (
            <EmptyState
              icon="eye-outline"
              title="No hidden chats"
              message="Chats you hide will appear here so you can restore them anytime."
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24, paddingTop: 8 },
  empty: { flexGrow: 1 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  copy: { flex: 1, minWidth: 0 },
  restore: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 12,
  },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 62 },
});
