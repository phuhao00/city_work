import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 通知类型定义
export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  categoryId?: string;
  sound?: string;
  badge?: number;
  priority?: 'default' | 'high' | 'max';
  vibrate?: boolean;
  lights?: boolean;
}

// 通知类别定义
export interface NotificationCategory {
  identifier: string;
  actions: NotificationAction[];
  options?: {
    customDismissAction?: boolean;
    allowInCarPlay?: boolean;
    showTitle?: boolean;
    showSubtitle?: boolean;
  };
}

export interface NotificationAction {
  identifier: string;
  buttonTitle: string;
  options?: {
    isDestructive?: boolean;
    isAuthenticationRequired?: boolean;
    opensAppToForeground?: boolean;
  };
}

// 推送通知服务类
class PushNotificationService {
  private static instance: PushNotificationService;
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  private constructor() {
    this.initializeNotifications();
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // 初始化通知系统
  private async initializeNotifications() {
    // 设置通知处理器
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // 注册通知类别
    await this.registerNotificationCategories();

    // 设置通知监听器
    this.setupNotificationListeners();
  }

  // 注册推送通知
  public async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('推送通知只能在真实设备上工作');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('推送通知权限被拒绝');
      return null;
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      
      // 保存token到本地存储
      await AsyncStorage.setItem('expoPushToken', token);
      
      console.log('推送通知token:', token);
      return token;
    } catch (error) {
      console.error('获取推送通知token失败:', error);
      return null;
    }
  }

  // 获取当前推送token
  public getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // 发送本地通知
  public async scheduleLocalNotification(notification: NotificationData, trigger?: any): Promise<string> {
    const notificationRequest = {
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: notification.sound || 'default',
        badge: notification.badge,
        categoryIdentifier: notification.categoryId,
        priority: this.mapPriority(notification.priority),
      },
      trigger: trigger || null,
    };

    const identifier = await Notifications.scheduleNotificationAsync(notificationRequest);
    return identifier;
  }

  // 发送即时本地通知
  public async presentLocalNotification(notification: NotificationData): Promise<string> {
    return this.scheduleLocalNotification(notification);
  }

  // 取消通知
  public async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  // 取消所有通知
  public async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // 获取所有待处理的通知
  public async getPendingNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // 清除通知徽章
  public async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  // 设置徽章数量
  public async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  // 获取通知权限状态
  public async getPermissionStatus(): Promise<string> {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  // 注册通知类别
  private async registerNotificationCategories(): Promise<void> {
    const categories: NotificationCategory[] = [
      {
        identifier: 'job_application',
        actions: [
          {
            identifier: 'view_job',
            buttonTitle: '查看职位',
            options: { opensAppToForeground: true },
          },
          {
            identifier: 'dismiss',
            buttonTitle: '忽略',
            options: { isDestructive: false },
          },
        ],
      },
      {
        identifier: 'message',
        actions: [
          {
            identifier: 'reply',
            buttonTitle: '回复',
            options: { opensAppToForeground: true },
          },
          {
            identifier: 'mark_read',
            buttonTitle: '标记已读',
            options: { opensAppToForeground: false },
          },
        ],
      },
      {
        identifier: 'interview',
        actions: [
          {
            identifier: 'confirm',
            buttonTitle: '确认参加',
            options: { opensAppToForeground: true },
          },
          {
            identifier: 'reschedule',
            buttonTitle: '重新安排',
            options: { opensAppToForeground: true },
          },
        ],
      },
    ];

    await Notifications.setNotificationCategoryAsync(
      categories[0].identifier,
      categories[0].actions,
      categories[0].options
    );
  }

  // 设置通知监听器
  private setupNotificationListeners(): void {
    // 监听收到的通知
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('收到通知:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // 监听通知响应
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('通知响应:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  // 处理收到的通知
  private handleNotificationReceived(notification: Notifications.Notification): void {
    // 可以在这里添加自定义逻辑
    // 例如：更新应用状态、显示应用内通知等
  }

  // 处理通知响应
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { actionIdentifier, notification } = response;
    
    switch (actionIdentifier) {
      case 'view_job':
        // 导航到职位详情页
        break;
      case 'reply':
        // 打开消息回复界面
        break;
      case 'confirm':
        // 确认面试安排
        break;
      case 'reschedule':
        // 重新安排面试时间
        break;
      default:
        // 默认操作：打开应用
        break;
    }
  }

  // 映射优先级
  private mapPriority(priority?: string): Notifications.AndroidNotificationPriority {
    switch (priority) {
      case 'high':
        return Notifications.AndroidNotificationPriority.HIGH;
      case 'max':
        return Notifications.AndroidNotificationPriority.MAX;
      default:
        return Notifications.AndroidNotificationPriority.DEFAULT;
    }
  }

  // 清理监听器
  public cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // 发送推送通知到服务器
  public async sendPushNotification(
    tokens: string[],
    notification: NotificationData
  ): Promise<boolean> {
    try {
      const messages = tokens.map(token => ({
        to: token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        badge: notification.badge,
        priority: notification.priority || 'default',
      }));

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();
      console.log('推送通知发送结果:', result);
      return response.ok;
    } catch (error) {
      console.error('发送推送通知失败:', error);
      return false;
    }
  }

  // 批量发送通知
  public async sendBulkNotifications(
    notifications: Array<{ tokens: string[]; notification: NotificationData }>
  ): Promise<boolean[]> {
    const promises = notifications.map(({ tokens, notification }) =>
      this.sendPushNotification(tokens, notification)
    );
    return Promise.all(promises);
  }

  // 获取通知统计
  public async getNotificationStats(): Promise<{
    pending: number;
    delivered: number;
    badge: number;
  }> {
    const pending = await this.getPendingNotifications();
    const badge = await Notifications.getBadgeCountAsync();
    
    return {
      pending: pending.length,
      delivered: 0, // 这需要从服务器获取
      badge: badge || 0,
    };
  }
}

// 导出单例实例
export const pushNotificationService = PushNotificationService.getInstance();

// 通知工具函数
export const NotificationUtils = {
  // 创建职位申请通知
  createJobApplicationNotification: (jobTitle: string, companyName: string): NotificationData => ({
    id: `job_app_${Date.now()}`,
    title: '职位申请更新',
    body: `您在${companyName}的${jobTitle}职位申请有新进展`,
    categoryId: 'job_application',
    data: { type: 'job_application', jobTitle, companyName },
  }),

  // 创建消息通知
  createMessageNotification: (senderName: string, message: string): NotificationData => ({
    id: `message_${Date.now()}`,
    title: `来自${senderName}的消息`,
    body: message,
    categoryId: 'message',
    data: { type: 'message', senderName },
  }),

  // 创建面试通知
  createInterviewNotification: (companyName: string, time: string): NotificationData => ({
    id: `interview_${Date.now()}`,
    title: '面试提醒',
    body: `您与${companyName}的面试将在${time}开始`,
    categoryId: 'interview',
    priority: 'high',
    data: { type: 'interview', companyName, time },
  }),

  // 创建系统通知
  createSystemNotification: (title: string, body: string): NotificationData => ({
    id: `system_${Date.now()}`,
    title,
    body,
    data: { type: 'system' },
  }),
};

export default pushNotificationService;