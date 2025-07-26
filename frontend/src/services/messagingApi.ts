import { apiSlice } from './api';
import { mockConversations, mockMessages } from './mockData';

// Messaging API endpoints
export const messagingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user conversations
    getConversations: builder.query<any[], void>({
      queryFn: async () => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/messaging/conversations', {
            headers: {
              'Authorization': 'Bearer mock_token',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for conversations');
          // Fallback to mock data
          return { data: mockConversations };
        }
      },
      providesTags: ['Message'],
    }),

    // Get conversation with specific user
    getConversation: builder.query<any, string>({
      queryFn: async (userId) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/messaging/conversations/${userId}`, {
            headers: {
              'Authorization': 'Bearer mock_token',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for conversation');
          // Fallback to mock data
          const conversation = mockConversations.find(c => 
            c.participants.some(p => p._id === userId)
          ) || mockConversations[0];
          
          const messages = mockMessages.filter(m => 
            (m.sender === userId || m.receiver === userId)
          );
          
          return { 
            data: {
              ...conversation,
              messages: messages.sort((a, b) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              ),
            }
          };
        }
      },
      providesTags: (result, error, userId) => [{ type: 'Message', id: userId }],
    }),

    // Send message
    sendMessage: builder.mutation<
      any,
      {
        receiverId: string;
        content: string;
        type?: 'text' | 'image' | 'file';
      }
    >({
      queryFn: async (messageData) => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/messaging/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock_token',
            },
            body: JSON.stringify(messageData),
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for send message');
          // Fallback to mock data
          const newMessage = {
            _id: Date.now().toString(),
            content: messageData.content,
            sender: '1', // Current user ID
            receiver: messageData.receiverId,
            timestamp: new Date().toISOString(),
            read: false,
            type: messageData.type || 'text',
          };
          return { data: newMessage };
        }
      },
      invalidatesTags: ['Message'],
    }),

    // Mark message as read
    markAsRead: builder.mutation<any, string>({
      queryFn: async (messageId) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/messaging/${messageId}/read`, {
            method: 'PATCH',
            headers: {
              'Authorization': 'Bearer mock_token',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for mark as read');
          // Fallback to mock data
          return { data: { success: true } };
        }
      },
      invalidatesTags: ['Message'],
    }),

    // Get unread message count
    getUnreadCount: builder.query<{ count: number }, void>({
      queryFn: async () => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/messaging/unread-count', {
            headers: {
              'Authorization': 'Bearer mock_token',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for unread count');
          // Fallback to mock data
          const unreadCount = mockMessages.filter(m => !m.read && m.receiver === '1').length;
          return { data: { count: unreadCount } };
        }
      },
      providesTags: ['Message'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useGetUnreadCountQuery,
} = messagingApi;