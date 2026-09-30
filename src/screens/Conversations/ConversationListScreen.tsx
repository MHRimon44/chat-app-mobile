import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Conversation } from '../../@types/chat';
import type { Message, PresenceChange } from '../../@types/message';
import { AppBrand } from '../../components/AppBrand/AppBrand';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { FilterChip } from '../../components/FilterChip/FilterChip';
import { IconButton } from '../../components/IconButton/IconButton';
import { AppIcon } from '../../components/AppIcon/AppIcon';
import { ConversationRow } from '../../components/ConversationRow/ConversationRow';
import { Screen } from '../../components/Screen/Screen';
import type { RootStackParamList } from '../../navigation/types';
import {
  useHideConversationMutation,
  useLazyListConversationsQuery,
} from '../../services/api/chatApi';
import { useLazyMessageHistoryQuery } from '../../services/api/messageApi';
import { socketManager } from '../../services/realtime/socketManager';
import { useAppSelector } from '../../store/hooks';
import { useAppTheme } from '../../theme/ThemeProvider';
import { mergeUniqueById } from '../../utils/listHelpers';

type Props = NativeStackScreenProps<RootStackParamList, 'ConversationList'>;
type Filter = 'all' | 'unread';

export function ConversationListScreen({ navigation }: Props): React.JSX.Element {
  const { colors, spacing, radii, typography, shadows } = useAppTheme();
  const user = useAppSelector((state) => state.session.user);
  const [items, setItems] = useState<Conversation[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [presenceByUser, setPresenceByUser] = useState<Record<string, PresenceChange>>({});
  const [, setClockTick] = useState(0);
  const [latestMessages, setLatestMessages] = useState<Record<string, Message>>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [openConversationId, setOpenConversationId] = useState<string | null>(null);
  const [load, request] = useLazyListConversationsQuery();
  const [loadLatestMessage] = useLazyMessageHistoryQuery();
  const [hide] = useHideConversationMutation();

  const closeSwipeAction = useCallback((): void => {
    setOpenConversationId(null);
  }, []);

  const visibleItems = useMemo(
    () => (filter === 'unread' ? items.filter((item) => item.unreadCount > 0) : items),
    [filter, items],
  );
  const unreadTotal = useMemo(
    () => items.reduce((total, item) => total + (item.unreadCount ?? 0), 0),
    [items],
  );

  const hydrateLatestMessages = useCallback(
    async (conversations: readonly Conversation[]): Promise<void> => {
      const entries = await Promise.all(
        conversations.map(async (conversation): Promise<readonly [string, Message] | null> => {
          try {
            const page = await loadLatestMessage(
              { conversationId: conversation.id, limit: 1 },
              false,
            ).unwrap();
            const latest = [...page.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
            return latest === undefined ? null : ([conversation.id, latest] as const);
          } catch {
            return null;
          }
        }),
      );

      setLatestMessages((current) => {
        const next = { ...current };
        for (const entry of entries) if (entry !== null) next[entry[0]] = entry[1];
        return next;
      });
    },
    [loadLatestMessage],
  );

  const refreshConversations = useCallback(async (): Promise<void> => {
    try {
      const page = await load({}, false).unwrap();
      setItems([...page.data]);
      setCursor(page.page.nextCursor);
      setHasMore(page.page.hasMore);
      void hydrateLatestMessages(page.data);
    } catch {
      // Keep the current list visible if a silent refresh fails.
    } finally {
      setInitialLoading(false);
    }
  }, [hydrateLatestMessages, load]);

  const pullToRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      await refreshConversations();
    } finally {
      setRefreshing(false);
    }
  }, [refreshConversations]);

  const loadMore = async (): Promise<void> => {
    if (cursor === null || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await load({ cursor }, false).unwrap();
      setItems((current) => mergeUniqueById(current, page.data));
      setCursor(page.page.nextCursor);
      setHasMore(page.page.hasMore);
      void hydrateLatestMessages(page.data);
    } catch {
      // Keep the current list visible if pagination fails.
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    void refreshConversations();
    return navigation.addListener('focus', () => {
      void refreshConversations();
    });
  }, [navigation, refreshConversations]);

  useEffect(
    () =>
      socketManager.on<Message>('message:created', (message) => {
        setLatestMessages((current) => ({ ...current, [message.conversationId]: message }));
        setItems((current) => {
          const updated = current.map((conversation) =>
            conversation.id === message.conversationId
              ? {
                  ...conversation,
                  activityAt: message.createdAt,
                  unreadCount:
                    message.senderId === user?.id
                      ? conversation.unreadCount
                      : conversation.unreadCount + 1,
                }
              : conversation,
          );
          return [...updated].sort((a, b) => b.activityAt.localeCompare(a.activityAt));
        });
      }),
    [user?.id],
  );

  useEffect(() => {
    const refreshPresence = (): void => {
      if (socketManager.connectionStatus() !== 'connected') return;
      for (const conversation of items) {
        const userId = conversation.counterpart.id;
        void socketManager.emitWithAck<PresenceChange>('presence:get', { userId })
          .then((presence) => setPresenceByUser((current) => ({ ...current, [userId]: presence })))
          .catch(() => undefined);
      }
    };
    const stopStatus = socketManager.onStatus((status) => {
      if (status === 'connected') refreshPresence();
      else setPresenceByUser({});
    });
    const stopEvents = socketManager.on<PresenceChange>('presence:changed', (presence) => {
      setPresenceByUser((current) => ({ ...current, [presence.userId]: presence }));
    });
    return () => { stopStatus(); stopEvents(); };
  }, [items]);

  useEffect(() => {
    const timer = setInterval(() => setClockTick((value) => value + 1), 30_000);
    return () => clearInterval(timer);
  }, []);

  const hideConversation = (conversation: Conversation): void => {
    closeSwipeAction();
    void hide(conversation.id)
      .unwrap()
      .then(() =>
        setItems((current) => current.filter((item) => item.id !== conversation.id)),
      )
      .catch(() => undefined);
  };

  const openConversation = (item: Conversation): void => {
    closeSwipeAction();
    setItems((current) =>
      current.map((conversation) =>
        conversation.id === item.id ? { ...conversation, unreadCount: 0 } : conversation,
      ),
    );
    navigation.navigate('Chat', {
      conversationId: item.id,
      counterpartId: item.counterpart.id,
      title: item.counterpart.displayName,
    });
  };

  return (
    <Screen padded={false} keyboardAvoiding={false}>
      <View
        onTouchStart={closeSwipeAction}
        style={[styles.header, { paddingHorizontal: spacing.xl, paddingTop: spacing.sm }]}
      >
        <AppBrand size={32} />

        <View style={styles.headerActions}>
          <IconButton
            accessibilityLabel="Search people"
            icon="magnify"
            onPress={() => {
              closeSwipeAction();
              navigation.navigate('UserSearch');
            }}
          />
          <IconButton
            accessibilityLabel="Settings"
            icon="cog-outline"
            onPress={() => {
              closeSwipeAction();
              navigation.navigate('Settings');
            }}
          />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          closeSwipeAction();
          navigation.navigate('UserSearch');
        }}
        style={[
          styles.search,
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: radii.pill,
            marginHorizontal: spacing.xl,
            marginTop: spacing.lg,
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        <AppIcon type="icon" name="magnify" size={21} color={colors.textMuted} />
        <Text style={[typography.label, { color: colors.textMuted }]}>Search conversations</Text>
      </Pressable>

      <View
        onTouchStart={closeSwipeAction}
        style={[
          styles.filters,
          { gap: spacing.sm, paddingHorizontal: spacing.xl, marginTop: spacing.lg },
        ]}
      >
        <FilterChip
          label="All"
          selected={filter === 'all'}
          onPress={() => {
            closeSwipeAction();
            setFilter('all');
          }}
        />
        <FilterChip
          label={unreadTotal > 0 ? `Unread ${unreadTotal > 99 ? '99+' : unreadTotal}` : 'Unread'}
          selected={filter === 'unread'}
          onPress={() => {
            closeSwipeAction();
            setFilter('unread');
          }}
        />
      </View>

      <FlatList
        contentContainerStyle={[
          styles.listContent,
          { paddingHorizontal: spacing.xl, paddingBottom: 96 },
          visibleItems.length === 0 ? styles.emptyList : null,
        ]}
        data={visibleItems}
        keyExtractor={(item) => item.id}
        onScrollBeginDrag={closeSwipeAction}
        onTouchStart={() => {
          if (openConversationId !== null) closeSwipeAction();
        }}
        onEndReached={() => {
          if (hasMore && !loadingMore) void loadMore();
        }}
        onEndReachedThreshold={0.4}
        onRefresh={() => {
          closeSwipeAction();
          void pullToRefresh();
        }}
        refreshing={refreshing}
        renderItem={({ item }) => (
          <ConversationRow
            conversation={item}
            latestMessage={latestMessages[item.id]}
            actorId={user?.id}
            presence={presenceByUser[item.counterpart.id]}
            isOpen={openConversationId === item.id}
            onOpen={() => setOpenConversationId(item.id)}
            onClose={closeSwipeAction}
            onHide={() => hideConversation(item)}
            onPress={() => openConversation(item)}
          />
        )}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.divider }]} />
        )}
        ListEmptyComponent={
          initialLoading && items.length === 0 ? (
            <ActivityIndicator accessibilityLabel="Loading conversations" color={colors.primary} />
          ) : request.isError ? (
            <EmptyState
              icon="cloud-alert-outline"
              title="Couldn't load chats"
              message="Check your connection and try again."
              actionIcon="refresh"
              actionLabel="Try again"
              onPress={() => void refreshConversations()}
            />
          ) : filter === 'unread' && items.length > 0 ? (
            <EmptyState
              icon="check-all"
              title="You're all caught up"
              message="No unread conversations right now."
            />
          ) : (
            <EmptyState
              icon="message-text-outline"
              title="Start your first conversation"
              message="Find someone by username and say hello."
              actionIcon="account-search-outline"
              actionLabel="Find people"
              onPress={() => navigation.navigate('UserSearch')}
            />
          )
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} /> : undefined}
      />

      <Pressable
        accessibilityLabel="New conversation"
        accessibilityRole="button"
        onPress={() => {
          closeSwipeAction();
          navigation.navigate('UserSearch');
        }}
        style={({ pressed }) => [
          styles.fab,
          shadows.md,
          {
            backgroundColor: pressed ? colors.primaryPressed : colors.primary,
            borderRadius: radii.pill,
          },
        ]}
      >
        <AppIcon type="icon" name="message-plus-outline" size={26} color={colors.onPrimary} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  search: { alignItems: 'center', flexDirection: 'row', gap: 10, height: 46 },
  filters: { flexDirection: 'row' },
  listContent: { paddingTop: 10 },
  emptyList: { flexGrow: 1 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 70 },
  fab: {
    alignItems: 'center',
    bottom: 22,
    height: 58,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    width: 58,
  },
});
