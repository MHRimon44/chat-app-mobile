import { api } from '../store/api';
import type { Conversation, PageEnvelope, UserProfile } from './types';

export const chatApi = api.injectEndpoints({
  endpoints: (build) => ({
    listConversations: build.query<PageEnvelope<Conversation>, { cursor?: string; limit?: number }>(
      {
        query: ({ cursor, limit = 30 }) => ({
          params: { ...(cursor === undefined ? {} : { cursor }), limit },
          url: '/v1/conversations',
        }),
        providesTags: (result) => [
          { id: 'LIST', type: 'Conversation' },
          ...(result?.data.map((conversation) => ({
            id: conversation.id,
            type: 'Conversation' as const,
          })) ?? []),
        ],
      },
    ),
    searchUsers: build.query<
      PageEnvelope<UserProfile>,
      { cursor?: string; limit?: number; query: string }
    >({
      query: ({ cursor, limit = 30, query }) => ({
        params: { ...(cursor === undefined ? {} : { cursor }), limit, q: query },
        url: '/v1/users/search',
      }),
    }),
    getUser: build.query<UserProfile, string>({
      query: (userId) => `/v1/users/${userId}`,
      transformResponse: (response: { data: UserProfile }) => response.data,
      providesTags: (_result, _error, userId) => [{ id: userId, type: 'User' }],
    }),
    createDirectConversation: build.mutation<Conversation, string>({
      query: (otherUserId) => ({
        body: { otherUserId },
        method: 'POST',
        url: '/v1/conversations/direct',
      }),
      transformResponse: (response: { data: Conversation }) => response.data,
      invalidatesTags: [{ id: 'LIST', type: 'Conversation' }],
    }),
    hideConversation: build.mutation<void, string>({
      query: (conversationId) => ({
        method: 'POST',
        url: `/v1/conversations/${conversationId}/hide`,
      }),
      invalidatesTags: (_result, _error, conversationId) => [
        { id: conversationId, type: 'Conversation' },
        { id: 'LIST', type: 'Conversation' },
      ],
    }),
  }),
});

export const {
  useCreateDirectConversationMutation,
  useGetUserQuery,
  useHideConversationMutation,
  useLazyListConversationsQuery,
  useLazySearchUsersQuery,
} = chatApi;
