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

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  type: 'scheduled' | 'emergency' | 'preventive' | 'corrective';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  scheduledDate: string;
  estimatedDuration: number;
  actualDuration?: number;
  affectedSystems: string[];
  downtime: boolean;
  completionPercentage: number;
}

interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  affectedServices: string[];
  impact: 'low' | 'medium' | 'high';
  notificationSent: boolean;
  approvedBy: string;
}

interface SystemHealth {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  uptime: number;
  lastCheck: string;
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  alerts: number;
}

interface MaintenanceMetrics {
  totalTasks: number;
  completedTasks: number;
  averageCompletionTime: number;
  systemUptime: number;
  scheduledDowntime: number;
  emergencyTasks: number;
}

const MaintenanceScheduler: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'windows' | 'health' | 'metrics'>('tasks');
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [windows, setWindows] = useState<MaintenanceWindow[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);
  const [metrics, setMetrics] = useState<MaintenanceMetrics | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showWindowModal, setShowWindowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data
  useEffect(() => {
    const mockTasks: MaintenanceTask[] = [
      {
        id: '1',
        title: '数据库性能优化',
        description: '优化数据库查询性能，清理冗余数据',
        type: 'scheduled',
        status: 'pending',
        priority: 'high',
        assignee: '张三',
        scheduledDate: '2024-02-01 02:00:00',
        estimatedDuration: 120,
        affectedSystems: ['数据库服务器', 'API服务'],
        downtime: true,
        completionPercentage: 0,
      },
      {
        id: '2',
        title: '安全补丁更新',
        description: '应用最新的安全补丁和系统更新',
        type: 'preventive',
        status: 'in_progress',
        priority: 'critical',
        assignee: '李四',
        scheduledDate: '2024-01-30 20:00:00',
        estimatedDuration: 90,
        actualDuration: 45,
        affectedSystems: ['Web服务器', '应用服务器'],
        downtime: false,
        completionPercentage: 60,
      },
      {
        id: '3',
        title: '存储空间清理',
        description: '清理临时文件和日志，释放存储空间',
        type: 'preventive',
        status: 'completed',
        priority: 'medium',
        assignee: '王五',
        scheduledDate: '2024-01-29 01:00:00',
        estimatedDuration: 60,
        actualDuration: 45,
        affectedSystems: ['文件服务器'],
        downtime: false,
        completionPercentage: 100,
      },
      {
        id: '4',
        title: '网络设备重启',
        description: '紧急重启网络设备解决连接问题',
        type: 'emergency',
        status: 'completed',
        priority: 'critical',
        assignee: '赵六',
        scheduledDate: '2024-01-30 14:30:00',
        estimatedDuration: 30,
        actualDuration: 25,
        affectedSystems: ['网络设备', '所有服务'],
        downtime: true,
        completionPercentage: 100,
      },
    ];

    const mockWindows: MaintenanceWindow[] = [
      {
        id: '1',
        title: '月度系统维护',
        description: '定期系统维护和性能优化',
        startTime: '2024-02-01 02:00:00',
        endTime: '2024-02-01 06:00:00',
        status: 'scheduled',
        affectedServices: ['用户服务', '数据服务', 'API网关'],
        impact: 'high',
        notificationSent: true,
        approvedBy: '系统管理员',
      },
      {
        id: '2',
        title: '安全更新维护',
        description: '应用安全补丁和系统更新',
        startTime: '2024-01-30 20:00:00',
        endTime: '2024-01-30 22:00:00',
        status: 'active',
        affectedServices: ['Web服务', '认证服务'],
        impact: 'medium',
        notificationSent: true,
        approvedBy: '安全团队',
      },
      {
        id: '3',
        title: '数据库维护',
        description: '数据库索引重建和性能调优',
        startTime: '2024-01-28 03:00:00',
        endTime: '2024-01-28 05:00:00',
        status: 'completed',
        affectedServices: ['数据库服务'],
        impact: 'low',
        notificationSent: true,
        approvedBy: 'DBA团队',
      },
    ];

    const mockSystemHealth: SystemHealth[] = [
      {
        id: '1',
        name: 'Web服务器',
        status: 'healthy',
        uptime: 99.8,
        lastCheck: '2024-01-30 15:30:00',
        metrics: { cpu: 45, memory: 60, disk: 35, network: 20 },
        alerts: 0,
      },
      {
        id: '2',
        name: '数据库服务器',
        status: 'warning',
        uptime: 99.5,
        lastCheck: '2024-01-30 15:30:00',
        metrics: { cpu: 75, memory: 85, disk: 70, network: 30 },
        alerts: 2,
      },
      {
        id: '3',
        name: 'API网关',
        status: 'healthy',
        uptime: 99.9,
        lastCheck: '2024-01-30 15:30:00',
        metrics: { cpu: 30, memory: 40, disk: 25, network: 50 },
        alerts: 0,
      },
      {
        id: '4',
        name: '文件服务器',
        status: 'maintenance',
        uptime: 98.2,
        lastCheck: '2024-01-30 15:25:00',
        metrics: { cpu: 20, memory: 30, disk: 90, network: 15 },
        alerts: 1,
      },
    ];

    const mockMetrics: MaintenanceMetrics = {
      totalTasks: 24,
      completedTasks: 18,
      averageCompletionTime: 75,
      systemUptime: 99.2,
      scheduledDowntime: 8,
      emergencyTasks: 3,
    };

    setTasks(mockTasks);
    setWindows(mockWindows);
    setSystemHealth(mockSystemHealth);
    setMetrics(mockMetrics);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'completed': return '#34C759';
      case 'warning': case 'in_progress': case 'active': return '#FF9500';
      case 'critical': case 'emergency': return '#FF3B30';
      case 'maintenance': case 'pending': case 'scheduled': return '#007AFF';
      case 'cancelled': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#007AFF';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const handleTaskAction = (taskId: string, action: 'start' | 'complete' | 'cancel') => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        switch (action) {
          case 'start':
            return { ...task, status: 'in_progress', completionPercentage: 10 };
          case 'complete':
            return { ...task, status: 'completed', completionPercentage: 100 };
          case 'cancel':
            return { ...task, status: 'cancelled' };
          default:
            return task;
        }
      }
      return task;
    }));
  };

  const handleWindowAction = (windowId: string, action: 'start' | 'complete' | 'cancel') => {
    setWindows(prev => prev.map(window => {
      if (window.id === windowId) {
        switch (action) {
          case 'start':
            return { ...window, status: 'active' };
          case 'complete':
            return { ...window, status: 'completed' };
          case 'cancel':
            return { ...window, status: 'cancelled' };
          default:
            return window;
        }
      }
      return window;
    }));
  };

  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filterStatus);

  const renderTaskCard = ({ item }: { item: MaintenanceTask }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <View style={styles.taskBadges}>
            <View style={[styles.typeBadge, { backgroundColor: getStatusColor(item.type) }]}>
              <Text style={styles.badgeText}>
                {item.type === 'scheduled' ? '计划' : 
                 item.type === 'emergency' ? '紧急' : 
                 item.type === 'preventive' ? '预防' : '修复'}
              </Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.badgeText}>
                {item.priority === 'critical' ? '紧急' : 
                 item.priority === 'high' ? '高' : 
                 item.priority === 'medium' ? '中' : '低'}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
      </View>
      
      <Text style={styles.taskDescription}>{item.description}</Text>
      
      <View style={styles.taskDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.detailText}>负责人: {item.assignee}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>计划时间: {item.scheduledDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="hourglass-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            预计耗时: {item.estimatedDuration}分钟
            {item.actualDuration && ` (实际: ${item.actualDuration}分钟)`}
          </Text>
        </View>
        {item.downtime && (
          <View style={styles.detailRow}>
            <Ionicons name="warning-outline" size={16} color="#FF9500" />
            <Text style={[styles.detailText, { color: '#FF9500' }]}>需要停机维护</Text>
          </View>
        )}
      </View>
      
      {item.status === 'in_progress' && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>进度: {item.completionPercentage}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.completionPercentage}%` }]} />
          </View>
        </View>
      )}
      
      <View style={styles.affectedSystems}>
        <Text style={styles.systemsTitle}>影响系统:</Text>
        <View style={styles.systemsList}>
          {item.affectedSystems.map((system, index) => (
            <View key={index} style={styles.systemTag}>
              <Text style={styles.systemText}>{system}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.taskActions}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={() => handleTaskAction(item.id, 'start')}
          >
            <Text style={styles.startButtonText}>开始</Text>
          </TouchableOpacity>
        )}
        {item.status === 'in_progress' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleTaskAction(item.id, 'complete')}
          >
            <Text style={styles.completeButtonText}>完成</Text>
          </TouchableOpacity>
        )}
        {(item.status === 'pending' || item.status === 'in_progress') && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleTaskAction(item.id, 'cancel')}
          >
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.detailButton]}
          onPress={() => setSelectedTask(item)}
        >
          <Text style={styles.detailButtonText}>详情</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMaintenanceWindow = ({ item }: { item: MaintenanceWindow }) => (
    <View style={styles.windowCard}>
      <View style={styles.windowHeader}>
        <Text style={styles.windowTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status === 'scheduled' ? '计划中' : 
             item.status === 'active' ? '进行中' : 
             item.status === 'completed' ? '已完成' : '已取消'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.windowDescription}>{item.description}</Text>
      
      <View style={styles.windowDetails}>
        <View style={styles.timeRange}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.timeText}>
            {item.startTime} - {item.endTime}
          </Text>
        </View>
        
        <View style={styles.impactLevel}>
          <Ionicons name="alert-circle-outline" size={16} color={getStatusColor(item.impact)} />
          <Text style={[styles.impactText, { color: getStatusColor(item.impact) }]}>
            影响级别: {item.impact === 'high' ? '高' : item.impact === 'medium' ? '中' : '低'}
          </Text>
        </View>
        
        <View style={styles.approvalInfo}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#34C759" />
          <Text style={styles.approvalText}>批准人: {item.approvedBy}</Text>
        </View>
      </View>
      
      <View style={styles.affectedServices}>
        <Text style={styles.servicesTitle}>影响服务:</Text>
        <View style={styles.servicesList}>
          {item.affectedServices.map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.windowActions}>
        {item.status === 'scheduled' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={() => handleWindowAction(item.id, 'start')}
            >
              <Text style={styles.startButtonText}>开始</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleWindowAction(item.id, 'cancel')}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'active' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleWindowAction(item.id, 'complete')}
          >
            <Text style={styles.completeButtonText}>完成</Text>
          </TouchableOpacity>
        )}
        {!item.notificationSent && (
          <TouchableOpacity style={[styles.actionButton, styles.notifyButton]}>
            <Text style={styles.notifyButtonText}>发送通知</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderSystemHealth = ({ item }: { item: SystemHealth }) => (
    <View style={styles.healthCard}>
      <View style={styles.healthHeader}>
        <Text style={styles.systemName}>{item.name}</Text>
        <View style={styles.healthStatus}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusLabel, { color: getStatusColor(item.status) }]}>
            {item.status === 'healthy' ? '健康' : 
             item.status === 'warning' ? '警告' : 
             item.status === 'critical' ? '严重' : '维护中'}
          </Text>
        </View>
      </View>
      
      <View style={styles.uptimeContainer}>
        <Text style={styles.uptimeLabel}>运行时间</Text>
        <Text style={styles.uptimeValue}>{item.uptime}%</Text>
      </View>
      
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>CPU</Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { 
              width: `${item.metrics.cpu}%`, 
              backgroundColor: item.metrics.cpu > 80 ? '#FF3B30' : '#34C759' 
            }]} />
          </View>
          <Text style={styles.metricValue}>{item.metrics.cpu}%</Text>
        </View>
        
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>内存</Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { 
              width: `${item.metrics.memory}%`, 
              backgroundColor: item.metrics.memory > 80 ? '#FF3B30' : '#34C759' 
            }]} />
          </View>
          <Text style={styles.metricValue}>{item.metrics.memory}%</Text>
        </View>
        
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>磁盘</Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { 
              width: `${item.metrics.disk}%`, 
              backgroundColor: item.metrics.disk > 80 ? '#FF3B30' : '#34C759' 
            }]} />
          </View>
          <Text style={styles.metricValue}>{item.metrics.disk}%</Text>
        </View>
        
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>网络</Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { 
              width: `${item.metrics.network}%`, 
              backgroundColor: '#007AFF' 
            }]} />
          </View>
          <Text style={styles.metricValue}>{item.metrics.network}%</Text>
        </View>
      </View>
      
      <View style={styles.healthFooter}>
        <Text style={styles.lastCheck}>最后检查: {item.lastCheck}</Text>
        {item.alerts > 0 && (
          <View style={styles.alertsBadge}>
            <Ionicons name="warning" size={14} color="#FF9500" />
            <Text style={styles.alertsText}>{item.alerts} 个警告</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderMetricsChart = () => {
    if (!metrics) return null;

    const chartData = {
      labels: ['已完成', '进行中', '待处理'],
      datasets: [{
        data: [metrics.completedTasks, 3, metrics.totalTasks - metrics.completedTasks - 3]
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>维护任务统计</Text>
        <PieChart
          data={[
            { name: '已完成', population: metrics.completedTasks, color: '#34C759', legendFontColor: '#333', legendFontSize: 12 },
            { name: '进行中', population: 3, color: '#FF9500', legendFontColor: '#333', legendFontSize: 12 },
            { name: '待处理', population: metrics.totalTasks - metrics.completedTasks - 3, color: '#007AFF', legendFontColor: '#333', legendFontSize: 12 },
          ]}
          width={width - 60}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>维护调度</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowTaskModal(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>
            维护任务
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'windows' && styles.activeTab]}
          onPress={() => setActiveTab('windows')}
        >
          <Text style={[styles.tabText, activeTab === 'windows' && styles.activeTabText]}>
            维护窗口
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'health' && styles.activeTab]}
          onPress={() => setActiveTab('health')}
        >
          <Text style={[styles.tabText, activeTab === 'health' && styles.activeTabText]}>
            系统健康
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'metrics' && styles.activeTab]}
          onPress={() => setActiveTab('metrics')}
        >
          <Text style={[styles.tabText, activeTab === 'metrics' && styles.activeTabText]}>
            统计指标
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'tasks' && (
        <View style={styles.content}>
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['all', 'pending', 'in_progress', 'completed'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterButton, filterStatus === status && styles.activeFilter]}
                  onPress={() => setFilterStatus(status)}
                >
                  <Text style={[styles.filterText, filterStatus === status && styles.activeFilterText]}>
                    {status === 'all' ? '全部' : 
                     status === 'pending' ? '待处理' : 
                     status === 'in_progress' ? '进行中' : '已完成'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <FlatList
            data={filteredTasks}
            renderItem={renderTaskCard}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}

      {activeTab === 'windows' && (
        <FlatList
          data={windows}
          renderItem={renderMaintenanceWindow}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'health' && (
        <FlatList
          data={systemHealth}
          renderItem={renderSystemHealth}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'metrics' && (
        <ScrollView contentContainerStyle={styles.metricsContent}>
          {metrics && (
            <>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricNumber}>{metrics.totalTasks}</Text>
                  <Text style={styles.metricLabel}>总任务数</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricNumber}>{metrics.completedTasks}</Text>
                  <Text style={styles.metricLabel}>已完成</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricNumber}>{metrics.averageCompletionTime}分钟</Text>
                  <Text style={styles.metricLabel}>平均完成时间</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricNumber}>{metrics.systemUptime}%</Text>
                  <Text style={styles.metricLabel}>系统运行时间</Text>
                </View>
              </View>
              {renderMetricsChart()}
            </>
          )}
        </ScrollView>
      )}

      {/* Task Detail Modal */}
      <Modal
        visible={selectedTask !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedTask(null)}>
              <Text style={styles.closeButton}>关闭</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>任务详情</Text>
            <View style={{ width: 50 }} />
          </View>
          
          {selectedTask && (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.taskDetailTitle}>{selectedTask.title}</Text>
              <Text style={styles.taskDetailDescription}>{selectedTask.description}</Text>
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>基本信息</Text>
                <Text style={styles.detailItem}>类型: {selectedTask.type}</Text>
                <Text style={styles.detailItem}>状态: {selectedTask.status}</Text>
                <Text style={styles.detailItem}>优先级: {selectedTask.priority}</Text>
                <Text style={styles.detailItem}>负责人: {selectedTask.assignee}</Text>
                <Text style={styles.detailItem}>计划时间: {selectedTask.scheduledDate}</Text>
                <Text style={styles.detailItem}>预计耗时: {selectedTask.estimatedDuration}分钟</Text>
                {selectedTask.actualDuration && (
                  <Text style={styles.detailItem}>实际耗时: {selectedTask.actualDuration}分钟</Text>
                )}
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>影响系统</Text>
                {selectedTask.affectedSystems.map((system, index) => (
                  <Text key={index} style={styles.detailItem}>• {system}</Text>
                ))}
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
  content: {
    flex: 1,
  },
  filterContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  taskCard: {
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  taskBadges: {
    flexDirection: 'row',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  taskDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  affectedSystems: {
    marginBottom: 15,
  },
  systemsTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  systemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  systemTag: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  systemText: {
    fontSize: 10,
    color: '#007AFF',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#34C759',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#007AFF',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  detailButton: {
    backgroundColor: '#f0f0f0',
  },
  detailButtonText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '500',
  },
  windowCard: {
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
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  windowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
  },
  windowDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  windowDetails: {
    marginBottom: 15,
  },
  timeRange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  impactLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactText: {
    fontSize: 12,
    marginLeft: 8,
  },
  approvalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approvalText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  affectedServices: {
    marginBottom: 15,
  },
  servicesTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceTag: {
    backgroundColor: '#fff5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  serviceText: {
    fontSize: 10,
    color: '#FF3B30',
  },
  windowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notifyButton: {
    backgroundColor: '#FF9500',
  },
  notifyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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
    marginBottom: 15,
  },
  systemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  uptimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  uptimeLabel: {
    fontSize: 14,
    color: '#666',
  },
  uptimeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  metricsContainer: {
    marginBottom: 15,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    width: 40,
  },
  metricBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricValue: {
    fontSize: 12,
    color: '#666',
    width: 35,
    textAlign: 'right',
  },
  healthFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastCheck: {
    fontSize: 10,
    color: '#999',
  },
  alertsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertsText: {
    fontSize: 10,
    color: '#FF9500',
    marginLeft: 4,
  },
  metricsContent: {
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
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  taskDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  taskDetailDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  detailItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default MaintenanceScheduler;