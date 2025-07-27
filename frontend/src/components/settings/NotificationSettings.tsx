import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { pushNotificationService, NotificationUtils } from '../../services/PushNotificationService';

interface NotificationSettingsProps {
  navigation?: any;
}

interface NotificationPreferences {
  jobAlerts: boolean;
  messageNotifications: boolean;
  applicationUpdates: boolean;
  interviewReminders: boolean;
  companyUpdates: boolean;
  systemNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [preferences, setPreferences] = React.useState<NotificationPreferences>({
    jobAlerts: true,
    messageNotifications: true,
    applicationUpdates: true,
    interviewReminders: true,
    companyUpdates: false,
    systemNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });

  const [pushToken, setPushToken] = React.useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = React.useState<string>('unknown');

  React.useEffect(() => {
    initializeNotifications();
    loadPreferences();
  }, []);

  const initializeNotifications = async () => {
    try {
      const status = await pushNotificationService.getPermissionStatus();
      setPermissionStatus(status);

      if (status === 'granted') {
        const token = await pushNotificationService.registerForPushNotifications();
        setPushToken(token);
      }
    } catch (error) {
      console.error('初始化通知失败:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      // 从AsyncStorage或API加载用户偏好设置
      // const savedPreferences = await AsyncStorage.getItem('notificationPreferences');
      // if (savedPreferences) {
      //   setPreferences(JSON.parse(savedPreferences));
      // }
    } catch (error) {
      console.error('加载通知偏好失败:', error);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      setPreferences(newPreferences);
      // await AsyncStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
      
      // 同步到服务器
      // await api.updateNotificationPreferences(newPreferences);
    } catch (error) {
      console.error('保存通知偏好失败:', error);
    }
  };

  const handleTogglePreference = (key: keyof NotificationPreferences) => {
    if (key === 'quietHours') return;
    
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    savePreferences(newPreferences);
  };

  const requestNotificationPermission = async () => {
    try {
      const token = await pushNotificationService.registerForPushNotifications();
      if (token) {
        setPushToken(token);
        setPermissionStatus('granted');
        Alert.alert('成功', '推送通知已启用');
      } else {
        Alert.alert('失败', '无法启用推送通知，请检查设备设置');
      }
    } catch (error) {
      Alert.alert('错误', '启用推送通知时发生错误');
    }
  };

  const testNotification = async () => {
    try {
      const notification = NotificationUtils.createSystemNotification(
        '测试通知',
        '这是一条测试通知，用于验证通知功能是否正常工作。'
      );
      
      await pushNotificationService.presentLocalNotification(notification);
      Alert.alert('成功', '测试通知已发送');
    } catch (error) {
      Alert.alert('错误', '发送测试通知失败');
    }
  };

  const clearAllNotifications = async () => {
    Alert.alert(
      '确认清除',
      '确定要清除所有通知吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await pushNotificationService.cancelAllNotifications();
              await pushNotificationService.clearBadge();
              Alert.alert('成功', '所有通知已清除');
            } catch (error) {
              Alert.alert('错误', '清除通知失败');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onToggle: () => void,
    icon?: string
  ) => (
    <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.settingContent}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={24}
            color={theme.colors.primary}
            style={styles.settingIcon}
          />
        )}
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
        thumbColor={value ? '#FFFFFF' : '#F4F3F4'}
      />
    </View>
  );

  const renderActionButton = (
    title: string,
    description: string,
    onPress: () => void,
    icon: string,
    color?: string
  ) => (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <Ionicons
        name={icon as any}
        size={24}
        color={color || theme.colors.primary}
        style={styles.actionIcon}
      />
      <View style={styles.actionText}>
        <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.actionDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 权限状态 */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          通知权限状态
        </Text>
        <View style={styles.permissionStatus}>
          <Ionicons
            name={permissionStatus === 'granted' ? 'checkmark-circle' : 'alert-circle'}
            size={24}
            color={permissionStatus === 'granted' ? '#4CAF50' : '#FF9800'}
          />
          <Text style={[styles.permissionText, { color: theme.colors.text }]}>
            {permissionStatus === 'granted' ? '已授权' : '未授权'}
          </Text>
          {permissionStatus !== 'granted' && (
            <TouchableOpacity
              style={styles.enableButton}
              onPress={requestNotificationPermission}
            >
              <Text style={styles.enableButtonText}>启用</Text>
            </TouchableOpacity>
          )}
        </View>
        {pushToken && (
          <Text style={[styles.tokenText, { color: theme.colors.textSecondary }]}>
            设备Token: {pushToken.substring(0, 20)}...
          </Text>
        )}
      </View>

      {/* 通知类型设置 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          通知类型
        </Text>
        
        {renderSettingItem(
          '职位提醒',
          '新的匹配职位和职位更新通知',
          preferences.jobAlerts,
          () => handleTogglePreference('jobAlerts'),
          'briefcase'
        )}

        {renderSettingItem(
          '消息通知',
          '新消息和聊天更新',
          preferences.messageNotifications,
          () => handleTogglePreference('messageNotifications'),
          'chatbubble'
        )}

        {renderSettingItem(
          '申请更新',
          '申请状态变化和面试邀请',
          preferences.applicationUpdates,
          () => handleTogglePreference('applicationUpdates'),
          'document-text'
        )}

        {renderSettingItem(
          '面试提醒',
          '面试时间提醒和相关通知',
          preferences.interviewReminders,
          () => handleTogglePreference('interviewReminders'),
          'calendar'
        )}

        {renderSettingItem(
          '公司动态',
          '关注公司的最新动态',
          preferences.companyUpdates,
          () => handleTogglePreference('companyUpdates'),
          'business'
        )}

        {renderSettingItem(
          '系统通知',
          '系统维护和重要公告',
          preferences.systemNotifications,
          () => handleTogglePreference('systemNotifications'),
          'settings'
        )}
      </View>

      {/* 通知方式 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          通知方式
        </Text>

        {renderSettingItem(
          '推送通知',
          '应用推送消息',
          preferences.pushNotifications,
          () => handleTogglePreference('pushNotifications'),
          'notifications'
        )}

        {renderSettingItem(
          '邮件通知',
          '重要通知的邮件提醒',
          preferences.emailNotifications,
          () => handleTogglePreference('emailNotifications'),
          'mail'
        )}

        {renderSettingItem(
          '短信通知',
          '紧急通知的短信提醒',
          preferences.smsNotifications,
          () => handleTogglePreference('smsNotifications'),
          'phone-portrait'
        )}
      </View>

      {/* 免打扰时间 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          免打扰时间
        </Text>
        
        {renderSettingItem(
          '启用免打扰',
          '在指定时间段内不接收通知',
          preferences.quietHours.enabled,
          () => {
            const newPreferences = {
              ...preferences,
              quietHours: {
                ...preferences.quietHours,
                enabled: !preferences.quietHours.enabled,
              },
            };
            savePreferences(newPreferences);
          },
          'moon'
        )}

        {preferences.quietHours.enabled && (
          <View style={[styles.timeRange, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.timeText, { color: theme.colors.text }]}>
              {preferences.quietHours.start} - {preferences.quietHours.end}
            </Text>
            <TouchableOpacity>
              <Text style={[styles.editText, { color: theme.colors.primary }]}>
                编辑
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 操作按钮 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          通知管理
        </Text>

        {renderActionButton(
          '测试通知',
          '发送一条测试通知',
          testNotification,
          'send',
          theme.colors.primary
        )}

        {renderActionButton(
          '清除所有通知',
          '清除所有待处理的通知',
          clearAllNotifications,
          'trash',
          '#F44336'
        )}

        {renderActionButton(
          '通知历史',
          '查看通知历史记录',
          () => navigation?.navigate('NotificationHistory'),
          'time',
          theme.colors.primary
        )}
      </View>

      {/* 统计信息 */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          通知统计
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              24
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              今日通知
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              156
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              本周通知
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              3
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              未读通知
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  permissionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  permissionText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  enableButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  tokenText: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  timeRange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
  },
  editText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
});

export default NotificationSettings;