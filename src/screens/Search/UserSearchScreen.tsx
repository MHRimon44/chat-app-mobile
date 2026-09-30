import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import type { UserProfile } from '../../@types/chat';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Screen } from '../../components/Screen/Screen';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { UserRow } from '../../components/UserRow/UserRow';
import type { RootStackParamList } from '../../navigation/types';
import { useLazySearchUsersQuery } from '../../services/api/chatApi';
import { useAppTheme } from '../../theme/ThemeProvider';
import { mergeUniqueById } from '../../utils/listHelpers';

type Props = NativeStackScreenProps<RootStackParamList, 'UserSearch'>;

export function UserSearchScreen({ navigation }: Props): React.JSX.Element {
  const { colors, spacing, typography } = useAppTheme();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [items, setItems] = useState<UserProfile[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [search, request] = useLazySearchUsersQuery();

  const run = async (reset: boolean): Promise<void> => {
    const normalized = reset ? query.trim() : submitted;
    if (normalized.length < 2) return;
    try {
      const page = await search(
        { query: normalized, ...(reset || cursor === null ? {} : { cursor }) },
        false,
      ).unwrap();
      setSubmitted(normalized);
      setItems((current) => (reset ? [...page.data] : mergeUniqueById(current, page.data)));
      setCursor(page.page.nextCursor);
      setHasMore(page.page.hasMore);
    } catch {
      // RTK Query exposes the error state below.
    }
  };

  const clear = (): void => {
    setQuery('');
    setSubmitted('');
    setItems([]);
    setCursor(null);
    setHasMore(false);
  };

  return (
    <Screen padded={false} keyboardAvoiding={false}>
      <AppHeader title="Find people" showBack />

      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
        <SearchBar
          loading={request.isFetching}
          onChangeText={setQuery}
          onClear={clear}
          onSubmit={() => void run(true)}
          value={query}
        />
        {query.length > 0 && query.trim().length < 2 ? (
          <Text style={[typography.caption, { color: colors.textMuted, paddingTop: spacing.sm }]}>
            Enter at least two characters to search.
          </Text>
        ) : null}
      </View>

      <FlatList
        contentContainerStyle={[
          styles.list,
          { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
          items.length === 0 ? styles.emptyList : undefined,
        ]}
        data={items}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          if (hasMore && !request.isFetching) void run(false);
        }}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => (
          <UserRow
            onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
            user={item}
          />
        )}
        ListEmptyComponent={
          request.isFetching ? (
            <ActivityIndicator accessibilityLabel="Searching users" color={colors.primary} />
          ) : request.isError ? (
            <EmptyState
              icon="cloud-alert-outline"
              title="Search failed"
              message="Check your connection and try again."
              actionIcon="refresh"
              actionLabel="Try again"
              onPress={() => void run(true)}
            />
          ) : submitted.length > 0 ? (
            <EmptyState
              icon="account-search-outline"
              title="No people found"
              message={`No users matched “${submitted}”. Try another username.`}
            />
          ) : (
            <EmptyState
              icon="account-search-outline"
              title="Find someone on Alap"
              message="Search by username to view a profile and start a conversation."
            />
          )
        }
        ListFooterComponent={
          request.isFetching && items.length > 0 ? (
            <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.lg }} />
          ) : undefined
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 1 },
  emptyList: { justifyContent: 'center' },
});
