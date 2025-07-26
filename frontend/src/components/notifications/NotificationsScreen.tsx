import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface Notification {
  id: string;
  type: 'job_application' | 'message' | 'job_match' | 'company_update' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
}

interface NotificationsScreenProps {
  navigation?: any;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    jobApplications: true,
    messages: true,
    jobMatches: true,
    companyUpdates: true,
    systemNotifications: true,
  });

  // Mock data - replace with actual API calls
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'job_application',
      title: 'Application Status Update',
      message: 'Your application for Senior Developer at TechCorp has been reviewed',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      actionUrl: '/applications/1',
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'You have a new message from Sarah Johnson',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      actionUrl: '/messages/chat/2',
    },
    {
      id: '3',
      type: 'job_match',
      title: 'New Job Match',
      message: '5 new jobs match your preferences',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: true,
      actionUrl: '/jobs/matches',
    },
    {
      id: '4',
      type: 'company_update',
      title: 'Company Update',
      message: 'TechCorp posted 3 new job openings',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      actionUrl: '/companies/techcorp',
    },
    {
      id: '5',
      type: 'system',
      title: 'Profile Completion',
      message: 'Complete your profile to get better job matches',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      read: false,
      actionUrl: '/profile/edit',
    },
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // Replace with actual API call
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      // API call to mark as read
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      // API call to mark all as read
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev =>
              prev.filter(notification => notification.id !== notificationId)
            );
            // API call to delete notification
          },
        },
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.actionUrl && navigation) {
      // Navigate to the appropriate screen based on actionUrl
      switch (notification.type) {
        case 'job_application':
          navigation.navigate('Applications');
          break;
        case 'message':
          navigation.navigate('Messages');
          break;
        case 'job_match':
          navigation.navigate('Jobs');
          break;
        case 'company_update':
          navigation.navigate('Companies');
          break;
        case 'system':
          navigation.navigate('Profile');
          break;
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_application':
        return '📋';
      case 'message':
        return '💬';
      case 'job_match':
        return '🎯';
      case 'company_update':
        return '🏢';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const filteredNotifications = showUnreadOnly
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: theme.colors.surface },
        !item.read && { backgroundColor: theme.colors.primary + '10' },
      ]}
      onPress={() => handleNotificationPress(item)}
      onLongPress={() => deleteNotification(item.id)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationIcon}>
            {getNotificationIcon(item.type)}
          </Text>
          <View style={styles.notificationInfo}>
            <Text
              style={[
                styles.notificationTitle,
                { color: theme.colors.text },
                !item.read && { fontWeight: 'bold' },
              ]}
            >
              {item.title}
            </Text>
            <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
          {!item.read && (
            <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
          )}
        </View>
        <Text
          style={[
            styles.notificationMessage,
            { color: theme.colors.textSecondary },
          ]}
          numberOfLines={2}
        >
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerTop}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={[styles.markAllRead, { color: theme.colors.primary }]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
          Show unread only
        </Text>
        <Switch
          value={showUnreadOnly}
          onValueChange={setShowUnreadOnly}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={theme.colors.surface}
        />
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={[styles.settingsSection, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.settingsTitle, { color: theme.colors.text }]}>
        Notification Settings
      </Text>
      
      {Object.entries(notificationSettings).map(([key, value]) => (
        <View key={key} style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </Text>
          <Switch
            value={value}
            onValueChange={(newValue) =>
              setNotificationSettings(prev => ({ ...prev, [key]: newValue }))
            }
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderSettings}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 16,
  },
  notificationItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 6,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 32,
  },
  settingsSection: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
  },
});