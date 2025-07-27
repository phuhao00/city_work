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

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'start' | 'task' | 'decision' | 'end' | 'parallel' | 'merge';
  position: { x: number; y: number };
  connections: string[];
  config: {
    assignee?: string;
    dueDate?: string;
    conditions?: string[];
    actions?: string[];
    approvers?: string[];
    notifications?: string[];
  };
  status: 'active' | 'completed' | 'failed' | 'pending';
  executionTime?: number;
  completedAt?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'approval' | 'review' | 'automation' | 'notification' | 'integration' | 'custom';
  version: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  variables: WorkflowVariable[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  usageCount: number;
  avgExecutionTime: number;
}

interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'schedule' | 'event' | 'webhook' | 'api';
  config: {
    schedule?: string; // cron expression
    event?: string;
    webhook?: string;
    conditions?: string[];
  };
  isActive: boolean;
}

interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  defaultValue?: any;
  required: boolean;
  description: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  currentStep?: string;
  progress: number;
  variables: Record<string, any>;
  logs: WorkflowLog[];
  triggeredBy: string;
  error?: string;
}

interface WorkflowLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  stepId?: string;
  data?: any;
}

interface WorkflowMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgExecutionTime: number;
  executionTrends: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }>;
  };
  workflowsByCategory: {
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

const WorkflowAutomation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workflows' | 'executions' | 'templates'>('dashboard');
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [showDesignerModal, setShowDesignerModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<'all' | WorkflowTemplate['category']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | WorkflowExecution['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock workflow templates
    const mockWorkflows: WorkflowTemplate[] = [
      {
        id: '1',
        name: '文档审批流程',
        description: '多级文档审批工作流，包含自动通知和条件分支',
        category: 'approval',
        version: '1.2.0',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
        createdBy: 'Admin',
        usageCount: 156,
        avgExecutionTime: 2.5,
        steps: [
          {
            id: 'start',
            name: '开始',
            description: '工作流开始',
            type: 'start',
            position: { x: 100, y: 100 },
            connections: ['review'],
            config: {},
            status: 'completed',
          },
          {
            id: 'review',
            name: '初审',
            description: '部门经理审核',
            type: 'task',
            position: { x: 300, y: 100 },
            connections: ['decision'],
            config: {
              assignee: 'manager',
              dueDate: '2天',
              notifications: ['email', 'sms'],
            },
            status: 'active',
          },
          {
            id: 'decision',
            name: '审批决策',
            description: '根据审核结果决定下一步',
            type: 'decision',
            position: { x: 500, y: 100 },
            connections: ['approve', 'reject'],
            config: {
              conditions: ['approved', 'rejected'],
            },
            status: 'pending',
          },
        ],
        triggers: [
          {
            id: '1',
            type: 'manual',
            config: {},
            isActive: true,
          },
          {
            id: '2',
            type: 'event',
            config: {
              event: 'document_submitted',
            },
            isActive: true,
          },
        ],
        variables: [
          {
            id: '1',
            name: 'document_id',
            type: 'string',
            required: true,
            description: '文档ID',
          },
          {
            id: '2',
            name: 'priority',
            type: 'string',
            defaultValue: 'normal',
            required: false,
            description: '优先级',
          },
        ],
      },
      {
        id: '2',
        name: '数据同步自动化',
        description: '定时数据同步和处理工作流',
        category: 'automation',
        version: '2.1.0',
        isActive: true,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-12',
        createdBy: 'System',
        usageCount: 89,
        avgExecutionTime: 5.2,
        steps: [],
        triggers: [
          {
            id: '1',
            type: 'schedule',
            config: {
              schedule: '0 2 * * *', // 每天凌晨2点
            },
            isActive: true,
          },
        ],
        variables: [],
      },
      {
        id: '3',
        name: '用户注册流程',
        description: '新用户注册和验证工作流',
        category: 'notification',
        version: '1.0.0',
        isActive: false,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10',
        createdBy: 'Developer',
        usageCount: 234,
        avgExecutionTime: 1.8,
        steps: [],
        triggers: [],
        variables: [],
      },
    ];

    // Mock executions
    const mockExecutions: WorkflowExecution[] = [
      {
        id: '1',
        workflowId: '1',
        workflowName: '文档审批流程',
        status: 'running',
        startedAt: '2024-01-15T10:30:00Z',
        duration: 3600,
        currentStep: 'review',
        progress: 45,
        variables: {
          document_id: 'DOC-001',
          priority: 'high',
        },
        logs: [
          {
            id: '1',
            timestamp: '2024-01-15T10:30:00Z',
            level: 'info',
            message: '工作流开始执行',
            stepId: 'start',
          },
          {
            id: '2',
            timestamp: '2024-01-15T10:31:00Z',
            level: 'info',
            message: '分配给部门经理审核',
            stepId: 'review',
          },
        ],
        triggeredBy: 'user@example.com',
      },
      {
        id: '2',
        workflowId: '2',
        workflowName: '数据同步自动化',
        status: 'completed',
        startedAt: '2024-01-15T02:00:00Z',
        completedAt: '2024-01-15T02:05:00Z',
        duration: 300,
        progress: 100,
        variables: {},
        logs: [
          {
            id: '1',
            timestamp: '2024-01-15T02:00:00Z',
            level: 'info',
            message: '开始数据同步',
          },
          {
            id: '2',
            timestamp: '2024-01-15T02:05:00Z',
            level: 'info',
            message: '数据同步完成',
          },
        ],
        triggeredBy: 'system',
      },
      {
        id: '3',
        workflowId: '1',
        workflowName: '文档审批流程',
        status: 'failed',
        startedAt: '2024-01-14T15:20:00Z',
        completedAt: '2024-01-14T15:25:00Z',
        duration: 300,
        progress: 30,
        variables: {
          document_id: 'DOC-002',
        },
        logs: [
          {
            id: '1',
            timestamp: '2024-01-14T15:25:00Z',
            level: 'error',
            message: '审批超时',
            stepId: 'review',
          },
        ],
        triggeredBy: 'user2@example.com',
        error: '审批超时，工作流终止',
      },
    ];

    // Mock metrics
    const mockMetrics: WorkflowMetrics = {
      totalWorkflows: 15,
      activeWorkflows: 12,
      totalExecutions: 1250,
      successfulExecutions: 1180,
      failedExecutions: 70,
      avgExecutionTime: 3.2,
      executionTrends: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
          {
            data: [180, 220, 195, 240, 210, 185],
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      },
      workflowsByCategory: {
        labels: ['审批', '自动化', '通知', '集成', '自定义'],
        datasets: [
          {
            data: [35, 25, 20, 15, 5],
          },
        ],
      },
      performanceMetrics: {
        labels: ['成功率', '平均执行时间', '资源利用率', '错误率'],
        datasets: [
          {
            data: [94.4, 3.2, 78.5, 5.6],
          },
        ],
      },
    };

    setWorkflows(mockWorkflows);
    setExecutions(mockExecutions);
    setMetrics(mockMetrics);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'cancelled': return '#9E9E9E';
      case 'paused': return '#FF9800';
      case 'active': return '#4CAF50';
      case 'pending': return '#FF9800';
      default: return '#666';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'approval': return 'checkmark-circle-outline';
      case 'review': return 'eye-outline';
      case 'automation': return 'cog-outline';
      case 'notification': return 'notifications-outline';
      case 'integration': return 'link-outline';
      case 'custom': return 'construct-outline';
      default: return 'document-outline';
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    if (categoryFilter !== 'all' && workflow.category !== categoryFilter) return false;
    if (searchQuery && !workflow.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredExecutions = executions.filter(execution => {
    if (statusFilter !== 'all' && execution.status !== statusFilter) return false;
    if (searchQuery && !execution.workflowName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const onRefresh = () => {
    setRefreshing(true);
    loadMockData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const executeWorkflow = (workflowId: string) => {
    Alert.alert(
      '执行工作流',
      '确定要手动执行此工作流吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '执行',
          onPress: () => {
            const workflow = workflows.find(w => w.id === workflowId);
            if (workflow) {
              const newExecution: WorkflowExecution = {
                id: Date.now().toString(),
                workflowId: workflow.id,
                workflowName: workflow.name,
                status: 'running',
                startedAt: new Date().toISOString(),
                progress: 0,
                variables: {},
                logs: [
                  {
                    id: '1',
                    timestamp: new Date().toISOString(),
                    level: 'info',
                    message: '工作流手动启动',
                  },
                ],
                triggeredBy: 'manual',
              };
              setExecutions(prev => [newExecution, ...prev]);
              Alert.alert('成功', '工作流已开始执行');
            }
          },
        },
      ]
    );
  };

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, isActive: !workflow.isActive }
        : workflow
    ));
  };

  const renderDashboardTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="git-network" size={24} color="#2196F3" />
          <Text style={styles.statValue}>{metrics?.totalWorkflows || 0}</Text>
          <Text style={styles.statLabel}>总工作流</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="play-circle" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{metrics?.activeWorkflows || 0}</Text>
          <Text style={styles.statLabel}>活跃工作流</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="bar-chart" size={24} color="#FF9800" />
          <Text style={styles.statValue}>{metrics?.totalExecutions || 0}</Text>
          <Text style={styles.statLabel}>总执行次数</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#9C27B0" />
          <Text style={styles.statValue}>{metrics?.avgExecutionTime || 0}s</Text>
          <Text style={styles.statLabel}>平均执行时间</Text>
        </View>
      </View>

      {/* Success Rate */}
      <View style={styles.successRateCard}>
        <Text style={styles.cardTitle}>执行成功率</Text>
        <View style={styles.successRateContent}>
          <View style={styles.successRateCircle}>
            <Text style={styles.successRateText}>
              {metrics ? Math.round((metrics.successfulExecutions / metrics.totalExecutions) * 100) : 0}%
            </Text>
          </View>
          <View style={styles.successRateDetails}>
            <View style={styles.successRateItem}>
              <View style={[styles.successRateDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.successRateLabel}>成功: {metrics?.successfulExecutions || 0}</Text>
            </View>
            <View style={styles.successRateItem}>
              <View style={[styles.successRateDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.successRateLabel}>失败: {metrics?.failedExecutions || 0}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Execution Trends */}
      {metrics?.executionTrends && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>执行趋势</Text>
          <LineChart
            data={metrics.executionTrends}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#2196F3',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Workflows by Category */}
      {metrics?.workflowsByCategory && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>工作流分类分布</Text>
          <PieChart
            data={metrics.workflowsByCategory.labels.map((label, index) => ({
              name: label,
              population: metrics.workflowsByCategory.datasets[0].data[index],
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
          <Text style={styles.cardTitle}>最近执行</Text>
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
                <Text style={styles.executionName}>{execution.workflowName}</Text>
                <Text style={styles.executionTime}>
                  {new Date(execution.startedAt).toLocaleString()}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(execution.status) }]}>
                <Text style={styles.statusText}>{execution.status}</Text>
              </View>
            </View>
            {execution.status === 'running' && (
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${execution.progress}%` }]} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderWorkflowsTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索工作流..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>分类:</Text>
            {['all', 'approval', 'automation', 'notification', 'integration'].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  categoryFilter === category && styles.activeFilter,
                ]}
                onPress={() => setCategoryFilter(category as any)}
              >
                <Text
                  style={[
                    styles.filterText,
                    categoryFilter === category && styles.activeFilterText,
                  ]}
                >
                  {category === 'all' ? '全部' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Create Workflow Button */}
      <TouchableOpacity style={styles.createButton}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.createButtonText}>创建工作流</Text>
      </TouchableOpacity>

      {/* Workflows List */}
      {filteredWorkflows.map((workflow) => (
        <View key={workflow.id} style={styles.workflowCard}>
          <View style={styles.workflowHeader}>
            <View style={styles.workflowInfo}>
              <View style={styles.workflowTitleRow}>
                <Ionicons
                  name={getCategoryIcon(workflow.category)}
                  size={20}
                  color="#2196F3"
                />
                <Text style={styles.workflowName}>{workflow.name}</Text>
                <Switch
                  value={workflow.isActive}
                  onValueChange={() => toggleWorkflow(workflow.id)}
                  trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
                  thumbColor={workflow.isActive ? '#fff' : '#f4f3f4'}
                />
              </View>
              <Text style={styles.workflowDescription}>{workflow.description}</Text>
              <View style={styles.workflowMeta}>
                <Text style={styles.workflowCategory}>{workflow.category}</Text>
                <Text style={styles.workflowVersion}>v{workflow.version}</Text>
                <Text style={styles.workflowUsage}>{workflow.usageCount} 次使用</Text>
              </View>
            </View>
          </View>

          <View style={styles.workflowStats}>
            <View style={styles.workflowStat}>
              <Text style={styles.workflowStatValue}>{workflow.avgExecutionTime}s</Text>
              <Text style={styles.workflowStatLabel}>平均执行时间</Text>
            </View>
            <View style={styles.workflowStat}>
              <Text style={styles.workflowStatValue}>{workflow.steps.length}</Text>
              <Text style={styles.workflowStatLabel}>步骤数</Text>
            </View>
            <View style={styles.workflowStat}>
              <Text style={styles.workflowStatValue}>{workflow.triggers.length}</Text>
              <Text style={styles.workflowStatLabel}>触发器</Text>
            </View>
          </View>

          <View style={styles.workflowActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => executeWorkflow(workflow.id)}
            >
              <Ionicons name="play" size={16} color="#2196F3" />
              <Text style={styles.actionButtonText}>执行</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedWorkflow(workflow);
                setShowDesignerModal(true);
              }}
            >
              <Ionicons name="create" size={16} color="#FF9800" />
              <Text style={styles.actionButtonText}>编辑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedWorkflow(workflow);
                setShowWorkflowModal(true);
              }}
            >
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
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索执行记录..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>状态:</Text>
            {['all', 'running', 'completed', 'failed', 'cancelled'].map((status) => (
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

      {/* Executions List */}
      {filteredExecutions.map((execution) => (
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
              <Text style={styles.executionCardName}>{execution.workflowName}</Text>
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

          {execution.status === 'running' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${execution.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{execution.progress}%</Text>
            </View>
          )}

          {execution.currentStep && (
            <Text style={styles.currentStep}>当前步骤: {execution.currentStep}</Text>
          )}

          {execution.error && (
            <Text style={styles.errorText}>{execution.error}</Text>
          )}

          <View style={styles.executionFooter}>
            <Text style={styles.triggeredBy}>触发者: {execution.triggeredBy}</Text>
            <Text style={styles.logsCount}>{execution.logs.length} 条日志</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTemplatesTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.templatesHeader}>
        <Text style={styles.sectionTitle}>工作流模板</Text>
        <TouchableOpacity style={styles.importButton}>
          <Ionicons name="cloud-download" size={20} color="#2196F3" />
          <Text style={styles.importButtonText}>导入模板</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.templateGrid}>
        {[
          {
            name: '文档审批模板',
            description: '标准的多级文档审批流程',
            category: 'approval',
            steps: 5,
            icon: 'document-text',
          },
          {
            name: '数据处理模板',
            description: '自动化数据处理和转换',
            category: 'automation',
            steps: 8,
            icon: 'cog',
          },
          {
            name: '通知发送模板',
            description: '多渠道通知发送流程',
            category: 'notification',
            steps: 3,
            icon: 'notifications',
          },
          {
            name: '系统集成模板',
            description: '第三方系统集成工作流',
            category: 'integration',
            steps: 6,
            icon: 'link',
          },
        ].map((template, index) => (
          <TouchableOpacity key={index} style={styles.templateCard}>
            <View style={styles.templateIcon}>
              <Ionicons name={template.icon as any} size={32} color="#2196F3" />
            </View>
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateDescription}>{template.description}</Text>
            <View style={styles.templateMeta}>
              <Text style={styles.templateCategory}>{template.category}</Text>
              <Text style={styles.templateSteps}>{template.steps} 步骤</Text>
            </View>
            <TouchableOpacity style={styles.useTemplateButton}>
              <Text style={styles.useTemplateButtonText}>使用模板</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>工作流自动化</Text>
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'dashboard', label: '仪表板', icon: 'speedometer-outline' },
          { key: 'workflows', label: '工作流', icon: 'git-network-outline' },
          { key: 'executions', label: '执行记录', icon: 'play-circle-outline' },
          { key: 'templates', label: '模板', icon: 'library-outline' },
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
        {activeTab === 'workflows' && renderWorkflowsTab()}
        {activeTab === 'executions' && renderExecutionsTab()}
        {activeTab === 'templates' && renderTemplatesTab()}
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
    marginBottom: 8,
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
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 15,
  },
  createButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  workflowCard: {
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
  workflowHeader: {
    marginBottom: 15,
  },
  workflowInfo: {
    flex: 1,
  },
  workflowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  workflowName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  workflowDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  workflowMeta: {
    flexDirection: 'row',
    gap: 15,
  },
  workflowCategory: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  workflowVersion: {
    fontSize: 12,
    color: '#666',
  },
  workflowUsage: {
    fontSize: 12,
    color: '#666',
  },
  workflowStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 15,
  },
  workflowStat: {
    alignItems: 'center',
  },
  workflowStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  workflowStatLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  workflowActions: {
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
    marginBottom: 10,
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 30,
  },
  currentStep: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginBottom: 8,
  },
  executionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  triggeredBy: {
    fontSize: 12,
    color: '#666',
  },
  logsCount: {
    fontSize: 12,
    color: '#666',
  },
  templatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  importButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  templateCard: {
    width: '48%',
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
  templateIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
  },
  templateDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 10,
  },
  templateMeta: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  templateCategory: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '600',
  },
  templateSteps: {
    fontSize: 10,
    color: '#666',
  },
  useTemplateButton: {
    backgroundColor: '#2196F3',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  useTemplateButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});

export default WorkflowAutomation;