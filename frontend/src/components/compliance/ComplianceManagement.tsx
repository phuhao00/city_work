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
import { LineChart, BarChart } from 'react-native-chart-kit';

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'data_protection' | 'privacy' | 'security' | 'accessibility' | 'financial' | 'industry';
  standard: string; // GDPR, CCPA, SOX, HIPAA, etc.
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  lastChecked: string;
  nextCheck: string;
  requirements: string[];
  evidence: string[];
  remediation?: string;
  responsible: string;
  automated: boolean;
}

interface ComplianceAudit {
  id: string;
  name: string;
  description: string;
  type: 'internal' | 'external' | 'regulatory' | 'certification';
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  startDate: string;
  endDate?: string;
  auditor: string;
  scope: string[];
  findings: AuditFinding[];
  overallScore?: number;
  certification?: string;
}

interface AuditFinding {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted';
  recommendation: string;
  dueDate: string;
  assignedTo: string;
  evidence: string[];
}

interface ComplianceMetrics {
  overallScore: number;
  totalRules: number;
  compliantRules: number;
  nonCompliantRules: number;
  partialCompliantRules: number;
  activeAudits: number;
  completedAudits: number;
  openFindings: number;
  criticalFindings: number;
  trendsData: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }>;
  };
  complianceByCategory: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
}

interface ComplianceReport {
  id: string;
  name: string;
  type: 'compliance_status' | 'audit_report' | 'risk_assessment' | 'gap_analysis';
  generatedAt: string;
  period: string;
  format: 'pdf' | 'excel' | 'json';
  status: 'generating' | 'ready' | 'expired';
  downloadUrl?: string;
  size?: string;
}

const ComplianceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rules' | 'audits' | 'reports'>('dashboard');
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [audits, setAudits] = useState<ComplianceAudit[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<ComplianceAudit | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<AuditFinding | null>(null);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<'all' | ComplianceRule['category']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ComplianceRule['status']>('all');
  const [standardFilter, setStandardFilter] = useState<'all' | string>('all');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock compliance rules
    const mockRules: ComplianceRule[] = [
      {
        id: '1',
        name: 'GDPR 数据处理同意',
        description: '确保所有个人数据处理都有明确的用户同意',
        category: 'data_protection',
        standard: 'GDPR',
        severity: 'critical',
        status: 'compliant',
        lastChecked: '2024-01-15',
        nextCheck: '2024-02-15',
        requirements: [
          '获得明确的用户同意',
          '提供撤回同意的机制',
          '记录同意的证据',
          '定期审查同意状态',
        ],
        evidence: [
          '同意管理系统日志',
          '用户同意记录',
          '隐私政策文档',
        ],
        responsible: 'Privacy Team',
        automated: true,
      },
      {
        id: '2',
        name: '数据加密要求',
        description: '所有敏感数据必须在传输和存储时加密',
        category: 'security',
        standard: 'ISO 27001',
        severity: 'high',
        status: 'partial',
        lastChecked: '2024-01-14',
        nextCheck: '2024-01-21',
        requirements: [
          '传输中数据加密 (TLS 1.3)',
          '静态数据加密 (AES-256)',
          '密钥管理系统',
          '加密算法定期更新',
        ],
        evidence: [
          'SSL证书配置',
          '数据库加密设置',
          '密钥管理审计',
        ],
        remediation: '部分API端点仍使用HTTP，需要强制HTTPS',
        responsible: 'Security Team',
        automated: false,
      },
      {
        id: '3',
        name: '访问控制管理',
        description: '实施基于角色的访问控制和最小权限原则',
        category: 'security',
        standard: 'SOC 2',
        severity: 'high',
        status: 'non_compliant',
        lastChecked: '2024-01-13',
        nextCheck: '2024-01-20',
        requirements: [
          '基于角色的访问控制',
          '最小权限原则',
          '定期权限审查',
          '访问日志记录',
        ],
        evidence: [],
        remediation: '需要实施RBAC系统和权限审查流程',
        responsible: 'IT Team',
        automated: false,
      },
    ];

    // Mock audits
    const mockAudits: ComplianceAudit[] = [
      {
        id: '1',
        name: 'GDPR 合规性审计',
        description: '全面审查GDPR合规性状况',
        type: 'external',
        status: 'completed',
        startDate: '2024-01-01',
        endDate: '2024-01-10',
        auditor: 'External Compliance Firm',
        scope: ['数据处理', '用户权利', '数据保护措施'],
        overallScore: 85,
        certification: 'GDPR Compliant',
        findings: [
          {
            id: '1',
            title: '数据保留政策不完整',
            description: '部分数据类型缺少明确的保留期限',
            severity: 'medium',
            category: '数据管理',
            status: 'resolved',
            recommendation: '制定完整的数据保留政策',
            dueDate: '2024-01-20',
            assignedTo: 'Privacy Team',
            evidence: ['数据保留政策文档', '数据分类清单'],
          },
          {
            id: '2',
            title: '用户权利响应时间过长',
            description: '数据主体权利请求响应时间超过30天',
            severity: 'high',
            category: '用户权利',
            status: 'in_progress',
            recommendation: '优化权利请求处理流程',
            dueDate: '2024-01-25',
            assignedTo: 'Customer Service',
            evidence: ['权利请求处理记录'],
          },
        ],
      },
      {
        id: '2',
        name: 'SOC 2 Type II 审计',
        description: 'SOC 2 Type II 安全控制审计',
        type: 'certification',
        status: 'in_progress',
        startDate: '2024-01-10',
        auditor: 'Big Four Audit Firm',
        scope: ['安全控制', '可用性', '处理完整性'],
        findings: [],
      },
    ];

    // Mock reports
    const mockReports: ComplianceReport[] = [
      {
        id: '1',
        name: '2024年第一季度合规状态报告',
        type: 'compliance_status',
        generatedAt: '2024-01-15',
        period: '2024 Q1',
        format: 'pdf',
        status: 'ready',
        downloadUrl: '/reports/compliance-q1-2024.pdf',
        size: '2.5 MB',
      },
      {
        id: '2',
        name: 'GDPR 合规性差距分析',
        type: 'gap_analysis',
        generatedAt: '2024-01-12',
        period: '2024-01',
        format: 'excel',
        status: 'ready',
        downloadUrl: '/reports/gdpr-gap-analysis.xlsx',
        size: '1.8 MB',
      },
      {
        id: '3',
        name: '风险评估报告',
        type: 'risk_assessment',
        generatedAt: '2024-01-15',
        period: '2024-01',
        format: 'pdf',
        status: 'generating',
        size: '预计 3.2 MB',
      },
    ];

    // Mock metrics
    const mockMetrics: ComplianceMetrics = {
      overallScore: 78,
      totalRules: 45,
      compliantRules: 28,
      nonCompliantRules: 8,
      partialCompliantRules: 9,
      activeAudits: 2,
      completedAudits: 5,
      openFindings: 12,
      criticalFindings: 3,
      trendsData: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
          {
            data: [72, 75, 78, 76, 80, 78],
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      },
      complianceByCategory: {
        labels: ['数据保护', '隐私', '安全', '可访问性', '金融', '行业'],
        datasets: [
          {
            data: [85, 78, 72, 90, 88, 75],
          },
        ],
      },
    };

    setComplianceRules(mockRules);
    setAudits(mockAudits);
    setReports(mockReports);
    setMetrics(mockMetrics);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return '#4CAF50';
      case 'non_compliant': return '#F44336';
      case 'partial': return '#FF9800';
      case 'not_applicable': return '#9E9E9E';
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#2196F3';
      case 'scheduled': return '#FF9800';
      case 'failed': return '#F44336';
      case 'open': return '#F44336';
      case 'resolved': return '#4CAF50';
      case 'accepted': return '#9E9E9E';
      default: return '#666';
    }
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data_protection': return 'shield-checkmark-outline';
      case 'privacy': return 'eye-off-outline';
      case 'security': return 'lock-closed-outline';
      case 'accessibility': return 'accessibility-outline';
      case 'financial': return 'card-outline';
      case 'industry': return 'business-outline';
      default: return 'document-text-outline';
    }
  };

  const filteredRules = complianceRules.filter(rule => {
    if (categoryFilter !== 'all' && rule.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && rule.status !== statusFilter) return false;
    if (standardFilter !== 'all' && rule.standard !== standardFilter) return false;
    return true;
  });

  const onRefresh = () => {
    setRefreshing(true);
    loadMockData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const runComplianceCheck = (ruleId: string) => {
    Alert.alert(
      '运行合规检查',
      '确定要运行此合规规则的检查吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '运行',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              Alert.alert('成功', '合规检查已完成');
              // Update rule status
              setComplianceRules(prev => prev.map(rule => 
                rule.id === ruleId 
                  ? { ...rule, lastChecked: new Date().toISOString().split('T')[0] }
                  : rule
              ));
            }, 2000);
          },
        },
      ]
    );
  };

  const generateReport = (type: ComplianceReport['type']) => {
    const reportName = `${type}_${Date.now()}`;
    const newReport: ComplianceReport = {
      id: Date.now().toString(),
      name: `${type} 报告`,
      type,
      generatedAt: new Date().toISOString().split('T')[0],
      period: new Date().toISOString().split('T')[0],
      format: 'pdf',
      status: 'generating',
    };

    setReports(prev => [newReport, ...prev]);
    
    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === newReport.id 
          ? { ...report, status: 'ready', downloadUrl: `/reports/${reportName}.pdf`, size: '2.1 MB' }
          : report
      ));
      Alert.alert('成功', '报告生成完成');
    }, 3000);
  };

  const renderDashboardTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Compliance Score */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreTitle}>合规评分</Text>
          <View style={[
            styles.scoreValue, 
            { backgroundColor: metrics?.overallScore && metrics.overallScore >= 80 ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.scoreText}>{metrics?.overallScore || 0}</Text>
          </View>
        </View>
        <Text style={styles.scoreDescription}>
          基于所有合规规则和审计结果的综合评分
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={24} color="#2196F3" />
          <Text style={styles.statValue}>{metrics?.totalRules || 0}</Text>
          <Text style={styles.statLabel}>总规则</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{metrics?.compliantRules || 0}</Text>
          <Text style={styles.statLabel}>合规</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="close-circle" size={24} color="#F44336" />
          <Text style={styles.statValue}>{metrics?.nonCompliantRules || 0}</Text>
          <Text style={styles.statLabel}>不合规</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="warning" size={24} color="#FF9800" />
          <Text style={styles.statValue}>{metrics?.criticalFindings || 0}</Text>
          <Text style={styles.statLabel}>严重发现</Text>
        </View>
      </View>

      {/* Compliance Trends */}
      {metrics?.trendsData && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>合规趋势</Text>
          <LineChart
            data={metrics.trendsData}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#4CAF50',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Compliance by Category */}
      {metrics?.complianceByCategory && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>分类合规状况</Text>
          <BarChart
            data={metrics.complianceByCategory}
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
            }}
            style={styles.chart}
          />
        </View>
      )}

      {/* Recent Non-Compliant Rules */}
      <View style={styles.recentIssuesCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>需要关注的规则</Text>
          <TouchableOpacity onPress={() => setActiveTab('rules')}>
            <Text style={styles.viewAllText}>查看全部</Text>
          </TouchableOpacity>
        </View>
        {complianceRules
          .filter(rule => rule.status === 'non_compliant' || rule.status === 'partial')
          .slice(0, 3)
          .map((rule) => (
            <TouchableOpacity
              key={rule.id}
              style={styles.issueItem}
              onPress={() => {
                setSelectedRule(rule);
                setShowRuleModal(true);
              }}
            >
              <View style={styles.issueHeader}>
                <Ionicons
                  name={getCategoryIcon(rule.category)}
                  size={20}
                  color={getStatusColor(rule.status)}
                />
                <View style={styles.issueInfo}>
                  <Text style={styles.issueTitle}>{rule.name}</Text>
                  <Text style={styles.issueStandard}>{rule.standard}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(rule.status) }]}>
                  <Text style={styles.statusText}>{rule.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </ScrollView>
  );

  const renderRulesTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>分类:</Text>
            {['all', 'data_protection', 'privacy', 'security', 'accessibility'].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  categoryFilter === category && styles.activeFilter,
                ]}
                onPress={() => setCategoryFilter(category as any)}
              >
                <Text
                  style={[
                    styles.filterText,
                    categoryFilter === category && styles.activeFilterText,
                  ]}
                >
                  {category === 'all' ? '全部' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Rules List */}
      {filteredRules.map((rule) => (
        <TouchableOpacity
          key={rule.id}
          style={styles.ruleCard}
          onPress={() => {
            setSelectedRule(rule);
            setShowRuleModal(true);
          }}
        >
          <View style={styles.ruleHeader}>
            <Ionicons
              name={getCategoryIcon(rule.category)}
              size={24}
              color={getSeverityColor(rule.severity)}
            />
            <View style={styles.ruleInfo}>
              <Text style={styles.ruleName}>{rule.name}</Text>
              <Text style={styles.ruleDescription}>{rule.description}</Text>
              <Text style={styles.ruleStandard}>{rule.standard} • {rule.category}</Text>
            </View>
            <View style={styles.ruleBadges}>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(rule.severity) }]}>
                <Text style={styles.severityText}>{rule.severity}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(rule.status) }]}>
                <Text style={styles.statusText}>{rule.status}</Text>
              </View>
            </View>
          </View>

          <View style={styles.ruleFooter}>
            <Text style={styles.ruleLastChecked}>
              最后检查: {rule.lastChecked}
            </Text>
            <Text style={styles.ruleNextCheck}>
              下次检查: {rule.nextCheck}
            </Text>
            {rule.automated && (
              <View style={styles.automatedBadge}>
                <Ionicons name="cog" size={12} color="#2196F3" />
                <Text style={styles.automatedText}>自动</Text>
              </View>
            )}
          </View>

          <View style={styles.ruleActions}>
            <TouchableOpacity
              style={styles.checkButton}
              onPress={() => runComplianceCheck(rule.id)}
            >
              <Ionicons name="refresh" size={16} color="#2196F3" />
              <Text style={styles.checkButtonText}>检查</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderAuditsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.auditsHeader}>
        <Text style={styles.sectionTitle}>合规审计</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#2196F3" />
          <Text style={styles.addButtonText}>新建审计</Text>
        </TouchableOpacity>
      </View>

      {audits.map((audit) => (
        <TouchableOpacity
          key={audit.id}
          style={styles.auditCard}
          onPress={() => {
            setSelectedAudit(audit);
            setShowAuditModal(true);
          }}
        >
          <View style={styles.auditHeader}>
            <View style={styles.auditInfo}>
              <Text style={styles.auditName}>{audit.name}</Text>
              <Text style={styles.auditDescription}>{audit.description}</Text>
              <Text style={styles.auditMeta}>
                {audit.type} • {audit.auditor}
              </Text>
            </View>
            <View style={styles.auditBadges}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(audit.status) }]}>
                <Text style={styles.statusText}>{audit.status}</Text>
              </View>
              {audit.overallScore && (
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{audit.overallScore}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.auditDetails}>
            <Text style={styles.auditDates}>
              {audit.startDate} - {audit.endDate || '进行中'}
            </Text>
            <Text style={styles.auditScope}>
              范围: {audit.scope.join(', ')}
            </Text>
            {audit.findings.length > 0 && (
              <Text style={styles.auditFindings}>
                {audit.findings.length} 个发现
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderReportsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.reportsHeader}>
        <Text style={styles.sectionTitle}>合规报告</Text>
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={() => setShowReportModal(true)}
        >
          <Ionicons name="document-text" size={20} color="#fff" />
          <Text style={styles.generateButtonText}>生成报告</Text>
        </TouchableOpacity>
      </View>

      {reports.map((report) => (
        <View key={report.id} style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <View style={styles.reportInfo}>
              <Text style={styles.reportName}>{report.name}</Text>
              <Text style={styles.reportMeta}>
                {report.type} • {report.format.toUpperCase()} • {report.period}
              </Text>
              <Text style={styles.reportDate}>
                生成时间: {report.generatedAt}
              </Text>
            </View>
            <View style={styles.reportBadges}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                <Text style={styles.statusText}>{report.status}</Text>
              </View>
            </View>
          </View>

          <View style={styles.reportFooter}>
            {report.size && (
              <Text style={styles.reportSize}>大小: {report.size}</Text>
            )}
            {report.status === 'ready' && report.downloadUrl && (
              <TouchableOpacity style={styles.downloadButton}>
                <Ionicons name="download" size={16} color="#2196F3" />
                <Text style={styles.downloadButtonText}>下载</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>合规管理</Text>
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'dashboard', label: '仪表板', icon: 'speedometer-outline' },
          { key: 'rules', label: '合规规则', icon: 'document-text-outline' },
          { key: 'audits', label: '审计', icon: 'search-outline' },
          { key: 'reports', label: '报告', icon: 'bar-chart-outline' },
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
        {activeTab === 'rules' && renderRulesTab()}
        {activeTab === 'audits' && renderAuditsTab()}
        {activeTab === 'reports' && renderReportsTab()}
      </ScrollView>

      {/* Generate Report Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>生成合规报告</Text>
            <TouchableOpacity onPress={() => setShowReportModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>选择报告类型</Text>
            {[
              { type: 'compliance_status', label: '合规状态报告', description: '当前所有合规规则的状态概览' },
              { type: 'audit_report', label: '审计报告', description: '详细的审计结果和发现' },
              { type: 'risk_assessment', label: '风险评估报告', description: '合规风险分析和评估' },
              { type: 'gap_analysis', label: '差距分析报告', description: '合规差距识别和改进建议' },
            ].map((reportType) => (
              <TouchableOpacity
                key={reportType.type}
                style={styles.reportTypeCard}
                onPress={() => {
                  generateReport(reportType.type as ComplianceReport['type']);
                  setShowReportModal(false);
                }}
              >
                <Text style={styles.reportTypeLabel}>{reportType.label}</Text>
                <Text style={styles.reportTypeDescription}>{reportType.description}</Text>
              </TouchableOpacity>
            ))}
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
  recentIssuesCard: {
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
  issueItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  issueInfo: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  issueStandard: {
    fontSize: 12,
    color: '#666',
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
  },
  activeFilterText: {
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
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
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
  ruleStandard: {
    fontSize: 12,
    color: '#999',
  },
  ruleBadges: {
    gap: 4,
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
  ruleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 10,
  },
  ruleLastChecked: {
    fontSize: 12,
    color: '#666',
  },
  ruleNextCheck: {
    fontSize: 12,
    color: '#666',
  },
  automatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  automatedText: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '600',
  },
  ruleActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  checkButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  auditsHeader: {
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
  auditCard: {
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
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  auditInfo: {
    flex: 1,
  },
  auditName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  auditDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  auditMeta: {
    fontSize: 12,
    color: '#999',
  },
  auditBadges: {
    gap: 4,
    marginLeft: 15,
  },
  scoreBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  auditDetails: {
    gap: 4,
  },
  auditDates: {
    fontSize: 12,
    color: '#666',
  },
  auditScope: {
    fontSize: 12,
    color: '#666',
  },
  auditFindings: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  reportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  generateButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reportMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
  },
  reportBadges: {
    marginLeft: 15,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportSize: {
    fontSize: 12,
    color: '#666',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  downloadButtonText: {
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
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  reportTypeCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reportTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reportTypeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ComplianceManagement;