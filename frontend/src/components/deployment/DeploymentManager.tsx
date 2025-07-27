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
  FlatList,
  Switch,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface DeploymentEnvironment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production' | 'testing';
  status: 'active' | 'inactive' | 'deploying' | 'error';
  url: string;
  version: string;
  lastDeployment: string;
  health: 'healthy' | 'warning' | 'critical';
  resources: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

interface DeploymentHistory {
  id: string;
  environment: string;
  version: string;
  status: 'success' | 'failed' | 'in_progress' | 'rolled_back';
  deployedBy: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  changes: string[];
  rollbackAvailable: boolean;
}

interface Pipeline {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  stages: PipelineStage[];
  lastRun: string;
  successRate: number;
  averageDuration: number;
}

interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  duration?: number;
  logs?: string[];
}

interface ReleaseNote {
  id: string;
  version: string;
  title: string;
  description: string;
  features: string[];
  bugFixes: string[];
  breakingChanges: string[];
  releaseDate: string;
  author: string;
}

const DeploymentManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'environments' | 'history' | 'pipelines' | 'releases'>('environments');
  const [environments, setEnvironments] = useState<DeploymentEnvironment[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentHistory[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [releases, setReleases] = useState<ReleaseNote[]>([]);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<DeploymentEnvironment | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data
  useEffect(() => {
    const mockEnvironments: DeploymentEnvironment[] = [
      {
        id: '1',
        name: '开发环境',
        type: 'development',
        status: 'active',
        url: 'https://dev.citywork.com',
        version: 'v1.2.3-dev',
        lastDeployment: '2024-01-30 14:30:00',
        health: 'healthy',
        resources: { cpu: 45, memory: 60, storage: 35 },
      },
      {
        id: '2',
        name: '测试环境',
        type: 'staging',
        status: 'active',
        url: 'https://staging.citywork.com',
        version: 'v1.2.2',
        lastDeployment: '2024-01-30 12:00:00',
        health: 'warning',
        resources: { cpu: 70, memory: 80, storage: 45 },
      },
      {
        id: '3',
        name: '生产环境',
        type: 'production',
        status: 'active',
        url: 'https://citywork.com',
        version: 'v1.2.1',
        lastDeployment: '2024-01-29 09:00:00',
        health: 'healthy',
        resources: { cpu: 55, memory: 65, storage: 70 },
      },
      {
        id: '4',
        name: '性能测试环境',
        type: 'testing',
        status: 'deploying',
        url: 'https://perf.citywork.com',
        version: 'v1.2.3-rc1',
        lastDeployment: '2024-01-30 15:00:00',
        health: 'healthy',
        resources: { cpu: 30, memory: 40, storage: 25 },
      },
    ];

    const mockHistory: DeploymentHistory[] = [
      {
        id: '1',
        environment: '生产环境',
        version: 'v1.2.1',
        status: 'success',
        deployedBy: '张三',
        startTime: '2024-01-29 09:00:00',
        endTime: '2024-01-29 09:15:00',
        duration: 15,
        changes: ['修复用户登录问题', '优化数据库查询性能', '更新UI组件'],
        rollbackAvailable: true,
      },
      {
        id: '2',
        environment: '测试环境',
        version: 'v1.2.2',
        status: 'success',
        deployedBy: '李四',
        startTime: '2024-01-30 12:00:00',
        endTime: '2024-01-30 12:08:00',
        duration: 8,
        changes: ['新增报告功能', '修复API响应问题'],
        rollbackAvailable: true,
      },
      {
        id: '3',
        environment: '开发环境',
        version: 'v1.2.3-dev',
        status: 'in_progress',
        deployedBy: '王五',
        startTime: '2024-01-30 14:30:00',
        changes: ['实验性功能测试', '性能优化'],
        rollbackAvailable: false,
      },
      {
        id: '4',
        environment: '测试环境',
        version: 'v1.2.0',
        status: 'failed',
        deployedBy: '赵六',
        startTime: '2024-01-28 16:00:00',
        endTime: '2024-01-28 16:05:00',
        duration: 5,
        changes: ['数据库迁移', '新功能发布'],
        rollbackAvailable: false,
      },
    ];

    const mockPipelines: Pipeline[] = [
      {
        id: '1',
        name: 'CI/CD主流水线',
        status: 'success',
        stages: [
          { id: '1', name: '代码检查', status: 'success', duration: 120 },
          { id: '2', name: '单元测试', status: 'success', duration: 300 },
          { id: '3', name: '构建', status: 'success', duration: 180 },
          { id: '4', name: '部署到测试环境', status: 'success', duration: 90 },
        ],
        lastRun: '2024-01-30 14:30:00',
        successRate: 92,
        averageDuration: 690,
      },
      {
        id: '2',
        name: '生产发布流水线',
        status: 'idle',
        stages: [
          { id: '1', name: '安全扫描', status: 'pending' },
          { id: '2', name: '性能测试', status: 'pending' },
          { id: '3', name: '部署到生产环境', status: 'pending' },
          { id: '4', name: '健康检查', status: 'pending' },
        ],
        lastRun: '2024-01-29 09:00:00',
        successRate: 98,
        averageDuration: 1200,
      },
      {
        id: '3',
        name: '热修复流水线',
        status: 'running',
        stages: [
          { id: '1', name: '快速测试', status: 'success', duration: 60 },
          { id: '2', name: '构建补丁', status: 'running' },
          { id: '3', name: '部署补丁', status: 'pending' },
        ],
        lastRun: '2024-01-30 15:00:00',
        successRate: 85,
        averageDuration: 300,
      },
    ];

    const mockReleases: ReleaseNote[] = [
      {
        id: '1',
        version: 'v1.2.1',
        title: '性能优化与Bug修复',
        description: '本次发布主要专注于系统性能优化和关键Bug修复',
        features: [
          '新增数据导出功能',
          '优化搜索算法',
          '改进用户界面响应速度',
        ],
        bugFixes: [
          '修复用户登录偶尔失败的问题',
          '解决数据同步延迟问题',
          '修复移动端显示异常',
        ],
        breakingChanges: [],
        releaseDate: '2024-01-29',
        author: '开发团队',
      },
      {
        id: '2',
        version: 'v1.2.0',
        title: '重大功能更新',
        description: '引入全新的报告系统和工作流管理功能',
        features: [
          '全新报告生成器',
          '工作流自动化',
          '高级搜索功能',
          '实时通知系统',
        ],
        bugFixes: [
          '修复文件上传问题',
          '优化数据库查询性能',
        ],
        breakingChanges: [
          'API v1已弃用，请使用API v2',
          '旧版报告格式不再支持',
        ],
        releaseDate: '2024-01-15',
        author: '产品团队',
      },
    ];

    setEnvironments(mockEnvironments);
    setDeploymentHistory(mockHistory);
    setPipelines(mockPipelines);
    setReleases(mockReleases);
  }, []);

  const getEnvironmentTypeColor = (type: string) => {
    switch (type) {
      case 'production': return '#FF3B30';
      case 'staging': return '#FF9500';
      case 'development': return '#34C759';
      case 'testing': return '#007AFF';
      default: return '#8E8E93';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'success': case 'healthy': return '#34C759';
      case 'deploying': case 'in_progress': case 'running': return '#007AFF';
      case 'failed': case 'error': case 'critical': return '#FF3B30';
      case 'warning': return '#FF9500';
      case 'inactive': case 'idle': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const handleDeploy = (environment: DeploymentEnvironment) => {
    setSelectedEnvironment(environment);
    setShowDeployModal(true);
  };

  const handleRollback = (deploymentId: string) => {
    Alert.alert(
      '确认回滚',
      '确定要回滚到上一个版本吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确认', onPress: () => {
          setDeploymentHistory(prev => prev.map(deployment =>
            deployment.id === deploymentId
              ? { ...deployment, status: 'rolled_back' }
              : deployment
          ));
        }}
      ]
    );
  };

  const handleRunPipeline = (pipelineId: string) => {
    setPipelines(prev => prev.map(pipeline =>
      pipeline.id === pipelineId
        ? { ...pipeline, status: 'running' }
        : pipeline
    ));
  };

  const renderEnvironmentCard = ({ item }: { item: DeploymentEnvironment }) => (
    <View style={styles.environmentCard}>
      <View style={styles.environmentHeader}>
        <View style={styles.environmentInfo}>
          <Text style={styles.environmentName}>{item.name}</Text>
          <View style={[styles.typeBadge, { backgroundColor: getEnvironmentTypeColor(item.type) }]}>
            <Text style={styles.typeText}>
              {item.type === 'production' ? '生产' : 
               item.type === 'staging' ? '测试' : 
               item.type === 'development' ? '开发' : '性能测试'}
            </Text>
          </View>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
      </View>
      
      <View style={styles.environmentDetails}>
        <Text style={styles.versionText}>版本: {item.version}</Text>
        <Text style={styles.urlText}>{item.url}</Text>
        <Text style={styles.lastDeployment}>最后部署: {item.lastDeployment}</Text>
      </View>
      
      <View style={styles.resourceMetrics}>
        <View style={styles.resourceItem}>
          <Text style={styles.resourceLabel}>CPU</Text>
          <View style={styles.resourceBar}>
            <View style={[styles.resourceFill, { width: `${item.resources.cpu}%`, backgroundColor: item.resources.cpu > 80 ? '#FF3B30' : '#34C759' }]} />
          </View>
          <Text style={styles.resourceValue}>{item.resources.cpu}%</Text>
        </View>
        <View style={styles.resourceItem}>
          <Text style={styles.resourceLabel}>内存</Text>
          <View style={styles.resourceBar}>
            <View style={[styles.resourceFill, { width: `${item.resources.memory}%`, backgroundColor: item.resources.memory > 80 ? '#FF3B30' : '#34C759' }]} />
          </View>
          <Text style={styles.resourceValue}>{item.resources.memory}%</Text>
        </View>
        <View style={styles.resourceItem}>
          <Text style={styles.resourceLabel}>存储</Text>
          <View style={styles.resourceBar}>
            <View style={[styles.resourceFill, { width: `${item.resources.storage}%`, backgroundColor: item.resources.storage > 80 ? '#FF3B30' : '#34C759' }]} />
          </View>
          <Text style={styles.resourceValue}>{item.resources.storage}%</Text>
        </View>
      </View>
      
      <View style={styles.environmentActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.deployButton]}
          onPress={() => handleDeploy(item)}
          disabled={item.status === 'deploying'}
        >
          <Ionicons name="rocket-outline" size={16} color="#fff" />
          <Text style={styles.deployButtonText}>
            {item.status === 'deploying' ? '部署中' : '部署'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.monitorButton]}>
          <Ionicons name="analytics-outline" size={16} color="#007AFF" />
          <Text style={styles.monitorButtonText}>监控</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDeploymentHistory = ({ item }: { item: DeploymentHistory }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.historyInfo}>
          <Text style={styles.historyEnvironment}>{item.environment}</Text>
          <Text style={styles.historyVersion}>{item.version}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status === 'success' ? '成功' : 
             item.status === 'failed' ? '失败' : 
             item.status === 'in_progress' ? '进行中' : '已回滚'}
          </Text>
        </View>
      </View>
      
      <View style={styles.historyDetails}>
        <Text style={styles.deployedBy}>部署人: {item.deployedBy}</Text>
        <Text style={styles.deployTime}>开始时间: {item.startTime}</Text>
        {item.endTime && (
          <Text style={styles.deployTime}>结束时间: {item.endTime}</Text>
        )}
        {item.duration && (
          <Text style={styles.duration}>耗时: {item.duration}分钟</Text>
        )}
      </View>
      
      <View style={styles.changes}>
        <Text style={styles.changesTitle}>变更内容:</Text>
        {item.changes.map((change, index) => (
          <Text key={index} style={styles.changeItem}>• {change}</Text>
        ))}
      </View>
      
      {item.rollbackAvailable && item.status === 'success' && (
        <TouchableOpacity
          style={styles.rollbackButton}
          onPress={() => handleRollback(item.id)}
        >
          <Ionicons name="arrow-undo-outline" size={16} color="#FF9500" />
          <Text style={styles.rollbackButtonText}>回滚</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPipeline = ({ item }: { item: Pipeline }) => (
    <View style={styles.pipelineCard}>
      <View style={styles.pipelineHeader}>
        <View style={styles.pipelineInfo}>
          <Text style={styles.pipelineName}>{item.name}</Text>
          <Text style={styles.pipelineStats}>
            成功率: {item.successRate}% | 平均耗时: {Math.floor(item.averageDuration / 60)}分钟
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status === 'success' ? '成功' : 
             item.status === 'failed' ? '失败' : 
             item.status === 'running' ? '运行中' : '空闲'}
          </Text>
        </View>
      </View>
      
      <View style={styles.stagesContainer}>
        {item.stages.map((stage, index) => (
          <View key={stage.id} style={styles.stageItem}>
            <View style={[styles.stageIndicator, { backgroundColor: getStatusColor(stage.status) }]} />
            <Text style={styles.stageName}>{stage.name}</Text>
            {stage.duration && (
              <Text style={styles.stageDuration}>{stage.duration}s</Text>
            )}
          </View>
        ))}
      </View>
      
      <View style={styles.pipelineActions}>
        <Text style={styles.lastRun}>最后运行: {item.lastRun}</Text>
        <TouchableOpacity
          style={[styles.runButton, item.status === 'running' && styles.disabledButton]}
          onPress={() => handleRunPipeline(item.id)}
          disabled={item.status === 'running'}
        >
          <Ionicons name="play-outline" size={16} color="#fff" />
          <Text style={styles.runButtonText}>
            {item.status === 'running' ? '运行中' : '运行'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRelease = ({ item }: { item: ReleaseNote }) => (
    <View style={styles.releaseCard}>
      <View style={styles.releaseHeader}>
        <Text style={styles.releaseVersion}>{item.version}</Text>
        <Text style={styles.releaseDate}>{item.releaseDate}</Text>
      </View>
      
      <Text style={styles.releaseTitle}>{item.title}</Text>
      <Text style={styles.releaseDescription}>{item.description}</Text>
      
      {item.features.length > 0 && (
        <View style={styles.releaseSection}>
          <Text style={styles.sectionTitle}>新功能:</Text>
          {item.features.map((feature, index) => (
            <Text key={index} style={styles.sectionItem}>• {feature}</Text>
          ))}
        </View>
      )}
      
      {item.bugFixes.length > 0 && (
        <View style={styles.releaseSection}>
          <Text style={styles.sectionTitle}>Bug修复:</Text>
          {item.bugFixes.map((fix, index) => (
            <Text key={index} style={styles.sectionItem}>• {fix}</Text>
          ))}
        </View>
      )}
      
      {item.breakingChanges.length > 0 && (
        <View style={styles.releaseSection}>
          <Text style={[styles.sectionTitle, { color: '#FF3B30' }]}>破坏性变更:</Text>
          {item.breakingChanges.map((change, index) => (
            <Text key={index} style={[styles.sectionItem, { color: '#FF3B30' }]}>• {change}</Text>
          ))}
        </View>
      )}
      
      <Text style={styles.releaseAuthor}>发布者: {item.author}</Text>
    </View>
  );

  const renderDeploymentChart = () => {
    const chartData = {
      labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      datasets: [{
        data: [3, 5, 2, 8, 6, 4, 1],
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>本周部署统计</Text>
        <BarChart
          data={chartData}
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
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>部署管理</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.autoRefreshContainer}>
            <Text style={styles.autoRefreshLabel}>自动刷新</Text>
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={autoRefresh ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'environments' && styles.activeTab]}
          onPress={() => setActiveTab('environments')}
        >
          <Text style={[styles.tabText, activeTab === 'environments' && styles.activeTabText]}>
            环境管理
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            部署历史
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pipelines' && styles.activeTab]}
          onPress={() => setActiveTab('pipelines')}
        >
          <Text style={[styles.tabText, activeTab === 'pipelines' && styles.activeTabText]}>
            流水线
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'releases' && styles.activeTab]}
          onPress={() => setActiveTab('releases')}
        >
          <Text style={[styles.tabText, activeTab === 'releases' && styles.activeTabText]}>
            发布说明
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'environments' && (
        <FlatList
          data={environments}
          renderItem={renderEnvironmentCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'history' && (
        <FlatList
          data={deploymentHistory}
          renderItem={renderDeploymentHistory}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderDeploymentChart}
        />
      )}

      {activeTab === 'pipelines' && (
        <FlatList
          data={pipelines}
          renderItem={renderPipeline}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'releases' && (
        <FlatList
          data={releases}
          renderItem={renderRelease}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Deploy Modal */}
      <Modal
        visible={showDeployModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDeployModal(false)}>
              <Text style={styles.closeButton}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>部署到 {selectedEnvironment?.name}</Text>
            <TouchableOpacity>
              <Text style={styles.deployModalButton}>部署</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.deployForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>选择版本</Text>
                <View style={styles.versionSelector}>
                  <Text style={styles.selectedVersion}>v1.2.3-rc1</Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>部署说明</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="输入部署说明..."
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.deployOptions}>
                <View style={styles.optionItem}>
                  <Switch value={true} />
                  <Text style={styles.optionText}>运行健康检查</Text>
                </View>
                <View style={styles.optionItem}>
                  <Switch value={false} />
                  <Text style={styles.optionText}>自动回滚</Text>
                </View>
                <View style={styles.optionItem}>
                  <Switch value={true} />
                  <Text style={styles.optionText}>发送通知</Text>
                </View>
              </View>
            </View>
          </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    marginRight: 15,
  },
  autoRefreshContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoRefreshLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
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
  listContainer: {
    padding: 15,
  },
  environmentCard: {
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
  environmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  environmentInfo: {
    flex: 1,
  },
  environmentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  environmentDetails: {
    marginBottom: 15,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  urlText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  lastDeployment: {
    fontSize: 12,
    color: '#999',
  },
  resourceMetrics: {
    marginBottom: 15,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceLabel: {
    fontSize: 12,
    color: '#666',
    width: 40,
  },
  resourceBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  resourceFill: {
    height: '100%',
    borderRadius: 3,
  },
  resourceValue: {
    fontSize: 12,
    color: '#666',
    width: 35,
    textAlign: 'right',
  },
  environmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  deployButton: {
    backgroundColor: '#007AFF',
  },
  deployButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  monitorButton: {
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  monitorButtonText: {
    color: '#007AFF',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  historyCard: {
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
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  historyInfo: {
    flex: 1,
  },
  historyEnvironment: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  historyVersion: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  historyDetails: {
    marginBottom: 15,
  },
  deployedBy: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  deployTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    color: '#007AFF',
  },
  changes: {
    marginBottom: 15,
  },
  changesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  changeItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
  },
  rollbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FF9500',
    borderRadius: 8,
  },
  rollbackButtonText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  pipelineCard: {
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
  pipelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  pipelineInfo: {
    flex: 1,
  },
  pipelineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  pipelineStats: {
    fontSize: 12,
    color: '#666',
  },
  stagesContainer: {
    marginBottom: 15,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  stageName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  stageDuration: {
    fontSize: 12,
    color: '#666',
  },
  pipelineActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastRun: {
    fontSize: 12,
    color: '#666',
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  runButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  releaseCard: {
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
  releaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  releaseVersion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  releaseDate: {
    fontSize: 14,
    color: '#666',
  },
  releaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  releaseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  releaseSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
  },
  releaseAuthor: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  chartContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 15,
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
    color: '#666',
  },
  deployModalButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  deployForm: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  versionSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  selectedVersion: {
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  deployOptions: {
    marginTop: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
});

export default DeploymentManager;