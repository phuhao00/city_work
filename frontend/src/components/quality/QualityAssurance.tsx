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

interface QualityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'improving' | 'declining' | 'stable';
  category: string;
  lastUpdated: string;
}

interface QualityIssue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  assignee: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  dueDate: string;
  tags: string[];
}

interface QualityTest {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance';
  status: 'passed' | 'failed' | 'skipped' | 'running';
  duration: number;
  coverage: number;
  lastRun: string;
  environment: string;
}

interface QualityReport {
  id: string;
  title: string;
  period: string;
  overallScore: number;
  metrics: {
    codeQuality: number;
    testCoverage: number;
    bugDensity: number;
    performance: number;
  };
  generatedAt: string;
}

const QualityAssurance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'issues' | 'tests' | 'reports'>('metrics');
  const [metrics, setMetrics] = useState<QualityMetric[]>([]);
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [tests, setTests] = useState<QualityTest[]>([]);
  const [reports, setReports] = useState<QualityReport[]>([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<QualityIssue | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  useEffect(() => {
    const mockMetrics: QualityMetric[] = [
      {
        id: '1',
        name: '代码覆盖率',
        value: 85,
        target: 90,
        unit: '%',
        trend: 'improving',
        category: '测试',
        lastUpdated: '2024-01-30 14:30:00',
      },
      {
        id: '2',
        name: '代码复杂度',
        value: 3.2,
        target: 3.0,
        unit: '',
        trend: 'declining',
        category: '代码质量',
        lastUpdated: '2024-01-30 14:30:00',
      },
      {
        id: '3',
        name: '缺陷密度',
        value: 0.8,
        target: 1.0,
        unit: 'bugs/kloc',
        trend: 'improving',
        category: '质量',
        lastUpdated: '2024-01-30 14:30:00',
      },
      {
        id: '4',
        name: '技术债务',
        value: 12,
        target: 8,
        unit: 'hours',
        trend: 'stable',
        category: '维护性',
        lastUpdated: '2024-01-30 14:30:00',
      },
      {
        id: '5',
        name: '安全漏洞',
        value: 2,
        target: 0,
        unit: 'issues',
        trend: 'declining',
        category: '安全',
        lastUpdated: '2024-01-30 14:30:00',
      },
      {
        id: '6',
        name: '性能评分',
        value: 92,
        target: 95,
        unit: 'score',
        trend: 'improving',
        category: '性能',
        lastUpdated: '2024-01-30 14:30:00',
      },
    ];

    const mockIssues: QualityIssue[] = [
      {
        id: '1',
        title: '用户登录接口响应时间过长',
        description: '用户登录接口在高并发情况下响应时间超过3秒，影响用户体验',
        severity: 'high',
        category: '性能',
        assignee: '张三',
        status: 'in_progress',
        createdAt: '2024-01-28',
        dueDate: '2024-02-05',
        tags: ['API', '性能', '登录'],
      },
      {
        id: '2',
        title: '数据库连接池配置不当',
        description: '数据库连接池最大连接数设置过小，导致连接等待时间过长',
        severity: 'medium',
        category: '配置',
        assignee: '李四',
        status: 'open',
        createdAt: '2024-01-29',
        dueDate: '2024-02-10',
        tags: ['数据库', '配置', '连接池'],
      },
      {
        id: '3',
        title: '前端代码重复度过高',
        description: '多个组件存在重复代码，需要提取公共组件',
        severity: 'low',
        category: '代码质量',
        assignee: '王五',
        status: 'resolved',
        createdAt: '2024-01-25',
        dueDate: '2024-02-01',
        tags: ['前端', '重构', '组件'],
      },
      {
        id: '4',
        title: 'SQL注入安全漏洞',
        description: '用户搜索功能存在SQL注入风险，需要立即修复',
        severity: 'critical',
        category: '安全',
        assignee: '赵六',
        status: 'in_progress',
        createdAt: '2024-01-30',
        dueDate: '2024-01-31',
        tags: ['安全', 'SQL注入', '搜索'],
      },
    ];

    const mockTests: QualityTest[] = [
      {
        id: '1',
        name: '用户认证模块测试',
        type: 'unit',
        status: 'passed',
        duration: 45,
        coverage: 92,
        lastRun: '2024-01-30 14:00:00',
        environment: 'development',
      },
      {
        id: '2',
        name: 'API集成测试',
        type: 'integration',
        status: 'failed',
        duration: 120,
        coverage: 78,
        lastRun: '2024-01-30 13:30:00',
        environment: 'staging',
      },
      {
        id: '3',
        name: '端到端用户流程测试',
        type: 'e2e',
        status: 'passed',
        duration: 300,
        coverage: 85,
        lastRun: '2024-01-30 12:00:00',
        environment: 'staging',
      },
      {
        id: '4',
        name: '性能压力测试',
        type: 'performance',
        status: 'running',
        duration: 0,
        coverage: 0,
        lastRun: '2024-01-30 14:30:00',
        environment: 'performance',
      },
    ];

    const mockReports: QualityReport[] = [
      {
        id: '1',
        title: '2024年1月质量报告',
        period: '2024-01-01 至 2024-01-30',
        overallScore: 88,
        metrics: {
          codeQuality: 85,
          testCoverage: 85,
          bugDensity: 92,
          performance: 90,
        },
        generatedAt: '2024-01-30 09:00:00',
      },
      {
        id: '2',
        title: '2023年12月质量报告',
        period: '2023-12-01 至 2023-12-31',
        overallScore: 82,
        metrics: {
          codeQuality: 80,
          testCoverage: 78,
          bugDensity: 88,
          performance: 85,
        },
        generatedAt: '2024-01-01 09:00:00',
      },
    ];

    setMetrics(mockMetrics);
    setIssues(mockIssues);
    setTests(mockTests);
    setReports(mockReports);
  }, []);

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getMetricStatus = (metric: QualityMetric) => {
    const percentage = (metric.value / metric.target) * 100;
    if (percentage >= 100) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 60) return 'warning';
    return 'poor';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return 'trending-up';
      case 'declining': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#34C759';
      case 'declining': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#FFCC00';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return '#34C759';
      case 'failed': return '#FF3B30';
      case 'running': return '#007AFF';
      case 'skipped': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const handleRunTest = (testId: string) => {
    setTests(prev => prev.map(test =>
      test.id === testId ? { ...test, status: 'running' } : test
    ));
    
    // Simulate test completion
    setTimeout(() => {
      setTests(prev => prev.map(test =>
        test.id === testId ? { 
          ...test, 
          status: Math.random() > 0.3 ? 'passed' : 'failed',
          duration: Math.floor(Math.random() * 200) + 30,
          lastRun: new Date().toLocaleString(),
        } : test
      ));
    }, 3000);
  };

  const renderMetricCard = ({ item }: { item: QualityMetric }) => {
    const status = getMetricStatus(item);
    
    return (
      <View style={[styles.metricCard, styles[`metric${status}`]]}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricName}>{item.name}</Text>
          <Ionicons
            name={getTrendIcon(item.trend)}
            size={16}
            color={getTrendColor(item.trend)}
          />
        </View>
        
        <View style={styles.metricValue}>
          <Text style={styles.valueText}>{item.value}</Text>
          <Text style={styles.unitText}>{item.unit}</Text>
        </View>
        
        <View style={styles.targetContainer}>
          <Text style={styles.targetText}>目标: {item.target}{item.unit}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min((item.value / item.target) * 100, 100)}%` },
                { backgroundColor: status === 'excellent' ? '#34C759' : status === 'good' ? '#FFCC00' : '#FF3B30' }
              ]} 
            />
          </View>
        </View>
        
        <Text style={styles.lastUpdated}>
          更新: {item.lastUpdated.split(' ')[1]}
        </Text>
      </View>
    );
  };

  const renderIssue = ({ item }: { item: QualityIssue }) => (
    <TouchableOpacity
      style={styles.issueCard}
      onPress={() => {
        setSelectedIssue(item);
        setShowIssueModal(true);
      }}
    >
      <View style={styles.issueHeader}>
        <View style={styles.issueInfo}>
          <Text style={styles.issueTitle}>{item.title}</Text>
          <Text style={styles.issueAssignee}>负责人: {item.assignee}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.severityText}>
            {item.severity === 'critical' ? '严重' : 
             item.severity === 'high' ? '高' : 
             item.severity === 'medium' ? '中' : '低'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.issueDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.issueFooter}>
        <View style={styles.issueTags}>
          {item.tags.slice(0, 2).map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {item.tags.length > 2 && (
            <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
          )}
        </View>
        <Text style={styles.dueDate}>截止: {item.dueDate}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTest = ({ item }: { item: QualityTest }) => (
    <View style={styles.testCard}>
      <View style={styles.testHeader}>
        <View style={styles.testInfo}>
          <Text style={styles.testName}>{item.name}</Text>
          <Text style={styles.testType}>
            {item.type === 'unit' ? '单元测试' : 
             item.type === 'integration' ? '集成测试' : 
             item.type === 'e2e' ? '端到端测试' : '性能测试'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getTestStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status === 'passed' ? '通过' : 
             item.status === 'failed' ? '失败' : 
             item.status === 'running' ? '运行中' : '跳过'}
          </Text>
        </View>
      </View>
      
      <View style={styles.testMetrics}>
        <View style={styles.testMetric}>
          <Text style={styles.metricLabel}>覆盖率</Text>
          <Text style={styles.metricValue}>{item.coverage}%</Text>
        </View>
        <View style={styles.testMetric}>
          <Text style={styles.metricLabel}>耗时</Text>
          <Text style={styles.metricValue}>{item.duration}s</Text>
        </View>
        <View style={styles.testMetric}>
          <Text style={styles.metricLabel}>环境</Text>
          <Text style={styles.metricValue}>{item.environment}</Text>
        </View>
      </View>
      
      <View style={styles.testActions}>
        <Text style={styles.lastRun}>最后运行: {item.lastRun}</Text>
        <TouchableOpacity
          style={[styles.runButton, item.status === 'running' && styles.disabledButton]}
          onPress={() => handleRunTest(item.id)}
          disabled={item.status === 'running'}
        >
          <Ionicons 
            name={item.status === 'running' ? 'hourglass-outline' : 'play-outline'} 
            size={16} 
            color="#fff" 
          />
          <Text style={styles.runButtonText}>
            {item.status === 'running' ? '运行中' : '运行测试'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReport = ({ item }: { item: QualityReport }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{item.title}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>综合评分</Text>
          <Text style={[styles.scoreValue, { color: item.overallScore >= 80 ? '#34C759' : item.overallScore >= 60 ? '#FF9500' : '#FF3B30' }]}>
            {item.overallScore}
          </Text>
        </View>
      </View>
      
      <Text style={styles.reportPeriod}>{item.period}</Text>
      
      <View style={styles.reportMetrics}>
        <View style={styles.reportMetric}>
          <Text style={styles.reportMetricLabel}>代码质量</Text>
          <Text style={styles.reportMetricValue}>{item.metrics.codeQuality}</Text>
        </View>
        <View style={styles.reportMetric}>
          <Text style={styles.reportMetricLabel}>测试覆盖率</Text>
          <Text style={styles.reportMetricValue}>{item.metrics.testCoverage}%</Text>
        </View>
        <View style={styles.reportMetric}>
          <Text style={styles.reportMetricLabel}>缺陷密度</Text>
          <Text style={styles.reportMetricValue}>{item.metrics.bugDensity}</Text>
        </View>
        <View style={styles.reportMetric}>
          <Text style={styles.reportMetricLabel}>性能评分</Text>
          <Text style={styles.reportMetricValue}>{item.metrics.performance}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.viewReportButton}>
        <Ionicons name="document-text-outline" size={16} color="#007AFF" />
        <Text style={styles.viewReportButtonText}>查看详细报告</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQualityChart = () => {
    const chartData = {
      labels: ['代码质量', '测试覆盖', '缺陷密度', '性能评分'],
      datasets: [{
        data: [85, 85, 92, 90]
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>质量指标概览</Text>
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
        <Text style={styles.title}>质量保证</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'metrics' && styles.activeTab]}
          onPress={() => setActiveTab('metrics')}
        >
          <Text style={[styles.tabText, activeTab === 'metrics' && styles.activeTabText]}>
            质量指标
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'issues' && styles.activeTab]}
          onPress={() => setActiveTab('issues')}
        >
          <Text style={[styles.tabText, activeTab === 'issues' && styles.activeTabText]}>
            问题跟踪
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tests' && styles.activeTab]}
          onPress={() => setActiveTab('tests')}
        >
          <Text style={[styles.tabText, activeTab === 'tests' && styles.activeTabText]}>
            测试管理
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>
            质量报告
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'metrics' && (
        <FlatList
          data={metrics}
          renderItem={renderMetricCard}
          keyExtractor={item => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.metricsContainer}
        />
      )}

      {activeTab === 'issues' && (
        <>
          <View style={styles.filterContainer}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="搜索问题..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilter}>
              {['all', 'open', 'in_progress', 'resolved', 'closed'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    filterStatus === status && styles.activeStatusButton
                  ]}
                  onPress={() => setFilterStatus(status)}
                >
                  <Text style={[
                    styles.statusButtonText,
                    filterStatus === status && styles.activeStatusButtonText
                  ]}>
                    {status === 'all' ? '全部' : 
                     status === 'open' ? '待处理' : 
                     status === 'in_progress' ? '进行中' : 
                     status === 'resolved' ? '已解决' : '已关闭'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <FlatList
            data={filteredIssues}
            renderItem={renderIssue}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}

      {activeTab === 'tests' && (
        <FlatList
          data={tests}
          renderItem={renderTest}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'reports' && (
        <FlatList
          data={reports}
          renderItem={renderReport}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderQualityChart}
        />
      )}

      {/* Issue Detail Modal */}
      <Modal
        visible={showIssueModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowIssueModal(false)}>
              <Text style={styles.closeButton}>关闭</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>问题详情</Text>
            <TouchableOpacity>
              <Text style={styles.editButton}>编辑</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedIssue && (
              <>
                <Text style={styles.issueDetailTitle}>{selectedIssue.title}</Text>
                <Text style={styles.issueDetailDescription}>{selectedIssue.description}</Text>
                
                <View style={styles.issueDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>严重程度:</Text>
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(selectedIssue.severity) }]}>
                      <Text style={styles.severityText}>
                        {selectedIssue.severity === 'critical' ? '严重' : 
                         selectedIssue.severity === 'high' ? '高' : 
                         selectedIssue.severity === 'medium' ? '中' : '低'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>负责人:</Text>
                    <Text style={styles.detailValue}>{selectedIssue.assignee}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>截止日期:</Text>
                    <Text style={styles.detailValue}>{selectedIssue.dueDate}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>标签:</Text>
                    <View style={styles.tagContainer}>
                      {selectedIssue.tags.map(tag => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </>
            )}
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
  filterContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 10,
    fontSize: 16,
  },
  statusFilter: {
    flexDirection: 'row',
  },
  statusButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  activeStatusButton: {
    backgroundColor: '#007AFF',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeStatusButtonText: {
    color: '#fff',
  },
  metricsContainer: {
    padding: 15,
  },
  listContainer: {
    padding: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricexcellent: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  metricgood: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFCC00',
  },
  metricwarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  metricpoor: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  unitText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  targetContainer: {
    marginBottom: 10,
  },
  targetText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  lastUpdated: {
    fontSize: 10,
    color: '#999',
  },
  issueCard: {
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
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  issueInfo: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  issueAssignee: {
    fontSize: 12,
    color: '#666',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  issueDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issueTags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
  },
  tagText: {
    fontSize: 10,
    color: '#666',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#999',
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
  },
  testCard: {
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
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  testType: {
    fontSize: 12,
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
  testMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  testMetric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  testActions: {
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
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  reportPeriod: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  reportMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  reportMetric: {
    width: '50%',
    marginBottom: 10,
  },
  reportMetricLabel: {
    fontSize: 12,
    color: '#666',
  },
  reportMetricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  viewReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
  },
  viewReportButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
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
  editButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  issueDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  issueDetailDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  issueDetails: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
});

export default QualityAssurance;