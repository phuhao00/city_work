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
  Dimensions,
  FlatList,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface Resource {
  id: string;
  name: string;
  type: 'cpu' | 'memory' | 'storage' | 'network' | 'database';
  current: number;
  limit: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: string;
  description: string;
}

interface ResourceQuota {
  id: string;
  name: string;
  resourceType: string;
  allocated: number;
  used: number;
  limit: number;
  unit: string;
  department: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'suspended';
}

interface ResourceAlert {
  id: string;
  resourceId: string;
  type: 'threshold' | 'quota' | 'availability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

const ResourceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'quotas' | 'alerts'>('overview');
  const [resources, setResources] = useState<Resource[]>([]);
  const [quotas, setQuotas] = useState<ResourceQuota[]>([]);
  const [alerts, setAlerts] = useState<ResourceAlert[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data generation
  useEffect(() => {
    generateMockData();
    if (autoRefresh) {
      const interval = setInterval(generateMockData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const generateMockData = () => {
    const mockResources: Resource[] = [
      {
        id: '1',
        name: 'Application Server CPU',
        type: 'cpu',
        current: 75,
        limit: 100,
        unit: '%',
        status: 'warning',
        lastUpdated: new Date().toISOString(),
        description: 'Main application server CPU usage',
      },
      {
        id: '2',
        name: 'Database Memory',
        type: 'memory',
        current: 12.5,
        limit: 16,
        unit: 'GB',
        status: 'normal',
        lastUpdated: new Date().toISOString(),
        description: 'Database server memory consumption',
      },
      {
        id: '3',
        name: 'File Storage',
        type: 'storage',
        current: 850,
        limit: 1000,
        unit: 'GB',
        status: 'warning',
        lastUpdated: new Date().toISOString(),
        description: 'Primary file storage usage',
      },
      {
        id: '4',
        name: 'Network Bandwidth',
        type: 'network',
        current: 450,
        limit: 1000,
        unit: 'Mbps',
        status: 'normal',
        lastUpdated: new Date().toISOString(),
        description: 'Network bandwidth utilization',
      },
      {
        id: '5',
        name: 'Database Connections',
        type: 'database',
        current: 180,
        limit: 200,
        unit: 'connections',
        status: 'critical',
        lastUpdated: new Date().toISOString(),
        description: 'Active database connections',
      },
    ];

    const mockQuotas: ResourceQuota[] = [
      {
        id: '1',
        name: 'Engineering Team Storage',
        resourceType: 'storage',
        allocated: 500,
        used: 320,
        limit: 500,
        unit: 'GB',
        department: 'Engineering',
        expiryDate: '2024-12-31',
        status: 'active',
      },
      {
        id: '2',
        name: 'Marketing Team Compute',
        resourceType: 'cpu',
        allocated: 40,
        used: 25,
        limit: 40,
        unit: 'cores',
        department: 'Marketing',
        expiryDate: '2024-06-30',
        status: 'active',
      },
      {
        id: '3',
        name: 'Analytics Memory',
        resourceType: 'memory',
        allocated: 64,
        used: 48,
        limit: 64,
        unit: 'GB',
        department: 'Analytics',
        expiryDate: '2024-03-31',
        status: 'expired',
      },
    ];

    const mockAlerts: ResourceAlert[] = [
      {
        id: '1',
        resourceId: '1',
        type: 'threshold',
        severity: 'high',
        message: 'CPU usage exceeded 75% threshold',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        acknowledged: false,
      },
      {
        id: '2',
        resourceId: '5',
        type: 'threshold',
        severity: 'critical',
        message: 'Database connections near limit (90%)',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        acknowledged: false,
      },
      {
        id: '3',
        resourceId: '3',
        type: 'quota',
        severity: 'medium',
        message: 'Storage quota 85% utilized',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        acknowledged: true,
      },
    ];

    setResources(mockResources);
    setQuotas(mockQuotas);
    setAlerts(mockAlerts);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'critical': return '#F44336';
      case 'active': return '#4CAF50';
      case 'expired': return '#F44336';
      case 'suspended': return '#9E9E9E';
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

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'cpu': return 'hardware-chip-outline';
      case 'memory': return 'albums-outline';
      case 'storage': return 'server-outline';
      case 'network': return 'wifi-outline';
      case 'database': return 'library-outline';
      default: return 'cube-outline';
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.round((current / limit) * 100);
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const renderOverview = () => {
    const totalResources = resources.length;
    const criticalResources = resources.filter(r => r.status === 'critical').length;
    const warningResources = resources.filter(r => r.status === 'warning').length;
    const activeQuotas = quotas.filter(q => q.status === 'active').length;

    const resourceUsageData = {
      labels: ['CPU', 'Memory', 'Storage', 'Network', 'Database'],
      datasets: [{
        data: resources.map(r => getUsagePercentage(r.current, r.limit)),
      }],
    };

    const quotaDistribution = quotas.map((quota, index) => ({
      name: quota.department,
      population: getUsagePercentage(quota.used, quota.allocated),
      color: ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336'][index % 5],
      legendFontColor: '#333',
    }));

    const alertTrend = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [5, 8, 3, 12, 7, 4, 6],
        strokeWidth: 2,
      }],
    };

    return (
      <ScrollView style={styles.content}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="cube-outline" size={24} color="#2196F3" />
            <Text style={styles.metricValue}>{totalResources}</Text>
            <Text style={styles.metricLabel}>Total Resources</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="warning-outline" size={24} color="#F44336" />
            <Text style={styles.metricValue}>{criticalResources}</Text>
            <Text style={styles.metricLabel}>Critical</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="alert-circle-outline" size={24} color="#FF9800" />
            <Text style={styles.metricValue}>{warningResources}</Text>
            <Text style={styles.metricLabel}>Warning</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
            <Text style={styles.metricValue}>{activeQuotas}</Text>
            <Text style={styles.metricLabel}>Active Quotas</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Resource Usage Overview</Text>
          <BarChart
            data={resourceUsageData}
            width={width - 40}
            height={200}
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

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Quota Distribution by Department</Text>
          <PieChart
            data={quotaDistribution}
            width={width - 40}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Alert Trend (Last 7 Days)</Text>
          <LineChart
            data={alertTrend}
            width={width - 40}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </ScrollView>
    );
  };

  const renderResources = () => (
    <View style={styles.content}>
      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search resources..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              const types = ['all', 'cpu', 'memory', 'storage', 'network', 'database'];
              const currentIndex = types.indexOf(filterType);
              const nextIndex = (currentIndex + 1) % types.length;
              setFilterType(types[nextIndex]);
            }}
          >
            <Ionicons name="filter-outline" size={20} color="#666" />
            <Text style={styles.filterText}>{filterType}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.autoRefreshContainer}>
          <Text style={styles.autoRefreshLabel}>Auto Refresh</Text>
          <Switch
            value={autoRefresh}
            onValueChange={setAutoRefresh}
            trackColor={{ false: '#e0e0e0', true: '#2196F3' }}
            thumbColor={autoRefresh ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <FlatList
        data={filteredResources}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => {
              setSelectedResource(item);
              setShowResourceModal(true);
            }}
          >
            <View style={styles.resourceHeader}>
              <View style={styles.resourceInfo}>
                <Ionicons
                  name={getResourceIcon(item.type) as any}
                  size={24}
                  color="#2196F3"
                />
                <View style={styles.resourceDetails}>
                  <Text style={styles.resourceName}>{item.name}</Text>
                  <Text style={styles.resourceType}>{item.type.toUpperCase()}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.resourceDescription}>{item.description}</Text>

            <View style={styles.usageContainer}>
              <View style={styles.usageInfo}>
                <Text style={styles.usageText}>
                  {item.current} / {item.limit} {item.unit}
                </Text>
                <Text style={styles.usagePercentage}>
                  {getUsagePercentage(item.current, item.limit)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getUsagePercentage(item.current, item.limit)}%`,
                      backgroundColor: getStatusColor(item.status),
                    },
                  ]}
                />
              </View>
            </View>

            <Text style={styles.lastUpdated}>
              Last updated: {new Date(item.lastUpdated).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderQuotas = () => (
    <View style={styles.content}>
      <FlatList
        data={quotas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.quotaCard}>
            <View style={styles.quotaHeader}>
              <View style={styles.quotaInfo}>
                <Text style={styles.quotaName}>{item.name}</Text>
                <Text style={styles.quotaDepartment}>{item.department}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.quotaMetrics}>
              <Text style={styles.quotaMetric}>
                Resource: {item.resourceType.toUpperCase()}
              </Text>
              <Text style={styles.quotaMetric}>
                Expires: {new Date(item.expiryDate).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.usageContainer}>
              <View style={styles.usageInfo}>
                <Text style={styles.usageText}>
                  {item.used} / {item.allocated} {item.unit}
                </Text>
                <Text style={styles.usagePercentage}>
                  {getUsagePercentage(item.used, item.allocated)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getUsagePercentage(item.used, item.allocated)}%`,
                      backgroundColor: getUsagePercentage(item.used, item.allocated) > 80 ? '#FF9800' : '#4CAF50',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowQuotaModal(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderAlerts = () => (
    <View style={styles.content}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.alertCard, item.acknowledged && styles.acknowledgedAlert]}>
            <View style={styles.alertHeader}>
              <View style={styles.alertInfo}>
                <Ionicons
                  name={item.acknowledged ? "checkmark-circle" : "warning"}
                  size={20}
                  color={getSeverityColor(item.severity)}
                />
                <View style={styles.alertDetails}>
                  <Text style={styles.alertMessage}>{item.message}</Text>
                  <Text style={styles.alertType}>{item.type.toUpperCase()}</Text>
                </View>
              </View>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
                <Text style={styles.severityText}>{item.severity}</Text>
              </View>
            </View>

            <Text style={styles.alertTimestamp}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>

            {!item.acknowledged && (
              <TouchableOpacity
                style={styles.acknowledgeButton}
                onPress={() => {
                  setAlerts(prev => prev.map(alert =>
                    alert.id === item.id ? { ...alert, acknowledged: true } : alert
                  ));
                }}
              >
                <Text style={styles.acknowledgeText}>Acknowledge</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resource Management</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={generateMockData}
        >
          <Ionicons name="refresh-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview', icon: 'analytics-outline' },
          { key: 'resources', label: 'Resources', icon: 'cube-outline' },
          { key: 'quotas', label: 'Quotas', icon: 'pie-chart-outline' },
          { key: 'alerts', label: 'Alerts', icon: 'notifications-outline' },
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
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'resources' && renderResources()}
      {activeTab === 'quotas' && renderQuotas()}
      {activeTab === 'alerts' && renderAlerts()}

      {/* Resource Modal */}
      <Modal
        visible={showResourceModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Resource Details</Text>
            <TouchableOpacity onPress={() => setShowResourceModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {selectedResource && (
              <View>
                <Text style={styles.modalSectionTitle}>Resource Information</Text>
                <Text style={styles.modalText}>Name: {selectedResource.name}</Text>
                <Text style={styles.modalText}>Type: {selectedResource.type}</Text>
                <Text style={styles.modalText}>Status: {selectedResource.status}</Text>
                <Text style={styles.modalText}>Description: {selectedResource.description}</Text>
                
                <Text style={styles.modalSectionTitle}>Usage Details</Text>
                <Text style={styles.modalText}>Current: {selectedResource.current} {selectedResource.unit}</Text>
                <Text style={styles.modalText}>Limit: {selectedResource.limit} {selectedResource.unit}</Text>
                <Text style={styles.modalText}>
                  Usage: {getUsagePercentage(selectedResource.current, selectedResource.limit)}%
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Quota Modal */}
      <Modal
        visible={showQuotaModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Quota</Text>
            <TouchableOpacity onPress={() => setShowQuotaModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>Quota configuration form would go here...</Text>
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
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  },
  chart: {
    borderRadius: 8,
  },
  controlsContainer: {
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  autoRefreshContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  autoRefreshLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  resourceCard: {
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
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  resourceDetails: {
    flex: 1,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resourceType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  usageContainer: {
    marginBottom: 8,
  },
  usageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  usagePercentage: {
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
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  quotaCard: {
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
  quotaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quotaInfo: {
    flex: 1,
  },
  quotaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  quotaDepartment: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  quotaMetrics: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 12,
  },
  quotaMetric: {
    fontSize: 12,
    color: '#666',
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
  acknowledgedAlert: {
    opacity: 0.7,
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
    gap: 12,
    flex: 1,
  },
  alertDetails: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  alertType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  alertTimestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  acknowledgeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  acknowledgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});

export default ResourceManagement;