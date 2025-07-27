import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../hooks/useTheme';

interface TestingDashboardProps {
  navigation?: any;
}

interface TestResult {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance';
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration: number;
  timestamp: Date;
  coverage?: number;
  error?: string;
}

interface TestSuite {
  id: string;
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage: number;
  duration: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
}

const TestingDashboard: React.FC<TestingDashboardProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadTestData();
    loadPerformanceMetrics();
  }, [selectedTimeRange]);

  const loadTestData = async () => {
    try {
      // 模拟测试数据
      const mockTestSuites: TestSuite[] = [
        {
          id: '1',
          name: 'Frontend Unit Tests',
          tests: [
            {
              id: '1',
              name: 'UserProfile Component',
              type: 'unit',
              status: 'passed',
              duration: 120,
              timestamp: new Date(),
              coverage: 95,
            },
            {
              id: '2',
              name: 'JobCard Component',
              type: 'unit',
              status: 'passed',
              duration: 85,
              timestamp: new Date(),
              coverage: 88,
            },
            {
              id: '3',
              name: 'SearchFilter Component',
              type: 'unit',
              status: 'failed',
              duration: 200,
              timestamp: new Date(),
              coverage: 70,
              error: 'Expected 3 but received 2',
            },
          ],
          totalTests: 45,
          passedTests: 42,
          failedTests: 3,
          coverage: 87,
          duration: 2500,
        },
        {
          id: '2',
          name: 'Backend API Tests',
          tests: [
            {
              id: '4',
              name: 'User Authentication',
              type: 'integration',
              status: 'passed',
              duration: 350,
              timestamp: new Date(),
            },
            {
              id: '5',
              name: 'Job Search API',
              type: 'integration',
              status: 'passed',
              duration: 280,
              timestamp: new Date(),
            },
          ],
          totalTests: 28,
          passedTests: 26,
          failedTests: 2,
          coverage: 92,
          duration: 3200,
        },
        {
          id: '3',
          name: 'E2E Tests',
          tests: [
            {
              id: '6',
              name: 'User Registration Flow',
              type: 'e2e',
              status: 'running',
              duration: 0,
              timestamp: new Date(),
            },
          ],
          totalTests: 12,
          passedTests: 10,
          failedTests: 1,
          coverage: 0,
          duration: 8500,
        },
      ];

      setTestSuites(mockTestSuites);
    } catch (error) {
      console.error('加载测试数据失败:', error);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      const mockMetrics: PerformanceMetric[] = [
        {
          name: '应用启动时间',
          value: 1.2,
          unit: 's',
          threshold: 2.0,
          status: 'good',
        },
        {
          name: '内存使用',
          value: 85,
          unit: 'MB',
          threshold: 100,
          status: 'warning',
        },
        {
          name: 'API响应时间',
          value: 250,
          unit: 'ms',
          threshold: 500,
          status: 'good',
        },
        {
          name: 'FPS',
          value: 58,
          unit: 'fps',
          threshold: 60,
          status: 'warning',
        },
        {
          name: '网络请求成功率',
          value: 99.2,
          unit: '%',
          threshold: 95,
          status: 'good',
        },
      ];

      setPerformanceMetrics(mockMetrics);
    } catch (error) {
      console.error('加载性能指标失败:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadTestData(), loadPerformanceMetrics()]);
    setRefreshing(false);
  };

  const runAllTests = () => {
    Alert.alert(
      '运行所有测试',
      '确定要运行所有测试套件吗？这可能需要几分钟时间。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '运行',
          onPress: () => {
            Alert.alert('测试启动', '所有测试套件已开始运行');
            // 这里实现运行测试的逻辑
          },
        },
      ]
    );
  };

  const runSpecificTest = (testSuite: TestSuite) => {
    Alert.alert(
      '运行测试套件',
      `确定要运行 "${testSuite.name}" 测试套件吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '运行',
          onPress: () => {
            Alert.alert('测试启动', `${testSuite.name} 测试套件已开始运行`);
            // 这里实现运行特定测试套件的逻辑
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return '#4CAF50';
      case 'failed':
        return '#F44336';
      case 'running':
        return '#FF9800';
      case 'pending':
        return '#9E9E9E';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return 'checkmark-circle';
      case 'failed':
        return 'close-circle';
      case 'running':
        return 'time';
      case 'pending':
        return 'ellipse';
      default:
        return 'help-circle';
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'critical':
        return '#F44336';
      default:
        return theme.colors.textSecondary;
    }
  };

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
  const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0);
  const overallCoverage = testSuites.reduce((sum, suite) => sum + suite.coverage, 0) / testSuites.length;

  // 图表数据
  const coverageData = {
    labels: testSuites.map(suite => suite.name.split(' ')[0]),
    datasets: [
      {
        data: testSuites.map(suite => suite.coverage),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const testResultsData = [
    {
      name: '通过',
      population: totalPassed,
      color: '#4CAF50',
      legendFontColor: theme.colors.text,
      legendFontSize: 15,
    },
    {
      name: '失败',
      population: totalFailed,
      color: '#F44336',
      legendFontColor: theme.colors.text,
      legendFontSize: 15,
    },
    {
      name: '待运行',
      population: totalTests - totalPassed - totalFailed,
      color: '#9E9E9E',
      legendFontColor: theme.colors.text,
      legendFontSize: 15,
    },
  ];

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4CAF50',
    },
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 总览卡片 */}
      <View style={styles.overviewSection}>
        <View style={[styles.overviewCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.overviewTitle, { color: theme.colors.text }]}>
            测试总览
          </Text>
          <View style={styles.overviewStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
                {totalPassed}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                通过
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#F44336' }]}>
                {totalFailed}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                失败
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {totalTests}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                总计
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
                {overallCoverage.toFixed(1)}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                覆盖率
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 操作按钮 */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={runAllTests}
        >
          <Ionicons name="play" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>运行所有测试</Text>
        </TouchableOpacity>
      </View>

      {/* 时间范围选择 */}
      <View style={styles.timeRangeSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          时间范围
        </Text>
        <View style={styles.timeRangeButtons}>
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                {
                  backgroundColor: selectedTimeRange === range
                    ? theme.colors.primary
                    : theme.colors.surface,
                },
              ]}
              onPress={() => setSelectedTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeButtonText,
                  {
                    color: selectedTimeRange === range
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 测试结果图表 */}
      <View style={styles.chartSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          测试结果分布
        </Text>
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
          <PieChart
            data={testResultsData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 50]}
            absolute
          />
        </View>
      </View>

      {/* 代码覆盖率图表 */}
      <View style={styles.chartSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          代码覆盖率趋势
        </Text>
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
          <LineChart
            data={coverageData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      </View>

      {/* 测试套件列表 */}
      <View style={styles.testSuitesSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          测试套件
        </Text>
        {testSuites.map((suite) => (
          <View
            key={suite.id}
            style={[styles.testSuiteCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.testSuiteHeader}>
              <Text style={[styles.testSuiteName, { color: theme.colors.text }]}>
                {suite.name}
              </Text>
              <TouchableOpacity
                style={[styles.runButton, { borderColor: theme.colors.primary }]}
                onPress={() => runSpecificTest(suite)}
              >
                <Ionicons name="play" size={16} color={theme.colors.primary} />
                <Text style={[styles.runButtonText, { color: theme.colors.primary }]}>
                  运行
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.testSuiteStats}>
              <View style={styles.statRow}>
                <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                  总计: {suite.totalTests}
                </Text>
                <Text style={[styles.statText, { color: '#4CAF50' }]}>
                  通过: {suite.passedTests}
                </Text>
                <Text style={[styles.statText, { color: '#F44336' }]}>
                  失败: {suite.failedTests}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                  覆盖率: {suite.coverage}%
                </Text>
                <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                  耗时: {(suite.duration / 1000).toFixed(1)}s
                </Text>
              </View>
            </View>

            {/* 最近的测试结果 */}
            <View style={styles.recentTests}>
              <Text style={[styles.recentTestsTitle, { color: theme.colors.text }]}>
                最近测试
              </Text>
              {suite.tests.slice(0, 3).map((test) => (
                <View key={test.id} style={styles.testItem}>
                  <Ionicons
                    name={getStatusIcon(test.status) as any}
                    size={20}
                    color={getStatusColor(test.status)}
                  />
                  <View style={styles.testInfo}>
                    <Text style={[styles.testName, { color: theme.colors.text }]}>
                      {test.name}
                    </Text>
                    <Text style={[styles.testDetails, { color: theme.colors.textSecondary }]}>
                      {test.type} • {test.duration}ms
                      {test.coverage && ` • ${test.coverage}% 覆盖率`}
                    </Text>
                    {test.error && (
                      <Text style={[styles.testError, { color: '#F44336' }]}>
                        {test.error}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* 性能指标 */}
      <View style={styles.performanceSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          性能指标
        </Text>
        {performanceMetrics.map((metric, index) => (
          <View
            key={index}
            style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.metricHeader}>
              <Text style={[styles.metricName, { color: theme.colors.text }]}>
                {metric.name}
              </Text>
              <View
                style={[
                  styles.metricStatus,
                  { backgroundColor: getMetricStatusColor(metric.status) },
                ]}
              >
                <Text style={styles.metricStatusText}>
                  {metric.status === 'good' ? '良好' : 
                   metric.status === 'warning' ? '警告' : '严重'}
                </Text>
              </View>
            </View>
            <View style={styles.metricValue}>
              <Text style={[styles.metricNumber, { color: theme.colors.text }]}>
                {metric.value}
              </Text>
              <Text style={[styles.metricUnit, { color: theme.colors.textSecondary }]}>
                {metric.unit}
              </Text>
            </View>
            <View style={styles.metricThreshold}>
              <Text style={[styles.thresholdText, { color: theme.colors.textSecondary }]}>
                阈值: {metric.threshold} {metric.unit}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overviewSection: {
    padding: 16,
  },
  overviewCard: {
    padding: 20,
    borderRadius: 12,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  actionSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  timeRangeSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timeRangeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  chartContainer: {
    borderRadius: 16,
    padding: 16,
  },
  testSuitesSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  testSuiteCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  testSuiteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testSuiteName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
  },
  runButtonText: {
    fontSize: 14,
    marginLeft: 4,
  },
  testSuiteStats: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statText: {
    fontSize: 14,
  },
  recentTests: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  recentTestsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  testInfo: {
    flex: 1,
    marginLeft: 12,
  },
  testName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  testDetails: {
    fontSize: 12,
  },
  testError: {
    fontSize: 12,
    marginTop: 2,
  },
  performanceSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  metricCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  metricStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metricStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 4,
  },
  metricUnit: {
    fontSize: 16,
  },
  metricThreshold: {
    marginTop: 4,
  },
  thresholdText: {
    fontSize: 12,
  },
});

export default TestingDashboard;