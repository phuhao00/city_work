import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface SystemMetric {
  id: string;
  name: string;
  category: 'performance' | 'resource' | 'network' | 'security' | 'application';
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  description: string;
}

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  source: string;
  affectedSystems: string[];
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  source: string;
  message: string;
  details?: any;
  userId?: string;
  sessionId?: string;
}

interface HealthCheck {
  id: string;
  service: string;
  endpoint: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastCheck: string;
  uptime: number;
  errorCount: number;
  dependencies: string[];
}

const SystemMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'alerts' | 'logs' | 'health' | 'analytics'>('metrics');
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<SystemMetric | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Mock data
  useEffect(() => {
    const mockMetrics: SystemMetric[] = [
      {
        id: '1',
        name: 'CPU使用率',
        category: 'performance',
        value: 75.5,
        unit: '%',
        threshold: { warning: 70, critical: 90 },
        status: 'warning',
        trend: 'up',
        lastUpdated: '2024-01-30 16:45:00',
        description: '服务器CPU使用率监控',
      },
      {
        id: '2',
        name: '内存使用率',
        category: 'resource',
        value: 68.2,
        unit: '%',
        threshold: { warning: 80, critical: 95 },
        status: 'normal',
        trend: 'stable',
        lastUpdated: '2024-01-30 16:45:00',
        description: '系统内存使用情况',
      },
      {
        id: '3',
        name: '磁盘使用率',
        category: 'resource',
        value: 85.7,
        unit: '%',
        threshold: { warning: 80, critical: 95 },
        status: 'warning',
        trend: 'up',
        lastUpdated: '2024-01-30 16:45:00',
        description: '磁盘空间使用监控',
      },
      {
        id: '4',
        name: '网络延迟',
        category: 'network',
        value: 45.3,
        unit: 'ms',
        threshold: { warning: 100, critical: 200 },
        status: 'normal',
        trend: 'down',
        lastUpdated: '2024-01-30 16:45:00',
        description: '网络响应时间监控',
      },
      {
        id: '5',
        name: '活跃用户数',
        category: 'application',
        value: 1250,
        unit: '人',
        threshold: { warning: 2000, critical: 3000 },
        status: 'normal',
        trend: 'up',
        lastUpdated: '2024-01-30 16:45:00',
        description: '当前在线用户数量',
      },
      {
        id: '6',
        name: '错误率',
        category: 'application',
        value: 2.1,
        unit: '%',
        threshold: { warning: 5, critical: 10 },
        status: 'normal',
        trend: 'stable',
        lastUpdated: '2024-01-30 16:45:00',
        description: '应用程序错误率',
      },
    ];

    const mockAlerts: Alert[] = [
      {
        id: '1',
        title: 'CPU使用率过高',
        message: '服务器CPU使用率达到75.5%，超过警告阈值70%',
        severity: 'warning',
        category: '性能监控',
        timestamp: '2024-01-30 16:45:00',
        status: 'active',
        source: 'system-monitor',
        affectedSystems: ['web-server-01', 'api-gateway'],
      },
      {
        id: '2',
        title: '磁盘空间不足',
        message: '主服务器磁盘使用率达到85.7%，建议清理或扩容',
        severity: 'warning',
        category: '资源管理',
        timestamp: '2024-01-30 16:30:00',
        status: 'acknowledged',
        source: 'disk-monitor',
        affectedSystems: ['database-server'],
      },
      {
        id: '3',
        title: '数据库连接失败',
        message: '无法连接到主数据库，系统可能受到影响',
        severity: 'critical',
        category: '数据库',
        timestamp: '2024-01-30 15:20:00',
        status: 'resolved',
        source: 'db-health-check',
        affectedSystems: ['user-service', 'order-service'],
      },
      {
        id: '4',
        title: '异常登录尝试',
        message: '检测到来自异常IP的多次登录失败尝试',
        severity: 'error',
        category: '安全',
        timestamp: '2024-01-30 14:15:00',
        status: 'active',
        source: 'security-monitor',
        affectedSystems: ['auth-service'],
      },
    ];

    const mockLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-30 16:45:23',
        level: 'warn',
        source: 'api-gateway',
        message: 'High response time detected for /api/users endpoint',
        details: { responseTime: 2500, endpoint: '/api/users', method: 'GET' },
        sessionId: 'sess_abc123',
      },
      {
        id: '2',
        timestamp: '2024-01-30 16:44:15',
        level: 'error',
        source: 'user-service',
        message: 'Failed to authenticate user',
        details: { userId: 'user_456', reason: 'invalid_token' },
        userId: 'user_456',
        sessionId: 'sess_def456',
      },
      {
        id: '3',
        timestamp: '2024-01-30 16:43:02',
        level: 'info',
        source: 'order-service',
        message: 'New order created successfully',
        details: { orderId: 'order_789', amount: 299.99 },
        userId: 'user_123',
        sessionId: 'sess_ghi789',
      },
      {
        id: '4',
        timestamp: '2024-01-30 16:42:45',
        level: 'debug',
        source: 'cache-service',
        message: 'Cache hit for user profile data',
        details: { key: 'user_profile_123', ttl: 3600 },
        sessionId: 'sess_jkl012',
      },
    ];

    const mockHealthChecks: HealthCheck[] = [
      {
        id: '1',
        service: 'API网关',
        endpoint: 'https://api.company.com/health',
        status: 'healthy',
        responseTime: 45,
        lastCheck: '2024-01-30 16:45:00',
        uptime: 99.95,
        errorCount: 2,
        dependencies: ['user-service', 'order-service'],
      },
      {
        id: '2',
        service: '用户服务',
        endpoint: 'https://users.company.com/health',
        status: 'healthy',
        responseTime: 32,
        lastCheck: '2024-01-30 16:45:00',
        uptime: 99.98,
        errorCount: 1,
        dependencies: ['database', 'cache'],
      },
      {
        id: '3',
        service: '订单服务',
        endpoint: 'https://orders.company.com/health',
        status: 'degraded',
        responseTime: 150,
        lastCheck: '2024-01-30 16:45:00',
        uptime: 98.5,
        errorCount: 15,
        dependencies: ['database', 'payment-gateway'],
      },
      {
        id: '4',
        service: '支付网关',
        endpoint: 'https://payments.company.com/health',
        status: 'unhealthy',
        responseTime: 0,
        lastCheck: '2024-01-30 16:40:00',
        uptime: 95.2,
        errorCount: 45,
        dependencies: ['external-payment-api'],
      },
    ];

    setMetrics(mockMetrics);
    setAlerts(mockAlerts);
    setLogs(mockLogs);
    setHealthChecks(mockHealthChecks);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': case 'healthy': case 'resolved': return '#34C759';
      case 'warning': case 'degraded': case 'acknowledged': return '#FF9500';
      case 'critical': case 'unhealthy': case 'active': return '#FF3B30';
      case 'info': return '#007AFF';
      default: return '#8E8E93';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return '#007AFF';
      case 'warning': return '#FF9500';
      case 'error': return '#FF3B30';
      case 'critical': return '#8B0000';
      default: return '#8E8E93';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'debug': return '#8E8E93';
      case 'info': return '#007AFF';
      case 'warn': return '#FF9500';
      case 'error': return '#FF3B30';
      case 'fatal': return '#8B0000';
      default: return '#8E8E93';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return 'speedometer-outline';
      case 'resource': return 'hardware-chip-outline';
      case 'network': return 'wifi-outline';
      case 'security': return 'shield-outline';
      case 'application': return 'apps-outline';
      default: return 'settings-outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'remove';
      default: return 'remove';
    }
  };

  const filteredMetrics = metrics.filter(metric => {
    const matchesSearch = metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         metric.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || metric.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const renderAnalytics = () => {
    const metricStatusData = {
      labels: ['正常', '警告', '严重'],
      datasets: [{
        data: [
          metrics.filter(m => m.status === 'normal').length,
          metrics.filter(m => m.status === 'warning').length,
          metrics.filter(m => m.status === 'critical').length,
        ]
      }]
    };

    const performanceTrendData = {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00'],
      datasets: [{
        data: [65, 72, 68, 75, 70],
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2
      }]
    };

    const alertSeverityData = [
      { name: '信息', population: alerts.filter(a => a.severity === 'info').length, color: '#007AFF', legendFontColor: '#333', legendFontSize: 12 },
      { name: '警告', population: alerts.filter(a => a.severity === 'warning').length, color: '#FF9500', legendFontColor: '#333', legendFontSize: 12 },
      { name: '错误', population: alerts.filter(a => a.severity === 'error').length, color: '#FF3B30', legendFontColor: '#333', legendFontSize: 12 },
      { name: '严重', population: alerts.filter(a => a.severity === 'critical').length, color: '#8B0000', legendFontColor: '#333', legendFontSize: 12 },
    ];

    return (
      <ScrollView style={styles.analyticsContainer} showsVerticalScrollIndicator={false}>
        {/* Metrics Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="pulse" size={24} color="#007AFF" />
            <Text style={styles.metricNumber}>{metrics.length}</Text>
            <Text style={styles.metricLabel}>监控指标</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="warning" size={24} color="#FF9500" />
            <Text style={styles.metricNumber}>{alerts.filter(a => a.status === 'active').length}</Text>
            <Text style={styles.metricLabel}>活跃告警</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            <Text style={styles.metricNumber}>{healthChecks.filter(h => h.status === 'healthy').length}</Text>
            <Text style={styles.metricLabel}>健康服务</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="trending-up" size={24} color="#34C759" />
            <Text style={styles.metricNumber}>{Math.round(healthChecks.reduce((sum, h) => sum + h.uptime, 0) / healthChecks.length)}%</Text>
            <Text style={styles.metricLabel}>平均可用性</Text>
          </View>
        </View>

        {/* Metric Status Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>指标状态分布</Text>
          <BarChart
            data={metricStatusData}
            width={width - 60}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
            }}
            style={styles.chart}
          />
        </View>

        {/* Performance Trend Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>性能趋势</Text>
          <LineChart
            data={performanceTrendData}
            width={width - 60}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
            }}
            style={styles.chart}
          />
        </View>

        {/* Alert Severity Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>告警严重程度分布</Text>
          <PieChart
            data={alertSeverityData}
            width={width - 60}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </ScrollView>
    );
  };

  const renderMetric = ({ item }: { item: SystemMetric }) => (
    <TouchableOpacity
      style={styles.metricCard}
      onPress={() => {
        setSelectedMetric(item);
        setShowMetricModal(true);
      }}
    >
      <View style={styles.metricHeader}>
        <View style={styles.metricInfo}>
          <Ionicons name={getCategoryIcon(item.category)} size={20} color="#007AFF" />
          <Text style={styles.metricName}>{item.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>
            {item.status === 'normal' ? '正常' : 
             item.status === 'warning' ? '警告' : '严重'}
          </Text>
        </View>
      </View>
      
      <View style={styles.metricValueContainer}>
        <Text style={styles.metricValue}>{item.value}</Text>
        <Text style={styles.metricUnit}>{item.unit}</Text>
        <Ionicons 
          name={getTrendIcon(item.trend)} 
          size={16} 
          color={item.trend === 'up' ? '#FF3B30' : item.trend === 'down' ? '#34C759' : '#8E8E93'} 
        />
      </View>
      
      <Text style={styles.metricDescription}>{item.description}</Text>
      
      <View style={styles.thresholdContainer}>
        <View style={styles.thresholdItem}>
          <Text style={styles.thresholdLabel}>警告:</Text>
          <Text style={styles.thresholdValue}>{item.threshold.warning}{item.unit}</Text>
        </View>
        <View style={styles.thresholdItem}>
          <Text style={styles.thresholdLabel}>严重:</Text>
          <Text style={styles.thresholdValue}>{item.threshold.critical}{item.unit}</Text>
        </View>
      </View>
      
      <Text style={styles.lastUpdatedText}>更新时间: {item.lastUpdated}</Text>
    </TouchableOpacity>
  );

  const renderAlert = ({ item }: { item: Alert }) => (
    <TouchableOpacity
      style={styles.alertCard}
      onPress={() => {
        setSelectedAlert(item);
        setShowAlertModal(true);
      }}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <Ionicons 
            name="warning" 
            size={20} 
            color={getSeverityColor(item.severity)} 
          />
          <Text style={styles.alertTitle}>{item.title}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>
            {item.status === 'active' ? '活跃' : 
             item.status === 'acknowledged' ? '已确认' : '已解决'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.alertMessage}>{item.message}</Text>
      
      <View style={styles.alertDetails}>
        <View style={styles.alertDetailRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.alertDetailText}>{item.timestamp}</Text>
        </View>
        <View style={styles.alertDetailRow}>
          <Ionicons name="folder-outline" size={14} color="#666" />
          <Text style={styles.alertDetailText}>{item.category}</Text>
        </View>
        <View style={styles.alertDetailRow}>
          <Ionicons name="server-outline" size={14} color="#666" />
          <Text style={styles.alertDetailText}>影响系统: {item.affectedSystems.join(', ')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLog = ({ item }: { item: LogEntry }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={styles.logInfo}>
          <View style={[styles.logLevelBadge, { backgroundColor: getLogLevelColor(item.level) }]}>
            <Text style={styles.logLevelText}>{item.level.toUpperCase()}</Text>
          </View>
          <Text style={styles.logSource}>{item.source}</Text>
        </View>
        <Text style={styles.logTimestamp}>{item.timestamp}</Text>
      </View>
      
      <Text style={styles.logMessage}>{item.message}</Text>
      
      {item.details && (
        <View style={styles.logDetailsContainer}>
          <Text style={styles.logDetailsText}>
            {JSON.stringify(item.details, null, 2)}
          </Text>
        </View>
      )}
      
      <View style={styles.logFooter}>
        {item.userId && (
          <Text style={styles.logMetaText}>用户: {item.userId}</Text>
        )}
        {item.sessionId && (
          <Text style={styles.logMetaText}>会话: {item.sessionId}</Text>
        )}
      </View>
    </View>
  );

  const renderHealthCheck = ({ item }: { item: HealthCheck }) => (
    <View style={styles.healthCard}>
      <View style={styles.healthHeader}>
        <Text style={styles.healthService}>{item.service}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>
            {item.status === 'healthy' ? '健康' : 
             item.status === 'degraded' ? '降级' : '不健康'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.healthEndpoint}>{item.endpoint}</Text>
      
      <View style={styles.healthStats}>
        <View style={styles.healthStatItem}>
          <Ionicons name="speedometer-outline" size={14} color="#666" />
          <Text style={styles.healthStatText}>{item.responseTime}ms</Text>
        </View>
        <View style={styles.healthStatItem}>
          <Ionicons name="trending-up-outline" size={14} color="#666" />
          <Text style={styles.healthStatText}>可用性 {item.uptime}%</Text>
        </View>
        <View style={styles.healthStatItem}>
          <Ionicons name="warning-outline" size={14} color="#666" />
          <Text style={styles.healthStatText}>{item.errorCount} 个错误</Text>
        </View>
      </View>
      
      <View style={styles.dependenciesContainer}>
        <Text style={styles.dependenciesLabel}>依赖服务:</Text>
        <View style={styles.dependenciesList}>
          {item.dependencies.map((dep, index) => (
            <View key={index} style={styles.dependencyTag}>
              <Text style={styles.dependencyText}>{dep}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <Text style={styles.lastCheckText}>最后检查: {item.lastCheck}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>系统监控</Text>
        <TouchableOpacity style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'metrics' && styles.activeTab]}
          onPress={() => setActiveTab('metrics')}
        >
          <Text style={[styles.tabText, activeTab === 'metrics' && styles.activeTabText]}>
            指标
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'alerts' && styles.activeTab]}
          onPress={() => setActiveTab('alerts')}
        >
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.activeTabText]}>
            告警
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'logs' && styles.activeTab]}
          onPress={() => setActiveTab('logs')}
        >
          <Text style={[styles.tabText, activeTab === 'logs' && styles.activeTabText]}>
            日志
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'health' && styles.activeTab]}
          onPress={() => setActiveTab('health')}
        >
          <Text style={[styles.tabText, activeTab === 'health' && styles.activeTabText]}>
            健康检查
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            分析
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'metrics' && (
        <View style={styles.contentContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索指标..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterButton, filterCategory === 'all' && styles.activeFilter]}
                onPress={() => setFilterCategory('all')}
              >
                <Text style={[styles.filterText, filterCategory === 'all' && styles.activeFilterText]}>
                  全部
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filterCategory === 'performance' && styles.activeFilter]}
                onPress={() => setFilterCategory('performance')}
              >
                <Text style={[styles.filterText, filterCategory === 'performance' && styles.activeFilterText]}>
                  性能
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filterCategory === 'resource' && styles.activeFilter]}
                onPress={() => setFilterCategory('resource')}
              >
                <Text style={[styles.filterText, filterCategory === 'resource' && styles.activeFilterText]}>
                  资源
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <FlatList
            data={filteredMetrics}
            renderItem={renderMetric}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}

      {activeTab === 'alerts' && (
        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'logs' && (
        <FlatList
          data={logs}
          renderItem={renderLog}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'health' && (
        <FlatList
          data={healthChecks}
          renderItem={renderHealthCheck}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'analytics' && renderAnalytics()}

      {/* Metric Detail Modal */}
      <Modal
        visible={showMetricModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMetricModal(false)}>
              <Text style={styles.closeButton}>关闭</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>指标详情</Text>
            <TouchableOpacity>
              <Text style={styles.actionButton}>配置</Text>
            </TouchableOpacity>
          </View>
          
          {selectedMetric && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.metricDetailContainer}>
                <Text style={styles.metricDetailTitle}>{selectedMetric.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedMetric.status) }]}>
                  <Text style={styles.badgeText}>
                    {selectedMetric.status === 'normal' ? '正常' : 
                     selectedMetric.status === 'warning' ? '警告' : '严重'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.currentValueContainer}>
                <Text style={styles.currentValueLabel}>当前值</Text>
                <View style={styles.currentValueDisplay}>
                  <Text style={styles.currentValue}>{selectedMetric.value}</Text>
                  <Text style={styles.currentUnit}>{selectedMetric.unit}</Text>
                </View>
              </View>
              
              <Text style={styles.metricDetailDescription}>{selectedMetric.description}</Text>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>阈值配置</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>警告阈值:</Text>
                  <Text style={styles.detailValue}>{selectedMetric.threshold.warning}{selectedMetric.unit}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>严重阈值:</Text>
                  <Text style={styles.detailValue}>{selectedMetric.threshold.critical}{selectedMetric.unit}</Text>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>监控信息</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>类别:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMetric.category === 'performance' ? '性能' : 
                     selectedMetric.category === 'resource' ? '资源' : 
                     selectedMetric.category === 'network' ? '网络' : 
                     selectedMetric.category === 'security' ? '安全' : '应用'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>趋势:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMetric.trend === 'up' ? '上升' : 
                     selectedMetric.trend === 'down' ? '下降' : '稳定'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>最后更新:</Text>
                  <Text style={styles.detailValue}>{selectedMetric.lastUpdated}</Text>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Alert Detail Modal */}
      <Modal
        visible={showAlertModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAlertModal(false)}>
              <Text style={styles.closeButton}>关闭</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>告警详情</Text>
            <TouchableOpacity>
              <Text style={styles.actionButton}>处理</Text>
            </TouchableOpacity>
          </View>
          
          {selectedAlert && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.alertDetailContainer}>
                <Text style={styles.alertDetailTitle}>{selectedAlert.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getSeverityColor(selectedAlert.severity) }]}>
                  <Text style={styles.badgeText}>
                    {selectedAlert.severity === 'info' ? '信息' : 
                     selectedAlert.severity === 'warning' ? '警告' : 
                     selectedAlert.severity === 'error' ? '错误' : '严重'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.alertDetailMessage}>{selectedAlert.message}</Text>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>告警信息</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>类别:</Text>
                  <Text style={styles.detailValue}>{selectedAlert.category}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>来源:</Text>
                  <Text style={styles.detailValue}>{selectedAlert.source}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>时间:</Text>
                  <Text style={styles.detailValue}>{selectedAlert.timestamp}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>状态:</Text>
                  <Text style={styles.detailValue}>
                    {selectedAlert.status === 'active' ? '活跃' : 
                     selectedAlert.status === 'acknowledged' ? '已确认' : '已解决'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>影响系统</Text>
                <View style={styles.affectedSystemsList}>
                  {selectedAlert.affectedSystems.map((system, index) => (
                    <View key={index} style={styles.systemTag}>
                      <Text style={styles.systemText}>{system}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  refreshButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  metricCard: {
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
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  metricUnit: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  metricDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  thresholdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  thresholdItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thresholdLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  thresholdValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
  },
  alertCard: {
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
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  alertDetails: {
    marginBottom: 10,
  },
  alertDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  alertDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  logCard: {
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
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logLevelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 10,
  },
  logLevelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  logSource: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  logTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  logMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
  },
  logDetailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  logDetailsText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logMetaText: {
    fontSize: 12,
    color: '#666',
  },
  healthCard: {
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
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  healthService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  healthEndpoint: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginBottom: 15,
  },
  healthStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  healthStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  dependenciesContainer: {
    marginBottom: 10,
  },
  dependenciesLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  dependenciesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dependencyTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  dependencyText: {
    fontSize: 10,
    color: '#1976d2',
  },
  lastCheckText: {
    fontSize: 12,
    color: '#999',
  },
  analyticsContainer: {
    flex: 1,
    padding: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
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
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  actionButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  metricDetailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  metricDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 15,
  },
  currentValueContainer: {
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
  },
  currentValueLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  currentValueDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  currentUnit: {
    fontSize: 18,
    color: '#666',
  },
  metricDetailDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 25,
  },
  detailSection: {
    marginBottom: 25,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  alertDetailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  alertDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 15,
  },
  alertDetailMessage: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 25,
  },
  affectedSystemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  systemTag: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  systemText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },
});

export default SystemMonitoring;