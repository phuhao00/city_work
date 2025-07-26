import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface AnalyticsData {
  jobPostings: {
    total: number;
    active: number;
    filled: number;
    expired: number;
    views: number;
    applications: number;
  };
  applications: {
    total: number;
    pending: number;
    reviewing: number;
    interviewed: number;
    hired: number;
    rejected: number;
  };
  performance: {
    averageTimeToFill: number;
    applicationRate: number;
    interviewRate: number;
    hireRate: number;
  };
  trends: {
    viewsOverTime: Array<{ date: string; views: number }>;
    applicationsOverTime: Array<{ date: string; applications: number }>;
  };
}

interface CompanyAnalyticsScreenProps {
  navigation?: any;
}

export const CompanyAnalyticsScreen: React.FC<CompanyAnalyticsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  const mockAnalyticsData: AnalyticsData = {
    jobPostings: {
      total: 25,
      active: 12,
      filled: 8,
      expired: 5,
      views: 1247,
      applications: 189,
    },
    applications: {
      total: 189,
      pending: 45,
      reviewing: 67,
      interviewed: 23,
      hired: 8,
      rejected: 46,
    },
    performance: {
      averageTimeToFill: 28,
      applicationRate: 15.2,
      interviewRate: 12.2,
      hireRate: 4.2,
    },
    trends: {
      viewsOverTime: [
        { date: '2024-01-01', views: 45 },
        { date: '2024-01-02', views: 52 },
        { date: '2024-01-03', views: 38 },
        { date: '2024-01-04', views: 67 },
        { date: '2024-01-05', views: 73 },
        { date: '2024-01-06', views: 41 },
        { date: '2024-01-07', views: 59 },
      ],
      applicationsOverTime: [
        { date: '2024-01-01', applications: 8 },
        { date: '2024-01-02', applications: 12 },
        { date: '2024-01-03', applications: 6 },
        { date: '2024-01-04', applications: 15 },
        { date: '2024-01-05', applications: 18 },
        { date: '2024-01-06', applications: 9 },
        { date: '2024-01-07', applications: 14 },
      ],
    },
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      setTimeout(() => {
        setAnalyticsData(mockAnalyticsData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setLoading(false);
    }
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    subtitle?: string,
    trend?: 'up' | 'down' | 'neutral',
    trendValue?: string
  ) => (
    <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.metricTitle, { color: theme.colors.textSecondary }]}>
        {title}
      </Text>
      <Text style={[styles.metricValue, { color: theme.colors.text }]}>
        {value}
      </Text>
      {subtitle && (
        <Text style={[styles.metricSubtitle, { color: theme.colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <Text
            style={[
              styles.trendText,
              {
                color: trend === 'up' ? '#4CAF50' : trend === 'down' ? '#F44336' : theme.colors.textSecondary,
              },
            ]}
          >
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
          </Text>
        </View>
      )}
    </View>
  );

  const renderSimpleChart = (data: Array<{ date: string; views?: number; applications?: number }>, type: 'views' | 'applications') => {
    const maxValue = Math.max(...data.map(d => d[type] || 0));
    const chartWidth = Dimensions.get('window').width - 64;
    const chartHeight = 120;
    const barWidth = chartWidth / data.length - 4;

    return (
      <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          {type === 'views' ? 'Job Views' : 'Applications'} Over Time
        </Text>
        <View style={styles.chart}>
          {data.map((item, index) => {
            const value = item[type] || 0;
            const height = (value / maxValue) * chartHeight;
            return (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      width: barWidth,
                      backgroundColor: type === 'views' ? theme.colors.primary : '#4CAF50',
                    },
                  ]}
                />
                <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>
                  {new Date(item.date).getDate()}
                </Text>
                <Text style={[styles.barValue, { color: theme.colors.text }]}>
                  {value}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderJobPostingsOverview = () => {
    if (!analyticsData) return null;

    const { jobPostings } = analyticsData;
    
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Job Postings Overview
        </Text>
        
        <View style={styles.metricsGrid}>
          {renderMetricCard('Total Postings', jobPostings.total)}
          {renderMetricCard('Active', jobPostings.active, 'Currently open')}
          {renderMetricCard('Filled', jobPostings.filled, 'Successfully hired')}
          {renderMetricCard('Expired', jobPostings.expired, 'Need renewal')}
        </View>

        <View style={styles.metricsGrid}>
          {renderMetricCard('Total Views', jobPostings.views.toLocaleString(), 'All time')}
          {renderMetricCard('Applications', jobPostings.applications, 'Total received')}
          {renderMetricCard('View Rate', `${(jobPostings.views / jobPostings.total).toFixed(1)}`, 'Per posting')}
          {renderMetricCard('App Rate', `${((jobPostings.applications / jobPostings.views) * 100).toFixed(1)}%`, 'Conversion')}
        </View>
      </View>
    );
  };

  const renderApplicationsBreakdown = () => {
    if (!analyticsData) return null;

    const { applications } = analyticsData;
    
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Applications Breakdown
        </Text>
        
        <View style={styles.metricsGrid}>
          {renderMetricCard('Total', applications.total)}
          {renderMetricCard('Pending', applications.pending, 'Awaiting review')}
          {renderMetricCard('Reviewing', applications.reviewing, 'In progress')}
          {renderMetricCard('Interviewed', applications.interviewed, 'Interview stage')}
        </View>

        <View style={styles.metricsGrid}>
          {renderMetricCard('Hired', applications.hired, 'Successful', 'up', '+2 this week')}
          {renderMetricCard('Rejected', applications.rejected, 'Not selected')}
          {renderMetricCard('Interview Rate', `${((applications.interviewed / applications.total) * 100).toFixed(1)}%`)}
          {renderMetricCard('Hire Rate', `${((applications.hired / applications.total) * 100).toFixed(1)}%`)}
        </View>
      </View>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!analyticsData) return null;

    const { performance } = analyticsData;
    
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Performance Metrics
        </Text>
        
        <View style={styles.metricsGrid}>
          {renderMetricCard('Avg. Time to Fill', `${performance.averageTimeToFill} days`, 'From posting to hire')}
          {renderMetricCard('Application Rate', `${performance.applicationRate}%`, 'Views to applications')}
          {renderMetricCard('Interview Rate', `${performance.interviewRate}%`, 'Apps to interviews')}
          {renderMetricCard('Hire Rate', `${performance.hireRate}%`, 'Apps to hires')}
        </View>
      </View>
    );
  };

  const renderTrends = () => {
    if (!analyticsData) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Trends
        </Text>
        
        {renderSimpleChart(analyticsData.trends.viewsOverTime, 'views')}
        {renderSimpleChart(analyticsData.trends.applicationsOverTime, 'applications')}
      </View>
    );
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['7d', '30d', '90d', '1y'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            {
              backgroundColor: selectedPeriod === period
                ? theme.colors.primary
                : theme.colors.surface,
            },
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text
            style={[
              styles.periodButtonText,
              {
                color: selectedPeriod === period
                  ? theme.colors.surface
                  : theme.colors.text,
              },
            ]}
          >
            {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : period === '90d' ? '90 Days' : '1 Year'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading analytics...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Company Analytics
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Track your hiring performance and job posting metrics
          </Text>
        </View>

        {renderPeriodSelector()}
        {renderJobPostingsOverview()}
        {renderApplicationsBreakdown()}
        {renderPerformanceMetrics()}
        {renderTrends()}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation?.navigate('JobPostings')}
          >
            <Text style={styles.actionButtonText}>Manage Job Postings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.primary, borderWidth: 1 }]}
            onPress={() => navigation?.navigate('Applications')}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
              View Applications
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  loadingText: {
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  metricCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  trendContainer: {
    alignSelf: 'flex-start',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  bar: {
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionButtons: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});