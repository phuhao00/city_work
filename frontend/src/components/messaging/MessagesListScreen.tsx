import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';

interface ChatPreview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userTitle?: string;
  lastMessage: {
    content: string;
    timestamp: Date;
    senderId: string;
    type: 'text' | 'image' | 'file';
  };
  unreadCount: number;
  isOnline: boolean;
  isPinned: boolean;
  isMuted: boolean;
}

export const MessagesListScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatPreview[]>([]);
  
  // Mock current user ID
  const currentUserId = 'current-user-id';

  // Mock chats data
  useEffect(() => {
    const mockChats: ChatPreview[] = [
      {
        id: 'chat-1',
        userId: 'user-1',
        userName: 'Sarah Johnson',
        userAvatar: 'https://via.placeholder.com/50',
        userTitle: 'Senior Software Engineer at TechCorp',
        lastMessage: {
          content: 'Perfect! How about Wednesday at 2 PM? I\'ll send you a calendar invite.',
          timestamp: new Date(Date.now() - 300000),
          senderId: 'user-1',
          type: 'text',
        },
        unreadCount: 1,
        isOnline: true,
        isPinned: true,
        isMuted: false,
      },
      {
        id: 'chat-2',
        userId: 'user-2',
        userName: 'Michael Chen',
        userAvatar: 'https://via.placeholder.com/50',
        userTitle: 'Product Manager at StartupXYZ',
        lastMessage: {
          content: 'Thanks for your interest! We\'d love to schedule an interview.',
          timestamp: new Date(Date.now() - 3600000),
          senderId: 'user-2',
          type: 'text',
        },
        unreadCount: 0,
        isOnline: false,
        isPinned: false,
        isMuted: false,
      },
      {
        id: 'chat-3',
        userId: 'user-3',
        userName: 'Emily Rodriguez',
        userAvatar: 'https://via.placeholder.com/50',
        userTitle: 'HR Manager at BigCorp',
        lastMessage: {
          content: 'You: I\'m very interested in the position. When can we talk?',
          timestamp: new Date(Date.now() - 7200000),
          senderId: currentUserId,
          type: 'text',
        },
        unreadCount: 0,
        isOnline: true,
        isPinned: false,
        isMuted: false,
      },
      {
        id: 'chat-4',
        userId: 'user-4',
        userName: 'David Kim',
        userAvatar: 'https://via.placeholder.com/50',
        userTitle: 'Tech Lead at InnovateCo',
        lastMessage: {
          content: 'Great portfolio! Let\'s discuss the React Native role.',
          timestamp: new Date(Date.now() - 86400000),
          senderId: 'user-4',
          type: 'text',
        },
        unreadCount: 2,
        isOnline: false,
        isPinned: false,
        isMuted: true,
      },
      {
        id: 'chat-5',
        userId: 'user-5',
        userName: 'Lisa Wang',
        userAvatar: 'https://via.placeholder.com/50',
        userTitle: 'Recruiter at TalentHub',
        lastMessage: {
          content: 'I have several opportunities that might interest you.',
          timestamp: new Date(Date.now() - 172800000),
          senderId: 'user-5',
          type: 'text',
        },
        unreadCount: 0,
        isOnline: false,
        isPinned: false,
        isMuted: false,
      },
    ];
    
    setChats(mockChats);
    setFilteredChats(mockChats);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = chats.filter(chat =>
        chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.userTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chats);
    }
  }, [searchQuery, chats]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
    return date.toLocaleDateString();
  };

  const handleChatPress = (chat: ChatPreview) => {
    // Mark as read
    if (chat.unreadCount > 0) {
      setChats(prev => prev.map(c => 
        c.id === chat.id ? { ...c, unreadCount: 0 } : c
      ));
    }
    
    navigation.navigate('Chat' as never, { 
      chatId: chat.id, 
      userId: chat.userId 
    } as never);
  };

  const handleChatLongPress = (chat: ChatPreview) => {
    const options = [
      { text: chat.isPinned ? 'Unpin' : 'Pin', onPress: () => togglePin(chat.id) },
      { text: chat.isMuted ? 'Unmute' : 'Mute', onPress: () => toggleMute(chat.id) },
      { text: 'Mark as Read', onPress: () => markAsRead(chat.id) },
      { text: 'Delete', onPress: () => deleteChat(chat.id), style: 'destructive' as const },
      { text: 'Cancel', style: 'cancel' as const },
    ];

    Alert.alert('Chat Options', 'What would you like to do?', options);
  };

  const togglePin = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
    ));
  };

  const toggleMute = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isMuted: !chat.isMuted } : chat
    ));
  };

  const markAsRead = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    ));
  };

  const deleteChat = (chatId: string) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setChats(prev => prev.filter(chat => chat.id !== chatId));
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getTotalUnreadCount = () => {
    return chats.reduce((total, chat) => total + chat.unreadCount, 0);
  };

  const sortedChats = [...filteredChats].sort((a, b) => {
    // Pinned chats first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then by last message timestamp
    return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
  });

  const renderChatItem = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity
      style={[styles.chatItem, { backgroundColor: theme.colors.card }]}
      onPress={() => handleChatPress(item)}
      onLongPress={() => handleChatLongPress(item)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
        {item.isOnline && <View style={[styles.onlineIndicator, { backgroundColor: '#4CAF50' }]} />}
        {item.isPinned && (
          <View style={[styles.pinIndicator, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.pinIcon}>📌</Text>
          </View>
        )}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={[styles.userName, { color: theme.colors.text }]} numberOfLines={1}>
            {item.userName}
          </Text>
          <View style={styles.chatMeta}>
            {item.isMuted && (
              <Text style={[styles.muteIcon, { color: theme.colors.gray }]}>🔇</Text>
            )}
            <Text style={[styles.timestamp, { color: theme.colors.gray }]}>
              {formatTime(item.lastMessage.timestamp)}
            </Text>
          </View>
        </View>
        
        {item.userTitle && (
          <Text style={[styles.userTitle, { color: theme.colors.gray }]} numberOfLines={1}>
            {item.userTitle}
          </Text>
        )}
        
        <View style={styles.messagePreview}>
          <Text 
            style={[
              styles.lastMessage, 
              { 
                color: item.unreadCount > 0 ? theme.colors.text : theme.colors.gray,
                fontWeight: item.unreadCount > 0 ? '600' : '400',
              }
            ]} 
            numberOfLines={1}
          >
            {item.lastMessage.content}
          </Text>
          
          {item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Messages
        </Text>
        {getTotalUnreadCount() > 0 && (
          <View style={[styles.totalUnreadBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.totalUnreadText}>
              {getTotalUnreadCount()}
            </Text>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search conversations..."
          placeholderTextColor={theme.colors.gray}
        />
      </View>

      {/* Chat List */}
      <FlatList
        data={sortedChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.colors.gray + '20' }]} />
        )}
      />

      {sortedChats.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.gray }]}>
            {searchQuery 
              ? 'Try searching with different keywords'
              : 'Start networking and your conversations will appear here'
            }
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  totalUnreadBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  totalUnreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchInput: {
    fontSize: 16,
    paddingVertical: 12,
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingHorizontal: 20,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  pinIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinIcon: {
    fontSize: 10,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  chatMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muteIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  userTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    marginLeft: 78,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});