import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { useTheme } from '../../theme/ThemeProvider';
import {
  useGetConversationQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
} from '../../services/messagingApi';

interface ChatScreenProps {
  route: {
    params: {
      conversationId: string;
      otherUser: any;
    };
  };
  navigation?: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { conversationId, otherUser } = route.params;
  const { theme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const {
    data: conversation,
    isLoading,
    error,
    refetch
  } = useGetConversationQuery(conversationId);

  const [sendMessage] = useSendMessageMutation();
  const [markAsRead] = useMarkAsReadMutation();

  useEffect(() => {
    // Set navigation title
    navigation?.setOptions({
      title: otherUser?.firstName && otherUser?.lastName
        ? `${otherUser.firstName} ${otherUser.lastName}`
        : otherUser?.email || 'Chat'
    });

    // Mark messages as read when entering the chat
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [conversationId, otherUser, navigation, markAsRead]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;

    const message = messageText.trim();
    setMessageText('');
    setIsSending(true);

    try {
      await sendMessage({
        conversationId,
        content: message,
      }).unwrap();

      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message text on error
      setMessageText(message);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isMyMessage = item.sender._id === user?._id;
    const messages = conversation?.messages || [];
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = !previousMessage || 
      formatMessageDate(item.createdAt) !== formatMessageDate(previousMessage.createdAt);

    return (
      <View>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={[styles.dateText, { color: theme.colors.gray }]}>
              {formatMessageDate(item.createdAt)}
            </Text>
          </View>
        )}
        <View style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
        ]}>
          <View style={[
            styles.messageBubble,
            isMyMessage 
              ? [styles.myMessageBubble, { backgroundColor: theme.colors.primary }]
              : [styles.otherMessageBubble, { backgroundColor: theme.colors.card }]
          ]}>
            <Text style={[
              styles.messageText,
              { color: isMyMessage ? '#FFFFFF' : theme.colors.text }
            ]}>
              {item.content}
            </Text>
            <Text style={[
              styles.messageTime,
              { color: isMyMessage ? '#FFFFFF80' : theme.colors.gray }
            ]}>
              {formatMessageTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.gray }]}>
        No messages yet
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.colors.gray }]}>
        Start the conversation!
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.gray }]}>Loading conversation...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Failed to load conversation
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={conversation?.messages || []}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.messagesContainer,
          (!conversation?.messages || conversation.messages.length === 0) && styles.emptyMessagesContainer
        ]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={renderEmptyState}
      />

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
        <TextInput
          style={[
            styles.textInput,
            { 
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              borderColor: theme.colors.border
            }
          ]}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.gray}
          multiline
          maxLength={1000}
          editable={!isSending}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: messageText.trim() ? theme.colors.primary : theme.colors.gray },
            (!messageText.trim() || isSending) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageContainer: {
    marginVertical: 2,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  myMessageBubble: {
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});