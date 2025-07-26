import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
  PanResponder,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface NotificationItem {
  id: string;
  type: 'job_match' | 'application_update' | 'message' | 'interview' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  data?: any;
}

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  jobMatches: boolean;
  applicationUpdates: boolean;
  messages: boolean;
  interviews: boolean;
  marketing: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const NotificationCenterScreen: React.FC = () => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    jobMatches: true,
    applicationUpdates: true,
    messages: true,
    interviews: true,
    marketing: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });
  const [selectedTab, setSelectedTab] = useState<'notifications' | 'settings'>('notifications');
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    // 模拟实时通知
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        addNewNotification();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      // 模拟 API 调用
      setTimeout(() => {
        setNotifications([
          {
            id: '1',
            type: 'job_match',
            title: '新的职位匹配',
            message: '发现 3 个与您技能匹配的前端开发职位',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            read: false,
            priority: 'high',
            actionUrl: '/jobs',
          },
          {
            id: '2',
            type: 'application_update',
            title: '申请状态更新',
            message: '您在 TechCorp 的申请已进入面试阶段',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            read: false,
            priority: 'high',
            actionUrl: '/applications',
          },
          {
            id: '3',
            type: 'message',
            title: '新消息',
            message: 'HR 张经理向您发送了一条消息',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
            read: true,
            priority: 'medium',
            actionUrl: '/messages',
          },
          {
            id: '4',
            type: 'interview',
            title: '面试提醒',
            message: '明天下午 2:00 与 StartupXYZ 的面试',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            read: true,
            priority: 'high',
            actionUrl: '/interviews',
          },
          {
            id: '5',
            type: 'system',
            title: '系统更新',
            message: 'City Work 应用已更新到 v2.1，新增 AI 面试助手功能',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
            read: true,
            priority: 'low',
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('加载通知失败:', error);
      Alert.alert('错误', '加载通知失败，请稍后重试');
      setLoading(false);
    }
  };

  const addNewNotification = () => {
    const newNotification: NotificationItem = {
      id: Date.now().toString(),
      type: 'job_match',
      title: '实时职位推荐',
      message: '发现新的职位机会，快来查看吧！',
      timestamp: new Date(),
      read: false,
      priority: 'medium',
      actionUrl: '/jobs',
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    Alert.alert(
      '清空通知',
      '确定要清空所有通知吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定', 
          style: 'destructive',
          onPress: () => setNotifications([])
        },
      ]
    );
  };

  const updateSettings = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'job_match':
        return 'briefcase';
      case 'application_update':
        return 'document-text';
      case 'message':
        return 'chatbubble';
      case 'interview':
        return 'calendar';
      case 'system':
        return 'settings';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: NotificationItem['type'], priority: NotificationItem['priority']) => {
    if (priority === 'high') return theme.error;
    
    switch (type) {
      case 'job_match':
        return theme.primary;
      case 'application_update':
        return theme.success;
      case 'message':
        return theme.info;
      case 'interview':
        return theme.warning;
      case 'system':
        return theme.textSecondary;
      default:
        return theme.primary;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return timestamp.toLocaleDateString('zh-CN');
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'important':
        return notification.priority === 'high';
      default:
        return true;
    }
  });

  const SwipeableNotification: React.FC<{ 
    notification: NotificationItem;
    onDelete: () => void;
    onRead: () => void;
  }> = ({ notification, onDelete, onRead }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    
    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100) {
          // 右滑标记为已读
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          onRead();
        } else if (gestureState.dx < -100) {
          // 左滑删除
          Animated.timing(translateX, {
            toValue: -400,
            duration: 300,
            useNativeDriver: true,
          }).start(() => onDelete());
        } else {
          // 回弹
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });

    return (
      <View style={styles.swipeContainer}>
        <View style={[styles.swipeActions, { backgroundColor: theme.success }]}>
          <Ionicons name="checkmark" size={24} color={theme.background} />
          <Text style={[styles.swipeActionText, { color: theme.background }]}>标记已读</Text>
        </View>
        <View style={[styles.swipeActions, styles.deleteAction, { backgroundColor: theme.error }]}>
          <Ionicons name="trash" size={24} color={theme.background} />
          <Text style={[styles.swipeActionText, { color: theme.background }]}>删除</Text>
        </View>
        
        <Animated.View
          style={[
            styles.notificationCard,
            { 
              backgroundColor: notification.read ? theme.surface : theme.background,
              transform: [{ translateX }],
              borderLeftColor: getNotificationColor(notification.type, notification.priority),
            }
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.notificationContent}
            onPress={() => {
              markAsRead(notification.id);
              // 这里可以导航到相应页面
              if (notification.actionUrl) {
                Alert.alert('导航', `将导航到: ${notification.actionUrl}`);
              }
            }}
          >
            <View style={styles.notificationHeader}>
              <View style={styles.notificationIcon}>
                <Ionicons
                  name={getNotificationIcon(notification.type)}
                  size={20}
                  color={getNotificationColor(notification.type, notification.priority)}
                />
              </View>
              <View style={styles.notificationInfo}>
                <Text style={[
                  styles.notificationTitle,
                  { 
                    color: theme.text,
                    fontWeight: notification.read ? 'normal' : 'bold'
                  }
                ]}>
                  {notification.title}
                </Text>
                <Text style={[styles.notificationTime, { color: theme.textSecondary }]}>
                  {formatTimestamp(notification.timestamp)}
                </Text>
              </View>
              {!notification.read && (
                <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
              )}
            </View>
            <Text style={[
              styles.notificationMessage,
              { 
                color: theme.textSecondary,
                fontWeight: notification.read ? 'normal' : '500'
              }
            ]}>
              {notification.message}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.notificationHeader}>
        <View style={styles.filterButtons}>
          {[
            { key: 'all', label: '全部' },
            { key: 'unread', label: '未读' },
            { key: 'important', label: '重要' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.filterButton,
                { backgroundColor: filter === item.key ? theme.primary : theme.surface }
              ]}
              onPress={() => setFilter(item.key as any)}
            >
              <Text style={[
                styles.filterButtonText,
                { color: filter === item.key ? theme.background : theme.text }
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
            onPress={markAllAsRead}
          >
            <Ionicons name="checkmark-done" size={16} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
            onPress={clearAllNotifications}
          >
            <Ionicons name="trash" size={16} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
              {filter === 'unread' ? '没有未读通知' : '暂无通知'}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notification) => (
            <SwipeableNotification
              key={notification.id}
              notification={notification}
              onDelete={() => deleteNotification(notification.id)}
              onRead={() => markAsRead(notification.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );

  const renderSettingsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>通知方式</Text>
      
      <View style={[styles.settingCard, { backgroundColor: theme.surface }]}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="phone-portrait" size={20} color={theme.primary} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>推送通知</Text>
          </View>
          <Switch
            value={settings.pushEnabled}
            onValueChange={(value) => updateSettings('pushEnabled', value)}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="mail" size={20} color={theme.info} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>邮件通知</Text>
          </View>
          <Switch
            value={settings.emailEnabled}
            onValueChange={(value) => updateSettings('emailEnabled', value)}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="chatbubble" size={20} color={theme.success} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>短信通知</Text>
          </View>
          <Switch
            value={settings.smsEnabled}
            onValueChange={(value) => updateSettings('smsEnabled', value)}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>通知类型</Text>
      
      <View style={[styles.settingCard, { backgroundColor: theme.surface }]}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="briefcase" size={20} color={theme.primary} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>职位匹配</Text>
          </View>
          <Switch
            value={settings.jobMatches}
            onValueChange={(value) => updateSettings('jobMatches', value)}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="document-text" size={20} color={theme.success} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>申请更新</Text>
          </View>
          <Switch
            value={settings.applicationUpdates}
            onValueChange={(value) => updateSettings('applicationUpdates', value)}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="chatbubbles" size={20} color={theme.info} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>消息通知</Text>
          </View>
          <Switch
            value={settings.messages}
            onValueChange={(value) => updateSettings('messages', value)}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="calendar" size={20} color={theme.warning} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>面试提醒</Text>
          </View>
          <Switch
            value={settings.interviews}
            onValueChange={(value) => updateSettings('interviews', value)}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="megaphone" size={20} color={theme.textSecondary} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>营销推广</Text>
          </View>
          <Switch
            value={settings.marketing}
            onValueChange={(value) => updateSettings('marketing', value)}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>免打扰时间</Text>
      
      <View style={[styles.settingCard, { backgroundColor: theme.surface }]}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={20} color={theme.primary} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>启用免打扰</Text>
          </View>
          <Switch
            value={settings.quietHours.enabled}
            onValueChange={(value) => 
              updateSettings('quietHours', { ...settings.quietHours, enabled: value })
            }
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        {settings.quietHours.enabled && (
          <>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="time" size={20} color={theme.textSecondary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>开始时间</Text>
              </View>
              <Text style={[styles.settingValue, { color: theme.primary }]}>
                {settings.quietHours.start}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="time" size={20} color={theme.textSecondary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>结束时间</Text>
              </View>
              <Text style={[styles.settingValue, { color: theme.primary }]}>
                {settings.quietHours.end}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>加载通知中...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>通知中心</Text>
        <View style={styles.headerActions}>
          {notifications.filter(n => !n.read).length > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: theme.error }]}>
              <Text style={[styles.unreadBadgeText, { color: theme.background }]}>
                {notifications.filter(n => !n.read).length}
              </Text>
            </View>
          )}
          <Ionicons name="notifications" size={24} color={theme.primary} />
        </View>
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'notifications' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setSelectedTab('notifications')}
        >
          <Text style={[
            styles.tabButtonText,
            { color: selectedTab === 'notifications' ? theme.background : theme.textSecondary }
          ]}>
            通知
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'settings' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setSelectedTab('settings')}
        >
          <Text style={[
            styles.tabButtonText,
            { color: selectedTab === 'settings' ? theme.background : theme.textSecondary }
          ]}>
            设置
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'notifications' && renderNotificationsTab()}
      {selectedTab === 'settings' && renderSettingsTab()}
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  notificationsList: {
    flex: 1,
  },
  swipeContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  swipeActions: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
  },
  deleteAction: {
    right: 0,
    left: 'auto',
  },
  swipeActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  notificationCard: {
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationContent: {
    padding: 15,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 52,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },
  settingCard: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationCenterScreen;