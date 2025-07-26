import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
  threshold: {
    good: number;
    warning: number;
  };
}

interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
  breakdown: {
    components: number;
    images: number;
    cache: number;
    other: number;
  };
}

interface NetworkMetric {
  id: string;
  endpoint: string;
  method: string;
  responseTime: number;
  status: number;
  size: number;
  timestamp: Date;
  cached: boolean;
}

interface RenderMetric {
  componentName: string;
  renderTime: number;
  renderCount: number;
  lastRender: Date;
  props: any;
  state: any;
}

interface OptimizationSuggestion {
  id: string;
  type: 'performance' | 'memory' | 'network' | 'rendering';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  impact: string;
  solution: string;
  estimatedImprovement: string;
  implemented: boolean;
}

const PerformanceMonitorScreen: React.FC = () => {
  const { theme } = useTheme();
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage | null>(null);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetric[]>([]);
  const [renderMetrics, setRenderMetrics] = useState<RenderMetric[]>([]);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'memory' | 'network' | 'rendering' | 'optimization'>('overview');
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [autoOptimization, setAutoOptimization] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetric | null>(null);

  useEffect(() => {
    if (monitoringEnabled) {
      initializeMonitoring();
      const interval = setInterval(updateMetrics, 2000);
      return () => clearInterval(interval);
    }
  }, [monitoringEnabled]);

  const initializeMonitoring = async () => {
    try {
      // 初始化性能指标
      const initialMetrics: PerformanceMetric[] = [
        {
          id: 'fps',
          name: 'FPS (帧率)',
          value: 60,
          unit: 'fps',
          status: 'good',
          trend: 'stable',
          description: '应用渲染帧率，影响用户体验流畅度',
          threshold: { good: 55, warning: 45 },
        },
        {
          id: 'memory',
          name: '内存使用',
          value: 45.2,
          unit: 'MB',
          status: 'good',
          trend: 'up',
          description: '应用内存占用情况',
          threshold: { good: 100, warning: 150 },
        },
        {
          id: 'cpu',
          name: 'CPU 使用率',
          value: 12.5,
          unit: '%',
          status: 'good',
          trend: 'stable',
          description: 'CPU 处理器使用率',
          threshold: { good: 30, warning: 60 },
        },
        {
          id: 'network',
          name: '网络延迟',
          value: 120,
          unit: 'ms',
          status: 'good',
          trend: 'down',
          description: 'API 请求平均响应时间',
          threshold: { good: 200, warning: 500 },
        },
        {
          id: 'battery',
          name: '电池消耗',
          value: 2.1,
          unit: '%/h',
          status: 'good',
          trend: 'stable',
          description: '每小时电池消耗百分比',
          threshold: { good: 5, warning: 10 },
        },
        {
          id: 'storage',
          name: '存储使用',
          value: 23.8,
          unit: 'MB',
          status: 'good',
          trend: 'up',
          description: '本地存储占用空间',
          threshold: { good: 50, warning: 100 },
        },
      ];

      setPerformanceMetrics(initialMetrics);

      // 初始化内存使用情况
      setMemoryUsage({
        used: 45.2,
        total: 128,
        percentage: 35.3,
        breakdown: {
          components: 18.5,
          images: 12.3,
          cache: 8.7,
          other: 5.7,
        },
      });

      // 初始化网络指标
      const initialNetworkMetrics: NetworkMetric[] = [
        {
          id: '1',
          endpoint: '/api/jobs',
          method: 'GET',
          responseTime: 145,
          status: 200,
          size: 2.3,
          timestamp: new Date(Date.now() - 1000 * 30),
          cached: false,
        },
        {
          id: '2',
          endpoint: '/api/user/profile',
          method: 'GET',
          responseTime: 89,
          status: 200,
          size: 1.2,
          timestamp: new Date(Date.now() - 1000 * 60),
          cached: true,
        },
        {
          id: '3',
          endpoint: '/api/companies',
          method: 'GET',
          responseTime: 234,
          status: 200,
          size: 4.1,
          timestamp: new Date(Date.now() - 1000 * 90),
          cached: false,
        },
      ];

      setNetworkMetrics(initialNetworkMetrics);

      // 初始化渲染指标
      const initialRenderMetrics: RenderMetric[] = [
        {
          componentName: 'JobListScreen',
          renderTime: 12.5,
          renderCount: 8,
          lastRender: new Date(Date.now() - 1000 * 15),
          props: { jobs: 25, filters: 3 },
          state: { loading: false, error: null },
        },
        {
          componentName: 'CompanyCard',
          renderTime: 3.2,
          renderCount: 45,
          lastRender: new Date(Date.now() - 1000 * 5),
          props: { company: 'object', featured: true },
          state: { expanded: false },
        },
        {
          componentName: 'SearchBar',
          renderTime: 1.8,
          renderCount: 12,
          lastRender: new Date(Date.now() - 1000 * 8),
          props: { query: 'React', suggestions: 8 },
          state: { focused: false },
        },
      ];

      setRenderMetrics(initialRenderMetrics);

      // 初始化优化建议
      const initialSuggestions: OptimizationSuggestion[] = [
        {
          id: '1',
          type: 'performance',
          severity: 'medium',
          title: '启用图片懒加载',
          description: '检测到大量图片同时加载，影响首屏渲染性能',
          impact: '可减少首屏加载时间 30-40%',
          solution: '使用 React.lazy() 和 Suspense 实现图片懒加载',
          estimatedImprovement: '提升 35% 加载速度',
          implemented: false,
        },
        {
          id: '2',
          type: 'memory',
          severity: 'low',
          title: '优化组件缓存策略',
          description: '部分组件重复渲染，可通过 React.memo 优化',
          impact: '减少不必要的重新渲染',
          solution: '为纯组件添加 React.memo 包装',
          estimatedImprovement: '减少 20% 内存占用',
          implemented: false,
        },
        {
          id: '3',
          type: 'network',
          severity: 'high',
          title: '实现 API 响应缓存',
          description: '相同 API 请求重复发送，浪费网络资源',
          impact: '显著提升用户体验和减少流量消耗',
          solution: '使用 React Query 或 SWR 实现智能缓存',
          estimatedImprovement: '减少 60% 网络请求',
          implemented: false,
        },
        {
          id: '4',
          type: 'rendering',
          severity: 'medium',
          title: '虚拟化长列表',
          description: '职位列表渲染大量 DOM 节点，影响滚动性能',
          impact: '提升列表滚动流畅度',
          solution: '使用 react-window 或 react-virtualized',
          estimatedImprovement: '提升 50% 滚动性能',
          implemented: false,
        },
      ];

      setOptimizationSuggestions(initialSuggestions);

    } catch (error) {
      console.error('初始化性能监控失败:', error);
    }
  };

  const updateMetrics = useCallback(() => {
    setPerformanceMetrics(prev => prev.map(metric => ({
      ...metric,
      value: metric.value + (Math.random() - 0.5) * 2,
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
      status: metric.value < metric.threshold.good ? 'good' :
              metric.value < metric.threshold.warning ? 'warning' : 'critical',
    })));

    // 更新内存使用情况
    setMemoryUsage(prev => prev ? {
      ...prev,
      used: prev.used + (Math.random() - 0.5) * 2,
      percentage: (prev.used / prev.total) * 100,
    } : null);
  }, []);

  const handleOptimizationImplement = async (suggestionId: string) => {
    try {
      setOptimizationSuggestions(prev =>
        prev.map(suggestion =>
          suggestion.id === suggestionId
            ? { ...suggestion, implemented: true }
            : suggestion
        )
      );

      Alert.alert(
        '优化已应用',
        '性能优化建议已成功实施，您将在接下来的使用中感受到改进。',
        [{ text: '确定' }]
      );
    } catch (error) {
      Alert.alert('错误', '应用优化失败，请稍后重试');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return theme.success;
      case 'warning':
        return theme.warning;
      case 'critical':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}秒前`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
    return `${Math.floor(seconds / 3600)}小时前`;
  };

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.metricsGrid}>
        {performanceMetrics.map((metric) => (
          <TouchableOpacity
            key={metric.id}
            style={[styles.metricCard, { backgroundColor: theme.surface }]}
            onPress={() => {
              setSelectedMetric(metric);
              setShowDetails(true);
            }}
          >
            <View style={styles.metricHeader}>
              <Text style={[styles.metricName, { color: theme.text }]}>
                {metric.name}
              </Text>
              <Ionicons
                name={getTrendIcon(metric.trend)}
                size={16}
                color={getStatusColor(metric.status)}
              />
            </View>
            <Text style={[styles.metricValue, { color: getStatusColor(metric.status) }]}>
              {metric.value.toFixed(1)} {metric.unit}
            </Text>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(metric.status) }]} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.chartContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>
          性能趋势
        </Text>
        <LineChart
          data={{
            labels: ['1分钟前', '30秒前', '现在'],
            datasets: [{
              data: [58, 61, 60],
              color: (opacity = 1) => `rgba(${theme.primary.slice(1)}, ${opacity})`,
            }],
          }}
          width={Dimensions.get('window').width - 60}
          height={200}
          chartConfig={{
            backgroundColor: theme.surface,
            backgroundGradientFrom: theme.surface,
            backgroundGradientTo: theme.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(${theme.text.slice(1)}, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(${theme.textSecondary.slice(1)}, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );

  const renderMemory = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {memoryUsage && (
        <>
          <View style={[styles.memoryOverview, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              内存使用概览
            </Text>
            <View style={styles.memoryStats}>
              <Text style={[styles.memoryText, { color: theme.text }]}>
                已使用: {memoryUsage.used.toFixed(1)} MB
              </Text>
              <Text style={[styles.memoryText, { color: theme.textSecondary }]}>
                总计: {memoryUsage.total} MB
              </Text>
              <Text style={[styles.memoryPercentage, { color: theme.primary }]}>
                {memoryUsage.percentage.toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={[styles.chartContainer, { backgroundColor: theme.surface }]}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              内存分布
            </Text>
            <PieChart
              data={[
                { name: '组件', population: memoryUsage.breakdown.components, color: theme.primary, legendFontColor: theme.text },
                { name: '图片', population: memoryUsage.breakdown.images, color: theme.success, legendFontColor: theme.text },
                { name: '缓存', population: memoryUsage.breakdown.cache, color: theme.warning, legendFontColor: theme.text },
                { name: '其他', population: memoryUsage.breakdown.other, color: theme.error, legendFontColor: theme.text },
              ]}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(${theme.text.slice(1)}, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderNetwork = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[styles.networkStats, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          网络请求统计
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {networkMetrics.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              总请求数
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.success }]}>
              {Math.round(networkMetrics.reduce((sum, m) => sum + m.responseTime, 0) / networkMetrics.length)}ms
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              平均响应时间
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.warning }]}>
              {networkMetrics.filter(m => m.cached).length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              缓存命中
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.requestsList, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          最近请求
        </Text>
        {networkMetrics.map((request) => (
          <View key={request.id} style={[styles.requestItem, { borderBottomColor: theme.border }]}>
            <View style={styles.requestHeader}>
              <Text style={[styles.requestEndpoint, { color: theme.text }]}>
                {request.method} {request.endpoint}
              </Text>
              <View style={styles.requestMeta}>
                <Text style={[styles.requestTime, { color: theme.textSecondary }]}>
                  {formatTimestamp(request.timestamp)}
                </Text>
                {request.cached && (
                  <View style={[styles.cachedBadge, { backgroundColor: theme.success + '20' }]}>
                    <Text style={[styles.cachedText, { color: theme.success }]}>
                      缓存
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.requestStats}>
              <Text style={[styles.requestStat, { color: theme.textSecondary }]}>
                {request.responseTime}ms
              </Text>
              <Text style={[styles.requestStat, { color: theme.textSecondary }]}>
                {request.size}KB
              </Text>
              <Text style={[
                styles.requestStatus,
                { color: request.status === 200 ? theme.success : theme.error }
              ]}>
                {request.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderRendering = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[styles.renderingStats, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          组件渲染性能
        </Text>
        {renderMetrics.map((metric, index) => (
          <View key={index} style={[styles.renderItem, { borderBottomColor: theme.border }]}>
            <View style={styles.renderHeader}>
              <Text style={[styles.componentName, { color: theme.text }]}>
                {metric.componentName}
              </Text>
              <Text style={[styles.renderTime, { color: theme.primary }]}>
                {metric.renderTime.toFixed(1)}ms
              </Text>
            </View>
            <View style={styles.renderDetails}>
              <Text style={[styles.renderDetail, { color: theme.textSecondary }]}>
                渲染次数: {metric.renderCount}
              </Text>
              <Text style={[styles.renderDetail, { color: theme.textSecondary }]}>
                最后渲染: {formatTimestamp(metric.lastRender)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderOptimization = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[styles.optimizationHeader, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          性能优化建议
        </Text>
        <View style={styles.autoOptimizationToggle}>
          <Text style={[styles.toggleLabel, { color: theme.textSecondary }]}>
            自动优化
          </Text>
          <Switch
            value={autoOptimization}
            onValueChange={setAutoOptimization}
            trackColor={{ false: theme.border, true: theme.primary + '50' }}
            thumbColor={autoOptimization ? theme.primary : theme.textSecondary}
          />
        </View>
      </View>

      {optimizationSuggestions.map((suggestion) => (
        <View key={suggestion.id} style={[styles.suggestionCard, { backgroundColor: theme.surface }]}>
          <View style={styles.suggestionHeader}>
            <View style={styles.suggestionTitleRow}>
              <Ionicons
                name={
                  suggestion.type === 'performance' ? 'speedometer' :
                  suggestion.type === 'memory' ? 'hardware-chip' :
                  suggestion.type === 'network' ? 'wifi' : 'eye'
                }
                size={20}
                color={theme.primary}
              />
              <Text style={[styles.suggestionTitle, { color: theme.text }]}>
                {suggestion.title}
              </Text>
            </View>
            <View style={[
              styles.severityBadge,
              {
                backgroundColor: suggestion.severity === 'high' ? theme.error + '20' :
                                suggestion.severity === 'medium' ? theme.warning + '20' :
                                theme.success + '20'
              }
            ]}>
              <Text style={[
                styles.severityText,
                {
                  color: suggestion.severity === 'high' ? theme.error :
                         suggestion.severity === 'medium' ? theme.warning :
                         theme.success
                }
              ]}>
                {suggestion.severity === 'high' ? '高' :
                 suggestion.severity === 'medium' ? '中' : '低'}
              </Text>
            </View>
          </View>

          <Text style={[styles.suggestionDescription, { color: theme.textSecondary }]}>
            {suggestion.description}
          </Text>

          <View style={styles.suggestionDetails}>
            <Text style={[styles.suggestionImpact, { color: theme.text }]}>
              影响: {suggestion.impact}
            </Text>
            <Text style={[styles.suggestionImprovement, { color: theme.success }]}>
              预期改进: {suggestion.estimatedImprovement}
            </Text>
          </View>

          <Text style={[styles.suggestionSolution, { color: theme.textSecondary }]}>
            解决方案: {suggestion.solution}
          </Text>

          <TouchableOpacity
            style={[
              styles.implementButton,
              {
                backgroundColor: suggestion.implemented ? theme.success + '20' : theme.primary,
                opacity: suggestion.implemented ? 0.7 : 1,
              }
            ]}
            onPress={() => !suggestion.implemented && handleOptimizationImplement(suggestion.id)}
            disabled={suggestion.implemented}
          >
            <Ionicons
              name={suggestion.implemented ? 'checkmark-circle' : 'rocket'}
              size={16}
              color={suggestion.implemented ? theme.success : 'white'}
            />
            <Text style={[
              styles.implementButtonText,
              { color: suggestion.implemented ? theme.success : 'white' }
            ]}>
              {suggestion.implemented ? '已实施' : '立即优化'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.primary, theme.primary + '80']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>性能监控</Text>
        <Text style={styles.headerSubtitle}>实时性能分析与优化</Text>
        
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={styles.monitoringToggle}
            onPress={() => setMonitoringEnabled(!monitoringEnabled)}
          >
            <Ionicons
              name={monitoringEnabled ? 'pause' : 'play'}
              size={16}
              color="white"
            />
            <Text style={styles.toggleText}>
              {monitoringEnabled ? '暂停监控' : '开始监控'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
        {[
          { key: 'overview', label: '概览', icon: 'analytics' },
          { key: 'memory', label: '内存', icon: 'hardware-chip' },
          { key: 'network', label: '网络', icon: 'wifi' },
          { key: 'rendering', label: '渲染', icon: 'eye' },
          { key: 'optimization', label: '优化', icon: 'rocket' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && { backgroundColor: theme.primary }
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={selectedTab === tab.key ? 'white' : theme.textSecondary}
            />
            <Text style={[
              styles.tabButtonText,
              { color: selectedTab === tab.key ? 'white' : theme.textSecondary }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'memory' && renderMemory()}
        {selectedTab === 'network' && renderNetwork()}
        {selectedTab === 'rendering' && renderRendering()}
        {selectedTab === 'optimization' && renderOptimization()}
      </View>

      {/* 详情模态框 */}
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface }]}>
            <TouchableOpacity onPress={() => setShowDetails(false)}>
              <Text style={[styles.modalClose, { color: theme.textSecondary }]}>
                关闭
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              性能指标详情
            </Text>
            <View style={{ width: 40 }} />
          </View>
          
          {selectedMetric && (
            <ScrollView style={styles.modalContent}>
              <View style={[styles.metricDetail, { backgroundColor: theme.surface }]}>
                <Text style={[styles.metricDetailName, { color: theme.text }]}>
                  {selectedMetric.name}
                </Text>
                <Text style={[styles.metricDetailValue, { color: getStatusColor(selectedMetric.status) }]}>
                  {selectedMetric.value.toFixed(2)} {selectedMetric.unit}
                </Text>
                <Text style={[styles.metricDetailDescription, { color: theme.textSecondary }]}>
                  {selectedMetric.description}
                </Text>
                
                <View style={styles.thresholds}>
                  <Text style={[styles.thresholdTitle, { color: theme.text }]}>
                    性能阈值
                  </Text>
                  <View style={styles.thresholdItem}>
                    <View style={[styles.thresholdIndicator, { backgroundColor: theme.success }]} />
                    <Text style={[styles.thresholdText, { color: theme.textSecondary }]}>
                      良好: &lt; {selectedMetric.threshold.good} {selectedMetric.unit}
                    </Text>
                  </View>
                  <View style={styles.thresholdItem}>
                    <View style={[styles.thresholdIndicator, { backgroundColor: theme.warning }]} />
                    <Text style={[styles.thresholdText, { color: theme.textSecondary }]}>
                      警告: {selectedMetric.threshold.good} - {selectedMetric.threshold.warning} {selectedMetric.unit}
                    </Text>
                  </View>
                  <View style={styles.thresholdItem}>
                    <View style={[styles.thresholdIndicator, { backgroundColor: theme.error }]} />
                    <Text style={[styles.thresholdText, { color: theme.textSecondary }]}>
                      严重: &gt; {selectedMetric.threshold.warning} {selectedMetric.unit}
                    </Text>
                  </View>
                </View>
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
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monitoringToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  toggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 2,
    borderRadius: 12,
  },
  tabButtonText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    position: 'relative',
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
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartContainer: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 8,
  },
  memoryOverview: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  memoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memoryText: {
    fontSize: 14,
  },
  memoryPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  networkStats: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  requestsList: {
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  requestEndpoint: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestTime: {
    fontSize: 12,
    marginRight: 8,
  },
  cachedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cachedText: {
    fontSize: 10,
    fontWeight: '600',
  },
  requestStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestStat: {
    fontSize: 12,
  },
  requestStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  renderingStats: {
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  renderItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  renderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  componentName: {
    fontSize: 14,
    fontWeight: '600',
  },
  renderTime: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  renderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  renderDetail: {
    fontSize: 12,
  },
  optimizationHeader: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  autoOptimizationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    marginRight: 10,
  },
  suggestionCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  suggestionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  suggestionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  suggestionDetails: {
    marginBottom: 10,
  },
  suggestionImpact: {
    fontSize: 13,
    marginBottom: 3,
  },
  suggestionImprovement: {
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionSolution: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  implementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  implementButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  modalClose: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  metricDetail: {
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricDetailName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  metricDetailValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  metricDetailDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  thresholds: {
    marginTop: 10,
  },
  thresholdTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  thresholdItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  thresholdIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  thresholdText: {
    fontSize: 14,
  },
});

export default PerformanceMonitorScreen;