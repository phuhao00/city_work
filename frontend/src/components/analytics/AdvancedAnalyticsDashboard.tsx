import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LineChart, BarChart, PieChart, AreaChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

const { width: screenWidth } = Dimensions.get('window');

// 数据类型定义
interface AnalyticsData {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userGrowth: number;
  };
  jobMetrics: {
    totalJobs: number;
    activeJobs: number;
    newJobs: number;
    applicationRate: number;
  };
  applicationMetrics: {
    totalApplications: number;
    successRate: number;
    averageResponseTime: number;
    topSkills: Array<{ skill: string; count: number }>;
  };
  companyMetrics: {
    totalCompanies: number;
    activeCompanies: number;
    averageRating: number;
    topIndustries: Array<{ industry: string; count: number }>;
  };
  performanceMetrics: {
    pageLoadTime: number;
    apiResponseTime: number;
    errorRate: number;
    uptime: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }>;
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        userMetrics: {
          totalUsers: 15420,
          activeUsers: 8930,
          newUsers: 1250,
          userGrowth: 12.5,
        },
        jobMetrics: {
          totalJobs: 3240,
          activeJobs: 2180,
          newJobs: 180,
          applicationRate: 67.8,
        },
        applicationMetrics: {
          totalApplications: 28450,
          successRate: 23.4,
          averageResponseTime: 3.2,
          topSkills: [
            { skill: 'React Native', count: 1250 },
            { skill: 'Node.js', count: 980 },
            { skill: 'Python', count: 850 },
            { skill: 'Java', count: 720 },
            { skill: 'TypeScript', count: 650 },
          ],
        },
        companyMetrics: {
          totalCompanies: 890,
          activeCompanies: 650,
          averageRating: 4.2,
          topIndustries: [
            { industry: '科技', count: 280 },
            { industry: '金融', count: 150 },
            { industry: '教育', count: 120 },
            { industry: '医疗', count: 100 },
            { industry: '制造', count: 80 },
          ],
        },
        performanceMetrics: {
          pageLoadTime: 1.2,
          apiResponseTime: 0.8,
          errorRate: 0.5,
          uptime: 99.9,
        },
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('加载分析数据失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    change?: number,
    icon?: string
  ) => (
    <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.metricHeader}>
        <Text style={[styles.metricTitle, { color: theme.colors.text }]}>{title}</Text>
        {icon && (
          <Ionicons name={icon as any} size={24} color={theme.colors.primary} />
        )}
      </View>
      <Text style={[styles.metricValue, { color: theme.colors.text }]}>{value}</Text>
      {change !== undefined && (
        <View style={styles.changeContainer}>
          <Ionicons
            name={change >= 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={change >= 0 ? '#4CAF50' : '#F44336'}
          />
          <Text
            style={[
              styles.changeText,
              { color: change >= 0 ? '#4CAF50' : '#F44336' },
            ]}
          >
            {Math.abs(change)}%
          </Text>
        </View>
      )}
    </View>
  );

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {(['7d', '30d', '90d', '1y'] as const).map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            selectedTimeRange === range && {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={() => setSelectedTimeRange(range)}
        >
          <Text
            style={[
              styles.timeRangeText,
              {
                color:
                  selectedTimeRange === range
                    ? '#FFFFFF'
                    : theme.colors.text,
              },
            ]}
          >
            {range === '7d' && '7天'}
            {range === '30d' && '30天'}
            {range === '90d' && '90天'}
            {range === '1y' && '1年'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderUserGrowthChart = () => {
    const data: ChartData = {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      datasets: [
        {
          data: [1200, 1450, 1680, 1920, 2150, 2380],
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          用户增长趋势
        </Text>
        <LineChart
          data={data}
          width={screenWidth - 60}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 0,
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
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderJobApplicationChart = () => {
    const data = {
      labels: ['已申请', '面试中', '已录用', '已拒绝'],
      datasets: [
        {
          data: [45, 25, 15, 15],
        },
      ],
    };

    return (
      <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          申请状态分布
        </Text>
        <BarChart
          data={data}
          width={screenWidth - 60}
          height={220}
          yAxisLabel=""
          yAxisSuffix="%"
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            labelColor: (opacity = 1) => theme.colors.text,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  const renderTopSkillsChart = () => {
    if (!analyticsData) return null;

    const data = analyticsData.applicationMetrics.topSkills.map((skill, index) => ({
      name: skill.skill,
      population: skill.count,
      color: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
      ][index],
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    }));

    return (
      <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          热门技能分布
        </Text>
        <PieChart
          data={data}
          width={screenWidth - 60}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 10]}
          absolute
        />
      </View>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!analyticsData) return null;

    const { performanceMetrics } = analyticsData;

    return (
      <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          系统性能指标
        </Text>
        <View style={styles.performanceGrid}>
          <View style={styles.performanceItem}>
            <Text style={[styles.performanceLabel, { color: theme.colors.text }]}>
              页面加载时间
            </Text>
            <Text style={[styles.performanceValue, { color: theme.colors.primary }]}>
              {performanceMetrics.pageLoadTime}s
            </Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={[styles.performanceLabel, { color: theme.colors.text }]}>
              API响应时间
            </Text>
            <Text style={[styles.performanceValue, { color: theme.colors.primary }]}>
              {performanceMetrics.apiResponseTime}s
            </Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={[styles.performanceLabel, { color: theme.colors.text }]}>
              错误率
            </Text>
            <Text style={[styles.performanceValue, { color: '#F44336' }]}>
              {performanceMetrics.errorRate}%
            </Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={[styles.performanceLabel, { color: theme.colors.text }]}>
              系统正常运行时间
            </Text>
            <Text style={[styles.performanceValue, { color: '#4CAF50' }]}>
              {performanceMetrics.uptime}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !analyticsData) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          加载分析数据中...
        </Text>
      </View>
    );
  }

  if (!analyticsData) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          加载数据失败
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAnalyticsData}>
          <Text style={styles.retryButtonText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          数据分析仪表板
        </Text>
        {renderTimeRangeSelector()}
      </View>

      {/* 核心指标卡片 */}
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          '总用户数',
          analyticsData.userMetrics.totalUsers.toLocaleString(),
          analyticsData.userMetrics.userGrowth,
          'people'
        )}
        {renderMetricCard(
          '活跃用户',
          analyticsData.userMetrics.activeUsers.toLocaleString(),
          undefined,
          'pulse'
        )}
        {renderMetricCard(
          '总职位数',
          analyticsData.jobMetrics.totalJobs.toLocaleString(),
          undefined,
          'briefcase'
        )}
        {renderMetricCard(
          '申请成功率',
          `${analyticsData.applicationMetrics.successRate}%`,
          undefined,
          'checkmark-circle'
        )}
      </View>

      {/* 图表区域 */}
      {renderUserGrowthChart()}
      {renderJobApplicationChart()}
      {renderTopSkillsChart()}
      {renderPerformanceMetrics()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  chartContainer: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  performanceItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AdvancedAnalyticsDashboard;