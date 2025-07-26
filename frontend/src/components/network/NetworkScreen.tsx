import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  title?: string;
  company?: string;
  industry?: string;
  location?: string;
  avatar?: string;
  connectionStatus: 'connected' | 'pending' | 'not_connected';
  mutualConnections: number;
  isOnline?: boolean;
  lastActive?: string;
}

interface NetworkScreenProps {
  navigation?: any;
}

export const NetworkScreen: React.FC<NetworkScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'connections' | 'suggestions' | 'requests'>('connections');
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Mock data
  const mockContacts: Contact[] = [
    {
      _id: '1',
      firstName: '张',
      lastName: '小明',
      title: '高级产品经理',
      company: '字节跳动',
      industry: '互联网',
      location: '北京',
      connectionStatus: 'connected',
      mutualConnections: 15,
      isOnline: true,
    },
    {
      _id: '2',
      firstName: '李',
      lastName: '小红',
      title: '前端工程师',
      company: '腾讯科技',
      industry: '互联网',
      location: '深圳',
      connectionStatus: 'pending',
      mutualConnections: 8,
      isOnline: false,
      lastActive: '2小时前',
    },
    {
      _id: '3',
      firstName: '王',
      lastName: '大华',
      title: 'UI设计师',
      company: '阿里巴巴',
      industry: '互联网',
      location: '杭州',
      connectionStatus: 'not_connected',
      mutualConnections: 3,
      isOnline: false,
      lastActive: '1天前',
    },
  ];

  React.useEffect(() => {
    setContacts(mockContacts);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setContacts(mockContacts);
      setRefreshing(false);
    }, 1000);
  };

  const handleConnect = (contactId: string) => {
    setContacts(prev => prev.map(contact => 
      contact._id === contactId 
        ? { ...contact, connectionStatus: 'pending' as const }
        : contact
    ));
    Alert.alert('连接请求已发送', '等待对方确认');
  };

  const handleAcceptRequest = (contactId: string) => {
    setContacts(prev => prev.map(contact => 
      contact._id === contactId 
        ? { ...contact, connectionStatus: 'connected' as const }
        : contact
    ));
    Alert.alert('已接受连接请求');
  };

  const handleMessage = (contact: Contact) => {
    navigation?.navigate('Chat', { 
      otherUser: contact 
    });
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchQuery === '' || 
      `${contact.firstName}${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = 
      (activeTab === 'connections' && contact.connectionStatus === 'connected') ||
      (activeTab === 'suggestions' && contact.connectionStatus === 'not_connected') ||
      (activeTab === 'requests' && contact.connectionStatus === 'pending');

    return matchesSearch && matchesTab;
  });

  const renderContactItem = ({ item }: { item: Contact }) => (
    <View style={[styles.contactItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.contactHeader}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.avatarText}>
            {item.firstName[0]}{item.lastName[0]}
          </Text>
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.contactInfo}>
          <Text style={[styles.contactName, { color: theme.colors.text }]}>
            {item.firstName}{item.lastName}
          </Text>
          <Text style={[styles.contactTitle, { color: theme.colors.gray }]}>
            {item.title} · {item.company}
          </Text>
          <Text style={[styles.contactLocation, { color: theme.colors.gray }]}>
            {item.location} · {item.industry}
          </Text>
          {item.mutualConnections > 0 && (
            <Text style={[styles.mutualConnections, { color: theme.colors.primary }]}>
              {item.mutualConnections}个共同联系人
            </Text>
          )}
          {!item.isOnline && item.lastActive && (
            <Text style={[styles.lastActive, { color: theme.colors.gray }]}>
              {item.lastActive}活跃
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actionButtons}>
        {item.connectionStatus === 'connected' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.messageButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleMessage(item)}
            >
              <Text style={styles.messageButtonText}>发消息</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.profileButton, { borderColor: theme.colors.primary }]}
              onPress={() => navigation?.navigate('Profile', { userId: item._id })}
            >
              <Text style={[styles.profileButtonText, { color: theme.colors.primary }]}>查看资料</Text>
            </TouchableOpacity>
          </>
        )}
        
        {item.connectionStatus === 'not_connected' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.connectButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => handleConnect(item._id)}
          >
            <Text style={styles.connectButtonText}>+ 连接</Text>
          </TouchableOpacity>
        )}
        
        {item.connectionStatus === 'pending' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton, { backgroundColor: theme.colors.success }]}
              onPress={() => handleAcceptRequest(item._id)}
            >
              <Text style={styles.acceptButtonText}>接受</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.declineButton, { backgroundColor: theme.colors.error }]}
            >
              <Text style={styles.declineButtonText}>拒绝</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderTabButton = (tab: typeof activeTab, title: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && { backgroundColor: theme.colors.primary },
        { borderColor: theme.colors.border }
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[
        styles.tabButtonText,
        { color: activeTab === tab ? '#FFFFFF' : theme.colors.gray }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 头部 */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>我的人脉</Text>
      </View>

      {/* 搜索框 */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
          placeholder="搜索联系人、公司或职位"
          placeholderTextColor={theme.colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 标签页 */}
      <View style={[styles.tabContainer, { backgroundColor: theme.colors.card }]}>
        {renderTabButton('connections', '我的联系人')}
        {renderTabButton('suggestions', '推荐联系人')}
        {renderTabButton('requests', '连接请求')}
      </View>

      {/* 联系人列表 */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.gray }]}>
              {activeTab === 'connections' && '暂无联系人'}
              {activeTab === 'suggestions' && '暂无推荐联系人'}
              {activeTab === 'requests' && '暂无连接请求'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  contactItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  contactLocation: {
    fontSize: 12,
    marginBottom: 4,
  },
  mutualConnections: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  lastActive: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  messageButton: {
    backgroundColor: '#007AFF',
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  connectButton: {
    backgroundColor: '#007AFF',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: '#F44336',
  },
  declineButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});