import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  lastRun: string;
  nextRun: string;
  size: string;
  duration: string;
  retention: number;
}

interface RestorePoint {
  id: string;
  name: string;
  type: 'automatic' | 'manual';
  timestamp: string;
  size: string;
  status: 'available' | 'corrupted' | 'expired';
  location: string;
  description: string;
}

interface RecoveryPlan {
  id: string;
  name: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  rto: string; // Recovery Time Objective
  rpo: string; // Recovery Point Objective
  status: 'active' | 'inactive' | 'testing';
  lastTested: string;
  steps: number;
}

interface DisasterScenario {
  id: string;
  name: string;
  type: 'hardware' | 'software' | 'natural' | 'cyber' | 'human';
  probability: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  response: string;
}

const BackupRecovery: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'backups' | 'restore' | 'recovery' | 'disaster'>('dashboard');
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showDisasterModal, setShowDisasterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const backupJobs: BackupJob[] = [
    {
      id: '1',
      name: 'Database Full Backup',
      type: 'full',
      status: 'completed',
      lastRun: '2024-01-15 02:00',
      nextRun: '2024-01-16 02:00',
      size: '2.5 GB',
      duration: '45 min',
      retention: 30,
    },
    {
      id: '2',
      name: 'Application Files Incremental',
      type: 'incremental',
      status: 'running',
      lastRun: '2024-01-15 12:00',
      nextRun: '2024-01-15 18:00',
      size: '150 MB',
      duration: '5 min',
      retention: 7,
    },
    {
      id: '3',
      name: 'System Configuration',
      type: 'differential',
      status: 'failed',
      lastRun: '2024-01-15 06:00',
      nextRun: '2024-01-16 06:00',
      size: '50 MB',
      duration: '2 min',
      retention: 14,
    },
  ];

  const restorePoints: RestorePoint[] = [
    {
      id: '1',
      name: 'Pre-Update Snapshot',
      type: 'manual',
      timestamp: '2024-01-15 14:30',
      size: '3.2 GB',
      status: 'available',
      location: '/backup/manual/20240115_1430',
      description: 'Created before system update',
    },
    {
      id: '2',
      name: 'Daily Automatic Backup',
      type: 'automatic',
      timestamp: '2024-01-15 02:00',
      size: '2.8 GB',
      status: 'available',
      location: '/backup/auto/20240115_0200',
      description: 'Scheduled daily backup',
    },
    {
      id: '3',
      name: 'Emergency Backup',
      type: 'manual',
      timestamp: '2024-01-14 16:45',
      size: '2.9 GB',
      status: 'corrupted',
      location: '/backup/manual/20240114_1645',
      description: 'Emergency backup before incident',
    },
  ];

  const recoveryPlans: RecoveryPlan[] = [
    {
      id: '1',
      name: 'Database Recovery Plan',
      priority: 'critical',
      rto: '2 hours',
      rpo: '15 minutes',
      status: 'active',
      lastTested: '2024-01-10',
      steps: 8,
    },
    {
      id: '2',
      name: 'Application Server Recovery',
      priority: 'high',
      rto: '4 hours',
      rpo: '1 hour',
      status: 'active',
      lastTested: '2024-01-08',
      steps: 12,
    },
    {
      id: '3',
      name: 'File Server Recovery',
      priority: 'medium',
      rto: '8 hours',
      rpo: '4 hours',
      status: 'testing',
      lastTested: '2024-01-05',
      steps: 6,
    },
  ];

  const disasterScenarios: DisasterScenario[] = [
    {
      id: '1',
      name: 'Hardware Failure',
      type: 'hardware',
      probability: 'medium',
      impact: 'high',
      mitigation: 'Redundant systems and regular maintenance',
      response: 'Activate backup systems and restore from latest backup',
    },
    {
      id: '2',
      name: 'Ransomware Attack',
      type: 'cyber',
      probability: 'high',
      impact: 'critical',
      mitigation: 'Security training and endpoint protection',
      response: 'Isolate systems and restore from clean backups',
    },
    {
      id: '3',
      name: 'Natural Disaster',
      type: 'natural',
      probability: 'low',
      impact: 'critical',
      mitigation: 'Off-site backups and disaster recovery site',
      response: 'Activate DR site and restore operations',
    },
  ];

  const backupMetrics = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [2.1, 2.3, 2.0, 2.5, 2.2, 1.8, 2.4],
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const recoveryTimeData = {
    labels: ['Database', 'App Server', 'File Server', 'Network'],
    datasets: [
      {
        data: [120, 240, 480, 60],
      },
    ],
  };

  const backupStatusData = [
    {
      name: 'Successful',
      population: 85,
      color: '#22c55e',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Failed',
      population: 10,
      color: '#ef4444',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Running',
      population: 5,
      color: '#f59e0b',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'available':
      case 'active':
        return '#22c55e';
      case 'running':
      case 'testing':
        return '#f59e0b';
      case 'failed':
      case 'corrupted':
      case 'inactive':
        return '#ef4444';
      case 'scheduled':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#d97706';
      case 'low':
        return '#65a30d';
      default:
        return '#6b7280';
    }
  };

  const renderDashboard = () => (
    <ScrollView style={styles.content}>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="archive-outline" size={24} color="#3b82f6" />
          <Text style={styles.metricValue}>24</Text>
          <Text style={styles.metricLabel}>Active Backups</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#22c55e" />
          <Text style={styles.metricValue}>98.5%</Text>
          <Text style={styles.metricLabel}>Success Rate</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="time-outline" size={24} color="#f59e0b" />
          <Text style={styles.metricValue}>2.3 GB</Text>
          <Text style={styles.metricLabel}>Avg Size</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#8b5cf6" />
          <Text style={styles.metricValue}>15</Text>
          <Text style={styles.metricLabel}>Restore Points</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Backup Size Trends (GB)</Text>
        <LineChart
          data={backupMetrics}
          width={width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Recovery Time Objectives (minutes)</Text>
        <BarChart
          data={recoveryTimeData}
          width={width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Backup Status Distribution</Text>
        <PieChart
          data={backupStatusData}
          width={width - 40}
          height={220}
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

  const renderBackupJobs = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search backup jobs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowBackupModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={backupJobs.filter(job =>
          job.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.itemDetails}>
              <Text style={styles.itemDetail}>Type: {item.type}</Text>
              <Text style={styles.itemDetail}>Size: {item.size}</Text>
              <Text style={styles.itemDetail}>Duration: {item.duration}</Text>
              <Text style={styles.itemDetail}>Last Run: {item.lastRun}</Text>
              <Text style={styles.itemDetail}>Next Run: {item.nextRun}</Text>
              <Text style={styles.itemDetail}>Retention: {item.retention} days</Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="play" size={16} color="#3b82f6" />
                <Text style={styles.actionText}>Run Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="settings" size={16} color="#6b7280" />
                <Text style={styles.actionText}>Configure</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );

  const renderRestorePoints = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search restore points..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowRestoreModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={restorePoints.filter(point =>
          point.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.itemDetails}>
              <Text style={styles.itemDetail}>Type: {item.type}</Text>
              <Text style={styles.itemDetail}>Timestamp: {item.timestamp}</Text>
              <Text style={styles.itemDetail}>Size: {item.size}</Text>
              <Text style={styles.itemDetail}>Location: {item.location}</Text>
              <Text style={styles.itemDetail}>Description: {item.description}</Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="refresh" size={16} color="#22c55e" />
                <Text style={styles.actionText}>Restore</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="download" size={16} color="#3b82f6" />
                <Text style={styles.actionText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );

  const renderRecoveryPlans = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search recovery plans..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowRecoveryModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={recoveryPlans.filter(plan =>
          plan.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                <Text style={styles.statusText}>{item.priority}</Text>
              </View>
            </View>
            <View style={styles.itemDetails}>
              <Text style={styles.itemDetail}>RTO: {item.rto}</Text>
              <Text style={styles.itemDetail}>RPO: {item.rpo}</Text>
              <Text style={styles.itemDetail}>Status: {item.status}</Text>
              <Text style={styles.itemDetail}>Last Tested: {item.lastTested}</Text>
              <Text style={styles.itemDetail}>Steps: {item.steps}</Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="play" size={16} color="#22c55e" />
                <Text style={styles.actionText}>Execute</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="flask" size={16} color="#f59e0b" />
                <Text style={styles.actionText}>Test</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );

  const renderDisasterScenarios = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search disaster scenarios..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowDisasterModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={disasterScenarios.filter(scenario =>
          scenario.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <View style={styles.typeContainer}>
                <View style={[styles.typeBadge, { backgroundColor: getPriorityColor(item.probability) }]}>
                  <Text style={styles.statusText}>{item.probability}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: getPriorityColor(item.impact) }]}>
                  <Text style={styles.statusText}>{item.impact}</Text>
                </View>
              </View>
            </View>
            <View style={styles.itemDetails}>
              <Text style={styles.itemDetail}>Type: {item.type}</Text>
              <Text style={styles.itemDetail}>Mitigation: {item.mitigation}</Text>
              <Text style={styles.itemDetail}>Response: {item.response}</Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="shield" size={16} color="#3b82f6" />
                <Text style={styles.actionText}>Mitigate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="alert" size={16} color="#ef4444" />
                <Text style={styles.actionText}>Activate</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Ionicons name="analytics" size={20} color={activeTab === 'dashboard' ? '#3b82f6' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'backups' && styles.activeTab]}
          onPress={() => setActiveTab('backups')}
        >
          <Ionicons name="archive" size={20} color={activeTab === 'backups' ? '#3b82f6' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'backups' && styles.activeTabText]}>Backups</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'restore' && styles.activeTab]}
          onPress={() => setActiveTab('restore')}
        >
          <Ionicons name="refresh" size={20} color={activeTab === 'restore' ? '#3b82f6' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'restore' && styles.activeTabText]}>Restore</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recovery' && styles.activeTab]}
          onPress={() => setActiveTab('recovery')}
        >
          <Ionicons name="medical" size={20} color={activeTab === 'recovery' ? '#3b82f6' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'recovery' && styles.activeTabText]}>Recovery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'disaster' && styles.activeTab]}
          onPress={() => setActiveTab('disaster')}
        >
          <Ionicons name="warning" size={20} color={activeTab === 'disaster' ? '#3b82f6' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'disaster' && styles.activeTabText]}>Disaster</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'backups' && renderBackupJobs()}
      {activeTab === 'restore' && renderRestorePoints()}
      {activeTab === 'recovery' && renderRecoveryPlans()}
      {activeTab === 'disaster' && renderDisasterScenarios()}

      {/* Backup Modal */}
      <Modal visible={showBackupModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Backup Job</Text>
            <TextInput style={styles.input} placeholder="Job Name" />
            <TextInput style={styles.input} placeholder="Description" />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowBackupModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  setShowBackupModal(false);
                  Alert.alert('Success', 'Backup job created successfully');
                }}
              >
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Restore Modal */}
      <Modal visible={showRestoreModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Restore Point</Text>
            <TextInput style={styles.input} placeholder="Restore Point Name" />
            <TextInput style={styles.input} placeholder="Description" />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRestoreModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  setShowRestoreModal(false);
                  Alert.alert('Success', 'Restore point created successfully');
                }}
              >
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Recovery Plan Modal */}
      <Modal visible={showRecoveryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Recovery Plan</Text>
            <TextInput style={styles.input} placeholder="Plan Name" />
            <TextInput style={styles.input} placeholder="RTO (hours)" />
            <TextInput style={styles.input} placeholder="RPO (minutes)" />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRecoveryModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  setShowRecoveryModal(false);
                  Alert.alert('Success', 'Recovery plan created successfully');
                }}
              >
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Disaster Scenario Modal */}
      <Modal visible={showDisasterModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Disaster Scenario</Text>
            <TextInput style={styles.input} placeholder="Scenario Name" />
            <TextInput style={styles.input} placeholder="Mitigation Strategy" />
            <TextInput style={styles.input} placeholder="Response Plan" />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDisasterModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  setShowDisasterModal(false);
                  Alert.alert('Success', 'Disaster scenario created successfully');
                }}
              >
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
    color: '#1f2937',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 8,
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  itemDetails: {
    marginBottom: 12,
  },
  itemDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default BackupRecovery;