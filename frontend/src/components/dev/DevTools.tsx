import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface DevToolsProps {
  navigation?: any;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
}

interface DebugFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'ui' | 'network' | 'performance' | 'data';
}

interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: Date;
  requestHeaders: { [key: string]: string };
  responseHeaders: { [key: string]: string };
  requestBody?: any;
  responseBody?: any;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  category: 'memory' | 'cpu' | 'network' | 'render';
}

const DevTools: React.FC<DevToolsProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'logs' | 'network' | 'performance' | 'debug'>('logs');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [debugFlags, setDebugFlags] = useState<DebugFlag[]>([]);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [logFilter, setLogFilter] = useState<'all' | 'debug' | 'info' | 'warn' | 'error'>('all');
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showNetworkDetails, setShowNetworkDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadLogs();
    loadDebugFlags();
    loadNetworkRequests();
    loadPerformanceMetrics();

    // 模拟实时数据更新
    const interval = setInterval(() => {
      addRandomLog();
      addRandomNetworkRequest();
      updatePerformanceMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadLogs = () => {
    const mockLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date(),
        level: 'info',
        category: 'Auth',
        message: '用户登录成功',
        data: { userId: '12345', email: 'user@example.com' },
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 60000),
        level: 'warn',
        category: 'Network',
        message: 'API响应时间较长',
        data: { url: '/api/jobs', duration: 2500 },
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 120000),
        level: 'error',
        category: 'UI',
        message: '组件渲染失败',
        data: { component: 'JobCard', error: 'Cannot read property of undefined' },
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 180000),
        level: 'debug',
        category: 'Performance',
        message: '内存使用情况',
        data: { used: 85, total: 128, unit: 'MB' },
      },
    ];

    setLogs(mockLogs);
  };

  const loadDebugFlags = () => {
    const mockFlags: DebugFlag[] = [
      {
        id: '1',
        name: 'showPerformanceOverlay',
        description: '显示性能监控覆盖层',
        enabled: false,
        category: 'performance',
      },
      {
        id: '2',
        name: 'enableNetworkLogging',
        description: '启用网络请求日志',
        enabled: true,
        category: 'network',
      },
      {
        id: '3',
        name: 'showUIBounds',
        description: '显示UI组件边界',
        enabled: false,
        category: 'ui',
      },
      {
        id: '4',
        name: 'enableDataValidation',
        description: '启用数据验证',
        enabled: true,
        category: 'data',
      },
      {
        id: '5',
        name: 'mockAPIResponses',
        description: '使用模拟API响应',
        enabled: false,
        category: 'network',
      },
    ];

    setDebugFlags(mockFlags);
  };

  const loadNetworkRequests = () => {
    const mockRequests: NetworkRequest[] = [
      {
        id: '1',
        method: 'GET',
        url: '/api/jobs/search',
        status: 200,
        duration: 245,
        timestamp: new Date(),
        requestHeaders: {
          'Authorization': 'Bearer token...',
          'Content-Type': 'application/json',
        },
        responseHeaders: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        responseBody: { jobs: [], total: 0 },
      },
      {
        id: '2',
        method: 'POST',
        url: '/api/auth/login',
        status: 200,
        duration: 180,
        timestamp: new Date(Date.now() - 30000),
        requestHeaders: {
          'Content-Type': 'application/json',
        },
        responseHeaders: {
          'Content-Type': 'application/json',
          'Set-Cookie': 'session=...',
        },
        requestBody: { email: 'user@example.com', password: '***' },
        responseBody: { token: 'jwt...', user: {} },
      },
      {
        id: '3',
        method: 'GET',
        url: '/api/user/profile',
        status: 500,
        duration: 2500,
        timestamp: new Date(Date.now() - 60000),
        requestHeaders: {
          'Authorization': 'Bearer token...',
        },
        responseHeaders: {
          'Content-Type': 'application/json',
        },
        responseBody: { error: 'Internal Server Error' },
      },
    ];

    setNetworkRequests(mockRequests);
  };

  const loadPerformanceMetrics = () => {
    const mockMetrics: PerformanceMetric[] = [
      {
        name: '内存使用',
        value: 85,
        unit: 'MB',
        timestamp: new Date(),
        category: 'memory',
      },
      {
        name: 'CPU使用率',
        value: 15,
        unit: '%',
        timestamp: new Date(),
        category: 'cpu',
      },
      {
        name: '帧率',
        value: 58,
        unit: 'FPS',
        timestamp: new Date(),
        category: 'render',
      },
      {
        name: '网络延迟',
        value: 120,
        unit: 'ms',
        timestamp: new Date(),
        category: 'network',
      },
    ];

    setPerformanceMetrics(mockMetrics);
  };

  const addRandomLog = () => {
    const levels: LogEntry['level'][] = ['debug', 'info', 'warn', 'error'];
    const categories = ['Auth', 'Network', 'UI', 'Performance', 'Data'];
    const messages = [
      '操作完成',
      '数据加载中',
      '网络连接异常',
      '组件更新',
      '缓存清理',
    ];

    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level: levels[Math.floor(Math.random() * levels.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      data: { random: Math.random() },
    };

    setLogs(prev => [newLog, ...prev].slice(0, 100)); // 保持最新100条
  };

  const addRandomNetworkRequest = () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const urls = ['/api/jobs', '/api/users', '/api/companies', '/api/messages'];
    const statuses = [200, 201, 400, 404, 500];

    const newRequest: NetworkRequest = {
      id: Date.now().toString(),
      method: methods[Math.floor(Math.random() * methods.length)],
      url: urls[Math.floor(Math.random() * urls.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      duration: Math.floor(Math.random() * 1000) + 100,
      timestamp: new Date(),
      requestHeaders: { 'Content-Type': 'application/json' },
      responseHeaders: { 'Content-Type': 'application/json' },
    };

    setNetworkRequests(prev => [newRequest, ...prev].slice(0, 50)); // 保持最新50条
  };

  const updatePerformanceMetrics = () => {
    setPerformanceMetrics(prev => prev.map(metric => ({
      ...metric,
      value: metric.value + (Math.random() - 0.5) * 10,
      timestamp: new Date(),
    })));
  };

  const clearLogs = () => {
    Alert.alert(
      '清除日志',
      '确定要清除所有日志吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: () => setLogs([]) },
      ]
    );
  };

  const exportLogs = () => {
    const logsData = JSON.stringify(logs, null, 2);
    Alert.alert('导出日志', '日志数据已准备导出');
    // 这里可以实现实际的导出功能
  };

  const toggleDebugFlag = (flagId: string) => {
    setDebugFlags(prev => prev.map(flag =>
      flag.id === flagId ? { ...flag, enabled: !flag.enabled } : flag
    ));
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug':
        return '#9E9E9E';
      case 'info':
        return '#2196F3';
      case 'warn':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return '#4CAF50';
    if (status >= 300 && status < 400) return '#FF9800';
    if (status >= 400) return '#F44336';
    return '#9E9E9E';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return '#4CAF50';
      case 'POST':
        return '#2196F3';
      case 'PUT':
        return '#FF9800';
      case 'DELETE':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const filteredLogs = logs.filter(log => 
    logFilter === 'all' || log.level === logFilter
  );

  const renderLogsTab = () => (
    <View>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: theme.colors.text }]}>
          应用日志
        </Text>
        <View style={styles.logActions}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.primary }]}
            onPress={exportLogs}
          >
            <Ionicons name="download" size={16} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
              导出
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: '#F44336' }]}
            onPress={clearLogs}
          >
            <Ionicons name="trash" size={16} color="#F44336" />
            <Text style={[styles.actionButtonText, { color: '#F44336' }]}>
              清除
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.logFilters}>
        {(['all', 'debug', 'info', 'warn', 'error'] as const).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.filterButton,
              {
                backgroundColor: logFilter === level
                  ? getLevelColor(level)
                  : theme.colors.surface,
              },
            ]}
            onPress={() => setLogFilter(level)}
          >
            <Text
              style={[
                styles.filterButtonText,
                {
                  color: logFilter === level
                    ? '#FFFFFF'
                    : theme.colors.text,
                },
              ]}
            >
              {level.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.logsList}>
        {filteredLogs.map((log) => (
          <TouchableOpacity
            key={log.id}
            style={[styles.logItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              setSelectedLog(log);
              setShowLogDetails(true);
            }}
          >
            <View style={styles.logHeader}>
              <View style={styles.logMeta}>
                <View
                  style={[
                    styles.logLevel,
                    { backgroundColor: getLevelColor(log.level) },
                  ]}
                >
                  <Text style={styles.logLevelText}>
                    {log.level.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.logCategory, { color: theme.colors.textSecondary }]}>
                  {log.category}
                </Text>
                <Text style={[styles.logTimestamp, { color: theme.colors.textSecondary }]}>
                  {log.timestamp.toLocaleTimeString()}
                </Text>
              </View>
            </View>
            <Text style={[styles.logMessage, { color: theme.colors.text }]}>
              {log.message}
            </Text>
            {log.data && (
              <Text style={[styles.logData, { color: theme.colors.textSecondary }]}>
                {JSON.stringify(log.data).substring(0, 100)}...
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderNetworkTab = () => (
    <View>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: theme.colors.text }]}>
          网络请求
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: theme.colors.primary }]}
          onPress={() => setNetworkRequests([])}
        >
          <Ionicons name="trash" size={16} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
            清除
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.networkList}>
        {networkRequests.map((request) => (
          <TouchableOpacity
            key={request.id}
            style={[styles.networkItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              setSelectedRequest(request);
              setShowNetworkDetails(true);
            }}
          >
            <View style={styles.networkHeader}>
              <View
                style={[
                  styles.methodBadge,
                  { backgroundColor: getMethodColor(request.method) },
                ]}
              >
                <Text style={styles.methodText}>{request.method}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(request.status) },
                ]}
              >
                <Text style={styles.statusText}>{request.status}</Text>
              </View>
              <Text style={[styles.networkDuration, { color: theme.colors.textSecondary }]}>
                {request.duration}ms
              </Text>
            </View>
            <Text style={[styles.networkUrl, { color: theme.colors.text }]}>
              {request.url}
            </Text>
            <Text style={[styles.networkTimestamp, { color: theme.colors.textSecondary }]}>
              {request.timestamp.toLocaleTimeString()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPerformanceTab = () => (
    <View>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: theme.colors.text }]}>
          性能监控
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: theme.colors.primary }]}
          onPress={updatePerformanceMetrics}
        >
          <Ionicons name="refresh" size={16} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
            刷新
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricsGrid}>
        {performanceMetrics.map((metric, index) => (
          <View
            key={index}
            style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.metricName, { color: theme.colors.text }]}>
              {metric.name}
            </Text>
            <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
              {metric.value.toFixed(1)} {metric.unit}
            </Text>
            <Text style={[styles.metricTimestamp, { color: theme.colors.textSecondary }]}>
              {metric.timestamp.toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.performanceInfo}>
        <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
          系统信息
        </Text>
        <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.infoItem, { color: theme.colors.text }]}>
            平台: {Platform.OS} {Platform.Version}
          </Text>
          <Text style={[styles.infoItem, { color: theme.colors.text }]}>
            屏幕尺寸: {screenWidth}x{Dimensions.get('window').height}
          </Text>
          <Text style={[styles.infoItem, { color: theme.colors.text }]}>
            像素密度: {Dimensions.get('window').scale}x
          </Text>
        </View>
      </View>
    </View>
  );

  const renderDebugTab = () => (
    <View>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: theme.colors.text }]}>
          调试选项
        </Text>
      </View>

      <View style={styles.debugCategories}>
        {['ui', 'network', 'performance', 'data'].map((category) => (
          <View key={category} style={styles.debugCategory}>
            <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
              {category.toUpperCase()}
            </Text>
            {debugFlags
              .filter(flag => flag.category === category)
              .map((flag) => (
                <View
                  key={flag.id}
                  style={[styles.debugFlag, { backgroundColor: theme.colors.surface }]}
                >
                  <View style={styles.flagInfo}>
                    <Text style={[styles.flagName, { color: theme.colors.text }]}>
                      {flag.name}
                    </Text>
                    <Text style={[styles.flagDescription, { color: theme.colors.textSecondary }]}>
                      {flag.description}
                    </Text>
                  </View>
                  <Switch
                    value={flag.enabled}
                    onValueChange={() => toggleDebugFlag(flag.id)}
                    trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
                    thumbColor={flag.enabled ? '#FFFFFF' : '#F4F3F4'}
                  />
                </View>
              ))}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 标签页导航 */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'logs', label: '日志', icon: 'document-text' },
          { key: 'network', label: '网络', icon: 'cloud' },
          { key: 'performance', label: '性能', icon: 'speedometer' },
          { key: 'debug', label: '调试', icon: 'bug' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              {
                backgroundColor: selectedTab === tab.key
                  ? theme.colors.primary
                  : theme.colors.surface,
              },
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={selectedTab === tab.key ? '#FFFFFF' : theme.colors.text}
            />
            <Text
              style={[
                styles.tabButtonText,
                {
                  color: selectedTab === tab.key ? '#FFFFFF' : theme.colors.text,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 标签页内容 */}
      <View style={styles.tabContent}>
        {selectedTab === 'logs' && renderLogsTab()}
        {selectedTab === 'network' && renderNetworkTab()}
        {selectedTab === 'performance' && renderPerformanceTab()}
        {selectedTab === 'debug' && renderDebugTab()}
      </View>

      {/* 日志详情模态框 */}
      <Modal
        visible={showLogDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLogDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              日志详情
            </Text>
            {selectedLog && (
              <ScrollView style={styles.logDetailsContent}>
                <Text style={[styles.logDetailsText, { color: theme.colors.text }]}>
                  级别: {selectedLog.level}
                </Text>
                <Text style={[styles.logDetailsText, { color: theme.colors.text }]}>
                  类别: {selectedLog.category}
                </Text>
                <Text style={[styles.logDetailsText, { color: theme.colors.text }]}>
                  时间: {selectedLog.timestamp.toLocaleString()}
                </Text>
                <Text style={[styles.logDetailsText, { color: theme.colors.text }]}>
                  消息: {selectedLog.message}
                </Text>
                {selectedLog.data && (
                  <View>
                    <Text style={[styles.logDetailsText, { color: theme.colors.text }]}>
                      数据:
                    </Text>
                    <Text style={[styles.logDetailsData, { color: theme.colors.textSecondary }]}>
                      {JSON.stringify(selectedLog.data, null, 2)}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLogDetails(false)}
            >
              <Text style={[styles.modalCloseButtonText, { color: theme.colors.primary }]}>
                关闭
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 网络请求详情模态框 */}
      <Modal
        visible={showNetworkDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNetworkDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              网络请求详情
            </Text>
            {selectedRequest && (
              <ScrollView style={styles.networkDetailsContent}>
                <Text style={[styles.networkDetailsText, { color: theme.colors.text }]}>
                  方法: {selectedRequest.method}
                </Text>
                <Text style={[styles.networkDetailsText, { color: theme.colors.text }]}>
                  URL: {selectedRequest.url}
                </Text>
                <Text style={[styles.networkDetailsText, { color: theme.colors.text }]}>
                  状态: {selectedRequest.status}
                </Text>
                <Text style={[styles.networkDetailsText, { color: theme.colors.text }]}>
                  耗时: {selectedRequest.duration}ms
                </Text>
                <Text style={[styles.networkDetailsText, { color: theme.colors.text }]}>
                  时间: {selectedRequest.timestamp.toLocaleString()}
                </Text>
                
                <Text style={[styles.networkDetailsSection, { color: theme.colors.text }]}>
                  请求头:
                </Text>
                <Text style={[styles.networkDetailsData, { color: theme.colors.textSecondary }]}>
                  {JSON.stringify(selectedRequest.requestHeaders, null, 2)}
                </Text>
                
                <Text style={[styles.networkDetailsSection, { color: theme.colors.text }]}>
                  响应头:
                </Text>
                <Text style={[styles.networkDetailsData, { color: theme.colors.textSecondary }]}>
                  {JSON.stringify(selectedRequest.responseHeaders, null, 2)}
                </Text>
                
                {selectedRequest.requestBody && (
                  <>
                    <Text style={[styles.networkDetailsSection, { color: theme.colors.text }]}>
                      请求体:
                    </Text>
                    <Text style={[styles.networkDetailsData, { color: theme.colors.textSecondary }]}>
                      {JSON.stringify(selectedRequest.requestBody, null, 2)}
                    </Text>
                  </>
                )}
                
                {selectedRequest.responseBody && (
                  <>
                    <Text style={[styles.networkDetailsSection, { color: theme.colors.text }]}>
                      响应体:
                    </Text>
                    <Text style={[styles.networkDetailsData, { color: theme.colors.textSecondary }]}>
                      {JSON.stringify(selectedRequest.responseBody, null, 2)}
                    </Text>
                  </>
                )}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowNetworkDetails(false)}
            >
              <Text style={[styles.modalCloseButtonText, { color: theme.colors.primary }]}>
                关闭
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabNavigation: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    marginLeft: 4,
  },
  logFilters: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  logsList: {
    flex: 1,
  },
  logItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  logHeader: {
    marginBottom: 8,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logLevel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logLevelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  logCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  logTimestamp: {
    fontSize: 10,
  },
  logMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  logData: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  networkList: {
    flex: 1,
  },
  networkItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  networkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  methodText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  networkDuration: {
    fontSize: 12,
  },
  networkUrl: {
    fontSize: 14,
    marginBottom: 4,
  },
  networkTimestamp: {
    fontSize: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricTimestamp: {
    fontSize: 10,
  },
  performanceInfo: {
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 8,
  },
  infoItem: {
    fontSize: 14,
    marginBottom: 8,
  },
  debugCategories: {
    flex: 1,
  },
  debugCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  debugFlag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  flagInfo: {
    flex: 1,
  },
  flagName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  flagDescription: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  logDetailsContent: {
    maxHeight: 400,
  },
  logDetailsText: {
    fontSize: 14,
    marginBottom: 8,
  },
  logDetailsData: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  networkDetailsContent: {
    maxHeight: 400,
  },
  networkDetailsText: {
    fontSize: 14,
    marginBottom: 8,
  },
  networkDetailsSection: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  networkDetailsData: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DevTools;