import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  history: number[];
}

interface SystemResource {
  name: string;
  usage: number;
  limit: number;
  unit: string;
}

interface PerformanceAlert {
  id: string;
  type: 'performance' | 'memory' | 'network' | 'error';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [resources, setResources] = useState<SystemResource[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'resources' | 'alerts'>('overview');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 30000); // 每30秒更新
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const loadPerformanceData = async () => {
    // 模拟性能数据
    const mockMetrics: PerformanceMetric[] = [
      {
        id: '1',
        name: 'Response Time',
        value: 245,
        unit: 'ms',
        status: 'good',
        trend: 'down',
        history: [280, 260, 245, 230, 245, 250, 245],
      },
      {
        id: '2',
        name: 'Throughput',
        value: 1250,
        unit: 'req/min',
        status: 'good',
        trend: 'up',
        history: [1100, 1150, 1200, 1220, 1240, 1250, 1250],
      },
      {
        id: '3',
        name: 'Error Rate',
        value: 0.8,
        unit: '%',
        status: 'warning',
        trend: 'up',
        history: [0.5, 0.6, 0.7, 0.8, 0.9, 0.8, 0.8],
      },
      {
        id: '4',
        name: 'CPU Usage',
        value: 65,
        unit: '%',
        status: 'warning',
        trend: 'stable',
        history: [60, 62, 65, 67, 65, 64, 65],
      },
    ];

    const mockResources: SystemResource[] = [
      { name: 'CPU', usage: 65, limit: 100, unit: '%' },
      { name: 'Memory', usage: 4.2, limit: 8, unit: 'GB' },
      { name: 'Disk', usage: 120, limit: 500, unit: 'GB' },
      { name: 'Network', usage: 45, limit: 100, unit: 'Mbps' },
    ];

    const mockAlerts: PerformanceAlert[] = [
      {
        id: '1',
        type: 'performance',
        message: 'Response time exceeded threshold (>200ms)',
        severity: 'medium',
        timestamp: new Date(Date.now() - 300000),
        resolved: false,
      },
      {
        id: '2',
        type: 'memory',
        message: 'Memory usage is high (>80%)',
        severity: 'high',
        timestamp: new Date(Date.now() - 600000),
        resolved: true,
      },
      {
        id: '3',
        type: 'error',
        message: 'Error rate spike detected',
        severity: 'critical',
        timestamp: new Date(Date.now() - 900000),
        resolved: false,
      },
    ];

    setMetrics(mockMetrics);
    setResources(mockResources);
    setAlerts(mockAlerts);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPerformanceData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'critical': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#FF5722';
      case 'critical': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'remove';
      default: return 'remove';
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const exportPerformanceReport = () => {
    Alert.alert(
      '导出报告',
      '性能报告已生成并保存到下载文件夹',
      [{ text: '确定' }]
    );
  };

  const renderOverview = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>系统概览</Text>
      <View style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <View key={metric.id} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricName}>{metric.name}</Text>
              <Ionicons
                name={getTrendIcon(metric.trend)}
                size={16}
                color={getStatusColor(metric.status)}
              />
            </View>
            <Text style={styles.metricValue}>
              {metric.value} {metric.unit}
            </Text>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(metric.status) }]} />
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>资源使用情况</Text>
      <View style={styles.resourcesContainer}>
        {resources.map((resource, index) => (
          <View key={index} style={styles.resourceItem}>
            <View style={styles.resourceHeader}>
              <Text style={styles.resourceName}>{resource.name}</Text>
              <Text style={styles.resourceValue}>
                {resource.usage}/{resource.limit} {resource.unit}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(resource.usage / resource.limit) * 100}%`,
                    backgroundColor: (resource.usage / resource.limit) > 0.8 ? '#F44336' : '#4CAF50',
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMetrics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>性能指标趋势</Text>
      {metrics.map((metric) => (
        <View key={metric.id} style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{metric.name}</Text>
          <LineChart
            data={{
              labels: ['6h', '5h', '4h', '3h', '2h', '1h', 'Now'],
              datasets: [{ data: metric.history }],
            }}
            width={screenWidth - 40}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            style={styles.chart}
          />
        </View>
      ))}
    </View>
  );

  const renderResources = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>系统资源</Text>
      <BarChart
        data={{
          labels: resources.map(r => r.name),
          datasets: [{
            data: resources.map(r => (r.usage / r.limit) * 100),
          }],
        }}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          style: { borderRadius: 16 },
        }}
        style={styles.chart}
      />
    </View>
  );

  const renderAlerts = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>性能警报</Text>
      {alerts.map((alert) => (
        <View key={alert.id} style={[styles.alertCard, alert.resolved && styles.resolvedAlert]}>
          <View style={styles.alertHeader}>
            <View style={styles.alertInfo}>
              <Ionicons
                name={alert.type === 'error' ? 'warning' : 'alert-circle'}
                size={20}
                color={getSeverityColor(alert.severity)}
              />
              <Text style={styles.alertType}>{alert.type.toUpperCase()}</Text>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
                <Text style={styles.severityText}>{alert.severity}</Text>
              </View>
            </View>
            {!alert.resolved && (
              <TouchableOpacity
                style={styles.resolveButton}
                onPress={() => resolveAlert(alert.id)}
              >
                <Text style={styles.resolveButtonText}>解决</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.alertMessage}>{alert.message}</Text>
          <Text style={styles.alertTime}>
            {alert.timestamp.toLocaleString()}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>性能监控</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.exportButton} onPress={exportPerformanceReport}>
            <Ionicons name="download" size={20} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.timeRangeSelector}>
        {['1h', '6h', '24h', '7d'].map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              selectedTimeRange === range && styles.activeTimeRange,
            ]}
            onPress={() => setSelectedTimeRange(range)}
          >
            <Text
              style={[
                styles.timeRangeText,
                selectedTimeRange === range && styles.activeTimeRangeText,
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: '概览', icon: 'speedometer' },
          { key: 'metrics', label: '指标', icon: 'analytics' },
          { key: 'resources', label: '资源', icon: 'hardware-chip' },
          { key: 'alerts', label: '警报', icon: 'notifications' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? '#2196F3' : '#666'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'metrics' && renderMetrics()}
        {activeTab === 'resources' && renderResources()}
        {activeTab === 'alerts' && renderAlerts()}
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
  },
  exportButton: {
    padding: 8,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timeRangeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTimeRange: {
    backgroundColor: '#2196F3',
  },
  timeRangeText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTimeRangeText: {
    color: '#fff',
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
    paddingVertical: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    marginLeft: 5,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
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
    marginBottom: 10,
  },
  metricName: {
    fontSize: 14,
    color: '#666',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  resourcesContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  resourceItem: {
    marginBottom: 15,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  resourceValue: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 10,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resolvedAlert: {
    opacity: 0.6,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertType: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  severityBadge: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  severityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  resolveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  resolveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  alertTime: {
    fontSize: 12,
    color: '#999',
  },
});

export default PerformanceMonitor;