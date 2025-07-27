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
  Switch,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'data_access' | 'permission_change' | 'suspicious_activity' | 'breach_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  source: string;
  userAgent?: string;
  ipAddress: string;
  location?: string;
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  affectedUsers?: string[];
  actions: string[];
}

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  type: 'authentication' | 'authorization' | 'data_protection' | 'network' | 'application';
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: string[];
  actions: string[];
  lastTriggered?: string;
  triggerCount: number;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  resolvedEvents: number;
  activeThreats: number;
  securityScore: number;
  trendsData: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }>;
  };
  eventsByType: Array<{
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }>;
  severityDistribution: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
}

interface VulnerabilityAssessment {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'web' | 'network' | 'system' | 'application' | 'database';
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  discoveredAt: string;
  lastUpdated: string;
  affectedAssets: string[];
  cvssScore?: number;
  remediation: string;
  assignedTo?: string;
}

const SecurityMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'rules' | 'vulnerabilities'>('dashboard');
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityRules, setSecurityRules] = useState<SecurityRule[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityAssessment[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showVulnerabilityModal, setShowVulnerabilityModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [selectedRule, setSelectedRule] = useState<SecurityRule | null>(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState<VulnerabilityAssessment | null>(null);

  // Filter states
  const [eventFilter, setEventFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'detected' | 'investigating' | 'resolved'>('all');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock security events
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'login_attempt',
        severity: 'high',
        title: '多次登录失败',
        description: '用户账号在5分钟内尝试登录失败10次',
        timestamp: '2024-01-15 14:30:00',
        source: 'Authentication Service',
        ipAddress: '192.168.1.100',
        location: '北京, 中国',
        status: 'investigating',
        affectedUsers: ['user123'],
        actions: ['账号临时锁定', '发送安全警报'],
      },
      {
        id: '2',
        type: 'data_access',
        severity: 'critical',
        title: '异常数据访问',
        description: '检测到大量敏感数据被异常访问',
        timestamp: '2024-01-15 13:45:00',
        source: 'Data Access Monitor',
        ipAddress: '10.0.0.50',
        status: 'detected',
        affectedUsers: ['admin', 'user456'],
        actions: ['阻止访问', '记录详细日志'],
      },
      {
        id: '3',
        type: 'suspicious_activity',
        severity: 'medium',
        title: '可疑网络活动',
        description: '检测到来自未知IP的异常网络扫描',
        timestamp: '2024-01-15 12:20:00',
        source: 'Network Monitor',
        ipAddress: '203.0.113.1',
        location: '未知',
        status: 'resolved',
        actions: ['IP地址封禁', '增强监控'],
      },
    ];

    // Mock security rules
    const mockRules: SecurityRule[] = [
      {
        id: '1',
        name: '登录失败检测',
        description: '检测短时间内多次登录失败的行为',
        type: 'authentication',
        enabled: true,
        severity: 'high',
        conditions: ['登录失败次数 > 5', '时间窗口 < 5分钟'],
        actions: ['锁定账号', '发送警报', '记录日志'],
        lastTriggered: '2024-01-15 14:30:00',
        triggerCount: 15,
      },
      {
        id: '2',
        name: '数据泄露检测',
        description: '监控大量敏感数据的异常访问',
        type: 'data_protection',
        enabled: true,
        severity: 'critical',
        conditions: ['数据访问量 > 1000条/分钟', '敏感字段访问'],
        actions: ['阻止访问', '立即警报', '管理员通知'],
        lastTriggered: '2024-01-15 13:45:00',
        triggerCount: 3,
      },
      {
        id: '3',
        name: '权限提升检测',
        description: '检测异常的权限提升操作',
        type: 'authorization',
        enabled: true,
        severity: 'high',
        conditions: ['权限变更', '非管理员操作', '敏感权限'],
        actions: ['撤销权限', '发送警报', '审计日志'],
        triggerCount: 0,
      },
    ];

    // Mock vulnerabilities
    const mockVulnerabilities: VulnerabilityAssessment[] = [
      {
        id: '1',
        name: 'SQL注入漏洞',
        description: '用户输入验证不足，可能导致SQL注入攻击',
        severity: 'high',
        category: 'web',
        status: 'open',
        discoveredAt: '2024-01-10',
        lastUpdated: '2024-01-15',
        affectedAssets: ['web-server-01', 'database-01'],
        cvssScore: 7.5,
        remediation: '实施参数化查询和输入验证',
        assignedTo: 'security-team',
      },
      {
        id: '2',
        name: '弱密码策略',
        description: '系统允许使用弱密码，增加暴力破解风险',
        severity: 'medium',
        category: 'system',
        status: 'in_progress',
        discoveredAt: '2024-01-08',
        lastUpdated: '2024-01-14',
        affectedAssets: ['auth-service'],
        cvssScore: 5.3,
        remediation: '强化密码策略，要求复杂密码',
        assignedTo: 'dev-team',
      },
      {
        id: '3',
        name: '未加密数据传输',
        description: '部分API端点使用HTTP而非HTTPS',
        severity: 'medium',
        category: 'network',
        status: 'resolved',
        discoveredAt: '2024-01-05',
        lastUpdated: '2024-01-12',
        affectedAssets: ['api-gateway'],
        cvssScore: 4.8,
        remediation: '强制使用HTTPS，禁用HTTP',
        assignedTo: 'devops-team',
      },
    ];

    // Mock metrics
    const mockMetrics: SecurityMetrics = {
      totalEvents: 156,
      criticalEvents: 8,
      resolvedEvents: 142,
      activeThreats: 6,
      securityScore: 85,
      trendsData: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [
          {
            data: [12, 8, 15, 25, 18, 10],
            color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      },
      eventsByType: [
        {
          name: '登录异常',
          population: 45,
          color: '#F44336',
          legendFontColor: '#333',
          legendFontSize: 12,
        },
        {
          name: '数据访问',
          population: 30,
          color: '#FF9800',
          legendFontColor: '#333',
          legendFontSize: 12,
        },
        {
          name: '网络活动',
          population: 25,
          color: '#2196F3',
          legendFontColor: '#333',
          legendFontSize: 12,
        },
      ],
      severityDistribution: {
        labels: ['低', '中', '高', '严重'],
        datasets: [
          {
            data: [45, 38, 25, 8],
          },
        ],
      },
    };

    setSecurityEvents(mockEvents);
    setSecurityRules(mockRules);
    setVulnerabilities(mockVulnerabilities);
    setMetrics(mockMetrics);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#D32F2F';
      case 'high': return '#F57C00';
      case 'medium': return '#FBC02D';
      case 'low': return '#388E3C';
      default: return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'detected': return '#F44336';
      case 'investigating': return '#FF9800';
      case 'resolved': return '#4CAF50';
      case 'false_positive': return '#9E9E9E';
      case 'open': return '#F44336';
      case 'in_progress': return '#FF9800';
      case 'accepted_risk': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'login_attempt': return 'log-in-outline';
      case 'data_access': return 'document-text-outline';
      case 'permission_change': return 'key-outline';
      case 'suspicious_activity': return 'warning-outline';
      case 'breach_attempt': return 'shield-outline';
      default: return 'alert-circle-outline';
    }
  };

  const filteredEvents = securityEvents.filter(event => {
    if (eventFilter !== 'all' && event.severity !== eventFilter) return false;
    if (statusFilter !== 'all' && event.status !== statusFilter) return false;
    return true;
  });

  const onRefresh = () => {
    setRefreshing(true);
    loadMockData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderDashboardTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Security Score */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreTitle}>安全评分</Text>
          <View style={[styles.scoreValue, { backgroundColor: metrics?.securityScore && metrics.securityScore >= 80 ? '#4CAF50' : '#FF9800' }]}>
            <Text style={styles.scoreText}>{metrics?.securityScore || 0}</Text>
          </View>
        </View>
        <Text style={styles.scoreDescription}>
          基于安全事件、漏洞和合规性的综合评分
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="alert-circle" size={24} color="#F44336" />
          <Text style={styles.statValue}>{metrics?.totalEvents || 0}</Text>
          <Text style={styles.statLabel}>总事件</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="warning" size={24} color="#D32F2F" />
          <Text style={styles.statValue}>{metrics?.criticalEvents || 0}</Text>
          <Text style={styles.statLabel}>严重事件</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{metrics?.resolvedEvents || 0}</Text>
          <Text style={styles.statLabel}>已解决</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="shield" size={24} color="#FF9800" />
          <Text style={styles.statValue}>{metrics?.activeThreats || 0}</Text>
          <Text style={styles.statLabel}>活跃威胁</Text>
        </View>
      </View>

      {/* Security Trends Chart */}
      {metrics?.trendsData && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>安全事件趋势</Text>
          <LineChart
            data={metrics.trendsData}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
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
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Event Types Distribution */}
      {metrics?.eventsByType && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>事件类型分布</Text>
          <PieChart
            data={metrics.eventsByType}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      {/* Recent Critical Events */}
      <View style={styles.recentEventsCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>最近严重事件</Text>
          <TouchableOpacity onPress={() => setActiveTab('events')}>
            <Text style={styles.viewAllText}>查看全部</Text>
          </TouchableOpacity>
        </View>
        {securityEvents
          .filter(event => event.severity === 'critical' || event.severity === 'high')
          .slice(0, 3)
          .map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventItem}
              onPress={() => {
                setSelectedEvent(event);
                setShowEventDetailModal(true);
              }}
            >
              <View style={styles.eventHeader}>
                <Ionicons
                  name={getTypeIcon(event.type)}
                  size={20}
                  color={getSeverityColor(event.severity)}
                />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>{event.timestamp}</Text>
                </View>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(event.severity) }]}>
                  <Text style={styles.severityText}>{event.severity}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </ScrollView>
  );

  const renderEventsTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>严重程度:</Text>
            {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
              <TouchableOpacity
                key={severity}
                style={[
                  styles.filterButton,
                  eventFilter === severity && styles.activeFilter,
                ]}
                onPress={() => setEventFilter(severity as any)}
              >
                <Text
                  style={[
                    styles.filterText,
                    eventFilter === severity && styles.activeFilterText,
                  ]}
                >
                  {severity === 'all' ? '全部' : severity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Events List */}
      {filteredEvents.map((event) => (
        <TouchableOpacity
          key={event.id}
          style={styles.eventCard}
          onPress={() => {
            setSelectedEvent(event);
            setShowEventDetailModal(true);
          }}
        >
          <View style={styles.eventCardHeader}>
            <Ionicons
              name={getTypeIcon(event.type)}
              size={24}
              color={getSeverityColor(event.severity)}
            />
            <View style={styles.eventCardInfo}>
              <Text style={styles.eventCardTitle}>{event.title}</Text>
              <Text style={styles.eventCardDescription}>{event.description}</Text>
              <Text style={styles.eventCardTime}>{event.timestamp}</Text>
            </View>
            <View style={styles.eventCardBadges}>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(event.severity) }]}>
                <Text style={styles.severityText}>{event.severity}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                <Text style={styles.statusText}>{event.status}</Text>
              </View>
            </View>
          </View>
          <View style={styles.eventCardFooter}>
            <Text style={styles.eventSource}>来源: {event.source}</Text>
            <Text style={styles.eventIP}>IP: {event.ipAddress}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderRulesTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.rulesHeader}>
        <Text style={styles.sectionTitle}>安全规则</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#2196F3" />
          <Text style={styles.addButtonText}>添加规则</Text>
        </TouchableOpacity>
      </View>

      {securityRules.map((rule) => (
        <View key={rule.id} style={styles.ruleCard}>
          <View style={styles.ruleHeader}>
            <View style={styles.ruleInfo}>
              <Text style={styles.ruleName}>{rule.name}</Text>
              <Text style={styles.ruleDescription}>{rule.description}</Text>
              <Text style={styles.ruleType}>类型: {rule.type}</Text>
            </View>
            <View style={styles.ruleControls}>
              <Switch
                value={rule.enabled}
                onValueChange={(enabled) => {
                  setSecurityRules(prev => prev.map(r => 
                    r.id === rule.id ? { ...r, enabled } : r
                  ));
                }}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={rule.enabled ? '#f5dd4b' : '#f4f3f4'}
              />
            </View>
          </View>
          
          <View style={styles.ruleStats}>
            <View style={styles.ruleStat}>
              <Text style={styles.ruleStatLabel}>严重程度</Text>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(rule.severity) }]}>
                <Text style={styles.severityText}>{rule.severity}</Text>
              </View>
            </View>
            <View style={styles.ruleStat}>
              <Text style={styles.ruleStatLabel}>触发次数</Text>
              <Text style={styles.ruleStatValue}>{rule.triggerCount}</Text>
            </View>
            {rule.lastTriggered && (
              <View style={styles.ruleStat}>
                <Text style={styles.ruleStatLabel}>最后触发</Text>
                <Text style={styles.ruleStatValue}>{rule.lastTriggered}</Text>
              </View>
            )}
          </View>

          <View style={styles.ruleDetails}>
            <Text style={styles.ruleDetailTitle}>触发条件:</Text>
            {rule.conditions.map((condition, index) => (
              <Text key={index} style={styles.ruleCondition}>• {condition}</Text>
            ))}
            
            <Text style={styles.ruleDetailTitle}>执行动作:</Text>
            {rule.actions.map((action, index) => (
              <Text key={index} style={styles.ruleAction}>• {action}</Text>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderVulnerabilitiesTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.vulnerabilitiesHeader}>
        <Text style={styles.sectionTitle}>漏洞评估</Text>
        <TouchableOpacity style={styles.scanButton}>
          <Ionicons name="scan" size={20} color="#fff" />
          <Text style={styles.scanButtonText}>开始扫描</Text>
        </TouchableOpacity>
      </View>

      {vulnerabilities.map((vuln) => (
        <TouchableOpacity
          key={vuln.id}
          style={styles.vulnerabilityCard}
          onPress={() => {
            setSelectedVulnerability(vuln);
            setShowVulnerabilityModal(true);
          }}
        >
          <View style={styles.vulnerabilityHeader}>
            <View style={styles.vulnerabilityInfo}>
              <Text style={styles.vulnerabilityName}>{vuln.name}</Text>
              <Text style={styles.vulnerabilityDescription}>{vuln.description}</Text>
            </View>
            <View style={styles.vulnerabilityBadges}>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(vuln.severity) }]}>
                <Text style={styles.severityText}>{vuln.severity}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vuln.status) }]}>
                <Text style={styles.statusText}>{vuln.status}</Text>
              </View>
            </View>
          </View>

          <View style={styles.vulnerabilityDetails}>
            <View style={styles.vulnerabilityMeta}>
              <Text style={styles.vulnerabilityMetaItem}>
                类别: {vuln.category}
              </Text>
              {vuln.cvssScore && (
                <Text style={styles.vulnerabilityMetaItem}>
                  CVSS: {vuln.cvssScore}
                </Text>
              )}
              <Text style={styles.vulnerabilityMetaItem}>
                发现时间: {vuln.discoveredAt}
              </Text>
            </View>
            
            <Text style={styles.vulnerabilityRemediation}>
              修复建议: {vuln.remediation}
            </Text>
            
            {vuln.assignedTo && (
              <Text style={styles.vulnerabilityAssigned}>
                负责人: {vuln.assignedTo}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>安全监控</Text>
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'dashboard', label: '仪表板', icon: 'speedometer-outline' },
          { key: 'events', label: '安全事件', icon: 'alert-circle-outline' },
          { key: 'rules', label: '安全规则', icon: 'shield-outline' },
          { key: 'vulnerabilities', label: '漏洞评估', icon: 'bug-outline' },
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
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'rules' && renderRulesTab()}
        {activeTab === 'vulnerabilities' && renderVulnerabilitiesTab()}
      </ScrollView>

      {/* Event Detail Modal */}
      <Modal
        visible={showEventDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>安全事件详情</Text>
            <TouchableOpacity onPress={() => setShowEventDetailModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {selectedEvent && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.eventDetailCard}>
                <View style={styles.eventDetailHeader}>
                  <Ionicons
                    name={getTypeIcon(selectedEvent.type)}
                    size={32}
                    color={getSeverityColor(selectedEvent.severity)}
                  />
                  <View style={styles.eventDetailInfo}>
                    <Text style={styles.eventDetailTitle}>{selectedEvent.title}</Text>
                    <Text style={styles.eventDetailTime}>{selectedEvent.timestamp}</Text>
                  </View>
                </View>

                <Text style={styles.eventDetailDescription}>
                  {selectedEvent.description}
                </Text>

                <View style={styles.eventDetailMeta}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>严重程度:</Text>
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(selectedEvent.severity) }]}>
                      <Text style={styles.severityText}>{selectedEvent.severity}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>状态:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedEvent.status) }]}>
                      <Text style={styles.statusText}>{selectedEvent.status}</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>来源:</Text>
                    <Text style={styles.metaValue}>{selectedEvent.source}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>IP地址:</Text>
                    <Text style={styles.metaValue}>{selectedEvent.ipAddress}</Text>
                  </View>

                  {selectedEvent.location && (
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>位置:</Text>
                      <Text style={styles.metaValue}>{selectedEvent.location}</Text>
                    </View>
                  )}

                  {selectedEvent.affectedUsers && selectedEvent.affectedUsers.length > 0 && (
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>影响用户:</Text>
                      <Text style={styles.metaValue}>{selectedEvent.affectedUsers.join(', ')}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.actionsSection}>
                  <Text style={styles.actionsSectionTitle}>执行的动作:</Text>
                  {selectedEvent.actions.map((action, index) => (
                    <Text key={index} style={styles.actionItem}>• {action}</Text>
                  ))}
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
    backgroundColor: '#f5f5f5',
  },
  header: {
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
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scoreValue: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartCard: {
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
    marginBottom: 15,
  },
  chart: {
    borderRadius: 16,
  },
  recentEventsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  eventItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
  },
  severityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  severityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  filtersContainer: {
    marginBottom: 15,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilter: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  activeFilterText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  eventCard: {
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
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  eventCardInfo: {
    flex: 1,
  },
  eventCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventCardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  eventCardTime: {
    fontSize: 12,
    color: '#999',
  },
  eventCardBadges: {
    gap: 4,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  eventSource: {
    fontSize: 12,
    color: '#666',
  },
  eventIP: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  rulesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  ruleCard: {
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
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  ruleInfo: {
    flex: 1,
  },
  ruleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  ruleType: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
  ruleControls: {
    marginLeft: 15,
  },
  ruleStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ruleStat: {
    alignItems: 'center',
  },
  ruleStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  ruleStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  ruleDetails: {
    gap: 10,
  },
  ruleDetailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  ruleCondition: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  ruleAction: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  vulnerabilitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scanButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  vulnerabilityCard: {
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
  vulnerabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  vulnerabilityInfo: {
    flex: 1,
  },
  vulnerabilityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vulnerabilityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  vulnerabilityBadges: {
    gap: 4,
    marginLeft: 15,
  },
  vulnerabilityDetails: {
    gap: 8,
  },
  vulnerabilityMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  vulnerabilityMetaItem: {
    fontSize: 12,
    color: '#666',
  },
  vulnerabilityRemediation: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  vulnerabilityAssigned: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  eventDetailCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
  },
  eventDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
  },
  eventDetailInfo: {
    flex: 1,
  },
  eventDetailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventDetailTime: {
    fontSize: 14,
    color: '#666',
  },
  eventDetailDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  eventDetailMeta: {
    gap: 12,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 80,
  },
  metaValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  actionsSection: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  actionItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default SecurityMonitoring;