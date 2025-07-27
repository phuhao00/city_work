import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  FlatList,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart, ProgressChart, ContributionGraph } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'progress' | 'contribution';
  category: string;
  data: any;
  config?: any;
  description: string;
  lastUpdated: string;
  isRealTime: boolean;
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  charts: string[];
  layout: 'grid' | 'list' | 'masonry';
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'realtime';
  url?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  description: string;
}

const DataVisualization: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'charts' | 'dashboards' | 'sources' | 'builder'>('charts');
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedChart, setSelectedChart] = useState<ChartData | null>(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data generation
  useEffect(() => {
    generateMockData();
    if (autoRefresh) {
      const interval = setInterval(updateRealTimeCharts, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const generateMockData = () => {
    const mockCharts: ChartData[] = [
      {
        id: '1',
        title: 'User Activity Trend',
        type: 'line',
        category: 'Analytics',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            data: [20, 45, 28, 80, 99, 43],
            strokeWidth: 2,
          }],
        },
        description: 'Monthly user activity trends',
        lastUpdated: new Date().toISOString(),
        isRealTime: true,
      },
      {
        id: '2',
        title: 'Revenue by Department',
        type: 'bar',
        category: 'Finance',
        data: {
          labels: ['Engineering', 'Sales', 'Marketing', 'Support'],
          datasets: [{
            data: [120000, 85000, 65000, 45000],
          }],
        },
        description: 'Quarterly revenue breakdown by department',
        lastUpdated: new Date().toISOString(),
        isRealTime: false,
      },
      {
        id: '3',
        title: 'Task Distribution',
        type: 'pie',
        category: 'Operations',
        data: [
          { name: 'Completed', population: 65, color: '#4CAF50', legendFontColor: '#333' },
          { name: 'In Progress', population: 25, color: '#2196F3', legendFontColor: '#333' },
          { name: 'Pending', population: 10, color: '#FF9800', legendFontColor: '#333' },
        ],
        description: 'Current task status distribution',
        lastUpdated: new Date().toISOString(),
        isRealTime: true,
      },
      {
        id: '4',
        title: 'System Performance',
        type: 'progress',
        category: 'Monitoring',
        data: {
          labels: ['CPU', 'Memory', 'Disk', 'Network'],
          data: [0.75, 0.6, 0.4, 0.8],
        },
        description: 'Real-time system resource utilization',
        lastUpdated: new Date().toISOString(),
        isRealTime: true,
      },
      {
        id: '5',
        title: 'Code Contributions',
        type: 'contribution',
        category: 'Development',
        data: {
          values: Array.from({ length: 365 }, () => Math.floor(Math.random() * 5)),
          endDate: new Date(),
          numDays: 365,
        },
        description: 'Daily code contribution activity',
        lastUpdated: new Date().toISOString(),
        isRealTime: false,
      },
    ];

    const mockDashboards: Dashboard[] = [
      {
        id: '1',
        name: 'Executive Dashboard',
        description: 'High-level metrics for executives',
        charts: ['1', '2', '3'],
        layout: 'grid',
        isPublic: true,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Operations Overview',
        description: 'Operational metrics and KPIs',
        charts: ['3', '4'],
        layout: 'list',
        isPublic: false,
        createdBy: 'ops_manager',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Development Metrics',
        description: 'Development team performance',
        charts: ['5'],
        layout: 'masonry',
        isPublic: true,
        createdBy: 'dev_lead',
        createdAt: new Date().toISOString(),
      },
    ];

    const mockDataSources: DataSource[] = [
      {
        id: '1',
        name: 'User Analytics API',
        type: 'api',
        url: 'https://api.analytics.com/v1/users',
        status: 'connected',
        lastSync: new Date().toISOString(),
        description: 'Real-time user behavior analytics',
      },
      {
        id: '2',
        name: 'Financial Database',
        type: 'database',
        status: 'connected',
        lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        description: 'PostgreSQL financial data warehouse',
      },
      {
        id: '3',
        name: 'System Metrics',
        type: 'realtime',
        status: 'connected',
        lastSync: new Date().toISOString(),
        description: 'Real-time system performance metrics',
      },
      {
        id: '4',
        name: 'CSV Import',
        type: 'file',
        status: 'disconnected',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        description: 'Monthly CSV data imports',
      },
    ];

    setCharts(mockCharts);
    setDashboards(mockDashboards);
    setDataSources(mockDataSources);
  };

  const updateRealTimeCharts = () => {
    setCharts(prev => prev.map(chart => {
      if (!chart.isRealTime) return chart;

      let updatedData = { ...chart.data };
      
      if (chart.type === 'line') {
        const newValue = Math.floor(Math.random() * 100);
        updatedData.datasets[0].data = [
          ...updatedData.datasets[0].data.slice(1),
          newValue
        ];
      } else if (chart.type === 'progress') {
        updatedData.data = updatedData.data.map(() => Math.random());
      } else if (chart.type === 'pie') {
        const total = 100;
        const completed = Math.floor(Math.random() * 80) + 10;
        const inProgress = Math.floor(Math.random() * (total - completed - 5)) + 5;
        const pending = total - completed - inProgress;
        
        updatedData = [
          { ...updatedData[0], population: completed },
          { ...updatedData[1], population: inProgress },
          { ...updatedData[2], population: pending },
        ];
      }

      return {
        ...chart,
        data: updatedData,
        lastUpdated: new Date().toISOString(),
      };
    }));
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    style: { borderRadius: 16 },
  };

  const renderChart = (chart: ChartData, size: 'small' | 'medium' | 'large' = 'medium') => {
    const chartWidth = size === 'small' ? width * 0.4 : size === 'large' ? width - 40 : width * 0.8;
    const chartHeight = size === 'small' ? 120 : size === 'large' ? 250 : 200;

    switch (chart.type) {
      case 'line':
        return (
          <LineChart
            data={chart.data}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        );
      case 'bar':
        return (
          <BarChart
            data={chart.data}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        );
      case 'pie':
        return (
          <PieChart
            data={chart.data}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        );
      case 'progress':
        return (
          <ProgressChart
            data={chart.data}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        );
      case 'contribution':
        return (
          <ContributionGraph
            values={chart.data.values}
            endDate={chart.data.endDate}
            numDays={chart.data.numDays}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        );
      default:
        return <Text>Unsupported chart type</Text>;
    }
  };

  const filteredCharts = charts.filter(chart => {
    const matchesSearch = chart.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chart.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || chart.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const renderCharts = () => (
    <View style={styles.content}>
      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search charts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              const categories = ['all', 'Analytics', 'Finance', 'Operations', 'Monitoring', 'Development'];
              const currentIndex = categories.indexOf(filterCategory);
              const nextIndex = (currentIndex + 1) % categories.length;
              setFilterCategory(categories[nextIndex]);
            }}
          >
            <Ionicons name="filter-outline" size={20} color="#666" />
            <Text style={styles.filterText}>{filterCategory}</Text>
          </TouchableOpacity>

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
      </View>

      <FlatList
        data={filteredCharts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chartCard}
            onPress={() => {
              setSelectedChart(item);
              setShowChartModal(true);
            }}
          >
            <View style={styles.chartHeader}>
              <View style={styles.chartInfo}>
                <Text style={styles.chartTitle}>{item.title}</Text>
                <Text style={styles.chartCategory}>{item.category}</Text>
              </View>
              <View style={styles.chartMeta}>
                {item.isRealTime && (
                  <View style={styles.realTimeBadge}>
                    <View style={styles.realTimeDot} />
                    <Text style={styles.realTimeText}>Live</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.chartAction}>
                  <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.chartDescription}>{item.description}</Text>

            <View style={styles.chartContainer}>
              {renderChart(item, 'medium')}
            </View>

            <Text style={styles.lastUpdated}>
              Last updated: {new Date(item.lastUpdated).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowBuilderModal(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderDashboards = () => (
    <View style={styles.content}>
      <FlatList
        data={dashboards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.dashboardCard}>
            <View style={styles.dashboardHeader}>
              <View style={styles.dashboardInfo}>
                <Text style={styles.dashboardName}>{item.name}</Text>
                <Text style={styles.dashboardDescription}>{item.description}</Text>
              </View>
              <View style={styles.dashboardMeta}>
                {item.isPublic && (
                  <Ionicons name="globe-outline" size={16} color="#4CAF50" />
                )}
                <TouchableOpacity style={styles.dashboardAction}>
                  <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.dashboardStats}>
              <Text style={styles.dashboardStat}>
                {item.charts.length} charts • {item.layout} layout
              </Text>
              <Text style={styles.dashboardStat}>
                Created by {item.createdBy} on {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.dashboardCharts}>
              {item.charts.slice(0, 3).map(chartId => {
                const chart = charts.find(c => c.id === chartId);
                return chart ? (
                  <View key={chartId} style={styles.miniChart}>
                    <Text style={styles.miniChartTitle}>{chart.title}</Text>
                    {renderChart(chart, 'small')}
                  </View>
                ) : null;
              })}
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderDataSources = () => (
    <View style={styles.content}>
      <FlatList
        data={dataSources}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.sourceCard}>
            <View style={styles.sourceHeader}>
              <View style={styles.sourceInfo}>
                <Ionicons
                  name={
                    item.type === 'api' ? 'cloud-outline' :
                    item.type === 'database' ? 'server-outline' :
                    item.type === 'file' ? 'document-outline' :
                    'flash-outline'
                  }
                  size={24}
                  color="#2196F3"
                />
                <View style={styles.sourceDetails}>
                  <Text style={styles.sourceName}>{item.name}</Text>
                  <Text style={styles.sourceType}>{item.type.toUpperCase()}</Text>
                </View>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: 
                  item.status === 'connected' ? '#4CAF50' :
                  item.status === 'disconnected' ? '#9E9E9E' : '#F44336'
                }
              ]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.sourceDescription}>{item.description}</Text>

            {item.url && (
              <Text style={styles.sourceUrl}>{item.url}</Text>
            )}

            <Text style={styles.lastSync}>
              Last sync: {new Date(item.lastSync).toLocaleString()}
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderBuilder = () => (
    <View style={styles.content}>
      <View style={styles.builderContainer}>
        <Text style={styles.builderTitle}>Chart Builder</Text>
        <Text style={styles.builderDescription}>
          Create custom charts and visualizations from your data sources.
        </Text>

        <View style={styles.builderOptions}>
          <TouchableOpacity style={styles.builderOption}>
            <Ionicons name="trending-up-outline" size={32} color="#2196F3" />
            <Text style={styles.builderOptionText}>Line Chart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.builderOption}>
            <Ionicons name="bar-chart-outline" size={32} color="#4CAF50" />
            <Text style={styles.builderOptionText}>Bar Chart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.builderOption}>
            <Ionicons name="pie-chart-outline" size={32} color="#FF9800" />
            <Text style={styles.builderOptionText}>Pie Chart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.builderOption}>
            <Ionicons name="radio-button-on-outline" size={32} color="#9C27B0" />
            <Text style={styles.builderOptionText}>Progress</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Data Visualization</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={generateMockData}
        >
          <Ionicons name="refresh-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'charts', label: 'Charts', icon: 'bar-chart-outline' },
          { key: 'dashboards', label: 'Dashboards', icon: 'grid-outline' },
          { key: 'sources', label: 'Data Sources', icon: 'server-outline' },
          { key: 'builder', label: 'Builder', icon: 'construct-outline' },
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

      {activeTab === 'charts' && renderCharts()}
      {activeTab === 'dashboards' && renderDashboards()}
      {activeTab === 'sources' && renderDataSources()}
      {activeTab === 'builder' && renderBuilder()}

      {/* Chart Detail Modal */}
      <Modal
        visible={showChartModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chart Details</Text>
            <TouchableOpacity onPress={() => setShowChartModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {selectedChart && (
              <View>
                <Text style={styles.modalSectionTitle}>{selectedChart.title}</Text>
                <Text style={styles.modalText}>{selectedChart.description}</Text>
                
                <View style={styles.modalChartContainer}>
                  {renderChart(selectedChart, 'large')}
                </View>
                
                <Text style={styles.modalSectionTitle}>Chart Information</Text>
                <Text style={styles.modalText}>Type: {selectedChart.type}</Text>
                <Text style={styles.modalText}>Category: {selectedChart.category}</Text>
                <Text style={styles.modalText}>Real-time: {selectedChart.isRealTime ? 'Yes' : 'No'}</Text>
                <Text style={styles.modalText}>
                  Last updated: {new Date(selectedChart.lastUpdated).toLocaleString()}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Chart Builder Modal */}
      <Modal
        visible={showBuilderModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chart Builder</Text>
            <TouchableOpacity onPress={() => setShowBuilderModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>Chart builder interface would be implemented here...</Text>
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
  controlsContainer: {
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  autoRefreshContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoRefreshLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartInfo: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chartCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chartMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  realTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  realTimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  realTimeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  chartAction: {
    padding: 4,
  },
  chartDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  dashboardCard: {
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
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dashboardInfo: {
    flex: 1,
  },
  dashboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dashboardDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dashboardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dashboardAction: {
    padding: 4,
  },
  dashboardStats: {
    marginBottom: 15,
  },
  dashboardStat: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  dashboardCharts: {
    flexDirection: 'row',
    gap: 10,
  },
  miniChart: {
    flex: 1,
    alignItems: 'center',
  },
  miniChartTitle: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  sourceCard: {
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
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sourceDetails: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sourceType: {
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
  sourceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  sourceUrl: {
    fontSize: 12,
    color: '#2196F3',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  lastSync: {
    fontSize: 12,
    color: '#999',
  },
  builderContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  builderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  builderDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  builderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  builderOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  builderOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
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
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalChartContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
});

export default DataVisualization;