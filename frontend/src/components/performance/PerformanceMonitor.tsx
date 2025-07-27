import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { EnhancedCard, EnhancedButton } from '../ui';
import { Ionicons } from '@expo/vector-icons';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  networkRequests: number;
  errorCount: number;
  timestamp: number;
}

interface PerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  showRealTime?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  onMetricsUpdate,
  showRealTime = false,
}) => {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    networkRequests: 0,
    errorCount: 0,
    timestamp: Date.now(),
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [history, setHistory] = useState<PerformanceMetrics[]>([]);
  
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  const renderStartTime = useRef(0);
  const monitoringInterval = useRef<NodeJS.Timeout>();

  // FPS 监控
  const measureFPS = () => {
    const now = Date.now();
    frameCount.current++;
    
    if (now - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
      frameCount.current = 0;
      lastTime.current = now;
      return fps;
    }
    return metrics.fps;
  };

  // 内存使用监控
  const measureMemoryUsage = () => {
    // 模拟内存使用情况（实际项目中可以使用 react-native-device-info）
    const baseMemory = 50; // MB
    const randomVariation = Math.random() * 20;
    return Math.round(baseMemory + randomVariation);
  };

  // 渲染时间监控
  const measureRenderTime = () => {
    if (renderStartTime.current > 0) {
      return Date.now() - renderStartTime.current;
    }
    return 0;
  };

  // 网络请求监控
  const measureNetworkRequests = () => {
    // 模拟网络请求计数
    return Math.floor(Math.random() * 10);
  };

  // 错误计数监控
  const measureErrorCount = () => {
    // 模拟错误计数
    return Math.floor(Math.random() * 3);
  };

  // 开始监控
  const startMonitoring = () => {
    setIsMonitoring(true);
    renderStartTime.current = Date.now();
    
    monitoringInterval.current = setInterval(() => {
      const newMetrics: PerformanceMetrics = {
        fps: measureFPS(),
        memoryUsage: measureMemoryUsage(),
        renderTime: measureRenderTime(),
        networkRequests: measureNetworkRequests(),
        errorCount: measureErrorCount(),
        timestamp: Date.now(),
      };
      
      setMetrics(newMetrics);
      setHistory(prev => [...prev.slice(-19), newMetrics]); // 保留最近20条记录
      
      if (onMetricsUpdate) {
        onMetricsUpdate(newMetrics);
      }
      
      // 性能警告
      if (newMetrics.fps < 30) {
        console.warn('Performance Warning: Low FPS detected');
      }
      if (newMetrics.memoryUsage > 100) {
        console.warn('Performance Warning: High memory usage detected');
      }
    }, 1000);
  };

  // 停止监控
  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
    }
  };

  // 清除历史数据
  const clearHistory = () => {
    Alert.alert(
      '清除数据',
      '确定要清除所有性能监控历史数据吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            setHistory([]);
            setMetrics({
              fps: 60,
              memoryUsage: 0,
              renderTime: 0,
              networkRequests: 0,
              errorCount: 0,
              timestamp: Date.now(),
            });
          },
        },
      ]
    );
  };

  // 生成性能报告
  const generateReport = () => {
    if (history.length === 0) {
      Alert.alert('提示', '暂无性能数据，请先开始监控');
      return;
    }

    const avgFPS = history.reduce((sum, m) => sum + m.fps, 0) / history.length;
    const avgMemory = history.reduce((sum, m) => sum + m.memoryUsage, 0) / history.length;
    const avgRenderTime = history.reduce((sum, m) => sum + m.renderTime, 0) / history.length;
    
    Alert.alert(
      '性能报告',
      `平均FPS: ${avgFPS.toFixed(1)}\n` +
      `平均内存使用: ${avgMemory.toFixed(1)}MB\n` +
      `平均渲染时间: ${avgRenderTime.toFixed(1)}ms\n` +
      `监控时长: ${history.length}秒`
    );
  };

  useEffect(() => {
    return () => {
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
      }
    };
  }, []);

  const getPerformanceStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return { color: theme.colors.success, status: '良好' };
    if (value <= thresholds.warning) return { color: theme.colors.warning, status: '一般' };
    return { color: theme.colors.error, status: '警告' };
  };

  const fpsStatus = getPerformanceStatus(60 - metrics.fps, { good: 10, warning: 20 });
  const memoryStatus = getPerformanceStatus(metrics.memoryUsage, { good: 70, warning: 90 });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    statusIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: isMonitoring ? theme.colors.success : theme.colors.gray,
    },
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    metricCard: {
      width: '48%',
      marginBottom: 12,
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    metricIcon: {
      marginRight: 8,
    },
    metricTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    metricStatus: {
      fontSize: 12,
      fontWeight: '500',
    },
    historyContainer: {
      marginTop: 20,
    },
    historyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
    },
    historyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray + '20',
    },
    historyTime: {
      fontSize: 12,
      color: theme.colors.gray,
    },
    historyMetric: {
      fontSize: 12,
      color: theme.colors.text,
    },
  });

  if (!showRealTime) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>性能监控</Text>
        <View style={styles.statusIndicator} />
      </View>

      <View style={styles.controlsContainer}>
        <EnhancedButton
          title={isMonitoring ? "停止监控" : "开始监控"}
          onPress={isMonitoring ? stopMonitoring : startMonitoring}
          variant={isMonitoring ? "outline" : "primary"}
          size="small"
          style={{ flex: 1, marginRight: 8 }}
        />
        <EnhancedButton
          title="生成报告"
          onPress={generateReport}
          variant="outline"
          size="small"
          style={{ flex: 1, marginHorizontal: 4 }}
        />
        <EnhancedButton
          title="清除数据"
          onPress={clearHistory}
          variant="outline"
          size="small"
          style={{ flex: 1, marginLeft: 8 }}
        />
      </View>

      <View style={styles.metricsGrid}>
        <EnhancedCard style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons 
              name="speedometer-outline" 
              size={20} 
              color={theme.colors.primary}
              style={styles.metricIcon}
            />
            <Text style={styles.metricTitle}>FPS</Text>
          </View>
          <Text style={styles.metricValue}>{metrics.fps}</Text>
          <Text style={[styles.metricStatus, { color: fpsStatus.color }]}>
            {fpsStatus.status}
          </Text>
        </EnhancedCard>

        <EnhancedCard style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons 
              name="hardware-chip-outline" 
              size={20} 
              color={theme.colors.primary}
              style={styles.metricIcon}
            />
            <Text style={styles.metricTitle}>内存</Text>
          </View>
          <Text style={styles.metricValue}>{metrics.memoryUsage}MB</Text>
          <Text style={[styles.metricStatus, { color: memoryStatus.color }]}>
            {memoryStatus.status}
          </Text>
        </EnhancedCard>

        <EnhancedCard style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons 
              name="time-outline" 
              size={20} 
              color={theme.colors.primary}
              style={styles.metricIcon}
            />
            <Text style={styles.metricTitle}>渲染时间</Text>
          </View>
          <Text style={styles.metricValue}>{metrics.renderTime}ms</Text>
          <Text style={[styles.metricStatus, { color: theme.colors.text }]}>
            渲染性能
          </Text>
        </EnhancedCard>

        <EnhancedCard style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons 
              name="cloud-outline" 
              size={20} 
              color={theme.colors.primary}
              style={styles.metricIcon}
            />
            <Text style={styles.metricTitle}>网络请求</Text>
          </View>
          <Text style={styles.metricValue}>{metrics.networkRequests}</Text>
          <Text style={[styles.metricStatus, { color: theme.colors.text }]}>
            每秒请求
          </Text>
        </EnhancedCard>
      </View>

      {history.length > 0 && (
        <EnhancedCard style={styles.historyContainer}>
          <Text style={styles.historyTitle}>性能历史</Text>
          {history.slice(-5).map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyTime}>
                {new Date(item.timestamp).toLocaleTimeString()}
              </Text>
              <Text style={styles.historyMetric}>
                FPS: {item.fps} | 内存: {item.memoryUsage}MB
              </Text>
            </View>
          ))}
        </EnhancedCard>
      )}
    </ScrollView>
  );
};

export default PerformanceMonitor;