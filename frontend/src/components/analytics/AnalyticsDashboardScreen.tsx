import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsData {
  userStats: {
    totalApplications: number;
    responseRate: number;
    averageMatchScore: number;
    profileViews: number;
  };
  marketTrends: {
    salaryTrends: number[];
    popularSkills: { name: string; demand: number }[];
    industryGrowth: { industry: string; growth: number }[];
  };
  personalInsights: {
    skillGaps: string[];
    recommendedActions: string[];
    careerProgress: number;
  };
}

const AnalyticsDashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trends' | 'insights'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      // 模拟 API 调用
      setTimeout(() => {
        setAnalyticsData({
          userStats: {
            totalApplications: 24,
            responseRate: 68,
            averageMatchScore: 85,
            profileViews: 156,
          },
          marketTrends: {
            salaryTrends: [65000, 68000, 72000, 75000, 78000, 82000],
            popularSkills: [
              { name: 'React', demand: 95 },
              { name: 'Node.js', demand: 88 },
              { name: 'Python', demand: 92 },
              { name: 'TypeScript', demand: 85 },
              { name: 'AWS', demand: 90 },
            ],
            industryGrowth: [
              { industry: '科技', growth: 15.2 },
              { industry: '金融', growth: 8.7 },
              { industry: '医疗', growth: 12.3 },
              { industry: '教育', growth: 6.8 },
            ],
          },
          personalInsights: {
            skillGaps: ['机器学习', '云计算', '数据分析'],
            recommendedActions: [
              '完善个人简历',
              '学习热门技能',
              '扩展专业网络',
              '参加行业活动',
            ],
            careerProgress: 72,
          },
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('加载分析数据失败:', error);
      Alert.alert('错误', '加载数据失败，请稍后重试');
      setLoading(false);
    }
  };

  const renderOverviewTab = () => {
    if (!analyticsData) return null;

    const { userStats } = analyticsData;

    return (
      <ScrollView style={styles.tabContent}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>个人统计</Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="document-text" size={24} color={theme.primary} />
            <Text style={[styles.statNumber, { color: theme.text }]}>{userStats.totalApplications}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>总申请数</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="mail" size={24} color={theme.success} />
            <Text style={[styles.statNumber, { color: theme.text }]}>{userStats.responseRate}%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>回复率</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="star" size={24} color={theme.warning} />
            <Text style={[styles.statNumber, { color: theme.text }]}>{userStats.averageMatchScore}%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>平均匹配度</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="eye" size={24} color={theme.info} />
            <Text style={[styles.statNumber, { color: theme.text }]}>{userStats.profileViews}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>档案浏览</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>申请趋势</Text>
        <View style={[styles.chartContainer, { backgroundColor: theme.surface }]}>
          <LineChart
            data={{
              labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
              datasets: [{
                data: [3, 5, 8, 12, 15, 24],
                strokeWidth: 3,
              }],
            }}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              backgroundColor: theme.surface,
              backgroundGradientFrom: theme.surface,
              backgroundGradientTo: theme.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(${theme.primary.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ')}, ${opacity})`,
              labelColor: (opacity = 1) => theme.textSecondary,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        </View>
      </ScrollView>
    );
  };

  const renderTrendsTab = () => {
    if (!analyticsData) return null;

    const { marketTrends } = analyticsData;

    return (
      <ScrollView style={styles.tabContent}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>薪资趋势</Text>
        <View style={[styles.chartContainer, { backgroundColor: theme.surface }]}>
          <LineChart
            data={{
              labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
              datasets: [{
                data: marketTrends.salaryTrends,
                strokeWidth: 3,
              }],
            }}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              backgroundColor: theme.surface,
              backgroundGradientFrom: theme.surface,
              backgroundGradientTo: theme.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
              labelColor: (opacity = 1) => theme.textSecondary,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>热门技能需求</Text>
        <View style={[styles.chartContainer, { backgroundColor: theme.surface }]}>
          <BarChart
            data={{
              labels: marketTrends.popularSkills.map(skill => skill.name),
              datasets: [{
                data: marketTrends.popularSkills.map(skill => skill.demand),
              }],
            }}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              backgroundColor: theme.surface,
              backgroundGradientFrom: theme.surface,
              backgroundGradientTo: theme.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) => theme.textSecondary,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>行业增长率</Text>
        <View style={styles.industryList}>
          {marketTrends.industryGrowth.map((item, index) => (
            <View key={index} style={[styles.industryItem, { backgroundColor: theme.surface }]}>
              <Text style={[styles.industryName, { color: theme.text }]}>{item.industry}</Text>
              <View style={styles.growthContainer}>
                <View 
                  style={[
                    styles.growthBar, 
                    { 
                      width: `${(item.growth / 20) * 100}%`,
                      backgroundColor: item.growth > 10 ? theme.success : theme.warning 
                    }
                  ]} 
                />
                <Text style={[styles.growthText, { color: theme.textSecondary }]}>
                  {item.growth}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderInsightsTab = () => {
    if (!analyticsData) return null;

    const { personalInsights } = analyticsData;

    return (
      <ScrollView style={styles.tabContent}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>职业发展进度</Text>
        <View style={[styles.progressContainer, { backgroundColor: theme.surface }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: theme.text }]}>整体进度</Text>
            <Text style={[styles.progressPercentage, { color: theme.primary }]}>
              {personalInsights.careerProgress}%
            </Text>
          </View>
          <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${personalInsights.careerProgress}%`,
                  backgroundColor: theme.primary 
                }
              ]} 
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>技能缺口分析</Text>
        <View style={styles.skillGapsList}>
          {personalInsights.skillGaps.map((skill, index) => (
            <View key={index} style={[styles.skillGapItem, { backgroundColor: theme.surface }]}>
              <Ionicons name="alert-circle" size={20} color={theme.warning} />
              <Text style={[styles.skillGapText, { color: theme.text }]}>{skill}</Text>
              <TouchableOpacity style={[styles.learnButton, { backgroundColor: theme.primary }]}>
                <Text style={[styles.learnButtonText, { color: theme.background }]}>学习</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>推荐行动</Text>
        <View style={styles.actionsList}>
          {personalInsights.recommendedActions.map((action, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.actionItem, { backgroundColor: theme.surface }]}
              onPress={() => Alert.alert('行动建议', action)}
            >
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
              <Text style={[styles.actionText, { color: theme.text }]}>{action}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>加载分析数据中...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>数据分析</Text>
        <TouchableOpacity onPress={loadAnalyticsData}>
          <Ionicons name="refresh" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'overview' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[
            styles.tabButtonText,
            { color: selectedTab === 'overview' ? theme.background : theme.textSecondary }
          ]}>
            概览
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'trends' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setSelectedTab('trends')}
        >
          <Text style={[
            styles.tabButtonText,
            { color: selectedTab === 'trends' ? theme.background : theme.textSecondary }
          ]}>
            趋势
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'insights' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setSelectedTab('insights')}
        >
          <Text style={[
            styles.tabButtonText,
            { color: selectedTab === 'insights' ? theme.background : theme.textSecondary }
          ]}>
            洞察
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'overview' && renderOverviewTab()}
      {selectedTab === 'trends' && renderTrendsTab()}
      {selectedTab === 'insights' && renderInsightsTab()}
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartContainer: {
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  industryList: {
    marginBottom: 20,
  },
  industryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  industryName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  growthBar: {
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  growthText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  skillGapsList: {
    marginBottom: 20,
  },
  skillGapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  skillGapText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  learnButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  learnButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsList: {
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
});

export default AnalyticsDashboardScreen;