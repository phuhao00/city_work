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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../hooks/useTheme';

interface DataAnalyticsProps {
  navigation?: any;
}

interface AnalyticsReport {
  id: string;
  name: string;
  type: 'user_behavior' | 'performance' | 'business' | 'technical';
  description: string;
  lastGenerated: Date;
  status: 'ready' | 'generating' | 'error';
  insights: string[];
  metrics: { [key: string]: number };
}

interface CustomQuery {
  id: string;
  name: string;
  query: string;
  description: string;
  schedule: 'manual' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  lastRun: Date;
  results?: any[];
}

interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'external';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: Date;
  recordCount: number;
  enabled: boolean;
}

const DataAnalytics: React.FC<DataAnalyticsProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [customQueries, setCustomQueries] = useState<CustomQuery[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedTab, setSelectedTab] = useState<'reports' | 'queries' | 'sources'>('reports');
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [showCreateQuery, setShowCreateQuery] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadReports();
    loadCustomQueries();
    loadDataSources();
  }, []);

  const loadReports = async () => {
    try {
      const mockReports: AnalyticsReport[] = [
        {
          id: '1',
          name: '用户行为分析',
          type: 'user_behavior',
          description: '分析用户在平台上的行为模式和偏好',
          lastGenerated: new Date(),
          status: 'ready',
          insights: [
            '用户平均会话时长增加了15%',
            '职位搜索功能使用率提升了23%',
            '移动端用户占比达到78%',
          ],
          metrics: {
            activeUsers: 15420,
            sessionDuration: 8.5,
            bounceRate: 12.3,
            conversionRate: 4.2,
          },
        },
        {
          id: '2',
          name: '应用性能报告',
          type: 'performance',
          description: '监控应用性能指标和用户体验',
          lastGenerated: new Date(),
          status: 'ready',
          insights: [
            'API响应时间平均为120ms',
            '应用启动时间优化了30%',
            '内存使用率保持在85MB以下',
          ],
          metrics: {
            avgResponseTime: 120,
            appStartTime: 1.2,
            memoryUsage: 85,
            crashRate: 0.02,
          },
        },
        {
          id: '3',
          name: '业务增长分析',
          type: 'business',
          description: '分析平台业务增长趋势和关键指标',
          lastGenerated: new Date(),
          status: 'generating',
          insights: [],
          metrics: {
            newUsers: 2340,
            revenue: 125000,
            jobPostings: 890,
            applications: 5670,
          },
        },
      ];

      setReports(mockReports);
    } catch (error) {
      console.error('加载分析报告失败:', error);
    }
  };

  const loadCustomQueries = async () => {
    try {
      const mockQueries: CustomQuery[] = [
        {
          id: '1',
          name: '热门职位类别',
          query: 'SELECT category, COUNT(*) as count FROM jobs GROUP BY category ORDER BY count DESC LIMIT 10',
          description: '统计最受欢迎的职位类别',
          schedule: 'daily',
          enabled: true,
          lastRun: new Date(),
          results: [
            { category: '软件开发', count: 234 },
            { category: '产品经理', count: 156 },
            { category: '数据分析', count: 123 },
          ],
        },
        {
          id: '2',
          name: '用户注册趋势',
          query: 'SELECT DATE(created_at) as date, COUNT(*) as registrations FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(created_at)',
          description: '过去30天的用户注册趋势',
          schedule: 'weekly',
          enabled: true,
          lastRun: new Date(),
        },
        {
          id: '3',
          name: '企业活跃度',
          query: 'SELECT company_id, COUNT(*) as job_posts FROM jobs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY company_id ORDER BY job_posts DESC',
          description: '企业发布职位活跃度统计',
          schedule: 'manual',
          enabled: false,
          lastRun: new Date(),
        },
      ];

      setCustomQueries(mockQueries);
    } catch (error) {
      console.error('加载自定义查询失败:', error);
    }
  };

  const loadDataSources = async () => {
    try {
      const mockDataSources: DataSource[] = [
        {
          id: '1',
          name: '用户数据库',
          type: 'database',
          status: 'connected',
          lastSync: new Date(),
          recordCount: 15420,
          enabled: true,
        },
        {
          id: '2',
          name: '职位数据API',
          type: 'api',
          status: 'connected',
          lastSync: new Date(),
          recordCount: 8930,
          enabled: true,
        },
        {
          id: '3',
          name: '应用日志文件',
          type: 'file',
          status: 'connected',
          lastSync: new Date(),
          recordCount: 125000,
          enabled: true,
        },
        {
          id: '4',
          name: '第三方分析服务',
          type: 'external',
          status: 'error',
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
          recordCount: 0,
          enabled: false,
        },
      ];

      setDataSources(mockDataSources);
    } catch (error) {
      console.error('加载数据源失败:', error);
    }
  };

  const generateReport = async (reportId: string) => {
    try {
      const updatedReports = reports.map(report =>
        report.id === reportId
          ? { ...report, status: 'generating' as const }
          : report
      );
      setReports(updatedReports);

      Alert.alert('报告生成中', '正在生成分析报告，请稍候...');

      // 模拟报告生成
      setTimeout(() => {
        const finalReports = reports.map(report =>
          report.id === reportId
            ? { 
                ...report, 
                status: 'ready' as const,
                lastGenerated: new Date(),
                insights: [
                  '数据分析完成',
                  '发现新的趋势模式',
                  '建议优化策略已生成',
                ]
              }
            : report
        );
        setReports(finalReports);
        Alert.alert('完成', '分析报告已生成');
      }, 3000);
    } catch (error) {
      Alert.alert('错误', '生成报告失败');
    }
  };

  const runQuery = async (queryId: string) => {
    try {
      Alert.alert('查询执行中', '正在执行自定义查询...');

      // 模拟查询执行
      setTimeout(() => {
        const updatedQueries = customQueries.map(query =>
          query.id === queryId
            ? { ...query, lastRun: new Date() }
            : query
        );
        setCustomQueries(updatedQueries);
        Alert.alert('完成', '查询执行完成');
      }, 2000);
    } catch (error) {
      Alert.alert('错误', '查询执行失败');
    }
  };

  const syncDataSource = async (sourceId: string) => {
    try {
      Alert.alert('同步中', '正在同步数据源...');

      // 模拟数据同步
      setTimeout(() => {
        const updatedSources = dataSources.map(source =>
          source.id === sourceId
            ? { 
                ...source, 
                lastSync: new Date(),
                status: 'connected' as const,
                recordCount: source.recordCount + Math.floor(Math.random() * 100)
              }
            : source
        );
        setDataSources(updatedSources);
        Alert.alert('完成', '数据源同步完成');
      }, 2000);
    } catch (error) {
      Alert.alert('错误', '数据源同步失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
      case 'connected':
        return '#4CAF50';
      case 'generating':
        return '#FF9800';
      case 'error':
      case 'disconnected':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
      case 'connected':
        return 'checkmark-circle';
      case 'generating':
        return 'time';
      case 'error':
      case 'disconnected':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user_behavior':
        return 'people';
      case 'performance':
        return 'speedometer';
      case 'business':
        return 'trending-up';
      case 'technical':
        return 'code-slash';
      case 'database':
        return 'server';
      case 'api':
        return 'cloud';
      case 'file':
        return 'document';
      case 'external':
        return 'link';
      default:
        return 'analytics';
    }
  };

  const renderReportsTab = () => (
    <View>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: theme.colors.text }]}>
          分析报告
        </Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowCreateReport(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>创建报告</Text>
        </TouchableOpacity>
      </View>

      {reports.map((report) => (
        <View
          key={report.id}
          style={[styles.reportCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.reportHeader}>
            <View style={styles.reportInfo}>
              <View style={styles.reportTitle}>
                <Ionicons
                  name={getTypeIcon(report.type) as any}
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={[styles.reportName, { color: theme.colors.text }]}>
                  {report.name}
                </Text>
              </View>
              <Text style={[styles.reportDescription, { color: theme.colors.textSecondary }]}>
                {report.description}
              </Text>
            </View>
            <View style={styles.reportStatus}>
              <Ionicons
                name={getStatusIcon(report.status) as any}
                size={20}
                color={getStatusColor(report.status)}
              />
              <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                {report.status === 'ready' ? '就绪' : 
                 report.status === 'generating' ? '生成中' : '错误'}
              </Text>
            </View>
          </View>

          {report.metrics && Object.keys(report.metrics).length > 0 && (
            <View style={styles.metricsContainer}>
              <Text style={[styles.metricsTitle, { color: theme.colors.text }]}>
                关键指标
              </Text>
              <View style={styles.metricsGrid}>
                {Object.entries(report.metrics).map(([key, value]) => (
                  <View key={key} style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </Text>
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      {key}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {report.insights.length > 0 && (
            <View style={styles.insightsContainer}>
              <Text style={[styles.insightsTitle, { color: theme.colors.text }]}>
                关键洞察
              </Text>
              {report.insights.map((insight, index) => (
                <View key={index} style={styles.insightItem}>
                  <Ionicons
                    name="bulb"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text style={[styles.insightText, { color: theme.colors.text }]}>
                    {insight}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.reportActions}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: theme.colors.primary }]}
              onPress={() => generateReport(report.id)}
              disabled={report.status === 'generating'}
            >
              <Ionicons
                name={report.status === 'generating' ? 'time' : 'refresh'}
                size={16}
                color={theme.colors.primary}
              />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                {report.status === 'generating' ? '生成中' : '重新生成'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: theme.colors.primary }]}
            >
              <Ionicons name="download" size={16} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                导出
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.lastGenerated, { color: theme.colors.textSecondary }]}>
            最后生成: {report.lastGenerated.toLocaleString()}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderQueriesTab = () => (
    <View>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: theme.colors.text }]}>
          自定义查询
        </Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowCreateQuery(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>创建查询</Text>
        </TouchableOpacity>
      </View>

      {customQueries.map((query) => (
        <View
          key={query.id}
          style={[styles.queryCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.queryHeader}>
            <View style={styles.queryInfo}>
              <Text style={[styles.queryName, { color: theme.colors.text }]}>
                {query.name}
              </Text>
              <Text style={[styles.queryDescription, { color: theme.colors.textSecondary }]}>
                {query.description}
              </Text>
            </View>
            <Switch
              value={query.enabled}
              onValueChange={(value) => {
                const updatedQueries = customQueries.map(q =>
                  q.id === query.id ? { ...q, enabled: value } : q
                );
                setCustomQueries(updatedQueries);
              }}
              trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
              thumbColor={query.enabled ? '#FFFFFF' : '#F4F3F4'}
            />
          </View>

          <View style={styles.queryCode}>
            <Text style={[styles.queryCodeText, { color: theme.colors.textSecondary }]}>
              {query.query}
            </Text>
          </View>

          <View style={styles.queryMeta}>
            <Text style={[styles.querySchedule, { color: theme.colors.textSecondary }]}>
              调度: {query.schedule === 'manual' ? '手动' : 
                     query.schedule === 'daily' ? '每日' :
                     query.schedule === 'weekly' ? '每周' : '每月'}
            </Text>
            <Text style={[styles.queryLastRun, { color: theme.colors.textSecondary }]}>
              最后运行: {query.lastRun.toLocaleString()}
            </Text>
          </View>

          <View style={styles.queryActions}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: theme.colors.primary }]}
              onPress={() => runQuery(query.id)}
            >
              <Ionicons name="play" size={16} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                运行
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: theme.colors.primary }]}
            >
              <Ionicons name="create" size={16} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                编辑
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderSourcesTab = () => (
    <View>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: theme.colors.text }]}>
          数据源
        </Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>添加数据源</Text>
        </TouchableOpacity>
      </View>

      {dataSources.map((source) => (
        <View
          key={source.id}
          style={[styles.sourceCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.sourceHeader}>
            <View style={styles.sourceInfo}>
              <View style={styles.sourceTitle}>
                <Ionicons
                  name={getTypeIcon(source.type) as any}
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={[styles.sourceName, { color: theme.colors.text }]}>
                  {source.name}
                </Text>
              </View>
              <View style={styles.sourceStatus}>
                <Ionicons
                  name={getStatusIcon(source.status) as any}
                  size={16}
                  color={getStatusColor(source.status)}
                />
                <Text style={[styles.sourceStatusText, { color: getStatusColor(source.status) }]}>
                  {source.status === 'connected' ? '已连接' : 
                   source.status === 'disconnected' ? '已断开' : '错误'}
                </Text>
              </View>
            </View>
            <Switch
              value={source.enabled}
              onValueChange={(value) => {
                const updatedSources = dataSources.map(s =>
                  s.id === source.id ? { ...s, enabled: value } : s
                );
                setDataSources(updatedSources);
              }}
              trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
              thumbColor={source.enabled ? '#FFFFFF' : '#F4F3F4'}
            />
          </View>

          <View style={styles.sourceStats}>
            <View style={styles.sourceStat}>
              <Text style={[styles.sourceStatValue, { color: theme.colors.text }]}>
                {source.recordCount.toLocaleString()}
              </Text>
              <Text style={[styles.sourceStatLabel, { color: theme.colors.textSecondary }]}>
                记录数
              </Text>
            </View>
            <View style={styles.sourceStat}>
              <Text style={[styles.sourceStatValue, { color: theme.colors.text }]}>
                {source.type}
              </Text>
              <Text style={[styles.sourceStatLabel, { color: theme.colors.textSecondary }]}>
                类型
              </Text>
            </View>
          </View>

          <View style={styles.sourceActions}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: theme.colors.primary }]}
              onPress={() => syncDataSource(source.id)}
            >
              <Ionicons name="sync" size={16} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                同步
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: theme.colors.primary }]}
            >
              <Ionicons name="settings" size={16} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                配置
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sourceLastSync, { color: theme.colors.textSecondary }]}>
            最后同步: {source.lastSync.toLocaleString()}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 标签页导航 */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'reports', label: '分析报告', icon: 'analytics' },
          { key: 'queries', label: '自定义查询', icon: 'code-slash' },
          { key: 'sources', label: '数据源', icon: 'server' },
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
      <ScrollView style={styles.tabContent}>
        {selectedTab === 'reports' && renderReportsTab()}
        {selectedTab === 'queries' && renderQueriesTab()}
        {selectedTab === 'sources' && renderSourcesTab()}
      </ScrollView>

      {/* 创建报告模态框 */}
      <Modal
        visible={showCreateReport}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateReport(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              创建分析报告
            </Text>
            {/* 这里可以添加表单字段 */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateReport(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.primary }]}>
                取消
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 创建查询模态框 */}
      <Modal
        visible={showCreateQuery}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateQuery(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              创建自定义查询
            </Text>
            {/* 这里可以添加表单字段 */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateQuery(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.primary }]}>
                取消
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
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  reportCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  reportDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  reportStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  metricsContainer: {
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  insightsContainer: {
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 14,
    marginLeft: 4,
  },
  lastGenerated: {
    fontSize: 12,
    textAlign: 'center',
  },
  queryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  queryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  queryInfo: {
    flex: 1,
  },
  queryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  queryDescription: {
    fontSize: 14,
  },
  queryCode: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  queryCodeText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  queryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  querySchedule: {
    fontSize: 12,
  },
  queryLastRun: {
    fontSize: 12,
  },
  queryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sourceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  sourceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceStatusText: {
    fontSize: 14,
    marginLeft: 6,
  },
  sourceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  sourceStat: {
    alignItems: 'center',
  },
  sourceStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sourceStatLabel: {
    fontSize: 12,
  },
  sourceActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  sourceLastSync: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DataAnalytics;