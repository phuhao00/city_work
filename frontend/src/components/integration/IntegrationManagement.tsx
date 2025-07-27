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

interface Integration {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'webhook' | 'service';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  description: string;
  endpoint?: string;
  lastSync: string;
  dataVolume: number;
  errorCount: number;
  successRate: number;
  config: {
    authentication: string;
    frequency: string;
    timeout: number;
    retries: number;
  };
}

interface DataMapping {
  id: string;
  integrationId: string;
  sourceField: string;
  targetField: string;
  transformation?: string;
  validation?: string;
  isRequired: boolean;
}

interface SyncLog {
  id: string;
  integrationId: string;
  integrationName: string;
  status: 'success' | 'failed' | 'partial';
  startTime: string;
  endTime: string;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsFailed: number;
  errorMessage?: string;
  duration: number;
}

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  description: string;
  status: 'active' | 'inactive' | 'deprecated';
  version: string;
  responseTime: number;
  requestCount: number;
  errorRate: number;
  lastUsed: string;
}

const IntegrationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'integrations' | 'mappings' | 'logs' | 'apis' | 'analytics'>('integrations');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [mappings, setMappings] = useState<DataMapping[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([]);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<DataMapping | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Mock data
  useEffect(() => {
    const mockIntegrations: Integration[] = [
      {
        id: '1',
        name: 'ERP系统集成',
        type: 'api',
        status: 'connected',
        description: '与企业ERP系统的数据同步集成',
        endpoint: 'https://erp.company.com/api/v1',
        lastSync: '2024-01-30 15:30:00',
        dataVolume: 15420,
        errorCount: 2,
        successRate: 98.7,
        config: {
          authentication: 'OAuth 2.0',
          frequency: '每小时',
          timeout: 30,
          retries: 3,
        },
      },
      {
        id: '2',
        name: 'CRM数据库连接',
        type: 'database',
        status: 'connected',
        description: '客户关系管理系统数据库直连',
        endpoint: 'mysql://crm-db.company.com:3306',
        lastSync: '2024-01-30 16:00:00',
        dataVolume: 8750,
        errorCount: 0,
        successRate: 100,
        config: {
          authentication: '数据库认证',
          frequency: '每30分钟',
          timeout: 60,
          retries: 2,
        },
      },
      {
        id: '3',
        name: '财务系统Webhook',
        type: 'webhook',
        status: 'error',
        description: '财务系统实时数据推送',
        endpoint: 'https://finance.company.com/webhook',
        lastSync: '2024-01-30 14:15:00',
        dataVolume: 3200,
        errorCount: 15,
        successRate: 85.2,
        config: {
          authentication: 'API Key',
          frequency: '实时',
          timeout: 15,
          retries: 5,
        },
      },
      {
        id: '4',
        name: '文件服务器同步',
        type: 'file',
        status: 'connected',
        description: '文档和附件文件同步',
        endpoint: 'ftp://files.company.com',
        lastSync: '2024-01-30 12:00:00',
        dataVolume: 2100,
        errorCount: 1,
        successRate: 99.5,
        config: {
          authentication: 'FTP认证',
          frequency: '每日',
          timeout: 120,
          retries: 1,
        },
      },
    ];

    const mockMappings: DataMapping[] = [
      {
        id: '1',
        integrationId: '1',
        sourceField: 'employee_id',
        targetField: 'user_id',
        transformation: 'String',
        validation: 'Required',
        isRequired: true,
      },
      {
        id: '2',
        integrationId: '1',
        sourceField: 'employee_name',
        targetField: 'full_name',
        transformation: 'Trim + Title Case',
        validation: 'Length > 2',
        isRequired: true,
      },
      {
        id: '3',
        integrationId: '2',
        sourceField: 'customer_email',
        targetField: 'email',
        transformation: 'Lowercase',
        validation: 'Email Format',
        isRequired: true,
      },
      {
        id: '4',
        integrationId: '2',
        sourceField: 'customer_phone',
        targetField: 'phone',
        transformation: 'Format Phone',
        validation: 'Phone Pattern',
        isRequired: false,
      },
    ];

    const mockSyncLogs: SyncLog[] = [
      {
        id: '1',
        integrationId: '1',
        integrationName: 'ERP系统集成',
        status: 'success',
        startTime: '2024-01-30 15:30:00',
        endTime: '2024-01-30 15:32:15',
        recordsProcessed: 1250,
        recordsSuccess: 1248,
        recordsFailed: 2,
        duration: 135,
      },
      {
        id: '2',
        integrationId: '2',
        integrationName: 'CRM数据库连接',
        status: 'success',
        startTime: '2024-01-30 16:00:00',
        endTime: '2024-01-30 16:01:30',
        recordsProcessed: 875,
        recordsSuccess: 875,
        recordsFailed: 0,
        duration: 90,
      },
      {
        id: '3',
        integrationId: '3',
        integrationName: '财务系统Webhook',
        status: 'failed',
        startTime: '2024-01-30 14:15:00',
        endTime: '2024-01-30 14:15:45',
        recordsProcessed: 0,
        recordsSuccess: 0,
        recordsFailed: 0,
        errorMessage: '连接超时：无法访问财务系统API',
        duration: 45,
      },
      {
        id: '4',
        integrationId: '4',
        integrationName: '文件服务器同步',
        status: 'partial',
        startTime: '2024-01-30 12:00:00',
        endTime: '2024-01-30 12:05:30',
        recordsProcessed: 210,
        recordsSuccess: 209,
        recordsFailed: 1,
        errorMessage: '1个文件权限不足',
        duration: 330,
      },
    ];

    const mockApiEndpoints: APIEndpoint[] = [
      {
        id: '1',
        name: '用户信息查询',
        method: 'GET',
        url: '/api/v1/users/{id}',
        description: '根据用户ID获取用户详细信息',
        status: 'active',
        version: 'v1.2',
        responseTime: 120,
        requestCount: 15420,
        errorRate: 0.5,
        lastUsed: '2024-01-30 16:45:00',
      },
      {
        id: '2',
        name: '创建工作订单',
        method: 'POST',
        url: '/api/v1/work-orders',
        description: '创建新的工作订单',
        status: 'active',
        version: 'v1.1',
        responseTime: 250,
        requestCount: 8750,
        errorRate: 1.2,
        lastUsed: '2024-01-30 16:30:00',
      },
      {
        id: '3',
        name: '更新项目状态',
        method: 'PUT',
        url: '/api/v1/projects/{id}/status',
        description: '更新项目的状态信息',
        status: 'active',
        version: 'v1.0',
        responseTime: 180,
        requestCount: 3200,
        errorRate: 2.1,
        lastUsed: '2024-01-30 15:20:00',
      },
      {
        id: '4',
        name: '删除临时文件',
        method: 'DELETE',
        url: '/api/v1/files/temp/{id}',
        description: '删除临时上传的文件',
        status: 'deprecated',
        version: 'v0.9',
        responseTime: 95,
        requestCount: 450,
        errorRate: 0.2,
        lastUsed: '2024-01-25 10:30:00',
      },
    ];

    setIntegrations(mockIntegrations);
    setMappings(mockMappings);
    setSyncLogs(mockSyncLogs);
    setApiEndpoints(mockApiEndpoints);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': case 'success': case 'active': return '#34C759';
      case 'pending': return '#FF9500';
      case 'disconnected': case 'inactive': case 'deprecated': return '#8E8E93';
      case 'error': case 'failed': return '#FF3B30';
      case 'partial': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api': return 'cloud-outline';
      case 'database': return 'server-outline';
      case 'file': return 'folder-outline';
      case 'webhook': return 'flash-outline';
      case 'service': return 'settings-outline';
      default: return 'link-outline';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return '#34C759';
      case 'POST': return '#007AFF';
      case 'PUT': return '#FF9500';
      case 'DELETE': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || integration.type === filterType;
    return matchesSearch && matchesType;
  });

  const renderAnalytics = () => {
    const integrationStatusData = {
      labels: ['已连接', '错误', '断开', '待处理'],
      datasets: [{
        data: [
          integrations.filter(i => i.status === 'connected').length,
          integrations.filter(i => i.status === 'error').length,
          integrations.filter(i => i.status === 'disconnected').length,
          integrations.filter(i => i.status === 'pending').length,
        ]
      }]
    };

    const dataVolumeData = {
      labels: ['ERP', 'CRM', 'Webhook', '文件'],
      datasets: [{
        data: integrations.map(i => i.dataVolume),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2
      }]
    };

    const apiUsageData = {
      labels: ['用户查询', '创建订单', '更新状态', '删除文件'],
      datasets: [{
        data: apiEndpoints.map(api => api.requestCount)
      }]
    };

    return (
      <ScrollView style={styles.analyticsContainer} showsVerticalScrollIndicator={false}>
        {/* Metrics Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="link" size={24} color="#007AFF" />
            <Text style={styles.metricNumber}>{integrations.length}</Text>
            <Text style={styles.metricLabel}>总集成数</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            <Text style={styles.metricNumber}>{integrations.filter(i => i.status === 'connected').length}</Text>
            <Text style={styles.metricLabel}>活跃连接</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="cloud-download" size={24} color="#FF9500" />
            <Text style={styles.metricNumber}>{integrations.reduce((sum, i) => sum + i.dataVolume, 0).toLocaleString()}</Text>
            <Text style={styles.metricLabel}>数据量</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="trending-up" size={24} color="#34C759" />
            <Text style={styles.metricNumber}>{Math.round(integrations.reduce((sum, i) => sum + i.successRate, 0) / integrations.length)}%</Text>
            <Text style={styles.metricLabel}>平均成功率</Text>
          </View>
        </View>

        {/* Integration Status Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>集成状态分布</Text>
          <PieChart
            data={[
              { name: '已连接', population: integrations.filter(i => i.status === 'connected').length, color: '#34C759', legendFontColor: '#333', legendFontSize: 12 },
              { name: '错误', population: integrations.filter(i => i.status === 'error').length, color: '#FF3B30', legendFontColor: '#333', legendFontSize: 12 },
              { name: '断开', population: integrations.filter(i => i.status === 'disconnected').length, color: '#8E8E93', legendFontColor: '#333', legendFontSize: 12 },
              { name: '待处理', population: integrations.filter(i => i.status === 'pending').length, color: '#FF9500', legendFontColor: '#333', legendFontSize: 12 },
            ]}
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

        {/* Data Volume Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>数据量趋势</Text>
          <BarChart
            data={dataVolumeData}
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

        {/* API Usage Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>API使用统计</Text>
          <BarChart
            data={apiUsageData}
            width={width - 60}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
            }}
            style={styles.chart}
          />
        </View>
      </ScrollView>
    );
  };

  const renderIntegration = ({ item }: { item: Integration }) => (
    <TouchableOpacity
      style={styles.integrationCard}
      onPress={() => {
        setSelectedIntegration(item);
        setShowIntegrationModal(true);
      }}
    >
      <View style={styles.integrationHeader}>
        <View style={styles.integrationInfo}>
          <Ionicons name={getTypeIcon(item.type)} size={20} color="#007AFF" />
          <Text style={styles.integrationName}>{item.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>
            {item.status === 'connected' ? '已连接' : 
             item.status === 'error' ? '错误' : 
             item.status === 'disconnected' ? '断开' : '待处理'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.integrationDescription}>{item.description}</Text>
      
      {item.endpoint && (
        <View style={styles.endpointContainer}>
          <Ionicons name="link-outline" size={14} color="#666" />
          <Text style={styles.endpointText}>{item.endpoint}</Text>
        </View>
      )}
      
      <View style={styles.integrationStats}>
        <View style={styles.statItem}>
          <Ionicons name="cloud-download-outline" size={14} color="#666" />
          <Text style={styles.statText}>{item.dataVolume.toLocaleString()} 条记录</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-outline" size={14} color="#666" />
          <Text style={styles.statText}>成功率 {item.successRate}%</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="warning-outline" size={14} color="#666" />
          <Text style={styles.statText}>{item.errorCount} 个错误</Text>
        </View>
      </View>
      
      <View style={styles.integrationFooter}>
        <Text style={styles.lastSyncText}>最后同步: {item.lastSync}</Text>
        <Text style={styles.frequencyText}>频率: {item.config.frequency}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMapping = ({ item }: { item: DataMapping }) => {
    const integration = integrations.find(i => i.id === item.integrationId);
    return (
      <TouchableOpacity
        style={styles.mappingCard}
        onPress={() => {
          setSelectedMapping(item);
          setShowMappingModal(true);
        }}
      >
        <View style={styles.mappingHeader}>
          <Text style={styles.mappingIntegration}>{integration?.name}</Text>
          {item.isRequired && (
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>必填</Text>
            </View>
          )}
        </View>
        
        <View style={styles.mappingFlow}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>源字段</Text>
            <Text style={styles.fieldValue}>{item.sourceField}</Text>
          </View>
          
          <Ionicons name="arrow-forward" size={20} color="#007AFF" />
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>目标字段</Text>
            <Text style={styles.fieldValue}>{item.targetField}</Text>
          </View>
        </View>
        
        {item.transformation && (
          <View style={styles.transformationContainer}>
            <Ionicons name="swap-horizontal-outline" size={14} color="#666" />
            <Text style={styles.transformationText}>转换: {item.transformation}</Text>
          </View>
        )}
        
        {item.validation && (
          <View style={styles.validationContainer}>
            <Ionicons name="checkmark-circle-outline" size={14} color="#666" />
            <Text style={styles.validationText}>验证: {item.validation}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSyncLog = ({ item }: { item: SyncLog }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <Text style={styles.logIntegrationName}>{item.integrationName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>
            {item.status === 'success' ? '成功' : 
             item.status === 'failed' ? '失败' : '部分成功'}
          </Text>
        </View>
      </View>
      
      <View style={styles.logDetails}>
        <View style={styles.logDetailRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.logDetailText}>
            {item.startTime} - {item.endTime} ({item.duration}秒)
          </Text>
        </View>
        
        <View style={styles.logDetailRow}>
          <Ionicons name="bar-chart-outline" size={14} color="#666" />
          <Text style={styles.logDetailText}>
            处理 {item.recordsProcessed} 条，成功 {item.recordsSuccess} 条，失败 {item.recordsFailed} 条
          </Text>
        </View>
      </View>
      
      {item.errorMessage && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={14} color="#FF3B30" />
          <Text style={styles.errorText}>{item.errorMessage}</Text>
        </View>
      )}
    </View>
  );

  const renderApiEndpoint = ({ item }: { item: APIEndpoint }) => (
    <View style={styles.apiCard}>
      <View style={styles.apiHeader}>
        <View style={styles.apiInfo}>
          <View style={[styles.methodBadge, { backgroundColor: getMethodColor(item.method) }]}>
            <Text style={styles.methodText}>{item.method}</Text>
          </View>
          <Text style={styles.apiName}>{item.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>
            {item.status === 'active' ? '活跃' : 
             item.status === 'inactive' ? '停用' : '已弃用'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.apiUrl}>{item.url}</Text>
      <Text style={styles.apiDescription}>{item.description}</Text>
      
      <View style={styles.apiStats}>
        <View style={styles.statItem}>
          <Ionicons name="speedometer-outline" size={14} color="#666" />
          <Text style={styles.statText}>{item.responseTime}ms</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="bar-chart-outline" size={14} color="#666" />
          <Text style={styles.statText}>{item.requestCount.toLocaleString()} 请求</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="warning-outline" size={14} color="#666" />
          <Text style={styles.statText}>错误率 {item.errorRate}%</Text>
        </View>
      </View>
      
      <View style={styles.apiFooter}>
        <Text style={styles.versionText}>版本: {item.version}</Text>
        <Text style={styles.lastUsedText}>最后使用: {item.lastUsed}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>集成管理</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'integrations' && styles.activeTab]}
          onPress={() => setActiveTab('integrations')}
        >
          <Text style={[styles.tabText, activeTab === 'integrations' && styles.activeTabText]}>
            集成
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mappings' && styles.activeTab]}
          onPress={() => setActiveTab('mappings')}
        >
          <Text style={[styles.tabText, activeTab === 'mappings' && styles.activeTabText]}>
            映射
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
          style={[styles.tab, activeTab === 'apis' && styles.activeTab]}
          onPress={() => setActiveTab('apis')}
        >
          <Text style={[styles.tabText, activeTab === 'apis' && styles.activeTabText]}>
            API
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

      {activeTab === 'integrations' && (
        <View style={styles.contentContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索集成..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterButton, filterType === 'all' && styles.activeFilter]}
                onPress={() => setFilterType('all')}
              >
                <Text style={[styles.filterText, filterType === 'all' && styles.activeFilterText]}>
                  全部
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filterType === 'api' && styles.activeFilter]}
                onPress={() => setFilterType('api')}
              >
                <Text style={[styles.filterText, filterType === 'api' && styles.activeFilterText]}>
                  API
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filterType === 'database' && styles.activeFilter]}
                onPress={() => setFilterType('database')}
              >
                <Text style={[styles.filterText, filterType === 'database' && styles.activeFilterText]}>
                  数据库
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <FlatList
            data={filteredIntegrations}
            renderItem={renderIntegration}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}

      {activeTab === 'mappings' && (
        <FlatList
          data={mappings}
          renderItem={renderMapping}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'logs' && (
        <FlatList
          data={syncLogs}
          renderItem={renderSyncLog}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'apis' && (
        <FlatList
          data={apiEndpoints}
          renderItem={renderApiEndpoint}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'analytics' && renderAnalytics()}

      {/* Integration Detail Modal */}
      <Modal
        visible={showIntegrationModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowIntegrationModal(false)}>
              <Text style={styles.closeButton}>关闭</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>集成详情</Text>
            <TouchableOpacity>
              <Text style={styles.actionButton}>编辑</Text>
            </TouchableOpacity>
          </View>
          
          {selectedIntegration && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.integrationDetailContainer}>
                <Text style={styles.integrationDetailTitle}>{selectedIntegration.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedIntegration.status) }]}>
                  <Text style={styles.badgeText}>
                    {selectedIntegration.status === 'connected' ? '已连接' : 
                     selectedIntegration.status === 'error' ? '错误' : 
                     selectedIntegration.status === 'disconnected' ? '断开' : '待处理'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.integrationDetailDescription}>{selectedIntegration.description}</Text>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>连接信息</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>类型:</Text>
                  <Text style={styles.detailValue}>
                    {selectedIntegration.type === 'api' ? 'API接口' : 
                     selectedIntegration.type === 'database' ? '数据库' : 
                     selectedIntegration.type === 'file' ? '文件系统' : 
                     selectedIntegration.type === 'webhook' ? 'Webhook' : '服务'}
                  </Text>
                </View>
                {selectedIntegration.endpoint && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>端点:</Text>
                    <Text style={styles.detailValue}>{selectedIntegration.endpoint}</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>最后同步:</Text>
                  <Text style={styles.detailValue}>{selectedIntegration.lastSync}</Text>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>配置信息</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>认证方式:</Text>
                  <Text style={styles.detailValue}>{selectedIntegration.config.authentication}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>同步频率:</Text>
                  <Text style={styles.detailValue}>{selectedIntegration.config.frequency}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>超时时间:</Text>
                  <Text style={styles.detailValue}>{selectedIntegration.config.timeout}秒</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>重试次数:</Text>
                  <Text style={styles.detailValue}>{selectedIntegration.config.retries}次</Text>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>统计信息</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{selectedIntegration.dataVolume.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>数据量</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{selectedIntegration.successRate}%</Text>
                    <Text style={styles.statLabel}>成功率</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{selectedIntegration.errorCount}</Text>
                    <Text style={styles.statLabel}>错误数</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Mapping Detail Modal */}
      <Modal
        visible={showMappingModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMappingModal(false)}>
              <Text style={styles.closeButton}>关闭</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>映射详情</Text>
            <TouchableOpacity>
              <Text style={styles.actionButton}>编辑</Text>
            </TouchableOpacity>
          </View>
          
          {selectedMapping && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.mappingDetailContainer}>
                <Text style={styles.mappingDetailTitle}>字段映射</Text>
                {selectedMapping.isRequired && (
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>必填</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>映射信息</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>源字段:</Text>
                  <Text style={styles.detailValue}>{selectedMapping.sourceField}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>目标字段:</Text>
                  <Text style={styles.detailValue}>{selectedMapping.targetField}</Text>
                </View>
                {selectedMapping.transformation && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>数据转换:</Text>
                    <Text style={styles.detailValue}>{selectedMapping.transformation}</Text>
                  </View>
                )}
                {selectedMapping.validation && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>数据验证:</Text>
                    <Text style={styles.detailValue}>{selectedMapping.validation}</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>是否必填:</Text>
                  <Text style={styles.detailValue}>{selectedMapping.isRequired ? '是' : '否'}</Text>
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
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  integrationCard: {
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
  integrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  integrationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  integrationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  integrationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  endpointContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
  },
  endpointText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'monospace',
  },
  integrationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  integrationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#666',
  },
  frequencyText: {
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
  mappingCard: {
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
  mappingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  mappingIntegration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
  },
  mappingFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  fieldContainer: {
    flex: 1,
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  transformationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
  },
  transformationText: {
    fontSize: 12,
    color: '#1976d2',
    marginLeft: 8,
  },
  validationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 8,
  },
  validationText: {
    fontSize: 12,
    color: '#2e7d32',
    marginLeft: 8,
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
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  logIntegrationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  logDetails: {
    marginBottom: 10,
  },
  logDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginLeft: 8,
    flex: 1,
  },
  apiCard: {
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
  apiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  apiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  methodText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  apiName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  apiUrl: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  apiDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  apiStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  apiFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  versionText: {
    fontSize: 12,
    color: '#666',
  },
  lastUsedText: {
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
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  integrationDetailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  integrationDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 15,
  },
  integrationDetailDescription: {
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  mappingDetailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  mappingDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 15,
  },
});

export default IntegrationManagement;