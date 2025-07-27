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

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
  lastUpdated: string;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: string;
  responseTime: number;
  lastCheck: string;
  url?: string;
}

interface HealthAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  service?: string;
}

interface PerformanceData {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

const SystemHealthMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'alerts' | 'performance'>('overview');
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadMockData();
    const interval = setInterval(updateRealTimeData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMockData = () => {
    // Mock system metrics
    const mockMetrics: SystemMetric[] = [
      {
        id: '1',
        name: 'CPU使用率',
        value: 45,
        unit: '%',
        status: 'healthy',
        threshold: 80,
        lastUpdated: new Date().toLocaleString(),
      },
      {
        id: '2',
        name: '内存使用率',
        value: 72,
        unit: '%',
        status: 'warning',
        threshold: 85,
        lastUpdated: new Date().toLocaleString(),
      },
      {
        id: '3',
        name: '磁盘使用率',
        value: 58,
        unit: '%',
        status: 'healthy',
        threshold: 90,
        lastUpdated: new Date().toLocaleString(),
      },
      {
        id: '4',
        name: '网络延迟',
        value: 23,
        unit: 'ms',
        status: 'healthy',
        threshold: 100,
        lastUpdated: new Date().toLocaleString(),
      },
      {
        id: '5',
        name: '数据库连接',
        value: 15,
        unit: '个',
        status: 'healthy',
        threshold: 100,
        lastUpdated: new Date().toLocaleString(),
      },
      {
        id: '6',
        name: '错误率',
        value: 0.5,
        unit: '%',
        status: 'healthy',
        threshold: 5,
        lastUpdated: new Date().toLocaleString(),
      },
    ];

    // Mock service status
    const mockServices: ServiceStatus[] = [
      {
        id: '1',
        name: 'Web服务器',
        status: 'online',
        uptime: '99.9%',
        responseTime: 120,
        lastCheck: new Date().toLocaleString(),
        url: 'https://api.citywork.com',
      },
      {
        id: '2',
        name: '数据库服务',
        status: 'online',
        uptime: '99.8%',
        responseTime: 45,
        lastCheck: new Date().toLocaleString(),
      },
      {
        id: '3',
        name: '缓存服务',
        status: 'degraded',
        uptime: '98.5%',
        responseTime: 200,
        lastCheck: new Date().toLocaleString(),
      },
      {
        id: '4',
        name: '消息队列',
        status: 'online',
        uptime: '99.7%',
        responseTime: 30,
        lastCheck: new Date().toLocaleString(),
      },
      {
        id: '5',
        name: '文件存储',
        status: 'offline',
        uptime: '95.2%',
        responseTime: 0,
        lastCheck: new Date().toLocaleString(),
      },
    ];

    // Mock alerts
    const mockAlerts: HealthAlert[] = [
      {
        id: '1',
        type: 'warning',
        title: '内存使用率过高',
        message: '系统内存使用率已达到72%，建议检查内存泄漏',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toLocaleString(),
        resolved: false,
        service: 'Web服务器',
      },
      {
        id: '2',
        type: 'error',
        title: '文件存储服务离线',
        message: '文件存储服务无法连接，影响文件上传功能',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toLocaleString(),
        resolved: false,
        service: '文件存储',
      },
      {
        id: '3',
        type: 'info',
        title: '系统维护完成',
        message: '定期系统维护已完成，所有服务恢复正常',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
        resolved: true,
      },
      {
        id: '4',
        type: 'warning',
        title: '缓存服务性能下降',
        message: '缓存服务响应时间增加，可能影响系统性能',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toLocaleString(),
        resolved: false,
        service: '缓存服务',
      },
    ];

    // Mock performance data
    const mockPerformanceData: PerformanceData[] = [];
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
      mockPerformanceData.push({
        timestamp: timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        cpu: Math.random() * 80 + 10,
        memory: Math.random() * 60 + 20,
        disk: Math.random() * 40 + 30,
        network: Math.random() * 50 + 10,
      });
    }

    setMetrics(mockMetrics);
    setServices(mockServices);
    setAlerts(mockAlerts);
    setPerformanceData(mockPerformanceData);
  };

  const updateRealTimeData = () => {
    // Update metrics with random variations
    setMetrics(prev => prev.map(metric => {
      const variation = (Math.random() - 0.5) * 10;
      const newValue = Math.max(0, Math.min(100, metric.value + variation));
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (newValue > metric.threshold * 0.9) {
        status = 'critical';
      } else if (newValue > metric.threshold * 0.7) {
        status = 'warning';
      }

      return {
        ...metric,
        value: parseFloat(newValue.toFixed(1)),
        status,
        lastUpdated: new Date().toLocaleString(),
      };
    }));

    // Update performance data
    setPerformanceData(prev => {
      const newData = [...prev.slice(1)];
      newData.push({
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        cpu: Math.random() * 80 + 10,
        memory: Math.random() * 60 + 20,
        disk: Math.random() * 40 + 30,
        network: Math.random() * 50 + 10,
      });
      return newData;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online': return '#4CAF50';
      case 'warning':
      case 'degraded': return '#FF9800';
      case 'critical':
      case 'offline': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online': return 'checkmark-circle';
      case 'warning':
      case 'degraded': return 'warning';
      case 'critical':
      case 'offline': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'help-circle';
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    Alert.alert('成功', '告警已标记为已解决');
  };

  const restartService = (serviceId: string) => {
    Alert.alert(
      '确认重启',
      '确定要重启这个服务吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重启',
          onPress: () => {
            setServices(prev => prev.map(service => 
              service.id === serviceId 
                ? { ...service, status: 'online' as const, lastCheck: new Date().toLocaleString() }
                : service
            ));
            Alert.alert('成功', '服务重启完成');
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMockData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
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
  };

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <View key={metric.id} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricName}>{metric.name}</Text>
              <Ionicons
                name={getStatusIcon(metric.status)}
                size={20}
                color={getStatusColor(metric.status)}
              />
            </View>
            <Text style={styles.metricValue}>
              {metric.value}{metric.unit}
            </Text>
            <View style={styles.metricProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(metric.value / metric.threshold) * 100}%`,
                      backgroundColor: getStatusColor(metric.status),
                    },
                  ]}
                />
              </View>
              <Text style={styles.thresholdText}>阈值: {metric.threshold}{metric.unit}</Text>
            </View>
            <Text style={styles.lastUpdated}>更新: {metric.lastUpdated}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>系统概览</Text>
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{services.filter(s => s.status === 'online').length}</Text>
            <Text style={styles.summaryLabel}>在线服务</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: '#FF9800' }]}>
              {alerts.filter(a => !a.resolved).length}
            </Text>
            <Text style={styles.summaryLabel}>待处理告警</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: '#4CAF50' }]}>
              {metrics.filter(m => m.status === 'healthy').length}
            </Text>
            <Text style={styles.summaryLabel}>健康指标</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderServices = () => (
    <ScrollView style={styles.tabContent}>
      {services.map((service) => (
        <View key={service.id} style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <View style={styles.serviceStatus}>
                <Ionicons
                  name={getStatusIcon(service.status)}
                  size={16}
                  color={getStatusColor(service.status)}
                />
                <Text style={[styles.statusText, { color: getStatusColor(service.status) }]}>
                  {service.status}
                </Text>
              </View>
            </View>
            {service.status !== 'online' && (
              <TouchableOpacity
                style={styles.restartButton}
                onPress={() => restartService(service.id)}
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.restartButtonText}>重启</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.serviceMetrics}>
            <View style={styles.serviceMetric}>
              <Text style={styles.metricLabel}>运行时间</Text>
              <Text style={styles.metricValue}>{service.uptime}</Text>
            </View>
            <View style={styles.serviceMetric}>
              <Text style={styles.metricLabel}>响应时间</Text>
              <Text style={styles.metricValue}>{service.responseTime}ms</Text>
            </View>
            <View style={styles.serviceMetric}>
              <Text style={styles.metricLabel}>最后检查</Text>
              <Text style={styles.metricValue}>{service.lastCheck}</Text>
            </View>
          </View>
          
          {service.url && (
            <Text style={styles.serviceUrl}>{service.url}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderAlerts = () => (
    <ScrollView style={styles.tabContent}>
      {alerts.map((alert) => (
        <View key={alert.id} style={[styles.alertCard, alert.resolved && styles.resolvedAlert]}>
          <View style={styles.alertHeader}>
            <View style={styles.alertInfo}>
              <Ionicons
                name={getAlertIcon(alert.type)}
                size={20}
                color={alert.resolved ? '#9E9E9E' : getStatusColor(alert.type === 'error' ? 'critical' : alert.type === 'warning' ? 'warning' : 'healthy')}
              />
              <Text style={[styles.alertTitle, alert.resolved && styles.resolvedText]}>
                {alert.title}
              </Text>
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
          
          <Text style={[styles.alertMessage, alert.resolved && styles.resolvedText]}>
            {alert.message}
          </Text>
          
          <View style={styles.alertFooter}>
            <Text style={[styles.alertTimestamp, alert.resolved && styles.resolvedText]}>
              {alert.timestamp}
            </Text>
            {alert.service && (
              <Text style={[styles.alertService, alert.resolved && styles.resolvedText]}>
                {alert.service}
              </Text>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderPerformance = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>CPU使用率趋势</Text>
        <LineChart
          data={{
            labels: performanceData.slice(-6).map(d => d.timestamp),
            datasets: [{
              data: performanceData.slice(-6).map(d => d.cpu),
            }],
          }}
          width={screenWidth - 40}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>内存使用率趋势</Text>
        <LineChart
          data={{
            labels: performanceData.slice(-6).map(d => d.timestamp),
            datasets: [{
              data: performanceData.slice(-6).map(d => d.memory),
              color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
            }],
          }}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>资源使用分布</Text>
        <BarChart
          data={{
            labels: ['CPU', '内存', '磁盘', '网络'],
            datasets: [{
              data: [
                performanceData[performanceData.length - 1]?.cpu || 0,
                performanceData[performanceData.length - 1]?.memory || 0,
                performanceData[performanceData.length - 1]?.disk || 0,
                performanceData[performanceData.length - 1]?.network || 0,
              ],
            }],
          }}
          width={screenWidth - 40}
          height={200}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>系统健康监控</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: '概览', icon: 'speedometer-outline' },
          { key: 'services', label: '服务', icon: 'server-outline' },
          { key: 'alerts', label: '告警', icon: 'warning-outline' },
          { key: 'performance', label: '性能', icon: 'analytics-outline' },
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
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'alerts' && renderAlerts()}
        {activeTab === 'performance' && renderPerformance()}
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
  refreshButton: {
    padding: 8,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricName: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  metricProgress: {
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  thresholdText: {
    fontSize: 10,
    color: '#999',
  },
  lastUpdated: {
    fontSize: 10,
    color: '#999',
  },
  summarySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  serviceCard: {
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
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  serviceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  serviceMetric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  serviceUrl: {
    fontSize: 12,
    color: '#2196F3',
    fontStyle: 'italic',
  },
  alertCard: {
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
  resolvedAlert: {
    opacity: 0.6,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  resolvedText: {
    color: '#999',
  },
  resolveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resolveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTimestamp: {
    fontSize: 10,
    color: '#999',
  },
  alertService: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '600',
  },
  chartContainer: {
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
    marginBottom: 10,
  },
  chart: {
    borderRadius: 8,
  },
});

export default SystemHealthMonitor;