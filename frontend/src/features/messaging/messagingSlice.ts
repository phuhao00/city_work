import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiSlice } from '../../services/api';

interface MessagingState {
  activeConversation: string | null;
  unreadCount: number;
}

export interface Message {
  _id: string;
  content: string;
  senderId: string;
  recipientId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: Message;
  unreadCount: number;
}

const initialState: MessagingState = {
  activeConversation: null,
  unreadCount: 0,
};

const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversation = action.payload;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = Math.max(0, state.unreadCount - action.payload);
    },
  },
});

export const {
  setActiveConversation,
  setUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount,
} = messagingSlice.actions;

export const messagingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendMessage: builder.mutation<Message, { recipientId: string; content: string }>({
      query: (messageData) => ({
        url: '/messaging/send',
        method: 'POST',
        body: messageData,
      }),
      invalidatesTags: ['Message'],
    }),
    getConversations: builder.query<Conversation[], void>({
      query: () => '/messaging/conversations',
      providesTags: ['Message'],
    }),
    getConversation: builder.query<Message[], string>({
      query: (userId) => `/messaging/conversation/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'Message', id: userId }],
    }),
    markAsRead: builder.mutation<void, string>({
      query: (messageId) => ({
        url: `/messaging/mark-read/${messageId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Message'],
    }),
    markConversationAsRead: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/messaging/mark-conversation-read/${userId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Message'],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetConversationsQuery,
  useGetConversationQuery,
  useMarkAsReadMutation,
  useMarkConversationAsReadMutation,
} = messagingApiSlice;

export default messagingSlice.reducer;