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

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  category: string;
  threshold: {
    warning: number;
    critical: number;
  };
  lastUpdated: string;
}

interface PerformanceAlert {
  id: string;
  metricId: string;
  metricName: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  category: string;
  estimatedImprovement: string;
  priority: number;
}

interface PerformanceReport {
  id: string;
  title: string;
  period: string;
  overallScore: number;
  metrics: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
  };
  generatedAt: string;
}

const PerformanceOptimizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'alerts' | 'suggestions' | 'reports'>('metrics');
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetric | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data
  useEffect(() => {
    const mockMetrics: PerformanceMetric[] = [
      {
        id: '1',
        name: '响应时间',
        value: 245,
        unit: 'ms',
        trend: 'down',
        trendValue: -12,
        category: '性能',
        threshold: { warning: 300, critical: 500 },
        lastUpdated: '2024-01-30 14:30:00',
      },
      {
        id: '2',
        name: 'CPU使用率',
        value: 68,
        unit: '%',
        trend: 'up',
        trendValue: 8,
        category: '系统',
        threshold: { warning: 70, critical: 85 },
        lastUpdated: '2024-01-30 14:30:00',
      },
      {
        id: '3',
        name: '内存使用率',
        value: 72,
        unit: '%',
        trend: 'stable',
        trendValue: 0,
        category: '系统',
        threshold: { warning: 75, critical: 90 },
        lastUpdated: '2024-01-30 14:30:00',
      },
      {
        id: '4',
        name: '吞吐量',
        value: 1250,
        unit: 'req/min',
        trend: 'up',
        trendValue: 15,
        category: '性能',
        threshold: { warning: 800, critical: 500 },
        lastUpdated: '2024-01-30 14:30:00',
      },
      {
        id: '5',
        name: '错误率',
        value: 0.8,
        unit: '%',
        trend: 'down',
        trendValue: -0.3,
        category: '质量',
        threshold: { warning: 1, critical: 2 },
        lastUpdated: '2024-01-30 14:30:00',
      },
      {
        id: '6',
        name: '可用性',
        value: 99.95,
        unit: '%',
        trend: 'stable',
        trendValue: 0,
        category: '质量',
        threshold: { warning: 99.5, critical: 99 },
        lastUpdated: '2024-01-30 14:30:00',
      },
    ];

    const mockAlerts: PerformanceAlert[] = [
      {
        id: '1',
        metricId: '2',
        metricName: 'CPU使用率',
        level: 'warning',
        message: 'CPU使用率接近警告阈值 (68% > 70%)',
        timestamp: '2024-01-30 14:25:00',
        acknowledged: false,
      },
      {
        id: '2',
        metricId: '3',
        metricName: '内存使用率',
        level: 'warning',
        message: '内存使用率持续上升，建议检查内存泄漏',
        timestamp: '2024-01-30 14:20:00',
        acknowledged: false,
      },
      {
        id: '3',
        metricId: '1',
        metricName: '响应时间',
        level: 'info',
        message: '响应时间优化效果显著，较上周降低12%',
        timestamp: '2024-01-30 14:15:00',
        acknowledged: true,
      },
    ];

    const mockSuggestions: OptimizationSuggestion[] = [
      {
        id: '1',
        title: '启用数据库连接池',
        description: '配置数据库连接池可以显著减少连接建立时间，提高数据库访问性能',
        impact: 'high',
        effort: 'medium',
        category: '数据库',
        estimatedImprovement: '响应时间减少20-30%',
        priority: 1,
      },
      {
        id: '2',
        title: '实施Redis缓存策略',
        description: '对频繁访问的数据实施Redis缓存，减少数据库查询压力',
        impact: 'high',
        effort: 'medium',
        category: '缓存',
        estimatedImprovement: '数据库负载减少40%',
        priority: 2,
      },
      {
        id: '3',
        title: '优化前端资源加载',
        description: '启用Gzip压缩、CDN加速和资源懒加载',
        impact: 'medium',
        effort: 'low',
        category: '前端',
        estimatedImprovement: '页面加载速度提升25%',
        priority: 3,
      },
      {
        id: '4',
        title: '数据库索引优化',
        description: '分析慢查询日志，为常用查询字段添加合适的索引',
        impact: 'medium',
        effort: 'low',
        category: '数据库',
        estimatedImprovement: '查询速度提升15-20%',
        priority: 4,
      },
    ];

    const mockReports: PerformanceReport[] = [
      {
        id: '1',
        title: '2024年1月性能报告',
        period: '2024-01-01 至 2024-01-30',
        overallScore: 85,
        metrics: {
          responseTime: 245,
          throughput: 1250,
          errorRate: 0.8,
          availability: 99.95,
        },
        generatedAt: '2024-01-30 09:00:00',
      },
      {
        id: '2',
        title: '2023年12月性能报告',
        period: '2023-12-01 至 2023-12-31',
        overallScore: 78,
        metrics: {
          responseTime: 280,
          throughput: 1100,
          errorRate: 1.2,
          availability: 99.8,
        },
        generatedAt: '2024-01-01 09:00:00',
      },
    ];

    setMetrics(mockMetrics);
    setAlerts(mockAlerts);
    setSuggestions(mockSuggestions);
    setReports(mockReports);
  }, []);

  const categories = ['all', ...Array.from(new Set(metrics.map(m => m.category)))];

  const filteredMetrics = metrics.filter(metric => 
    filterCategory === 'all' || metric.category === filterCategory
  );

  const getMetricStatus = (metric: PerformanceMetric) => {
    if (metric.value >= metric.threshold.critical) return 'critical';
    if (metric.value >= metric.threshold.warning) return 'warning';
    return 'normal';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#34C759';
      case 'down': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const renderMetricCard = ({ item }: { item: PerformanceMetric }) => {
    const status = getMetricStatus(item);
    
    return (
      <TouchableOpacity
        style={[styles.metricCard, styles[`metric${status}`]]}
        onPress={() => {
          setSelectedMetric(item);
          setShowMetricModal(true);
        }}
      >
        <View style={styles.metricHeader}>
          <Text style={styles.metricName}>{item.name}</Text>
          <View style={[styles.statusIndicator, styles[`status${status}`]]} />
        </View>
        
        <View style={styles.metricValue}>
          <Text style={styles.valueText}>{item.value}</Text>
          <Text style={styles.unitText}>{item.unit}</Text>
        </View>
        
        <View style={styles.metricTrend}>
          <Ionicons
            name={getTrendIcon(item.trend)}
            size={16}
            color={getTrendColor(item.trend)}
          />
          <Text style={[styles.trendText, { color: getTrendColor(item.trend) }]}>
            {item.trendValue > 0 ? '+' : ''}{item.trendValue}%
          </Text>
        </View>
        
        <Text style={styles.lastUpdated}>
          更新: {item.lastUpdated.split(' ')[1]}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderAlert = ({ item }: { item: PerformanceAlert }) => (
    <View style={[styles.alertCard, styles[`alert${item.level}`]]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <Text style={styles.alertMetric}>{item.metricName}</Text>
          <Text style={styles.alertTime}>{item.timestamp}</Text>
        </View>
        <View style={[styles.alertLevel, styles[`level${item.level}`]]}>
          <Text style={styles.alertLevelText}>
            {item.level === 'critical' ? '严重' : 
             item.level === 'warning' ? '警告' : '信息'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.alertMessage}>{item.message}</Text>
      
      {!item.acknowledged && (
        <TouchableOpacity
          style={styles.acknowledgeButton}
          onPress={() => handleAcknowledgeAlert(item.id)}
        >
          <Text style={styles.acknowledgeButtonText}>确认</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSuggestion = ({ item }: { item: OptimizationSuggestion }) => (
    <View style={styles.suggestionCard}>
      <View style={styles.suggestionHeader}>
        <Text style={styles.suggestionTitle}>{item.title}</Text>
        <View style={styles.priorityBadge}>
          <Text style={styles.priorityText}>P{item.priority}</Text>
        </View>
      </View>
      
      <Text style={styles.suggestionDescription}>{item.description}</Text>
      
      <View style={styles.suggestionMetrics}>
        <View style={styles.metricBadge}>
          <Text style={styles.metricLabel}>影响</Text>
          <Text style={[styles.metricValue, styles[`impact${item.impact}`]]}>
            {item.impact === 'high' ? '高' : item.impact === 'medium' ? '中' : '低'}
          </Text>
        </View>
        <View style={styles.metricBadge}>
          <Text style={styles.metricLabel}>工作量</Text>
          <Text style={[styles.metricValue, styles[`effort${item.effort}`]]}>
            {item.effort === 'high' ? '高' : item.effort === 'medium' ? '中' : '低'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.estimatedImprovement}>{item.estimatedImprovement}</Text>
      
      <TouchableOpacity style={styles.implementButton}>
        <Text style={styles.implementButtonText}>实施建议</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReport = ({ item }: { item: PerformanceReport }) => (
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
          <Text style={styles.reportMetricLabel}>响应时间</Text>
          <Text style={styles.reportMetricValue}>{item.metrics.responseTime}ms</Text>
        </View>
        <View style={styles.reportMetric}>
          <Text style={styles.reportMetricLabel}>吞吐量</Text>
          <Text style={styles.reportMetricValue}>{item.metrics.throughput}</Text>
        </View>
        <View style={styles.reportMetric}>
          <Text style={styles.reportMetricLabel}>错误率</Text>
          <Text style={styles.reportMetricValue}>{item.metrics.errorRate}%</Text>
        </View>
        <View style={styles.reportMetric}>
          <Text style={styles.reportMetricLabel}>可用性</Text>
          <Text style={styles.reportMetricValue}>{item.metrics.availability}%</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.viewReportButton}>
        <Ionicons name="document-text-outline" size={16} color="#007AFF" />
        <Text style={styles.viewReportButtonText}>查看详细报告</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPerformanceChart = () => {
    const chartData = {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      datasets: [{
        data: [180, 165, 220, 245, 280, 195],
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>24小时响应时间趋势</Text>
        <LineChart
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
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#007AFF'
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>性能优化器</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.autoRefreshContainer}>
            <Text style={styles.autoRefreshLabel}>自动刷新</Text>
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={autoRefresh ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'metrics' && styles.activeTab]}
          onPress={() => setActiveTab('metrics')}
        >
          <Text style={[styles.tabText, activeTab === 'metrics' && styles.activeTabText]}>
            性能指标
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'alerts' && styles.activeTab]}
          onPress={() => setActiveTab('alerts')}
        >
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.activeTabText]}>
            告警 ({alerts.filter(a => !a.acknowledged).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'suggestions' && styles.activeTab]}
          onPress={() => setActiveTab('suggestions')}
        >
          <Text style={[styles.tabText, activeTab === 'suggestions' && styles.activeTabText]}>
            优化建议
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>
            性能报告
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'metrics' && (
        <>
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    filterCategory === category && styles.activeCategoryButton
                  ]}
                  onPress={() => setFilterCategory(category)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    filterCategory === category && styles.activeCategoryButtonText
                  ]}>
                    {category === 'all' ? '全部' : category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <FlatList
            data={filteredMetrics}
            renderItem={renderMetricCard}
            keyExtractor={item => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.metricsContainer}
          />
        </>
      )}

      {activeTab === 'alerts' && (
        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'suggestions' && (
        <FlatList
          data={suggestions}
          renderItem={renderSuggestion}
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
        />
      )}

      {/* Metric Detail Modal */}
      <Modal
        visible={showMetricModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMetricModal(false)}>
              <Text style={styles.closeButton}>关闭</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedMetric?.name}
            </Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedMetric && (
              <>
                <View style={styles.metricDetailCard}>
                  <Text style={styles.currentValue}>
                    当前值: {selectedMetric.value} {selectedMetric.unit}
                  </Text>
                  <Text style={styles.threshold}>
                    警告阈值: {selectedMetric.threshold.warning} {selectedMetric.unit}
                  </Text>
                  <Text style={styles.threshold}>
                    严重阈值: {selectedMetric.threshold.critical} {selectedMetric.unit}
                  </Text>
                </View>
                
                {renderPerformanceChart()}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    marginRight: 15,
  },
  autoRefreshContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoRefreshLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
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
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  activeCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeCategoryButtonText: {
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
  metricnormal: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  metricwarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  metriccritical: {
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
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusnormal: {
    backgroundColor: '#34C759',
  },
  statuswarning: {
    backgroundColor: '#FF9500',
  },
  statuscritical: {
    backgroundColor: '#FF3B30',
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
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
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  lastUpdated: {
    fontSize: 10,
    color: '#999',
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  alertinfo: {
    borderLeftColor: '#007AFF',
  },
  alertwarning: {
    borderLeftColor: '#FF9500',
  },
  alertcritical: {
    borderLeftColor: '#FF3B30',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  alertInfo: {
    flex: 1,
  },
  alertMetric: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  alertTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  alertLevel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelinfo: {
    backgroundColor: '#e3f2fd',
  },
  levelwarning: {
    backgroundColor: '#fff3e0',
  },
  levelcritical: {
    backgroundColor: '#ffebee',
  },
  alertLevelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  acknowledgeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  acknowledgeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionCard: {
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
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  suggestionMetrics: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  impacthigh: {
    color: '#FF3B30',
  },
  impactmedium: {
    color: '#FF9500',
  },
  impactlow: {
    color: '#34C759',
  },
  efforthigh: {
    color: '#FF3B30',
  },
  effortmedium: {
    color: '#FF9500',
  },
  effortlow: {
    color: '#34C759',
  },
  estimatedImprovement: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 15,
  },
  implementButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  implementButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  metricDetailCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  currentValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  threshold: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  chartContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
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
});

export default PerformanceOptimizer;