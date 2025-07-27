import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'data_access' | 'permission_change' | 'system_breach' | 'malware_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  source: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  affectedSystems: string[];
  assignedTo?: string;
}

interface SecurityPolicy {
  id: string;
  name: string;
  category: 'access_control' | 'data_protection' | 'network_security' | 'compliance';
  description: string;
  status: 'active' | 'inactive' | 'draft';
  lastUpdated: string;
  compliance: string[];
  rules: SecurityRule[];
}

interface SecurityRule {
  id: string;
  condition: string;
  action: string;
  enabled: boolean;
}

interface VulnerabilityAssessment {
  id: string;
  target: string;
  type: 'network' | 'application' | 'system' | 'database';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  discoveredDate: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  cvssScore: number;
  remediation: string;
  assignedTo?: string;
}

interface SecurityMetrics {
  totalEvents: number;
  resolvedEvents: number;
  activeThreats: number;
  vulnerabilities: number;
  complianceScore: number;
  securityScore: number;
}

const SecurityManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'policies' | 'vulnerabilities'>('dashboard');
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityAssessment[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    resolvedEvents: 0,
    activeThreats: 0,
    vulnerabilities: 0,
    complianceScore: 0,
    securityScore: 0,
  });
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Mock data
  useEffect(() => {
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'login_attempt',
        severity: 'high',
        title: '可疑登录尝试',
        description: '检测到来自异常IP地址的多次登录失败尝试',
        timestamp: '2024-01-30 14:30:00',
        source: '192.168.1.100',
        status: 'investigating',
        affectedSystems: ['用户认证系统'],
        assignedTo: '安全团队',
      },
      {
        id: '2',
        type: 'data_access',
        severity: 'medium',
        title: '异常数据访问',
        description: '用户在非工作时间访问敏感数据',
        timestamp: '2024-01-30 02:15:00',
        source: '内部用户',
        status: 'resolved',
        affectedSystems: ['数据库系统'],
        assignedTo: '数据保护团队',
      },
      {
        id: '3',
        type: 'malware_detected',
        severity: 'critical',
        title: '恶意软件检测',
        description: '在工作站上检测到潜在的恶意软件',
        timestamp: '2024-01-30 10:45:00',
        source: 'WS-001',
        status: 'active',
        affectedSystems: ['工作站', '网络'],
        assignedTo: '事件响应团队',
      },
      {
        id: '4',
        type: 'permission_change',
        severity: 'low',
        title: '权限变更',
        description: '管理员权限被修改',
        timestamp: '2024-01-30 16:20:00',
        source: '管理控制台',
        status: 'resolved',
        affectedSystems: ['权限管理系统'],
        assignedTo: '系统管理员',
      },
    ];

    const mockPolicies: SecurityPolicy[] = [
      {
        id: '1',
        name: '密码安全策略',
        category: 'access_control',
        description: '定义密码复杂度和更新要求',
        status: 'active',
        lastUpdated: '2024-01-15',
        compliance: ['ISO 27001', 'GDPR'],
        rules: [
          { id: '1', condition: '密码长度 >= 8', action: '强制执行', enabled: true },
          { id: '2', condition: '包含特殊字符', action: '强制执行', enabled: true },
          { id: '3', condition: '90天更新', action: '提醒用户', enabled: true },
        ],
      },
      {
        id: '2',
        name: '数据加密策略',
        category: 'data_protection',
        description: '规定数据传输和存储的加密要求',
        status: 'active',
        lastUpdated: '2024-01-20',
        compliance: ['ISO 27001', 'SOX'],
        rules: [
          { id: '1', condition: '传输数据', action: 'TLS 1.3加密', enabled: true },
          { id: '2', condition: '存储数据', action: 'AES-256加密', enabled: true },
        ],
      },
      {
        id: '3',
        name: '网络访问控制',
        category: 'network_security',
        description: '控制网络资源的访问权限',
        status: 'active',
        lastUpdated: '2024-01-25',
        compliance: ['ISO 27001'],
        rules: [
          { id: '1', condition: '外部访问', action: 'VPN验证', enabled: true },
          { id: '2', condition: '内部网络', action: '分段隔离', enabled: true },
        ],
      },
    ];

    const mockVulnerabilities: VulnerabilityAssessment[] = [
      {
        id: '1',
        target: 'Web应用服务器',
        type: 'application',
        severity: 'high',
        title: 'SQL注入漏洞',
        description: '用户输入验证不足，可能导致SQL注入攻击',
        discoveredDate: '2024-01-28',
        status: 'in_progress',
        cvssScore: 7.5,
        remediation: '更新输入验证逻辑，使用参数化查询',
        assignedTo: '开发团队',
      },
      {
        id: '2',
        target: '操作系统',
        type: 'system',
        severity: 'critical',
        title: '权限提升漏洞',
        description: '本地用户可能获得管理员权限',
        discoveredDate: '2024-01-25',
        status: 'open',
        cvssScore: 9.1,
        remediation: '安装最新安全补丁',
        assignedTo: '系统管理员',
      },
      {
        id: '3',
        target: '数据库服务器',
        type: 'database',
        severity: 'medium',
        title: '弱密码配置',
        description: '数据库账户使用弱密码',
        discoveredDate: '2024-01-20',
        status: 'resolved',
        cvssScore: 5.3,
        remediation: '更新密码策略，强制使用强密码',
        assignedTo: '数据库管理员',
      },
    ];

    setSecurityEvents(mockEvents);
    setSecurityPolicies(mockPolicies);
    setVulnerabilities(mockVulnerabilities);
    
    // Calculate metrics
    const totalEvents = mockEvents.length;
    const resolvedEvents = mockEvents.filter(e => e.status === 'resolved').length;
    const activeThreats = mockEvents.filter(e => e.status === 'active').length;
    const totalVulnerabilities = mockVulnerabilities.filter(v => v.status !== 'resolved').length;
    
    setMetrics({
      totalEvents,
      resolvedEvents,
      activeThreats,
      vulnerabilities: totalVulnerabilities,
      complianceScore: 85,
      securityScore: 78,
    });
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#007AFF';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'open': return '#FF3B30';
      case 'investigating': case 'in_progress': return '#FF9500';
      case 'resolved': return '#34C759';
      case 'false_positive': case 'accepted_risk': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'login_attempt': return 'log-in-outline';
      case 'data_access': return 'document-outline';
      case 'permission_change': return 'key-outline';
      case 'system_breach': return 'warning-outline';
      case 'malware_detected': return 'bug-outline';
      default: return 'alert-circle-outline';
    }
  };

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const renderDashboard = () => {
    const threatTrendData = {
      labels: ['周一', '周二', '周三', '周四', '周五'],
      datasets: [{
        data: [12, 8, 15, 6, 10],
        color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
        strokeWidth: 2
      }]
    };

    const severityDistribution = {
      labels: ['严重', '高', '中', '低'],
      datasets: [{
        data: [2, 5, 8, 12]
      }]
    };

    const complianceData = {
      labels: ['ISO 27001', 'GDPR', 'SOX', 'PCI DSS'],
      datasets: [{
        data: [95, 88, 92, 85]
      }]
    };

    return (
      <ScrollView style={styles.dashboardContainer} showsVerticalScrollIndicator={false}>
        {/* Metrics Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="shield-checkmark" size={24} color="#34C759" />
            <Text style={styles.metricNumber}>{metrics.securityScore}</Text>
            <Text style={styles.metricLabel}>安全评分</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="warning" size={24} color="#FF3B30" />
            <Text style={styles.metricNumber}>{metrics.activeThreats}</Text>
            <Text style={styles.metricLabel}>活跃威胁</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="bug" size={24} color="#FF9500" />
            <Text style={styles.metricNumber}>{metrics.vulnerabilities}</Text>
            <Text style={styles.metricLabel}>漏洞数量</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
            <Text style={styles.metricNumber}>{metrics.complianceScore}%</Text>
            <Text style={styles.metricLabel}>合规评分</Text>
          </View>
        </View>

        {/* Threat Trend Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>威胁趋势</Text>
          <LineChart
            data={threatTrendData}
            width={width - 60}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
            }}
            style={styles.chart}
          />
        </View>

        {/* Severity Distribution */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>威胁严重程度分布</Text>
          <BarChart
            data={severityDistribution}
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
            }}
            style={styles.chart}
          />
        </View>

        {/* Compliance Status */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>合规状态</Text>
          <BarChart
            data={complianceData}
            width={width - 60}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
            }}
            style={styles.chart}
          />
        </View>

        {/* Recent Events */}
        <View style={styles.recentEventsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最近安全事件</Text>
            <TouchableOpacity onPress={() => setActiveTab('events')}>
              <Text style={styles.viewAllText}>查看全部</Text>
            </TouchableOpacity>
          </View>
          {securityEvents.slice(0, 3).map(event => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventSummaryCard}
              onPress={() => {
                setSelectedEvent(event);
                setShowEventModal(true);
              }}
            >
              <View style={styles.eventSummaryHeader}>
                <Ionicons name={getTypeIcon(event.type)} size={20} color={getSeverityColor(event.severity)} />
                <Text style={styles.eventSummaryTitle}>{event.title}</Text>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(event.severity) }]}>
                  <Text style={styles.badgeText}>
                    {event.severity === 'critical' ? '严重' : 
                     event.severity === 'high' ? '高' : 
                     event.severity === 'medium' ? '中' : '低'}
                  </Text>
                </View>
              </View>
              <Text style={styles.eventSummaryTime}>{event.timestamp}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderEvent = ({ item }: { item: SecurityEvent }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => {
        setSelectedEvent(item);
        setShowEventModal(true);
      }}
    >
      <View style={styles.eventHeader}>
        <View style={styles.eventTypeContainer}>
          <Ionicons name={getTypeIcon(item.type)} size={20} color={getSeverityColor(item.severity)} />
          <Text style={styles.eventTitle}>{item.title}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.badgeText}>
            {item.severity === 'critical' ? '严重' : 
             item.severity === 'high' ? '高' : 
             item.severity === 'medium' ? '中' : '低'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.eventDescription}>{item.description}</Text>
      
      <View style={styles.eventDetails}>
        <View style={styles.eventDetailRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.eventDetailText}>{item.timestamp}</Text>
        </View>
        <View style={styles.eventDetailRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.eventDetailText}>{item.source}</Text>
        </View>
        <View style={styles.eventDetailRow}>
          <Ionicons name="person-outline" size={14} color="#666" />
          <Text style={styles.eventDetailText}>{item.assignedTo || '未分配'}</Text>
        </View>
      </View>
      
      <View style={styles.eventFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>
            {item.status === 'active' ? '活跃' : 
             item.status === 'investigating' ? '调查中' : 
             item.status === 'resolved' ? '已解决' : '误报'}
          </Text>
        </View>
        <Text style={styles.affectedSystems}>
          影响系统: {item.affectedSystems.join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderPolicy = ({ item }: { item: SecurityPolicy }) => (
    <TouchableOpacity
      style={styles.policyCard}
      onPress={() => {
        setSelectedPolicy(item);
        setShowPolicyModal(true);
      }}
    >
      <View style={styles.policyHeader}>
        <Text style={styles.policyName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#34C759' : '#8E8E93' }]}>
          <Text style={styles.badgeText}>
            {item.status === 'active' ? '启用' : item.status === 'inactive' ? '禁用' : '草稿'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.policyDescription}>{item.description}</Text>
      
      <View style={styles.policyDetails}>
        <View style={styles.policyDetailRow}>
          <Ionicons name="folder-outline" size={14} color="#666" />
          <Text style={styles.policyDetailText}>
            {item.category === 'access_control' ? '访问控制' : 
             item.category === 'data_protection' ? '数据保护' : 
             item.category === 'network_security' ? '网络安全' : '合规性'}
          </Text>
        </View>
        <View style={styles.policyDetailRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.policyDetailText}>更新: {item.lastUpdated}</Text>
        </View>
      </View>
      
      <View style={styles.complianceContainer}>
        <Text style={styles.complianceLabel}>合规标准:</Text>
        <View style={styles.complianceTags}>
          {item.compliance.map((standard, index) => (
            <View key={index} style={styles.complianceTag}>
              <Text style={styles.complianceText}>{standard}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <Text style={styles.rulesCount}>{item.rules.length} 条规则</Text>
    </TouchableOpacity>
  );

  const renderVulnerability = ({ item }: { item: VulnerabilityAssessment }) => (
    <View style={styles.vulnerabilityCard}>
      <View style={styles.vulnerabilityHeader}>
        <Text style={styles.vulnerabilityTitle}>{item.title}</Text>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.badgeText}>
            {item.severity === 'critical' ? '严重' : 
             item.severity === 'high' ? '高' : 
             item.severity === 'medium' ? '中' : '低'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.vulnerabilityDescription}>{item.description}</Text>
      
      <View style={styles.vulnerabilityDetails}>
        <View style={styles.vulnerabilityDetailRow}>
          <Ionicons name="server-outline" size={14} color="#666" />
          <Text style={styles.vulnerabilityDetailText}>{item.target}</Text>
        </View>
        <View style={styles.vulnerabilityDetailRow}>
          <Ionicons name="speedometer-outline" size={14} color="#666" />
          <Text style={styles.vulnerabilityDetailText}>CVSS: {item.cvssScore}</Text>
        </View>
        <View style={styles.vulnerabilityDetailRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.vulnerabilityDetailText}>发现: {item.discoveredDate}</Text>
        </View>
      </View>
      
      <View style={styles.remediationContainer}>
        <Text style={styles.remediationTitle}>修复建议:</Text>
        <Text style={styles.remediationText}>{item.remediation}</Text>
      </View>
      
      <View style={styles.vulnerabilityFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>
            {item.status === 'open' ? '待处理' : 
             item.status === 'in_progress' ? '处理中' : 
             item.status === 'resolved' ? '已解决' : '接受风险'}
          </Text>
        </View>
        <Text style={styles.assignedText}>负责人: {item.assignedTo || '未分配'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>安全管理</Text>
        <TouchableOpacity style={styles.alertButton}>
          <Ionicons name="notifications" size={24} color="#fff" />
          {metrics.activeThreats > 0 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>{metrics.activeThreats}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            仪表板
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
            安全事件
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'policies' && styles.activeTab]}
          onPress={() => setActiveTab('policies')}
        >
          <Text style={[styles.tabText, activeTab === 'policies' && styles.activeTabText]}>
            安全策略
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vulnerabilities' && styles.activeTab]}
          onPress={() => setActiveTab('vulnerabilities')}
        >
          <Text style={[styles.tabText, activeTab === 'vulnerabilities' && styles.activeTabText]}>
            漏洞评估
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'dashboard' && renderDashboard()}

      {activeTab === 'events' && (
        <View style={styles.contentContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索安全事件..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterButton, filterSeverity === 'all' && styles.activeFilter]}
                onPress={() => setFilterSeverity('all')}
              >
                <Text style={[styles.filterText, filterSeverity === 'all' && styles.activeFilterText]}>
                  全部
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filterSeverity === 'critical' && styles.activeFilter]}
                onPress={() => setFilterSeverity('critical')}
              >
                <Text style={[styles.filterText, filterSeverity === 'critical' && styles.activeFilterText]}>
                  严重
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filterSeverity === 'high' && styles.activeFilter]}
                onPress={() => setFilterSeverity('high')}
              >
                <Text style={[styles.filterText, filterSeverity === 'high' && styles.activeFilterText]}>
                  高
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <FlatList
            data={filteredEvents}
            renderItem={renderEvent}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}

      {activeTab === 'policies' && (
        <FlatList
          data={securityPolicies}
          renderItem={renderPolicy}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'vulnerabilities' && (
        <FlatList
          data={vulnerabilities}
          renderItem={renderVulnerability}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Event Detail Modal */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEventModal(false)}>
              <Text style={styles.closeButton}>关闭</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>事件详情</Text>
            <TouchableOpacity>
              <Text style={styles.actionButton}>处理</Text>
            </TouchableOpacity>
          </View>
          
          {selectedEvent && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.eventDetailContainer}>
                <Text style={styles.eventDetailTitle}>{selectedEvent.title}</Text>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(selectedEvent.severity) }]}>
                  <Text style={styles.badgeText}>
                    {selectedEvent.severity === 'critical' ? '严重' : 
                     selectedEvent.severity === 'high' ? '高' : 
                     selectedEvent.severity === 'medium' ? '中' : '低'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.eventDetailDescription}>{selectedEvent.description}</Text>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>基本信息</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>事件类型:</Text>
                  <Text style={styles.detailValue}>
                    {selectedEvent.type === 'login_attempt' ? '登录尝试' : 
                     selectedEvent.type === 'data_access' ? '数据访问' : 
                     selectedEvent.type === 'permission_change' ? '权限变更' : 
                     selectedEvent.type === 'system_breach' ? '系统入侵' : '恶意软件'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>发生时间:</Text>
                  <Text style={styles.detailValue}>{selectedEvent.timestamp}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>事件源:</Text>
                  <Text style={styles.detailValue}>{selectedEvent.source}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>负责人:</Text>
                  <Text style={styles.detailValue}>{selectedEvent.assignedTo || '未分配'}</Text>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>影响系统</Text>
                {selectedEvent.affectedSystems.map((system, index) => (
                  <Text key={index} style={styles.systemItem}>• {system}</Text>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Policy Detail Modal */}
      <Modal
        visible={showPolicyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPolicyModal(false)}>
              <Text style={styles.closeButton}>关闭</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>策略详情</Text>
            <TouchableOpacity>
              <Text style={styles.actionButton}>编辑</Text>
            </TouchableOpacity>
          </View>
          
          {selectedPolicy && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.policyDetailContainer}>
                <Text style={styles.policyDetailTitle}>{selectedPolicy.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: selectedPolicy.status === 'active' ? '#34C759' : '#8E8E93' }]}>
                  <Text style={styles.badgeText}>
                    {selectedPolicy.status === 'active' ? '启用' : selectedPolicy.status === 'inactive' ? '禁用' : '草稿'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.policyDetailDescription}>{selectedPolicy.description}</Text>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>策略规则</Text>
                {selectedPolicy.rules.map((rule, index) => (
                  <View key={rule.id} style={styles.ruleItem}>
                    <View style={styles.ruleHeader}>
                      <Text style={styles.ruleCondition}>{rule.condition}</Text>
                      <View style={[styles.ruleStatus, { backgroundColor: rule.enabled ? '#34C759' : '#8E8E93' }]}>
                        <Text style={styles.ruleStatusText}>{rule.enabled ? '启用' : '禁用'}</Text>
                      </View>
                    </View>
                    <Text style={styles.ruleAction}>动作: {rule.action}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>合规标准</Text>
                <View style={styles.complianceTags}>
                  {selectedPolicy.compliance.map((standard, index) => (
                    <View key={index} style={styles.complianceTag}>
                      <Text style={styles.complianceText}>{standard}</Text>
                    </View>
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
  alertButton: {
    backgroundColor: '#FF3B30',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  alertBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  alertBadgeText: {
    color: '#FF3B30',
    fontSize: 10,
    fontWeight: 'bold',
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
  dashboardContainer: {
    flex: 1,
    padding: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
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
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  recentEventsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
  },
  eventSummaryCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 10,
  },
  eventSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  eventSummaryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  eventSummaryTime: {
    fontSize: 12,
    color: '#666',
  },
  contentContainer: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  eventCard: {
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
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  eventDetails: {
    marginBottom: 15,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  eventDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  affectedSystems: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
  },
  policyCard: {
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
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  policyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  policyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  policyDetails: {
    marginBottom: 15,
  },
  policyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  policyDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  complianceContainer: {
    marginBottom: 10,
  },
  complianceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  complianceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  complianceTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  complianceText: {
    fontSize: 10,
    color: '#1976d2',
  },
  rulesCount: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'right',
  },
  vulnerabilityCard: {
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
  vulnerabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  vulnerabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  vulnerabilityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  vulnerabilityDetails: {
    marginBottom: 15,
  },
  vulnerabilityDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  vulnerabilityDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  remediationContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  remediationTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  remediationText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  vulnerabilityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignedText: {
    fontSize: 12,
    color: '#666',
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
  actionButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  eventDetailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  eventDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 15,
  },
  eventDetailDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 25,
  },
  detailSection: {
    marginBottom: 25,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  systemItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  policyDetailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  policyDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 15,
  },
  policyDetailDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 25,
  },
  ruleItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  ruleCondition: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  ruleStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ruleStatusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
  },
  ruleAction: {
    fontSize: 12,
    color: '#666',
  },
});

export default SecurityManagement;