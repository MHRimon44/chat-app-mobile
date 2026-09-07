import { api } from '../store/api';
import type { Message, MessagePage, ReactionChange, ReceiptChange } from './types';

export const messageApi = api.injectEndpoints({
  endpoints: (build) => ({
    messageHistory: build.query<
      MessagePage,
      { conversationId: string; before?: string; limit?: number }
    >({
      query: ({ conversationId, before, limit = 30 }) => ({
        params: { ...(before === undefined ? {} : { before }), limit },
        url: `/v1/conversations/${conversationId}/messages`,
      }),
    }),
    sendMessageRest: build.mutation<
      Message,
      { conversationId: string; clientMessageId: string; text: string; replyToMessageId?: string }
    >({
      query: ({ conversationId, ...body }) => ({
        body: { ...body, kind: 'text' },
        method: 'POST',
        url: `/v1/conversations/${conversationId}/messages`,
      }),
      transformResponse: (response: { data: Message }) => response.data,
    }),
    deleteMessageForMe: build.mutation<void, string>({
      query: (messageId) => ({ method: 'DELETE', url: `/v1/messages/${messageId}/me` }),
    }),
    deleteMessageForEveryone: build.mutation<Message, string>({
      query: (messageId) => ({ method: 'DELETE', url: `/v1/messages/${messageId}/everyone` }),
      transformResponse: (response: { data: Message }) => response.data,
    }),
    setMessageReaction: build.mutation<
      ReactionChange,
      { messageId: string; emoji: string; active: boolean }
    >({
      query: ({ messageId, emoji, active }) => ({
        method: active ? 'PUT' : 'DELETE',
        url: `/v1/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
      }),
      transformResponse: (response: { data: ReactionChange }) => response.data,
    }),
    advanceReceipt: build.mutation<
      ReceiptChange,
      { conversationId: string; messageId: string; type: 'delivered' | 'seen' }
    >({
      query: ({ conversationId, ...body }) => ({
        body,
        method: 'POST',
        url: `/v1/conversations/${conversationId}/receipts`,
      }),
      transformResponse: (response: { data: ReceiptChange }) => response.data,
    }),
  }),
});
export const {
  useAdvanceReceiptMutation,
  useDeleteMessageForEveryoneMutation,
  useDeleteMessageForMeMutation,
  useLazyMessageHistoryQuery,
  useSendMessageRestMutation,
  useSetMessageReactionMutation,
} = messageApi;
