import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
  replyTo?: string;
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  title?: string;
}

export const ChatScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { chatId, userId } = route.params as { chatId: string; userId: string };
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const flatListRef = useRef<FlatList>(null);
  
  // Mock current user ID
  const currentUserId = 'current-user-id';
  
  // Mock chat user data
  const chatUser: ChatUser = {
    id: userId,
    name: 'Sarah Johnson',
    avatar: 'https://via.placeholder.com/40',
    isOnline: true,
    title: 'Senior Software Engineer at TechCorp',
  };

  // Mock messages data
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: userId,
        receiverId: currentUserId,
        content: 'Hi! I saw your profile and I think you might be a great fit for our team.',
        timestamp: new Date(Date.now() - 3600000),
        type: 'text',
        status: 'read',
      },
      {
        id: '2',
        senderId: currentUserId,
        receiverId: userId,
        content: 'Thank you for reaching out! I\'d love to learn more about the opportunity.',
        timestamp: new Date(Date.now() - 3500000),
        type: 'text',
        status: 'read',
      },
      {
        id: '3',
        senderId: userId,
        receiverId: currentUserId,
        content: 'Great! We\'re looking for a React Native developer with 3+ years of experience. Are you available for a quick call this week?',
        timestamp: new Date(Date.now() - 3400000),
        type: 'text',
        status: 'read',
      },
      {
        id: '4',
        senderId: currentUserId,
        receiverId: userId,
        content: 'Yes, I have 4 years of React Native experience. I\'m available Tuesday or Wednesday afternoon.',
        timestamp: new Date(Date.now() - 3300000),
        type: 'text',
        status: 'read',
      },
      {
        id: '5',
        senderId: userId,
        receiverId: currentUserId,
        content: 'Perfect! How about Wednesday at 2 PM? I\'ll send you a calendar invite.',
        timestamp: new Date(Date.now() - 300000),
        type: 'text',
        status: 'delivered',
      },
    ];
    
    setMessages(mockMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
  }, []);

  useEffect(() => {
    // Set navigation header
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerContainer}>
          <Image source={{ uri: chatUser.avatar }} style={styles.headerAvatar} />
          <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: theme.colors.text }]}>
              {chatUser.name}
            </Text>
            <Text style={[styles.headerStatus, { color: theme.colors.gray }]}>
              {chatUser.isOnline ? 'Online' : `Last seen ${formatTime(chatUser.lastSeen)}`}
            </Text>
          </View>
        </View>
      ),
    });
  }, [navigation, theme, chatUser]);

  const formatTime = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: currentUserId,
        receiverId: userId,
        content: newMessage.trim(),
        timestamp: new Date(),
        type: 'text',
        status: 'sent',
        replyTo: replyingTo?.id,
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setReplyingTo(null);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Simulate message delivery
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        ));
      }, 1000);
    }
  };

  const handleLongPress = (message: Message) => {
    if (message.senderId === currentUserId) {
      Alert.alert(
        'Message Options',
        'What would you like to do?',
        [
          { text: 'Reply', onPress: () => setReplyingTo(message) },
          { text: 'Delete', onPress: () => deleteMessage(message.id), style: 'destructive' },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert(
        'Message Options',
        'What would you like to do?',
        [
          { text: 'Reply', onPress: () => setReplyingTo(message) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  const getStatusColor = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return theme.colors.gray;
      case 'delivered':
        return theme.colors.gray;
      case 'read':
        return theme.colors.primary;
      default:
        return theme.colors.gray;
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCurrentUser = item.senderId === currentUserId;
    const showAvatar = !isCurrentUser && (index === 0 || messages[index - 1].senderId !== item.senderId);
    const showTimestamp = index === 0 || 
      (item.timestamp.getTime() - messages[index - 1].timestamp.getTime()) > 300000; // 5 minutes
    
    const replyMessage = item.replyTo ? messages.find(msg => msg.id === item.replyTo) : null;

    return (
      <View style={styles.messageContainer}>
        {showTimestamp && (
          <Text style={[styles.timestamp, { color: theme.colors.gray }]}>
            {formatMessageTime(item.timestamp)}
          </Text>
        )}
        
        <View style={[
          styles.messageRow,
          isCurrentUser ? styles.messageRowReverse : styles.messageRowNormal
        ]}>
          {showAvatar && !isCurrentUser && (
            <Image source={{ uri: chatUser.avatar }} style={styles.messageAvatar} />
          )}
          
          <TouchableOpacity
            style={[
              styles.messageBubble,
              {
                backgroundColor: isCurrentUser ? theme.colors.primary : theme.colors.card,
                marginLeft: !isCurrentUser && !showAvatar ? 48 : 0,
              }
            ]}
            onLongPress={() => handleLongPress(item)}
          >
            {replyMessage && (
              <View style={[styles.replyContainer, { borderLeftColor: theme.colors.gray }]}>
                <Text style={[styles.replyAuthor, { color: theme.colors.gray }]}>
                  {replyMessage.senderId === currentUserId ? 'You' : chatUser.name}
                </Text>
                <Text style={[styles.replyText, { color: theme.colors.gray }]} numberOfLines={1}>
                  {replyMessage.content}
                </Text>
              </View>
            )}
            
            <Text style={[
              styles.messageText,
              { color: isCurrentUser ? 'white' : theme.colors.text }
            ]}>
              {item.content}
            </Text>
            
            {isCurrentUser && (
              <Text style={[styles.messageStatus, { color: getStatusColor(item.status) }]}>
                {getStatusIcon(item.status)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      {isTyping && (
        <View style={[styles.typingIndicator, { backgroundColor: theme.colors.card }]}>
          <Image source={{ uri: chatUser.avatar }} style={styles.typingAvatar} />
          <View style={styles.typingDots}>
            <Text style={[styles.typingText, { color: theme.colors.gray }]}>
              {chatUser.name} is typing...
            </Text>
          </View>
        </View>
      )}
      
      {replyingTo && (
        <View style={[styles.replyPreview, { backgroundColor: theme.colors.card }]}>
          <View style={styles.replyPreviewContent}>
            <Text style={[styles.replyPreviewLabel, { color: theme.colors.primary }]}>
              Replying to {replyingTo.senderId === currentUserId ? 'yourself' : chatUser.name}
            </Text>
            <Text style={[styles.replyPreviewText, { color: theme.colors.text }]} numberOfLines={1}>
              {replyingTo.content}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.replyPreviewClose}
            onPress={() => setReplyingTo(null)}
          >
            <Text style={[styles.replyPreviewCloseText, { color: theme.colors.gray }]}>×</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.textInput, { color: theme.colors.text }]}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.gray}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: newMessage.trim() ? theme.colors.primary : theme.colors.gray,
            }
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: 12,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 8,
  },
  timestamp: {
    textAlign: 'center',
    fontSize: 12,
    marginVertical: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageRowNormal: {
    justifyContent: 'flex-start',
  },
  messageRowReverse: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    position: 'relative',
  },
  replyContainer: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 4,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '600',
  },
  replyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageStatus: {
    fontSize: 10,
    textAlign: 'right',
    marginTop: 2,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
  },
  typingAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  typingDots: {
    flex: 1,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: 14,
  },
  replyPreviewClose: {
    padding: 4,
  },
  replyPreviewCloseText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});