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

interface IntegrationEndpoint {
  id: string;
  name: string;
  description: string;
  type: 'rest_api' | 'graphql' | 'webhook' | 'database' | 'file_system' | 'message_queue';
  protocol: 'http' | 'https' | 'tcp' | 'udp' | 'websocket';
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  authentication: {
    type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';
    credentials?: Record<string, string>;
  };
  status: 'active' | 'inactive' | 'error' | 'testing';
  lastTested: string;
  responseTime: number;
  successRate: number;
  totalRequests: number;
  errorCount: number;
  createdAt: string;
  updatedAt: string;
}

interface DataMapping {
  id: string;
  name: string;
  description: string;
  sourceEndpoint: string;
  targetEndpoint: string;
  mappingRules: MappingRule[];
  transformations: DataTransformation[];
  schedule?: {
    type: 'manual' | 'interval' | 'cron';
    value?: string;
    interval?: number;
  };
  isActive: boolean;
  lastSync: string;
  nextSync?: string;
  syncCount: number;
  errorCount: number;
  dataVolume: number;
}

interface MappingRule {
  id: string;
  sourceField: string;
  targetField: string;
  transformation?: string;
  defaultValue?: any;
  required: boolean;
  validation?: string;
}

interface DataTransformation {
  id: string;
  type: 'format' | 'filter' | 'aggregate' | 'join' | 'split' | 'custom';
  config: Record<string, any>;
  order: number;
}

interface SyncExecution {
  id: string;
  mappingId: string;
  mappingName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsError: number;
  errorMessage?: string;
  logs: SyncLog[];
}

interface SyncLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  details?: any;
}

interface IntegrationMetrics {
  totalEndpoints: number;
  activeEndpoints: number;
  totalMappings: number;
  activeMappings: number;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  avgResponseTime: number;
  dataVolume: number;
  syncTrends: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }>;
  };
  endpointsByType: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
  performanceMetrics: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
}

const DataIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'endpoints' | 'mappings' | 'executions'>('dashboard');
  const [endpoints, setEndpoints] = useState<IntegrationEndpoint[]>([]);
  const [mappings, setMappings] = useState<DataMapping[]>([]);
  const [executions, setExecutions] = useState<SyncExecution[]>([]);
  const [metrics, setMetrics] = useState<IntegrationMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<IntegrationEndpoint | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<DataMapping | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<SyncExecution | null>(null);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<'all' | IntegrationEndpoint['type']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | IntegrationEndpoint['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock endpoints
    const mockEndpoints: IntegrationEndpoint[] = [
      {
        id: '1',
        name: 'CRM API',
        description: '客户关系管理系统API接口',
        type: 'rest_api',
        protocol: 'https',
        url: 'https://api.crm.example.com/v1',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        authentication: {
          type: 'bearer',
          credentials: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
        status: 'active',
        lastTested: '2024-01-15T10:30:00Z',
        responseTime: 245,
        successRate: 98.5,
        totalRequests: 15420,
        errorCount: 231,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
      },
      {
        id: '2',
        name: 'ERP Database',
        description: '企业资源规划数据库连接',
        type: 'database',
        protocol: 'tcp',
        url: 'postgresql://erp.example.com:5432/erp_db',
        headers: {},
        authentication: {
          type: 'basic',
          credentials: {
            username: 'erp_user',
            password: '***',
          },
        },
        status: 'active',
        lastTested: '2024-01-15T09:15:00Z',
        responseTime: 89,
        successRate: 99.2,
        totalRequests: 8950,
        errorCount: 72,
        createdAt: '2024-01-02',
        updatedAt: '2024-01-14',
      },
      {
        id: '3',
        name: 'Payment Webhook',
        description: '支付系统回调接口',
        type: 'webhook',
        protocol: 'https',
        url: 'https://api.payment.example.com/webhook',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        authentication: {
          type: 'api_key',
          credentials: {
            key: 'pk_live_...',
          },
        },
        status: 'error',
        lastTested: '2024-01-15T08:45:00Z',
        responseTime: 0,
        successRate: 85.3,
        totalRequests: 3420,
        errorCount: 503,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-15',
      },
    ];

    // Mock mappings
    const mockMappings: DataMapping[] = [
      {
        id: '1',
        name: 'CRM到ERP客户同步',
        description: '将CRM系统的客户数据同步到ERP系统',
        sourceEndpoint: '1',
        targetEndpoint: '2',
        mappingRules: [
          {
            id: '1',
            sourceField: 'customer_id',
            targetField: 'client_id',
            required: true,
          },
          {
            id: '2',
            sourceField: 'customer_name',
            targetField: 'client_name',
            required: true,
          },
          {
            id: '3',
            sourceField: 'email',
            targetField: 'email_address',
            required: false,
            validation: 'email',
          },
        ],
        transformations: [
          {
            id: '1',
            type: 'format',
            config: {
              field: 'phone',
              format: 'international',
            },
            order: 1,
          },
        ],
        schedule: {
          type: 'interval',
          interval: 3600, // 1 hour
        },
        isActive: true,
        lastSync: '2024-01-15T10:00:00Z',
        nextSync: '2024-01-15T11:00:00Z',
        syncCount: 245,
        errorCount: 12,
        dataVolume: 15420,
      },
      {
        id: '2',
        name: '支付数据同步',
        description: '同步支付系统的交易数据',
        sourceEndpoint: '3',
        targetEndpoint: '2',
        mappingRules: [
          {
            id: '1',
            sourceField: 'transaction_id',
            targetField: 'payment_id',
            required: true,
          },
          {
            id: '2',
            sourceField: 'amount',
            targetField: 'payment_amount',
            required: true,
          },
        ],
        transformations: [],
        schedule: {
          type: 'manual',
        },
        isActive: false,
        lastSync: '2024-01-14T16:30:00Z',
        syncCount: 89,
        errorCount: 5,
        dataVolume: 3420,
      },
    ];

    // Mock executions
    const mockExecutions: SyncExecution[] = [
      {
        id: '1',
        mappingId: '1',
        mappingName: 'CRM到ERP客户同步',
        status: 'completed',
        startedAt: '2024-01-15T10:00:00Z',
        completedAt: '2024-01-15T10:05:00Z',
        duration: 300,
        recordsProcessed: 1250,
        recordsSuccess: 1245,
        recordsError: 5,
        logs: [
          {
            id: '1',
            timestamp: '2024-01-15T10:00:00Z',
            level: 'info',
            message: '开始数据同步',
          },
          {
            id: '2',
            timestamp: '2024-01-15T10:05:00Z',
            level: 'info',
            message: '数据同步完成',
          },
        ],
      },
      {
        id: '2',
        mappingId: '1',
        mappingName: 'CRM到ERP客户同步',
        status: 'running',
        startedAt: '2024-01-15T11:00:00Z',
        recordsProcessed: 850,
        recordsSuccess: 850,
        recordsError: 0,
        logs: [
          {
            id: '1',
            timestamp: '2024-01-15T11:00:00Z',
            level: 'info',
            message: '开始数据同步',
          },
        ],
      },
      {
        id: '3',
        mappingId: '2',
        mappingName: '支付数据同步',
        status: 'failed',
        startedAt: '2024-01-14T16:30:00Z',
        completedAt: '2024-01-14T16:32:00Z',
        duration: 120,
        recordsProcessed: 0,
        recordsSuccess: 0,
        recordsError: 0,
        errorMessage: '目标端点连接失败',
        logs: [
          {
            id: '1',
            timestamp: '2024-01-14T16:30:00Z',
            level: 'error',
            message: '连接目标端点失败',
          },
        ],
      },
    ];

    // Mock metrics
    const mockMetrics: IntegrationMetrics = {
      totalEndpoints: 8,
      activeEndpoints: 6,
      totalMappings: 12,
      activeMappings: 9,
      totalSyncs: 1580,
      successfulSyncs: 1495,
      failedSyncs: 85,
      avgResponseTime: 156,
      dataVolume: 2450000,
      syncTrends: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
          {
            data: [220, 280, 245, 310, 290, 265],
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      },
      endpointsByType: {
        labels: ['REST API', 'Database', 'Webhook', 'GraphQL', 'File System'],
        datasets: [
          {
            data: [35, 25, 20, 15, 5],
          },
        ],
      },
      performanceMetrics: {
        labels: ['响应时间', '成功率', '数据量', '错误率'],
        datasets: [
          {
            data: [156, 94.6, 2450, 5.4],
          },
        ],
      },
    };

    setEndpoints(mockEndpoints);
    setMappings(mockMappings);
    setExecutions(mockExecutions);
    setMetrics(mockMetrics);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#9E9E9E';
      case 'error': return '#F44336';
      case 'testing': return '#FF9800';
      case 'running': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'cancelled': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rest_api': return 'cloud-outline';
      case 'graphql': return 'git-network-outline';
      case 'webhook': return 'flash-outline';
      case 'database': return 'server-outline';
      case 'file_system': return 'folder-outline';
      case 'message_queue': return 'chatbubbles-outline';
      default: return 'link-outline';
    }
  };

  const filteredEndpoints = endpoints.filter(endpoint => {
    if (typeFilter !== 'all' && endpoint.type !== typeFilter) return false;
    if (statusFilter !== 'all' && endpoint.status !== statusFilter) return false;
    if (searchQuery && !endpoint.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const onRefresh = () => {
    setRefreshing(true);
    loadMockData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const testEndpoint = (endpointId: string) => {
    Alert.alert(
      '测试端点',
      '确定要测试此端点的连接吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '测试',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setEndpoints(prev => prev.map(endpoint => 
                endpoint.id === endpointId 
                  ? { 
                      ...endpoint, 
                      status: 'active',
                      lastTested: new Date().toISOString(),
                      responseTime: Math.floor(Math.random() * 500) + 50,
                    }
                  : endpoint
              ));
              Alert.alert('成功', '端点测试通过');
            }, 2000);
          },
        },
      ]
    );
  };

  const runSync = (mappingId: string) => {
    Alert.alert(
      '执行同步',
      '确定要手动执行此数据同步吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '执行',
          onPress: () => {
            const mapping = mappings.find(m => m.id === mappingId);
            if (mapping) {
              const newExecution: SyncExecution = {
                id: Date.now().toString(),
                mappingId: mapping.id,
                mappingName: mapping.name,
                status: 'running',
                startedAt: new Date().toISOString(),
                recordsProcessed: 0,
                recordsSuccess: 0,
                recordsError: 0,
                logs: [
                  {
                    id: '1',
                    timestamp: new Date().toISOString(),
                    level: 'info',
                    message: '手动启动数据同步',
                  },
                ],
              };
              setExecutions(prev => [newExecution, ...prev]);
              Alert.alert('成功', '数据同步已开始');
            }
          },
        },
      ]
    );
  };

  const toggleMapping = (mappingId: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.id === mappingId 
        ? { ...mapping, isActive: !mapping.isActive }
        : mapping
    ));
  };

  const renderDashboardTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="link" size={24} color="#2196F3" />
          <Text style={styles.statValue}>{metrics?.totalEndpoints || 0}</Text>
          <Text style={styles.statLabel}>总端点</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{metrics?.activeEndpoints || 0}</Text>
          <Text style={styles.statLabel}>活跃端点</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="git-network" size={24} color="#FF9800" />
          <Text style={styles.statValue}>{metrics?.totalMappings || 0}</Text>
          <Text style={styles.statLabel}>数据映射</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="sync" size={24} color="#9C27B0" />
          <Text style={styles.statValue}>{metrics?.totalSyncs || 0}</Text>
          <Text style={styles.statLabel}>同步次数</Text>
        </View>
      </View>

      {/* Success Rate */}
      <View style={styles.successRateCard}>
        <Text style={styles.cardTitle}>同步成功率</Text>
        <View style={styles.successRateContent}>
          <View style={styles.successRateCircle}>
            <Text style={styles.successRateText}>
              {metrics ? Math.round((metrics.successfulSyncs / metrics.totalSyncs) * 100) : 0}%
            </Text>
          </View>
          <View style={styles.successRateDetails}>
            <View style={styles.successRateItem}>
              <View style={[styles.successRateDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.successRateLabel}>成功: {metrics?.successfulSyncs || 0}</Text>
            </View>
            <View style={styles.successRateItem}>
              <View style={[styles.successRateDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.successRateLabel}>失败: {metrics?.failedSyncs || 0}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics?.avgResponseTime || 0}ms</Text>
          <Text style={styles.metricLabel}>平均响应时间</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {metrics ? (metrics.dataVolume / 1000000).toFixed(1) : 0}M
          </Text>
          <Text style={styles.metricLabel}>数据量</Text>
        </View>
      </View>

      {/* Sync Trends */}
      {metrics?.syncTrends && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>同步趋势</Text>
          <LineChart
            data={metrics.syncTrends}
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

      {/* Endpoints by Type */}
      {metrics?.endpointsByType && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>端点类型分布</Text>
          <PieChart
            data={metrics.endpointsByType.labels.map((label, index) => ({
              name: label,
              population: metrics.endpointsByType.datasets[0].data[index],
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

      {/* Recent Executions */}
      <View style={styles.recentExecutionsCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>最近同步</Text>
          <TouchableOpacity onPress={() => setActiveTab('executions')}>
            <Text style={styles.viewAllText}>查看全部</Text>
          </TouchableOpacity>
        </View>
        {executions.slice(0, 5).map((execution) => (
          <TouchableOpacity
            key={execution.id}
            style={styles.executionItem}
            onPress={() => {
              setSelectedExecution(execution);
              setShowExecutionModal(true);
            }}
          >
            <View style={styles.executionHeader}>
              <View style={styles.executionInfo}>
                <Text style={styles.executionName}>{execution.mappingName}</Text>
                <Text style={styles.executionTime}>
                  {new Date(execution.startedAt).toLocaleString()}
                </Text>
                <Text style={styles.executionRecords}>
                  处理记录: {execution.recordsProcessed}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(execution.status) }]}>
                <Text style={styles.statusText}>{execution.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderEndpointsTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索端点..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>类型:</Text>
            {['all', 'rest_api', 'database', 'webhook', 'graphql'].map((type) => (
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

      {/* Add Endpoint Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>添加端点</Text>
      </TouchableOpacity>

      {/* Endpoints List */}
      {filteredEndpoints.map((endpoint) => (
        <View key={endpoint.id} style={styles.endpointCard}>
          <View style={styles.endpointHeader}>
            <View style={styles.endpointInfo}>
              <View style={styles.endpointTitleRow}>
                <Ionicons
                  name={getTypeIcon(endpoint.type)}
                  size={20}
                  color="#2196F3"
                />
                <Text style={styles.endpointName}>{endpoint.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(endpoint.status) }]}>
                  <Text style={styles.statusText}>{endpoint.status}</Text>
                </View>
              </View>
              <Text style={styles.endpointDescription}>{endpoint.description}</Text>
              <Text style={styles.endpointUrl}>{endpoint.url}</Text>
              <View style={styles.endpointMeta}>
                <Text style={styles.endpointType}>{endpoint.type}</Text>
                <Text style={styles.endpointProtocol}>{endpoint.protocol.toUpperCase()}</Text>
                {endpoint.method && (
                  <Text style={styles.endpointMethod}>{endpoint.method}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.endpointStats}>
            <View style={styles.endpointStat}>
              <Text style={styles.endpointStatValue}>{endpoint.responseTime}ms</Text>
              <Text style={styles.endpointStatLabel}>响应时间</Text>
            </View>
            <View style={styles.endpointStat}>
              <Text style={styles.endpointStatValue}>{endpoint.successRate}%</Text>
              <Text style={styles.endpointStatLabel}>成功率</Text>
            </View>
            <View style={styles.endpointStat}>
              <Text style={styles.endpointStatValue}>{endpoint.totalRequests}</Text>
              <Text style={styles.endpointStatLabel}>总请求</Text>
            </View>
            <View style={styles.endpointStat}>
              <Text style={styles.endpointStatValue}>{endpoint.errorCount}</Text>
              <Text style={styles.endpointStatLabel}>错误数</Text>
            </View>
          </View>

          <View style={styles.endpointFooter}>
            <Text style={styles.lastTested}>
              最后测试: {new Date(endpoint.lastTested).toLocaleString()}
            </Text>
          </View>

          <View style={styles.endpointActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => testEndpoint(endpoint.id)}
            >
              <Ionicons name="flash" size={16} color="#2196F3" />
              <Text style={styles.actionButtonText}>测试</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedEndpoint(endpoint);
                setShowEndpointModal(true);
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

  const renderMappingsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.mappingsHeader}>
        <Text style={styles.sectionTitle}>数据映射</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>创建映射</Text>
        </TouchableOpacity>
      </View>

      {mappings.map((mapping) => (
        <View key={mapping.id} style={styles.mappingCard}>
          <View style={styles.mappingHeader}>
            <View style={styles.mappingInfo}>
              <View style={styles.mappingTitleRow}>
                <Text style={styles.mappingName}>{mapping.name}</Text>
                <Switch
                  value={mapping.isActive}
                  onValueChange={() => toggleMapping(mapping.id)}
                  trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
                  thumbColor={mapping.isActive ? '#fff' : '#f4f3f4'}
                />
              </View>
              <Text style={styles.mappingDescription}>{mapping.description}</Text>
              <View style={styles.mappingFlow}>
                <Text style={styles.mappingEndpoint}>
                  {endpoints.find(e => e.id === mapping.sourceEndpoint)?.name || '源端点'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#666" />
                <Text style={styles.mappingEndpoint}>
                  {endpoints.find(e => e.id === mapping.targetEndpoint)?.name || '目标端点'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.mappingStats}>
            <View style={styles.mappingStat}>
              <Text style={styles.mappingStatValue}>{mapping.syncCount}</Text>
              <Text style={styles.mappingStatLabel}>同步次数</Text>
            </View>
            <View style={styles.mappingStat}>
              <Text style={styles.mappingStatValue}>{mapping.errorCount}</Text>
              <Text style={styles.mappingStatLabel}>错误数</Text>
            </View>
            <View style={styles.mappingStat}>
              <Text style={styles.mappingStatValue}>{mapping.dataVolume}</Text>
              <Text style={styles.mappingStatLabel}>数据量</Text>
            </View>
            <View style={styles.mappingStat}>
              <Text style={styles.mappingStatValue}>{mapping.mappingRules.length}</Text>
              <Text style={styles.mappingStatLabel}>映射规则</Text>
            </View>
          </View>

          <View style={styles.mappingSchedule}>
            <Text style={styles.scheduleLabel}>调度:</Text>
            <Text style={styles.scheduleValue}>
              {mapping.schedule?.type === 'manual' ? '手动' : 
               mapping.schedule?.type === 'interval' ? `每${mapping.schedule.interval}秒` :
               mapping.schedule?.type === 'cron' ? mapping.schedule.value : '未设置'}
            </Text>
            {mapping.nextSync && (
              <Text style={styles.nextSync}>
                下次同步: {new Date(mapping.nextSync).toLocaleString()}
              </Text>
            )}
          </View>

          <View style={styles.mappingActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => runSync(mapping.id)}
            >
              <Ionicons name="sync" size={16} color="#2196F3" />
              <Text style={styles.actionButtonText}>同步</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedMapping(mapping);
                setShowMappingModal(true);
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

  const renderExecutionsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.executionsHeader}>
        <Text style={styles.sectionTitle}>同步执行记录</Text>
      </View>

      {executions.map((execution) => (
        <TouchableOpacity
          key={execution.id}
          style={styles.executionCard}
          onPress={() => {
            setSelectedExecution(execution);
            setShowExecutionModal(true);
          }}
        >
          <View style={styles.executionCardHeader}>
            <View style={styles.executionCardInfo}>
              <Text style={styles.executionCardName}>{execution.mappingName}</Text>
              <Text style={styles.executionCardId}>ID: {execution.id}</Text>
              <Text style={styles.executionCardTime}>
                开始: {new Date(execution.startedAt).toLocaleString()}
              </Text>
              {execution.completedAt && (
                <Text style={styles.executionCardTime}>
                  完成: {new Date(execution.completedAt).toLocaleString()}
                </Text>
              )}
            </View>
            <View style={styles.executionCardBadges}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(execution.status) }]}>
                <Text style={styles.statusText}>{execution.status}</Text>
              </View>
              {execution.duration && (
                <Text style={styles.durationText}>{execution.duration}s</Text>
              )}
            </View>
          </View>

          <View style={styles.executionProgress}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>处理记录</Text>
              <Text style={styles.progressValue}>{execution.recordsProcessed}</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>成功</Text>
              <Text style={[styles.progressValue, { color: '#4CAF50' }]}>
                {execution.recordsSuccess}
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>错误</Text>
              <Text style={[styles.progressValue, { color: '#F44336' }]}>
                {execution.recordsError}
              </Text>
            </View>
          </View>

          {execution.errorMessage && (
            <Text style={styles.errorMessage}>{execution.errorMessage}</Text>
          )}

          <View style={styles.executionFooter}>
            <Text style={styles.logsCount}>{execution.logs.length} 条日志</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>数据集成</Text>
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'dashboard', label: '仪表板', icon: 'speedometer-outline' },
          { key: 'endpoints', label: '端点', icon: 'link-outline' },
          { key: 'mappings', label: '映射', icon: 'git-network-outline' },
          { key: 'executions', label: '执行记录', icon: 'sync-outline' },
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
        {activeTab === 'endpoints' && renderEndpointsTab()}
        {activeTab === 'mappings' && renderMappingsTab()}
        {activeTab === 'executions' && renderExecutionsTab()}
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
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  metricCard: {
    flex: 1,
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
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
  recentExecutionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
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
  executionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  executionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  executionInfo: {
    flex: 1,
  },
  executionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  executionTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  executionRecords: {
    fontSize: 12,
    color: '#666',
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
  endpointCard: {
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
  endpointHeader: {
    marginBottom: 15,
  },
  endpointInfo: {
    flex: 1,
  },
  endpointTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  endpointName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  endpointDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  endpointUrl: {
    fontSize: 12,
    color: '#2196F3',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  endpointMeta: {
    flexDirection: 'row',
    gap: 15,
  },
  endpointType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  endpointProtocol: {
    fontSize: 12,
    color: '#666',
  },
  endpointMethod: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  endpointStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 15,
  },
  endpointStat: {
    alignItems: 'center',
  },
  endpointStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  endpointStatLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  endpointFooter: {
    marginBottom: 15,
  },
  lastTested: {
    fontSize: 12,
    color: '#666',
  },
  endpointActions: {
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
  mappingsHeader: {
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
  mappingCard: {
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
  mappingHeader: {
    marginBottom: 15,
  },
  mappingInfo: {
    flex: 1,
  },
  mappingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mappingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  mappingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  mappingFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mappingEndpoint: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  mappingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 15,
  },
  mappingStat: {
    alignItems: 'center',
  },
  mappingStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  mappingStatLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  mappingSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  scheduleLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  scheduleValue: {
    fontSize: 12,
    color: '#333',
  },
  nextSync: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 'auto',
  },
  mappingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  executionsHeader: {
    marginBottom: 15,
  },
  executionCard: {
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
  executionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  executionCardInfo: {
    flex: 1,
  },
  executionCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  executionCardId: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  executionCardTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  executionCardBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#666',
  },
  executionProgress: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 10,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  errorMessage: {
    fontSize: 12,
    color: '#F44336',
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  executionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  logsCount: {
    fontSize: 12,
    color: '#666',
  },
});

export default DataIntegration;