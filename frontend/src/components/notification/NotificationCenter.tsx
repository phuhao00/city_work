import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Switch,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'slack' | 'teams';
  triggers: NotificationTrigger[];
  recipients: NotificationRecipient[];
  template: NotificationTemplate;
  schedule?: NotificationSchedule;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number; // minutes
  lastTriggered?: string;
  triggerCount: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
}

interface NotificationTrigger {
  id: string;
  event: string;
  conditions: TriggerCondition[];
  operator: 'and' | 'or';
}

interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
  value: any;
}

interface NotificationRecipient {
  id: string;
  type: 'user' | 'group' | 'role' | 'external';
  identifier: string;
  name: string;
  preferences?: {
    channels: string[];
    quietHours?: {
      start: string;
      end: string;
    };
  };
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  format: 'text' | 'html' | 'markdown';
  variables: string[];
}

interface NotificationSchedule {
  type: 'immediate' | 'delayed' | 'scheduled' | 'recurring';
  delay?: number; // minutes
  scheduledTime?: string;
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };
}

interface NotificationHistory {
  id: string;
  ruleId: string;
  ruleName: string;
  type: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending' | 'cancelled';
  sentAt: string;
  deliveredAt?: string;
  errorMessage?: string;
  retryCount: number;
  metadata: Record<string, any>;
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'slack' | 'teams';
  config: Record<string, any>;
  isActive: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastTested?: string;
  successRate: number;
  totalSent: number;
  totalFailed: number;
}

interface NotificationMetrics {
  totalRules: number;
  activeRules: number;
  totalSent: number;
  successRate: number;
  avgDeliveryTime: number;
  channelDistribution: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
  deliveryTrends: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }>;
  };
  statusDistribution: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
}

const NotificationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rules' | 'history' | 'channels'>('dashboard');
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [metrics, setMetrics] = useState<NotificationMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<NotificationHistory | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | null>(null);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<'all' | NotificationRule['type']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | NotificationHistory['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock notification rules
    const mockRules: NotificationRule[] = [
      {
        id: '1',
        name: '系统错误告警',
        description: '当系统发生错误时发送通知',
        type: 'email',
        triggers: [
          {
            id: '1',
            event: 'system_error',
            conditions: [
              {
                field: 'severity',
                operator: 'greater_than',
                value: 'warning',
              },
            ],
            operator: 'and',
          },
        ],
        recipients: [
          {
            id: '1',
            type: 'group',
            identifier: 'admin_group',
            name: '管理员组',
          },
        ],
        template: {
          id: '1',
          name: '错误告警模板',
          subject: '系统错误告警: {{error_type}}',
          body: '检测到系统错误: {{error_message}}',
          format: 'html',
          variables: ['error_type', 'error_message', 'timestamp'],
        },
        isActive: true,
        priority: 'high',
        cooldown: 15,
        lastTriggered: '2024-01-15T10:30:00Z',
        triggerCount: 45,
        successRate: 98.5,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
      },
      {
        id: '2',
        name: '用户注册通知',
        description: '新用户注册时发送欢迎邮件',
        type: 'email',
        triggers: [
          {
            id: '1',
            event: 'user_registered',
            conditions: [],
            operator: 'and',
          },
        ],
        recipients: [
          {
            id: '1',
            type: 'user',
            identifier: '{{user_email}}',
            name: '新注册用户',
          },
        ],
        template: {
          id: '2',
          name: '欢迎邮件模板',
          subject: '欢迎加入城市工作平台',
          body: '欢迎您，{{user_name}}！',
          format: 'html',
          variables: ['user_name', 'user_email'],
        },
        isActive: true,
        priority: 'medium',
        cooldown: 0,
        lastTriggered: '2024-01-15T09:15:00Z',
        triggerCount: 128,
        successRate: 99.2,
        createdAt: '2024-01-02',
        updatedAt: '2024-01-14',
      },
      {
        id: '3',
        name: '任务截止提醒',
        description: '任务即将截止时发送提醒',
        type: 'push',
        triggers: [
          {
            id: '1',
            event: 'task_due_soon',
            conditions: [
              {
                field: 'hours_remaining',
                operator: 'less_than',
                value: 24,
              },
            ],
            operator: 'and',
          },
        ],
        recipients: [
          {
            id: '1',
            type: 'user',
            identifier: '{{task_assignee}}',
            name: '任务负责人',
          },
        ],
        template: {
          id: '3',
          name: '任务提醒模板',
          subject: '任务即将截止',
          body: '您的任务"{{task_title}}"将在{{hours_remaining}}小时后截止',
          format: 'text',
          variables: ['task_title', 'hours_remaining'],
        },
        schedule: {
          type: 'recurring',
          recurrence: {
            pattern: 'daily',
            interval: 1,
          },
        },
        isActive: false,
        priority: 'medium',
        cooldown: 60,
        lastTriggered: '2024-01-14T16:00:00Z',
        triggerCount: 89,
        successRate: 95.5,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-15',
      },
    ];

    // Mock notification history
    const mockHistory: NotificationHistory[] = [
      {
        id: '1',
        ruleId: '1',
        ruleName: '系统错误告警',
        type: 'email',
        recipient: 'admin@example.com',
        subject: '系统错误告警: Database Connection Error',
        status: 'sent',
        sentAt: '2024-01-15T10:30:00Z',
        deliveredAt: '2024-01-15T10:30:15Z',
        retryCount: 0,
        metadata: {
          error_type: 'Database Connection Error',
          error_message: '无法连接到数据库服务器',
          timestamp: '2024-01-15T10:30:00Z',
        },
      },
      {
        id: '2',
        ruleId: '2',
        ruleName: '用户注册通知',
        type: 'email',
        recipient: 'newuser@example.com',
        subject: '欢迎加入城市工作平台',
        status: 'sent',
        sentAt: '2024-01-15T09:15:00Z',
        deliveredAt: '2024-01-15T09:15:08Z',
        retryCount: 0,
        metadata: {
          user_name: '张三',
          user_email: 'newuser@example.com',
        },
      },
      {
        id: '3',
        ruleId: '3',
        ruleName: '任务截止提醒',
        type: 'push',
        recipient: 'user123',
        subject: '任务即将截止',
        status: 'failed',
        sentAt: '2024-01-14T16:00:00Z',
        errorMessage: '推送服务不可用',
        retryCount: 3,
        metadata: {
          task_title: '完成项目报告',
          hours_remaining: 12,
        },
      },
      {
        id: '4',
        ruleId: '1',
        ruleName: '系统错误告警',
        type: 'email',
        recipient: 'admin@example.com',
        subject: '系统错误告警: API Rate Limit Exceeded',
        status: 'pending',
        sentAt: '2024-01-15T11:00:00Z',
        retryCount: 1,
        metadata: {
          error_type: 'API Rate Limit Exceeded',
          error_message: 'API调用频率超过限制',
          timestamp: '2024-01-15T11:00:00Z',
        },
      },
    ];

    // Mock notification channels
    const mockChannels: NotificationChannel[] = [
      {
        id: '1',
        name: 'SMTP邮件服务',
        type: 'email',
        config: {
          host: 'smtp.example.com',
          port: 587,
          username: 'noreply@example.com',
          encryption: 'tls',
        },
        isActive: true,
        status: 'connected',
        lastTested: '2024-01-15T08:00:00Z',
        successRate: 98.5,
        totalSent: 1250,
        totalFailed: 19,
      },
      {
        id: '2',
        name: '短信服务',
        type: 'sms',
        config: {
          provider: 'aliyun',
          accessKey: 'LTAI***',
          signName: '城市工作平台',
        },
        isActive: true,
        status: 'connected',
        lastTested: '2024-01-15T07:30:00Z',
        successRate: 99.2,
        totalSent: 890,
        totalFailed: 7,
      },
      {
        id: '3',
        name: '推送通知',
        type: 'push',
        config: {
          provider: 'firebase',
          serverKey: 'AAAA***',
        },
        isActive: false,
        status: 'error',
        lastTested: '2024-01-14T16:00:00Z',
        successRate: 85.3,
        totalSent: 420,
        totalFailed: 62,
      },
      {
        id: '4',
        name: 'Slack集成',
        type: 'slack',
        config: {
          webhookUrl: 'https://hooks.slack.com/services/***',
          channel: '#alerts',
        },
        isActive: true,
        status: 'connected',
        lastTested: '2024-01-15T09:00:00Z',
        successRate: 97.8,
        totalSent: 156,
        totalFailed: 3,
      },
    ];

    // Mock metrics
    const mockMetrics: NotificationMetrics = {
      totalRules: 15,
      activeRules: 12,
      totalSent: 8950,
      successRate: 96.8,
      avgDeliveryTime: 2.3,
      channelDistribution: {
        labels: ['邮件', '短信', '推送', 'Slack', 'Teams'],
        datasets: [
          {
            data: [45, 25, 15, 10, 5],
          },
        ],
      },
      deliveryTrends: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
          {
            data: [1200, 1450, 1380, 1620, 1580, 1490],
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      },
      statusDistribution: {
        labels: ['成功', '失败', '待发送', '已取消'],
        datasets: [
          {
            data: [8650, 285, 15, 0],
          },
        ],
      },
    };

    setRules(mockRules);
    setHistory(mockHistory);
    setChannels(mockChannels);
    setMetrics(mockMetrics);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#9E9E9E';
      case 'connected': return '#4CAF50';
      case 'disconnected': return '#9E9E9E';
      case 'error': return '#F44336';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      case 'critical': return '#9C27B0';
      default: return '#666';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return 'mail-outline';
      case 'sms': return 'chatbubble-outline';
      case 'push': return 'notifications-outline';
      case 'webhook': return 'link-outline';
      case 'slack': return 'logo-slack';
      case 'teams': return 'people-outline';
      default: return 'alert-outline';
    }
  };

  const filteredRules = rules.filter(rule => {
    if (typeFilter !== 'all' && rule.type !== typeFilter) return false;
    if (searchQuery && !rule.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredHistory = history.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery && !item.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const onRefresh = () => {
    setRefreshing(true);
    loadMockData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
  };

  const testChannel = (channelId: string) => {
    Alert.alert(
      '测试通道',
      '确定要测试此通知通道吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '测试',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setChannels(prev => prev.map(channel => 
                channel.id === channelId 
                  ? { 
                      ...channel, 
                      status: 'connected',
                      lastTested: new Date().toISOString(),
                    }
                  : channel
              ));
              Alert.alert('成功', '通知通道测试通过');
            }, 2000);
          },
        },
      ]
    );
  };

  const retryNotification = (historyId: string) => {
    Alert.alert(
      '重试发送',
      '确定要重试发送此通知吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重试',
          onPress: () => {
            setHistory(prev => prev.map(item => 
              item.id === historyId 
                ? { 
                    ...item, 
                    status: 'pending',
                    retryCount: item.retryCount + 1,
                  }
                : item
            ));
            Alert.alert('成功', '通知已重新加入发送队列');
          },
        },
      ]
    );
  };

  const renderDashboardTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="notifications" size={24} color="#2196F3" />
          <Text style={styles.statValue}>{metrics?.totalRules || 0}</Text>
          <Text style={styles.statLabel}>通知规则</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{metrics?.activeRules || 0}</Text>
          <Text style={styles.statLabel}>活跃规则</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="send" size={24} color="#FF9800" />
          <Text style={styles.statValue}>{metrics?.totalSent || 0}</Text>
          <Text style={styles.statLabel}>已发送</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#9C27B0" />
          <Text style={styles.statValue}>{metrics?.avgDeliveryTime || 0}s</Text>
          <Text style={styles.statLabel}>平均送达时间</Text>
        </View>
      </View>

      {/* Success Rate */}
      <View style={styles.successRateCard}>
        <Text style={styles.cardTitle}>发送成功率</Text>
        <View style={styles.successRateContent}>
          <View style={styles.successRateCircle}>
            <Text style={styles.successRateText}>
              {metrics?.successRate || 0}%
            </Text>
          </View>
          <View style={styles.successRateDetails}>
            <View style={styles.successRateItem}>
              <View style={[styles.successRateDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.successRateLabel}>
                成功: {metrics ? Math.round(metrics.totalSent * metrics.successRate / 100) : 0}
              </Text>
            </View>
            <View style={styles.successRateItem}>
              <View style={[styles.successRateDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.successRateLabel}>
                失败: {metrics ? Math.round(metrics.totalSent * (100 - metrics.successRate) / 100) : 0}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Delivery Trends */}
      {metrics?.deliveryTrends && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>发送趋势</Text>
          <LineChart
            data={metrics.deliveryTrends}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#4CAF50',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Channel Distribution */}
      {metrics?.channelDistribution && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>通道分布</Text>
          <PieChart
            data={metrics.channelDistribution.labels.map((label, index) => ({
              name: label,
              population: metrics.channelDistribution.datasets[0].data[index],
              color: `hsl(${index * 60}, 70%, 50%)`,
              legendFontColor: '#333',
              legendFontSize: 12,
            }))}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>
      )}

      {/* Recent Notifications */}
      <View style={styles.recentNotificationsCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>最近通知</Text>
          <TouchableOpacity onPress={() => setActiveTab('history')}>
            <Text style={styles.viewAllText}>查看全部</Text>
          </TouchableOpacity>
        </View>
        {history.slice(0, 5).map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.notificationItem}
            onPress={() => {
              setSelectedHistory(item);
              setShowHistoryModal(true);
            }}
          >
            <View style={styles.notificationHeader}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationSubject}>{item.subject}</Text>
                <Text style={styles.notificationRecipient}>收件人: {item.recipient}</Text>
                <Text style={styles.notificationTime}>
                  {new Date(item.sentAt).toLocaleString()}
                </Text>
              </View>
              <View style={styles.notificationBadges}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
                <Ionicons
                  name={getTypeIcon(item.type)}
                  size={16}
                  color="#666"
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active Rules */}
      <View style={styles.activeRulesCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>活跃规则</Text>
          <TouchableOpacity onPress={() => setActiveTab('rules')}>
            <Text style={styles.viewAllText}>查看全部</Text>
          </TouchableOpacity>
        </View>
        {rules.filter(rule => rule.isActive).slice(0, 3).map((rule) => (
          <View key={rule.id} style={styles.ruleItem}>
            <View style={styles.ruleHeader}>
              <View style={styles.ruleInfo}>
                <Text style={styles.ruleName}>{rule.name}</Text>
                <Text style={styles.ruleDescription}>{rule.description}</Text>
                <View style={styles.ruleStats}>
                  <Text style={styles.ruleStatText}>触发次数: {rule.triggerCount}</Text>
                  <Text style={styles.ruleStatText}>成功率: {rule.successRate}%</Text>
                </View>
              </View>
              <View style={styles.ruleBadges}>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(rule.priority) }]}>
                  <Text style={styles.priorityText}>{rule.priority}</Text>
                </View>
                <Ionicons
                  name={getTypeIcon(rule.type)}
                  size={16}
                  color="#666"
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderRulesTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索规则..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>类型:</Text>
            {['all', 'email', 'sms', 'push', 'webhook', 'slack'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  typeFilter === type && styles.activeFilter,
                ]}
                onPress={() => setTypeFilter(type as any)}
              >
                <Text
                  style={[
                    styles.filterText,
                    typeFilter === type && styles.activeFilterText,
                  ]}
                >
                  {type === 'all' ? '全部' : type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Add Rule Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>创建规则</Text>
      </TouchableOpacity>

      {/* Rules List */}
      {filteredRules.map((rule) => (
        <View key={rule.id} style={styles.ruleCard}>
          <View style={styles.ruleCardHeader}>
            <View style={styles.ruleCardInfo}>
              <View style={styles.ruleCardTitleRow}>
                <Ionicons
                  name={getTypeIcon(rule.type)}
                  size={20}
                  color="#2196F3"
                />
                <Text style={styles.ruleCardName}>{rule.name}</Text>
                <Switch
                  value={rule.isActive}
                  onValueChange={() => toggleRule(rule.id)}
                  trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
                  thumbColor={rule.isActive ? '#fff' : '#f4f3f4'}
                />
              </View>
              <Text style={styles.ruleCardDescription}>{rule.description}</Text>
              <View style={styles.ruleCardMeta}>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(rule.priority) }]}>
                  <Text style={styles.priorityText}>{rule.priority}</Text>
                </View>
                <Text style={styles.ruleCardType}>{rule.type}</Text>
                <Text style={styles.ruleCardCooldown}>冷却: {rule.cooldown}分钟</Text>
              </View>
            </View>
          </View>

          <View style={styles.ruleCardStats}>
            <View style={styles.ruleCardStat}>
              <Text style={styles.ruleCardStatValue}>{rule.triggerCount}</Text>
              <Text style={styles.ruleCardStatLabel}>触发次数</Text>
            </View>
            <View style={styles.ruleCardStat}>
              <Text style={styles.ruleCardStatValue}>{rule.successRate}%</Text>
              <Text style={styles.ruleCardStatLabel}>成功率</Text>
            </View>
            <View style={styles.ruleCardStat}>
              <Text style={styles.ruleCardStatValue}>{rule.recipients.length}</Text>
              <Text style={styles.ruleCardStatLabel}>收件人</Text>
            </View>
            <View style={styles.ruleCardStat}>
              <Text style={styles.ruleCardStatValue}>{rule.triggers.length}</Text>
              <Text style={styles.ruleCardStatLabel}>触发器</Text>
            </View>
          </View>

          {rule.lastTriggered && (
            <View style={styles.ruleCardFooter}>
              <Text style={styles.lastTriggered}>
                最后触发: {new Date(rule.lastTriggered).toLocaleString()}
              </Text>
            </View>
          )}

          <View style={styles.ruleCardActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="flash" size={16} color="#2196F3" />
              <Text style={styles.actionButtonText}>测试</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedRule(rule);
                setShowRuleModal(true);
              }}
            >
              <Ionicons name="create" size={16} color="#FF9800" />
              <Text style={styles.actionButtonText}>编辑</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="copy" size={16} color="#4CAF50" />
              <Text style={styles.actionButtonText}>复制</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索通知历史..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>状态:</Text>
            {['all', 'sent', 'failed', 'pending', 'cancelled'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  statusFilter === status && styles.activeFilter,
                ]}
                onPress={() => setStatusFilter(status as any)}
              >
                <Text
                  style={[
                    styles.filterText,
                    statusFilter === status && styles.activeFilterText,
                  ]}
                >
                  {status === 'all' ? '全部' : status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* History List */}
      {filteredHistory.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.historyCard}
          onPress={() => {
            setSelectedHistory(item);
            setShowHistoryModal(true);
          }}
        >
          <View style={styles.historyCardHeader}>
            <View style={styles.historyCardInfo}>
              <Text style={styles.historyCardSubject}>{item.subject}</Text>
              <Text style={styles.historyCardRule}>规则: {item.ruleName}</Text>
              <Text style={styles.historyCardRecipient}>收件人: {item.recipient}</Text>
              <Text style={styles.historyCardTime}>
                发送时间: {new Date(item.sentAt).toLocaleString()}
              </Text>
              {item.deliveredAt && (
                <Text style={styles.historyCardTime}>
                  送达时间: {new Date(item.deliveredAt).toLocaleString()}
                </Text>
              )}
            </View>
            <View style={styles.historyCardBadges}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
              <Ionicons
                name={getTypeIcon(item.type)}
                size={16}
                color="#666"
              />
            </View>
          </View>

          {item.errorMessage && (
            <Text style={styles.errorMessage}>{item.errorMessage}</Text>
          )}

          {item.retryCount > 0 && (
            <Text style={styles.retryCount}>重试次数: {item.retryCount}</Text>
          )}

          {item.status === 'failed' && (
            <View style={styles.historyCardActions}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => retryNotification(item.id)}
              >
                <Ionicons name="refresh" size={16} color="#2196F3" />
                <Text style={styles.retryButtonText}>重试</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderChannelsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.channelsHeader}>
        <Text style={styles.sectionTitle}>通知通道</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>添加通道</Text>
        </TouchableOpacity>
      </View>

      {channels.map((channel) => (
        <View key={channel.id} style={styles.channelCard}>
          <View style={styles.channelCardHeader}>
            <View style={styles.channelCardInfo}>
              <View style={styles.channelCardTitleRow}>
                <Ionicons
                  name={getTypeIcon(channel.type)}
                  size={20}
                  color="#2196F3"
                />
                <Text style={styles.channelCardName}>{channel.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(channel.status) }]}>
                  <Text style={styles.statusText}>{channel.status}</Text>
                </View>
              </View>
              <Text style={styles.channelCardType}>{channel.type.toUpperCase()}</Text>
              <View style={styles.channelCardConfig}>
                {Object.entries(channel.config).slice(0, 2).map(([key, value]) => (
                  <Text key={key} style={styles.configItem}>
                    {key}: {typeof value === 'string' && value.includes('*') ? value : '***'}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.channelCardStats}>
            <View style={styles.channelCardStat}>
              <Text style={styles.channelCardStatValue}>{channel.successRate}%</Text>
              <Text style={styles.channelCardStatLabel}>成功率</Text>
            </View>
            <View style={styles.channelCardStat}>
              <Text style={styles.channelCardStatValue}>{channel.totalSent}</Text>
              <Text style={styles.channelCardStatLabel}>已发送</Text>
            </View>
            <View style={styles.channelCardStat}>
              <Text style={styles.channelCardStatValue}>{channel.totalFailed}</Text>
              <Text style={styles.channelCardStatLabel}>失败数</Text>
            </View>
          </View>

          {channel.lastTested && (
            <View style={styles.channelCardFooter}>
              <Text style={styles.lastTested}>
                最后测试: {new Date(channel.lastTested).toLocaleString()}
              </Text>
            </View>
          )}

          <View style={styles.channelCardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => testChannel(channel.id)}
            >
              <Ionicons name="flash" size={16} color="#2196F3" />
              <Text style={styles.actionButtonText}>测试</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedChannel(channel);
                setShowChannelModal(true);
              }}
            >
              <Ionicons name="create" size={16} color="#FF9800" />
              <Text style={styles.actionButtonText}>编辑</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="eye" size={16} color="#4CAF50" />
              <Text style={styles.actionButtonText}>查看</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>通知中心</Text>
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'dashboard', label: '仪表板', icon: 'speedometer-outline' },
          { key: 'rules', label: '规则', icon: 'notifications-outline' },
          { key: 'history', label: '历史', icon: 'time-outline' },
          { key: 'channels', label: '通道', icon: 'send-outline' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.key ? '#2196F3' : '#666'}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'rules' && renderRulesTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'channels' && renderChannelsTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  successRateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  successRateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  successRateCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successRateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  successRateDetails: {
    flex: 1,
    gap: 8,
  },
  successRateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successRateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  successRateLabel: {
    fontSize: 14,
    color: '#666',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 16,
  },
  recentNotificationsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  notificationItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  notificationRecipient: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  notificationBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  activeRulesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ruleItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ruleInfo: {
    flex: 1,
  },
  ruleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  ruleDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  ruleStats: {
    flexDirection: 'row',
    gap: 15,
  },
  ruleStatText: {
    fontSize: 11,
    color: '#666',
  },
  ruleBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priorityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    marginBottom: 15,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilter: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 15,
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  ruleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ruleCardHeader: {
    marginBottom: 15,
  },
  ruleCardInfo: {
    flex: 1,
  },
  ruleCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ruleCardName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ruleCardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  ruleCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  ruleCardType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  ruleCardCooldown: {
    fontSize: 12,
    color: '#666',
  },
  ruleCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 15,
  },
  ruleCardStat: {
    alignItems: 'center',
  },
  ruleCardStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  ruleCardStatLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  ruleCardFooter: {
    marginBottom: 15,
  },
  lastTriggered: {
    fontSize: 12,
    color: '#666',
  },
  ruleCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  historyCardInfo: {
    flex: 1,
  },
  historyCardSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  historyCardRule: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  historyCardRecipient: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  historyCardTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  historyCardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorMessage: {
    fontSize: 12,
    color: '#F44336',
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  retryCount: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 10,
  },
  historyCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  channelsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  channelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  channelCardHeader: {
    marginBottom: 15,
  },
  channelCardInfo: {
    flex: 1,
  },
  channelCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  channelCardName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  channelCardType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  channelCardConfig: {
    gap: 4,
  },
  configItem: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  channelCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 15,
  },
  channelCardStat: {
    alignItems: 'center',
  },
  channelCardStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  channelCardStatLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  channelCardFooter: {
    marginBottom: 15,
  },
  lastTested: {
    fontSize: 12,
    color: '#666',
  },
  channelCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default NotificationCenter;