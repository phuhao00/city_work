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
import { LineChart, BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface WorkflowStep {
  id: string;
  name: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  config: any;
  position: { x: number; y: number };
  connections: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  category: 'approval' | 'notification' | 'data_processing' | 'integration';
  trigger: string;
  steps: WorkflowStep[];
  createdAt: string;
  lastRun: string;
  runCount: number;
  successRate: number;
  avgExecutionTime: number;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number;
  currentStep?: string;
  errorMessage?: string;
  inputData: any;
  outputData?: any;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  usageCount: number;
}

const WorkflowAutomation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workflows' | 'executions' | 'templates' | 'analytics'>('workflows');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data
  useEffect(() => {
    const mockWorkflows: Workflow[] = [
      {
        id: '1',
        name: '员工入职流程',
        description: '自动化新员工入职审批和账户创建流程',
        status: 'active',
        category: 'approval',
        trigger: '新员工信息提交',
        steps: [
          {
            id: 'step1',
            name: '部门经理审批',
            type: 'condition',
            config: { approver: 'department_manager' },
            position: { x: 100, y: 100 },
            connections: ['step2'],
          },
          {
            id: 'step2',
            name: '创建系统账户',
            type: 'action',
            config: { system: 'user_management' },
            position: { x: 300, y: 100 },
            connections: ['step3'],
          },
          {
            id: 'step3',
            name: '发送欢迎邮件',
            type: 'action',
            config: { template: 'welcome_email' },
            position: { x: 500, y: 100 },
            connections: [],
          },
        ],
        createdAt: '2024-01-15',
        lastRun: '2024-01-30 14:30:00',
        runCount: 25,
        successRate: 96,
        avgExecutionTime: 120,
      },
      {
        id: '2',
        name: '项目审批流程',
        description: '多级项目审批和资源分配自动化',
        status: 'active',
        category: 'approval',
        trigger: '项目申请提交',
        steps: [
          {
            id: 'step1',
            name: '预算检查',
            type: 'condition',
            config: { budget_limit: 100000 },
            position: { x: 100, y: 100 },
            connections: ['step2'],
          },
          {
            id: 'step2',
            name: '技术评审',
            type: 'action',
            config: { reviewer: 'tech_lead' },
            position: { x: 300, y: 100 },
            connections: ['step3'],
          },
          {
            id: 'step3',
            name: '资源分配',
            type: 'action',
            config: { system: 'resource_management' },
            position: { x: 500, y: 100 },
            connections: [],
          },
        ],
        createdAt: '2024-01-10',
        lastRun: '2024-01-30 16:45:00',
        runCount: 18,
        successRate: 89,
        avgExecutionTime: 300,
      },
      {
        id: '3',
        name: '数据备份流程',
        description: '定时数据备份和验证流程',
        status: 'active',
        category: 'data_processing',
        trigger: '每日凌晨2点',
        steps: [
          {
            id: 'step1',
            name: '数据库备份',
            type: 'action',
            config: { databases: ['main', 'logs'] },
            position: { x: 100, y: 100 },
            connections: ['step2'],
          },
          {
            id: 'step2',
            name: '备份验证',
            type: 'condition',
            config: { validation: 'integrity_check' },
            position: { x: 300, y: 100 },
            connections: ['step3'],
          },
          {
            id: 'step3',
            name: '通知管理员',
            type: 'action',
            config: { notification: 'backup_status' },
            position: { x: 500, y: 100 },
            connections: [],
          },
        ],
        createdAt: '2024-01-05',
        lastRun: '2024-01-30 02:00:00',
        runCount: 25,
        successRate: 100,
        avgExecutionTime: 45,
      },
    ];

    const mockExecutions: WorkflowExecution[] = [
      {
        id: '1',
        workflowId: '1',
        workflowName: '员工入职流程',
        status: 'completed',
        startTime: '2024-01-30 14:30:00',
        endTime: '2024-01-30 14:32:00',
        duration: 120,
        inputData: { employee_name: '张三', department: '技术部' },
        outputData: { user_id: 'U001', account_created: true },
      },
      {
        id: '2',
        workflowId: '2',
        workflowName: '项目审批流程',
        status: 'running',
        startTime: '2024-01-30 16:45:00',
        currentStep: '技术评审',
        inputData: { project_name: '移动应用开发', budget: 80000 },
      },
      {
        id: '3',
        workflowId: '3',
        workflowName: '数据备份流程',
        status: 'completed',
        startTime: '2024-01-30 02:00:00',
        endTime: '2024-01-30 02:00:45',
        duration: 45,
        inputData: { backup_type: 'full' },
        outputData: { backup_size: '2.5GB', status: 'success' },
      },
      {
        id: '4',
        workflowId: '1',
        workflowName: '员工入职流程',
        status: 'failed',
        startTime: '2024-01-29 10:15:00',
        endTime: '2024-01-29 10:16:30',
        duration: 90,
        errorMessage: '邮件服务器连接失败',
        inputData: { employee_name: '李四', department: '市场部' },
      },
    ];

    const mockTemplates: WorkflowTemplate[] = [
      {
        id: '1',
        name: '审批流程模板',
        description: '通用的多级审批流程模板',
        category: '审批管理',
        steps: [
          {
            id: 'step1',
            name: '初级审批',
            type: 'condition',
            config: {},
            position: { x: 100, y: 100 },
            connections: ['step2'],
          },
          {
            id: 'step2',
            name: '高级审批',
            type: 'condition',
            config: {},
            position: { x: 300, y: 100 },
            connections: ['step3'],
          },
          {
            id: 'step3',
            name: '执行操作',
            type: 'action',
            config: {},
            position: { x: 500, y: 100 },
            connections: [],
          },
        ],
        usageCount: 15,
      },
      {
        id: '2',
        name: '通知流程模板',
        description: '多渠道通知发送模板',
        category: '通知管理',
        steps: [
          {
            id: 'step1',
            name: '邮件通知',
            type: 'action',
            config: {},
            position: { x: 100, y: 100 },
            connections: ['step2'],
          },
          {
            id: 'step2',
            name: '短信通知',
            type: 'action',
            config: {},
            position: { x: 300, y: 100 },
            connections: ['step3'],
          },
          {
            id: 'step3',
            name: '系统消息',
            type: 'action',
            config: {},
            position: { x: 500, y: 100 },
            connections: [],
          },
        ],
        usageCount: 8,
      },
    ];

    setWorkflows(mockWorkflows);
    setExecutions(mockExecutions);
    setTemplates(mockTemplates);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'completed': return '#34C759';
      case 'running': return '#007AFF';
      case 'inactive': case 'cancelled': return '#8E8E93';
      case 'draft': return '#FF9500';
      case 'failed': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'approval': return 'checkmark-circle-outline';
      case 'notification': return 'notifications-outline';
      case 'data_processing': return 'server-outline';
      case 'integration': return 'link-outline';
      default: return 'settings-outline';
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'trigger': return 'play-circle-outline';
      case 'condition': return 'help-circle-outline';
      case 'action': return 'flash-outline';
      case 'delay': return 'time-outline';
      default: return 'ellipse-outline';
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const renderAnalytics = () => {
    const executionTrendData = {
      labels: ['周一', '周二', '周三', '周四', '周五'],
      datasets: [{
        data: [15, 22, 18, 25, 20],
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2
      }]
    };

    const successRateData = {
      labels: ['入职流程', '项目审批', '数据备份', '通知流程'],
      datasets: [{
        data: [96, 89, 100, 94]
      }]
    };

    return (
      <ScrollView style={styles.analyticsContainer} showsVerticalScrollIndicator={false}>
        {/* Metrics Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="play-circle" size={24} color="#007AFF" />
            <Text style={styles.metricNumber}>{workflows.filter(w => w.status === 'active').length}</Text>
            <Text style={styles.metricLabel}>活跃流程</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            <Text style={styles.metricNumber}>{executions.filter(e => e.status === 'completed').length}</Text>
            <Text style={styles.metricLabel}>成功执行</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="time" size={24} color="#FF9500" />
            <Text style={styles.metricNumber}>{Math.round(workflows.reduce((sum, w) => sum + w.avgExecutionTime, 0) / workflows.length)}</Text>
            <Text style={styles.metricLabel}>平均耗时(秒)</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="trending-up" size={24} color="#34C759" />
            <Text style={styles.metricNumber}>{Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length)}%</Text>
            <Text style={styles.metricLabel}>成功率</Text>
          </View>
        </View>

        {/* Execution Trend Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>执行趋势</Text>
          <LineChart
            data={executionTrendData}
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

        {/* Success Rate Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>流程成功率</Text>
          <BarChart
            data={successRateData}
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

  const renderWorkflow = ({ item }: { item: Workflow }) => (
    <TouchableOpacity
      style={styles.workflowCard}
      onPress={() => {
        setSelectedWorkflow(item);
        setShowWorkflowModal(true);
      }}
    >
      <View style={styles.workflowHeader}>
        <View style={styles.workflowInfo}>
          <Ionicons name={getCategoryIcon(item.category)} size={20} color="#007AFF" />
          <Text style={styles.workflowName}>{item.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>
            {item.status === 'active' ? '活跃' : 
             item.status === 'inactive' ? '停用' : '草稿'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.workflowDescription}>{item.description}</Text>
      
      <View style={styles.workflowStats}>
        <View style={styles.statItem}>
          <Ionicons name="play-outline" size={14} color="#666" />
          <Text style={styles.statText}>执行 {item.runCount} 次</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-outline" size={14} color="#666" />
          <Text style={styles.statText}>成功率 {item.successRate}%</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.statText}>平均 {item.avgExecutionTime}s</Text>
        </View>
      </View>
      
      <View style={styles.workflowFooter}>
        <Text style={styles.triggerText}>触发器: {item.trigger}</Text>
        <Text style={styles.lastRunText}>最后运行: {item.lastRun}</Text>
      </View>
      
      <View style={styles.stepsPreview}>
        <Text style={styles.stepsLabel}>流程步骤 ({item.steps.length}):</Text>
        <View style={styles.stepsContainer}>
          {item.steps.map((step, index) => (
            <View key={step.id} style={styles.stepPreview}>
              <Ionicons name={getStepIcon(step.type)} size={12} color="#007AFF" />
              <Text style={styles.stepName}>{step.name}</Text>
              {index < item.steps.length - 1 && (
                <Ionicons name="chevron-forward" size={12} color="#ccc" />
              )}
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderExecution = ({ item }: { item: WorkflowExecution }) => (
    <TouchableOpacity
      style={styles.executionCard}
      onPress={() => {
        setSelectedExecution(item);
        setShowExecutionModal(true);
      }}
    >
      <View style={styles.executionHeader}>
        <Text style={styles.executionWorkflowName}>{item.workflowName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>
            {item.status === 'running' ? '运行中' : 
             item.status === 'completed' ? '已完成' : 
             item.status === 'failed' ? '失败' : '已取消'}
          </Text>
        </View>
      </View>
      
      <View style={styles.executionDetails}>
        <View style={styles.executionDetailRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.executionDetailText}>开始: {item.startTime}</Text>
        </View>
        {item.endTime && (
          <View style={styles.executionDetailRow}>
            <Ionicons name="checkmark-outline" size={14} color="#666" />
            <Text style={styles.executionDetailText}>结束: {item.endTime}</Text>
          </View>
        )}
        {item.duration && (
          <View style={styles.executionDetailRow}>
            <Ionicons name="speedometer-outline" size={14} color="#666" />
            <Text style={styles.executionDetailText}>耗时: {item.duration}秒</Text>
          </View>
        )}
        {item.currentStep && (
          <View style={styles.executionDetailRow}>
            <Ionicons name="play-outline" size={14} color="#666" />
            <Text style={styles.executionDetailText}>当前步骤: {item.currentStep}</Text>
          </View>
        )}
      </View>
      
      {item.errorMessage && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={14} color="#FF3B30" />
          <Text style={styles.errorText}>{item.errorMessage}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderTemplate = ({ item }: { item: WorkflowTemplate }) => (
    <View style={styles.templateCard}>
      <View style={styles.templateHeader}>
        <Text style={styles.templateName}>{item.name}</Text>
        <Text style={styles.usageCount}>使用 {item.usageCount} 次</Text>
      </View>
      
      <Text style={styles.templateDescription}>{item.description}</Text>
      
      <View style={styles.templateCategory}>
        <Ionicons name="folder-outline" size={14} color="#666" />
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
      
      <View style={styles.templateSteps}>
        <Text style={styles.stepsLabel}>包含 {item.steps.length} 个步骤</Text>
        <TouchableOpacity style={styles.useTemplateButton}>
          <Text style={styles.useTemplateText}>使用模板</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>工作流自动化</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'workflows' && styles.activeTab]}
          onPress={() => setActiveTab('workflows')}
        >
          <Text style={[styles.tabText, activeTab === 'workflows' && styles.activeTabText]}>
            工作流
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'executions' && styles.activeTab]}
          onPress={() => setActiveTab('executions')}
        >
          <Text style={[styles.tabText, activeTab === 'executions' && styles.activeTabText]}>
            执行记录
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'templates' && styles.activeTab]}
          onPress={() => setActiveTab('templates')}
        >
          <Text style={[styles.tabText, activeTab === 'templates' && styles.activeTabText]}>
            模板库
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            分析报告
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'workflows' && (
        <View style={styles.contentContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索工作流..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterButton, filterStatus === 'all' && styles.activeFilter]}
                onPress={() => setFilterStatus('all')}
              >
                <Text style={[styles.filterText, filterStatus === 'all' && styles.activeFilterText]}>
                  全部
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filterStatus === 'active' && styles.activeFilter]}
                onPress={() => setFilterStatus('active')}
              >
                <Text style={[styles.filterText, filterStatus === 'active' && styles.activeFilterText]}>
                  活跃
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filterStatus === 'draft' && styles.activeFilter]}
                onPress={() => setFilterStatus('draft')}
              >
                <Text style={[styles.filterText, filterStatus === 'draft' && styles.activeFilterText]}>
                  草稿
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <FlatList
            data={filteredWorkflows}
            renderItem={renderWorkflow}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}

      {activeTab === 'executions' && (
        <FlatList
          data={executions}
          renderItem={renderExecution}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'templates' && (
        <FlatList
          data={templates}
          renderItem={renderTemplate}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'analytics' && renderAnalytics()}

      {/* Workflow Detail Modal */}
      <Modal
        visible={showWorkflowModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowWorkflowModal(false)}>
              <Text style={styles.closeButton}>关闭</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>工作流详情</Text>
            <TouchableOpacity>
              <Text style={styles.actionButton}>编辑</Text>
            </TouchableOpacity>
          </View>
          
          {selectedWorkflow && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.workflowDetailContainer}>
                <Text style={styles.workflowDetailTitle}>{selectedWorkflow.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedWorkflow.status) }]}>
                  <Text style={styles.badgeText}>
                    {selectedWorkflow.status === 'active' ? '活跃' : 
                     selectedWorkflow.status === 'inactive' ? '停用' : '草稿'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.workflowDetailDescription}>{selectedWorkflow.description}</Text>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>基本信息</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>类别:</Text>
                  <Text style={styles.detailValue}>
                    {selectedWorkflow.category === 'approval' ? '审批流程' : 
                     selectedWorkflow.category === 'notification' ? '通知流程' : 
                     selectedWorkflow.category === 'data_processing' ? '数据处理' : '系统集成'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>触发器:</Text>
                  <Text style={styles.detailValue}>{selectedWorkflow.trigger}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>创建时间:</Text>
                  <Text style={styles.detailValue}>{selectedWorkflow.createdAt}</Text>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>执行统计</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{selectedWorkflow.runCount}</Text>
                    <Text style={styles.statLabel}>执行次数</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{selectedWorkflow.successRate}%</Text>
                    <Text style={styles.statLabel}>成功率</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{selectedWorkflow.avgExecutionTime}s</Text>
                    <Text style={styles.statLabel}>平均耗时</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>流程步骤</Text>
                {selectedWorkflow.steps.map((step, index) => (
                  <View key={step.id} style={styles.stepDetail}>
                    <View style={styles.stepHeader}>
                      <Ionicons name={getStepIcon(step.type)} size={16} color="#007AFF" />
                      <Text style={styles.stepDetailName}>{step.name}</Text>
                      <Text style={styles.stepType}>
                        {step.type === 'trigger' ? '触发器' : 
                         step.type === 'condition' ? '条件' : 
                         step.type === 'action' ? '动作' : '延迟'}
                      </Text>
                    </View>
                    {index < selectedWorkflow.steps.length - 1 && (
                      <View style={styles.stepConnector}>
                        <Ionicons name="chevron-down" size={16} color="#ccc" />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Execution Detail Modal */}
      <Modal
        visible={showExecutionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowExecutionModal(false)}>
              <Text style={styles.closeButton}>关闭</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>执行详情</Text>
            <View style={{ width: 50 }} />
          </View>
          
          {selectedExecution && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.executionDetailContainer}>
                <Text style={styles.executionDetailTitle}>{selectedExecution.workflowName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedExecution.status) }]}>
                  <Text style={styles.badgeText}>
                    {selectedExecution.status === 'running' ? '运行中' : 
                     selectedExecution.status === 'completed' ? '已完成' : 
                     selectedExecution.status === 'failed' ? '失败' : '已取消'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>执行信息</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>开始时间:</Text>
                  <Text style={styles.detailValue}>{selectedExecution.startTime}</Text>
                </View>
                {selectedExecution.endTime && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>结束时间:</Text>
                    <Text style={styles.detailValue}>{selectedExecution.endTime}</Text>
                  </View>
                )}
                {selectedExecution.duration && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>执行时长:</Text>
                    <Text style={styles.detailValue}>{selectedExecution.duration}秒</Text>
                  </View>
                )}
                {selectedExecution.currentStep && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>当前步骤:</Text>
                    <Text style={styles.detailValue}>{selectedExecution.currentStep}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>输入数据</Text>
                <View style={styles.dataContainer}>
                  <Text style={styles.dataText}>
                    {JSON.stringify(selectedExecution.inputData, null, 2)}
                  </Text>
                </View>
              </View>
              
              {selectedExecution.outputData && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>输出数据</Text>
                  <View style={styles.dataContainer}>
                    <Text style={styles.dataText}>
                      {JSON.stringify(selectedExecution.outputData, null, 2)}
                    </Text>
                  </View>
                </View>
              )}
              
              {selectedExecution.errorMessage && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>错误信息</Text>
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{selectedExecution.errorMessage}</Text>
                  </View>
                </View>
              )}
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
  workflowCard: {
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
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  workflowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workflowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  workflowDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  workflowStats: {
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
  workflowFooter: {
    marginBottom: 15,
  },
  triggerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  lastRunText: {
    fontSize: 12,
    color: '#999',
  },
  stepsPreview: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  stepsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  stepsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  stepPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  stepName: {
    fontSize: 10,
    color: '#333',
    marginLeft: 5,
    marginRight: 5,
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
  executionCard: {
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
  executionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  executionWorkflowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  executionDetails: {
    marginBottom: 10,
  },
  executionDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  executionDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
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
  templateCard: {
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
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  usageCount: {
    fontSize: 12,
    color: '#666',
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  templateCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  templateSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  useTemplateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  useTemplateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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
  workflowDetailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  workflowDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 15,
  },
  workflowDetailDescription: {
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
  stepDetail: {
    marginBottom: 15,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  stepDetailName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  stepType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepConnector: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  executionDetailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  executionDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 15,
  },
  dataContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
  },
  dataText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
});

export default WorkflowAutomation;