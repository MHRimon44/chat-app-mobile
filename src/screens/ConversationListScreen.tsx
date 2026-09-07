import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLogoutMutation } from '../auth/authApi';
import { clearSession } from '../auth/refreshCoordinator';
import { useHideConversationMutation, useLazyListConversationsQuery } from '../chat/chatApi';
import { mergeUniqueById } from '../chat/listHelpers';
import type { Conversation } from '../chat/types';
import { ConversationRow } from '../components/ConversationRow';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';
import { useAppDispatch } from '../store/hooks';

type Props = NativeStackScreenProps<RootStackParamList, 'ConversationList'>;
export function ConversationListScreen({ navigation }: Props): React.JSX.Element {
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();
  const [items, setItems] = useState<Conversation[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [load, request] = useLazyListConversationsQuery();
  const [hide] = useHideConversationMutation();
  const loadPage = async (reset: boolean): Promise<void> => {
    try {
      const page = await load(
        reset ? {} : { ...(cursor === null ? {} : { cursor }) },
        false,
      ).unwrap();
      setItems((current) => (reset ? [...page.data] : mergeUniqueById(current, page.data)));
      setCursor(page.page.nextCursor);
      setHasMore(page.page.hasMore);
    } catch {
      // RTK Query exposes the safe error state to the rendered retry UI.
    }
  };
  useEffect(() => {
    void loadPage(true);
  }, []);
  const confirmHide = (conversation: Conversation): void => {
    Alert.alert(
      'Hide conversation?',
      `This removes ${conversation.counterpart.displayName} from your chat list. A new message will restore it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hide',
          style: 'destructive',
          onPress: () => {
            void hide(conversation.id)
              .unwrap()
              .then(() =>
                setItems((current) => current.filter((item) => item.id !== conversation.id)),
              )
              .catch(() => undefined);
          },
        },
      ],
    );
  };
  const signOut = async (): Promise<void> => {
    try {
      await logout().unwrap();
    } catch {
      // Local credential cleanup remains mandatory when transport fails.
    } finally {
      await clearSession(dispatch);
    }
  };
  return (
    <Screen>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          Chats
        </Text>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.action}>Profile</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('UserSearch')}>
            <Text style={styles.action}>New chat</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void signOut();
            }}
          >
            <Text style={styles.action}>Log out</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        contentContainerStyle={items.length === 0 ? styles.emptyList : undefined}
        data={items}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          if (hasMore && !request.isFetching) void loadPage(false);
        }}
        onEndReachedThreshold={0.4}
        onRefresh={() => {
          void loadPage(true);
        }}
        refreshing={request.isFetching && items.length > 0}
        renderItem={({ item }) => (
          <ConversationRow
            conversation={item}
            onHide={() => confirmHide(item)}
            onPress={() =>
              navigation.navigate('Chat', {
                conversationId: item.id,
                counterpartId: item.counterpart.id,
                title: item.counterpart.displayName,
              })
            }
          />
        )}
        ListEmptyComponent={
          request.isFetching ? (
            <ActivityIndicator accessibilityLabel="Loading conversations" />
          ) : request.isError ? (
            <View style={styles.center}>
              <Text style={styles.error}>Could not load your chats.</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void loadPage(true);
                }}
              >
                <Text style={styles.action}>Try again</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptyCopy}>Find someone by username to start chatting.</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('UserSearch')}
              >
                <Text style={styles.action}>Find people</Text>
              </Pressable>
            </View>
          )
        }
        ListFooterComponent={
          request.isFetching && items.length > 0 ? <ActivityIndicator /> : undefined
        }
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  actions: { flexDirection: 'row' },
  title: { ...typography.heading, color: colors.text },
  action: { color: colors.primary, fontWeight: '700', padding: spacing.sm },
  emptyList: { flexGrow: 1 },
  center: { alignItems: 'center', flex: 1, gap: spacing.sm, justifyContent: 'center' },
  emptyTitle: { ...typography.body, color: colors.text, fontWeight: '700' },
  emptyCopy: { color: colors.textMuted, textAlign: 'center' },
  error: { color: colors.danger },
});
