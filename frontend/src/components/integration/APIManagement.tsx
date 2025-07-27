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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: 'active' | 'inactive' | 'deprecated';
  version: string;
  description: string;
  responseTime: number;
  successRate: number;
  lastTested: string;
  tags: string[];
}

interface APIRequest {
  id: string;
  endpointId: string;
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent: string;
  ip: string;
}

interface APITest {
  id: string;
  endpointId: string;
  name: string;
  status: 'passed' | 'failed' | 'pending';
  lastRun: string;
  duration: number;
  assertions: number;
  passedAssertions: number;
}

const APIManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'endpoints' | 'requests' | 'testing'>('dashboard');
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [requests, setRequests] = useState<APIRequest[]>([]);
  const [tests, setTests] = useState<APITest[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data generation
  useEffect(() => {
    generateMockData();
  }, []);

  const generateMockData = () => {
    const mockEndpoints: APIEndpoint[] = [
      {
        id: '1',
        name: 'User Authentication',
        url: '/api/v1/auth/login',
        method: 'POST',
        status: 'active',
        version: 'v1.2.0',
        description: 'User login endpoint',
        responseTime: 120,
        successRate: 99.5,
        lastTested: '2024-01-15T10:30:00Z',
        tags: ['auth', 'security'],
      },
      {
        id: '2',
        name: 'Get User Profile',
        url: '/api/v1/users/profile',
        method: 'GET',
        status: 'active',
        version: 'v1.1.0',
        description: 'Retrieve user profile information',
        responseTime: 85,
        successRate: 98.2,
        lastTested: '2024-01-15T09:45:00Z',
        tags: ['users', 'profile'],
      },
      {
        id: '3',
        name: 'Create Work Order',
        url: '/api/v1/workorders',
        method: 'POST',
        status: 'active',
        version: 'v2.0.0',
        description: 'Create new work order',
        responseTime: 200,
        successRate: 97.8,
        lastTested: '2024-01-15T11:15:00Z',
        tags: ['workorders', 'create'],
      },
      {
        id: '4',
        name: 'Legacy Reports',
        url: '/api/v0/reports',
        method: 'GET',
        status: 'deprecated',
        version: 'v0.9.0',
        description: 'Legacy reporting endpoint',
        responseTime: 450,
        successRate: 85.3,
        lastTested: '2024-01-10T14:20:00Z',
        tags: ['reports', 'legacy'],
      },
    ];

    const mockRequests: APIRequest[] = Array.from({ length: 50 }, (_, i) => ({
      id: `req-${i + 1}`,
      endpointId: mockEndpoints[Math.floor(Math.random() * mockEndpoints.length)].id,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
      url: `/api/v1/endpoint-${i + 1}`,
      statusCode: [200, 201, 400, 401, 404, 500][Math.floor(Math.random() * 6)],
      responseTime: Math.floor(Math.random() * 1000) + 50,
      userAgent: 'Mozilla/5.0 (compatible; API Client)',
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
    }));

    const mockTests: APITest[] = [
      {
        id: 'test-1',
        endpointId: '1',
        name: 'Authentication Flow Test',
        status: 'passed',
        lastRun: '2024-01-15T10:30:00Z',
        duration: 2.5,
        assertions: 8,
        passedAssertions: 8,
      },
      {
        id: 'test-2',
        endpointId: '2',
        name: 'Profile Data Validation',
        status: 'passed',
        lastRun: '2024-01-15T09:45:00Z',
        duration: 1.8,
        assertions: 5,
        passedAssertions: 5,
      },
      {
        id: 'test-3',
        endpointId: '3',
        name: 'Work Order Creation',
        status: 'failed',
        lastRun: '2024-01-15T11:15:00Z',
        duration: 3.2,
        assertions: 10,
        passedAssertions: 8,
      },
    ];

    setEndpoints(mockEndpoints);
    setRequests(mockRequests);
    setTests(mockTests);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#FF9800';
      case 'deprecated': return '#F44336';
      case 'passed': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return '#2196F3';
      case 'POST': return '#4CAF50';
      case 'PUT': return '#FF9800';
      case 'DELETE': return '#F44336';
      case 'PATCH': return '#9C27B0';
      default: return '#9E9E9E';
    }
  };

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         endpoint.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || endpoint.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const renderDashboard = () => {
    const totalEndpoints = endpoints.length;
    const activeEndpoints = endpoints.filter(e => e.status === 'active').length;
    const avgResponseTime = endpoints.reduce((sum, e) => sum + e.responseTime, 0) / endpoints.length;
    const avgSuccessRate = endpoints.reduce((sum, e) => sum + e.successRate, 0) / endpoints.length;

    const responseTimeData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [120, 135, 110, 145, 130, 125, 140],
        strokeWidth: 2,
      }],
    };

    const requestVolumeData = {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      datasets: [{
        data: [45, 23, 78, 156, 134, 89],
      }],
    };

    const statusDistribution = [
      { name: '2xx', population: 85, color: '#4CAF50', legendFontColor: '#333' },
      { name: '4xx', population: 10, color: '#FF9800', legendFontColor: '#333' },
      { name: '5xx', population: 5, color: '#F44336', legendFontColor: '#333' },
    ];

    return (
      <ScrollView style={styles.content}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="globe-outline" size={24} color="#2196F3" />
            <Text style={styles.metricValue}>{totalEndpoints}</Text>
            <Text style={styles.metricLabel}>Total Endpoints</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
            <Text style={styles.metricValue}>{activeEndpoints}</Text>
            <Text style={styles.metricLabel}>Active</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="time-outline" size={24} color="#FF9800" />
            <Text style={styles.metricValue}>{Math.round(avgResponseTime)}ms</Text>
            <Text style={styles.metricLabel}>Avg Response</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="trending-up-outline" size={24} color="#9C27B0" />
            <Text style={styles.metricValue}>{avgSuccessRate.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Success Rate</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Response Time Trend</Text>
          <LineChart
            data={responseTimeData}
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
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Request Volume</Text>
          <BarChart
            data={requestVolumeData}
            width={width - 40}
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

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Status Code Distribution</Text>
          <PieChart
            data={statusDistribution}
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
      </ScrollView>
    );
  };

  const renderEndpoints = () => (
    <View style={styles.content}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search endpoints..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            const statuses = ['all', 'active', 'inactive', 'deprecated'];
            const currentIndex = statuses.indexOf(filterStatus);
            const nextIndex = (currentIndex + 1) % statuses.length;
            setFilterStatus(statuses[nextIndex]);
          }}
        >
          <Ionicons name="filter-outline" size={20} color="#666" />
          <Text style={styles.filterText}>{filterStatus}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredEndpoints}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.endpointCard}
            onPress={() => {
              setSelectedEndpoint(item);
              setShowEndpointModal(true);
            }}
          >
            <View style={styles.endpointHeader}>
              <View style={styles.endpointInfo}>
                <View style={styles.methodBadge}>
                  <Text style={[styles.methodText, { color: getMethodColor(item.method) }]}>
                    {item.method}
                  </Text>
                </View>
                <Text style={styles.endpointName}>{item.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#666" />
            </View>
            <Text style={styles.endpointUrl}>{item.url}</Text>
            <Text style={styles.endpointDescription}>{item.description}</Text>
            <View style={styles.endpointMetrics}>
              <Text style={styles.metricText}>
                Response: {item.responseTime}ms
              </Text>
              <Text style={styles.metricText}>
                Success: {item.successRate}%
              </Text>
              <Text style={styles.metricText}>
                Version: {item.version}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setSelectedEndpoint(null);
          setShowEndpointModal(true);
        }}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderRequests = () => (
    <View style={styles.content}>
      <FlatList
        data={requests.slice(0, 20)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={styles.methodBadge}>
                <Text style={[styles.methodText, { color: getMethodColor(item.method) }]}>
                  {item.method}
                </Text>
              </View>
              <Text style={styles.requestUrl}>{item.url}</Text>
              <View style={[
                styles.statusCodeBadge,
                { backgroundColor: item.statusCode < 400 ? '#4CAF50' : '#F44336' }
              ]}>
                <Text style={styles.statusCodeText}>{item.statusCode}</Text>
              </View>
            </View>
            <View style={styles.requestDetails}>
              <Text style={styles.requestDetail}>
                <Ionicons name="time-outline" size={14} color="#666" />
                {' '}{item.responseTime}ms
              </Text>
              <Text style={styles.requestDetail}>
                <Ionicons name="location-outline" size={14} color="#666" />
                {' '}{item.ip}
              </Text>
              <Text style={styles.requestDetail}>
                <Ionicons name="calendar-outline" size={14} color="#666" />
                {' '}{new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderTesting = () => (
    <View style={styles.content}>
      <FlatList
        data={tests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.testCard}
            onPress={() => {
              setShowTestModal(true);
            }}
          >
            <View style={styles.testHeader}>
              <Text style={styles.testName}>{item.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.testMetrics}>
              <Text style={styles.testMetric}>
                Duration: {item.duration}s
              </Text>
              <Text style={styles.testMetric}>
                Assertions: {item.passedAssertions}/{item.assertions}
              </Text>
              <Text style={styles.testMetric}>
                Last Run: {new Date(item.lastRun).toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowTestModal(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API Management</Text>
        <TouchableOpacity style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'dashboard', label: 'Dashboard', icon: 'analytics-outline' },
          { key: 'endpoints', label: 'Endpoints', icon: 'globe-outline' },
          { key: 'requests', label: 'Requests', icon: 'list-outline' },
          { key: 'testing', label: 'Testing', icon: 'flask-outline' },
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

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'endpoints' && renderEndpoints()}
      {activeTab === 'requests' && renderRequests()}
      {activeTab === 'testing' && renderTesting()}

      {/* Endpoint Modal */}
      <Modal
        visible={showEndpointModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedEndpoint ? 'Edit Endpoint' : 'New Endpoint'}
            </Text>
            <TouchableOpacity onPress={() => setShowEndpointModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>Endpoint configuration form would go here...</Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Test Modal */}
      <Modal
        visible={showTestModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>API Test Configuration</Text>
            <TouchableOpacity onPress={() => setShowTestModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>Test configuration form would go here...</Text>
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
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
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
  endpointCard: {
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
  endpointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  endpointInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  endpointName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
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
  endpointUrl: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  endpointDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  endpointMetrics: {
    flexDirection: 'row',
    gap: 15,
  },
  metricText: {
    fontSize: 12,
    color: '#666',
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  requestUrl: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  statusCodeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusCodeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  requestDetails: {
    flexDirection: 'row',
    gap: 15,
  },
  requestDetail: {
    fontSize: 12,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  testCard: {
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
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  testMetrics: {
    flexDirection: 'row',
    gap: 15,
  },
  testMetric: {
    fontSize: 12,
    color: '#666',
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
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default APIManagement;