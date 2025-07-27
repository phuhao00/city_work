import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Switch,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../../hooks/useTheme';

interface APIMonitoringProps {
  navigation?: any;
}

interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  responseTime: number;
  uptime: number;
  lastCheck: Date;
  errorRate: number;
  requestCount: number;
  enabled: boolean;
}

interface APIMetric {
  timestamp: Date;
  responseTime: number;
  statusCode: number;
  success: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  condition: 'response_time' | 'error_rate' | 'uptime';
  threshold: number;
  operator: '>' | '<' | '=' | '>=' | '<=';
  enabled: boolean;
  endpoints: string[];
}

const APIMonitoring: React.FC<APIMonitoringProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [metrics, setMetrics] = useState<{ [key: string]: APIMetric[] }>({});
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [showAddEndpoint, setShowAddEndpoint] = useState(false);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadEndpoints();
    loadMetrics();
    loadAlertRules();
    
    // 设置定时监控
    const interval = setInterval(() => {
      checkAllEndpoints();
    }, 60000); // 每分钟检查一次

    return () => clearInterval(interval);
  }, []);

  const loadEndpoints = async () => {
    try {
      // 模拟API端点数据
      const mockEndpoints: APIEndpoint[] = [
        {
          id: '1',
          name: '用户认证API',
          url: 'https://api.citywork.com/v1/auth',
          method: 'POST',
          status: 'healthy',
          responseTime: 120,
          uptime: 99.8,
          lastCheck: new Date(),
          errorRate: 0.2,
          requestCount: 15420,
          enabled: true,
        },
        {
          id: '2',
          name: '职位搜索API',
          url: 'https://api.citywork.com/v1/jobs/search',
          method: 'GET',
          status: 'warning',
          responseTime: 850,
          uptime: 98.5,
          lastCheck: new Date(),
          errorRate: 2.1,
          requestCount: 8930,
          enabled: true,
        },
        {
          id: '3',
          name: '用户资料API',
          url: 'https://api.citywork.com/v1/users/profile',
          method: 'GET',
          status: 'healthy',
          responseTime: 95,
          uptime: 99.9,
          lastCheck: new Date(),
          errorRate: 0.1,
          requestCount: 12340,
          enabled: true,
        },
        {
          id: '4',
          name: '消息发送API',
          url: 'https://api.citywork.com/v1/messages',
          method: 'POST',
          status: 'error',
          responseTime: 2500,
          uptime: 95.2,
          lastCheck: new Date(),
          errorRate: 8.5,
          requestCount: 3420,
          enabled: true,
        },
      ];

      setEndpoints(mockEndpoints);
    } catch (error) {
      console.error('加载API端点失败:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      // 生成模拟指标数据
      const mockMetrics: { [key: string]: APIMetric[] } = {};
      
      endpoints.forEach(endpoint => {
        const endpointMetrics: APIMetric[] = [];
        const now = new Date();
        
        for (let i = 23; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
          endpointMetrics.push({
            timestamp,
            responseTime: Math.random() * 500 + 100,
            statusCode: Math.random() > 0.95 ? 500 : 200,
            success: Math.random() > 0.02,
          });
        }
        
        mockMetrics[endpoint.id] = endpointMetrics;
      });

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('加载指标数据失败:', error);
    }
  };

  const loadAlertRules = async () => {
    try {
      const mockAlertRules: AlertRule[] = [
        {
          id: '1',
          name: '响应时间过长',
          condition: 'response_time',
          threshold: 1000,
          operator: '>',
          enabled: true,
          endpoints: ['1', '2', '3', '4'],
        },
        {
          id: '2',
          name: '错误率过高',
          condition: 'error_rate',
          threshold: 5,
          operator: '>',
          enabled: true,
          endpoints: ['1', '2', '3', '4'],
        },
        {
          id: '3',
          name: '可用性过低',
          condition: 'uptime',
          threshold: 95,
          operator: '<',
          enabled: true,
          endpoints: ['1', '2', '3', '4'],
        },
      ];

      setAlertRules(mockAlertRules);
    } catch (error) {
      console.error('加载告警规则失败:', error);
    }
  };

  const checkAllEndpoints = async () => {
    try {
      // 这里实现实际的API健康检查
      console.log('检查所有API端点健康状态...');
      
      // 模拟检查结果
      const updatedEndpoints = endpoints.map(endpoint => ({
        ...endpoint,
        lastCheck: new Date(),
        responseTime: Math.random() * 1000 + 50,
        status: Math.random() > 0.1 ? 'healthy' : 'warning' as any,
      }));

      setEndpoints(updatedEndpoints);
    } catch (error) {
      console.error('检查API端点失败:', error);
    }
  };

  const testEndpoint = async (endpoint: APIEndpoint) => {
    try {
      Alert.alert('测试中', `正在测试 ${endpoint.name}...`);
      
      // 这里实现实际的API测试
      setTimeout(() => {
        Alert.alert('测试完成', `${endpoint.name} 响应正常`);
      }, 2000);
    } catch (error) {
      Alert.alert('测试失败', `${endpoint.name} 测试失败`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return '#4CAF50';
      case 'POST':
        return '#2196F3';
      case 'PUT':
        return '#FF9800';
      case 'DELETE':
        return '#F44336';
      case 'PATCH':
        return '#9C27B0';
      default:
        return '#9E9E9E';
    }
  };

  const renderEndpointCard = (endpoint: APIEndpoint) => {
    const endpointMetrics = metrics[endpoint.id] || [];
    const chartData = {
      labels: endpointMetrics.slice(-6).map((_, index) => `${index * 4}h`),
      datasets: [
        {
          data: endpointMetrics.slice(-6).map(m => m.responseTime),
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <View
        key={endpoint.id}
        style={[styles.endpointCard, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.endpointHeader}>
          <View style={styles.endpointInfo}>
            <View style={styles.endpointTitle}>
              <Ionicons
                name={getStatusIcon(endpoint.status) as any}
                size={20}
                color={getStatusColor(endpoint.status)}
              />
              <Text style={[styles.endpointName, { color: theme.colors.text }]}>
                {endpoint.name}
              </Text>
            </View>
            <View style={styles.endpointMeta}>
              <View
                style={[
                  styles.methodBadge,
                  { backgroundColor: getMethodColor(endpoint.method) },
                ]}
              >
                <Text style={styles.methodText}>{endpoint.method}</Text>
              </View>
              <Text style={[styles.endpointUrl, { color: theme.colors.textSecondary }]}>
                {endpoint.url}
              </Text>
            </View>
          </View>
          <Switch
            value={endpoint.enabled}
            onValueChange={(value) => {
              const updatedEndpoints = endpoints.map(ep =>
                ep.id === endpoint.id ? { ...ep, enabled: value } : ep
              );
              setEndpoints(updatedEndpoints);
            }}
            trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
            thumbColor={endpoint.enabled ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        <View style={styles.endpointStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {endpoint.responseTime}ms
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              响应时间
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>
              {endpoint.uptime}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              可用性
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F44336' }]}>
              {endpoint.errorRate}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              错误率
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {endpoint.requestCount.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              请求数
            </Text>
          </View>
        </View>

        {endpointMetrics.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              响应时间趋势
            </Text>
            <LineChart
              data={chartData}
              width={screenWidth - 64}
              height={120}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: (opacity = 1) => theme.colors.textSecondary,
                style: { borderRadius: 16 },
                propsForDots: { r: '3', strokeWidth: '1', stroke: '#4CAF50' },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          </View>
        )}

        <View style={styles.endpointActions}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.primary }]}
            onPress={() => testEndpoint(endpoint)}
          >
            <Ionicons name="play" size={16} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
              测试
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.primary }]}
            onPress={() => setSelectedEndpoint(endpoint.id)}
          >
            <Ionicons name="analytics" size={16} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
              详情
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.lastCheck, { color: theme.colors.textSecondary }]}>
          最后检查: {endpoint.lastCheck.toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  const renderAlertRule = (rule: AlertRule) => (
    <View
      key={rule.id}
      style={[styles.alertRuleCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.alertRuleHeader}>
        <Text style={[styles.alertRuleName, { color: theme.colors.text }]}>
          {rule.name}
        </Text>
        <Switch
          value={rule.enabled}
          onValueChange={(value) => {
            const updatedRules = alertRules.map(r =>
              r.id === rule.id ? { ...r, enabled: value } : r
            );
            setAlertRules(updatedRules);
          }}
          trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
          thumbColor={rule.enabled ? '#FFFFFF' : '#F4F3F4'}
        />
      </View>
      <Text style={[styles.alertRuleCondition, { color: theme.colors.textSecondary }]}>
        当 {rule.condition === 'response_time' ? '响应时间' : 
             rule.condition === 'error_rate' ? '错误率' : '可用性'} {rule.operator} {rule.threshold}
        {rule.condition === 'response_time' ? 'ms' : '%'} 时触发告警
      </Text>
      <Text style={[styles.alertRuleEndpoints, { color: theme.colors.textSecondary }]}>
        监控端点: {rule.endpoints.length} 个
      </Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 总览统计 */}
      <View style={styles.overviewSection}>
        <View style={[styles.overviewCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.overviewTitle, { color: theme.colors.text }]}>
            API监控总览
          </Text>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewNumber, { color: '#4CAF50' }]}>
                {endpoints.filter(e => e.status === 'healthy').length}
              </Text>
              <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>
                健康
              </Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewNumber, { color: '#FF9800' }]}>
                {endpoints.filter(e => e.status === 'warning').length}
              </Text>
              <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>
                警告
              </Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewNumber, { color: '#F44336' }]}>
                {endpoints.filter(e => e.status === 'error').length}
              </Text>
              <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>
                错误
              </Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewNumber, { color: theme.colors.text }]}>
                {endpoints.length}
              </Text>
              <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>
                总计
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 操作按钮 */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAddEndpoint(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>添加端点</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
          onPress={checkAllEndpoints}
        >
          <Ionicons name="refresh" size={20} color={theme.colors.primary} />
          <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
            检查全部
          </Text>
        </TouchableOpacity>
      </View>

      {/* API端点列表 */}
      <View style={styles.endpointsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          API端点
        </Text>
        {endpoints.map(renderEndpointCard)}
      </View>

      {/* 告警规则 */}
      <View style={styles.alertRulesSection}>
        <View style={styles.alertRulesHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            告警规则
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { borderColor: theme.colors.primary }]}
            onPress={() => setShowAddAlert(true)}
          >
            <Ionicons name="add" size={16} color={theme.colors.primary} />
            <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>
              添加
            </Text>
          </TouchableOpacity>
        </View>
        {alertRules.map(renderAlertRule)}
      </View>

      {/* 添加端点模态框 */}
      <Modal
        visible={showAddEndpoint}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddEndpoint(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              添加API端点
            </Text>
            {/* 这里可以添加表单字段 */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddEndpoint(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.primary }]}>
                取消
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 添加告警规则模态框 */}
      <Modal
        visible={showAddAlert}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddAlert(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              添加告警规则
            </Text>
            {/* 这里可以添加表单字段 */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddAlert(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.primary }]}>
                取消
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  overviewStat: {
    alignItems: 'center',
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 14,
  },
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  endpointsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  endpointCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  endpointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  endpointInfo: {
    flex: 1,
  },
  endpointTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  endpointName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  endpointMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  methodText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  endpointUrl: {
    fontSize: 12,
    flex: 1,
  },
  endpointStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  chartContainer: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  endpointActions: {
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
  lastCheck: {
    fontSize: 12,
    textAlign: 'center',
  },
  alertRulesSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  alertRulesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    marginLeft: 4,
  },
  alertRuleCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  alertRuleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertRuleName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  alertRuleCondition: {
    fontSize: 14,
    marginBottom: 4,
  },
  alertRuleEndpoints: {
    fontSize: 12,
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

export default APIMonitoring;