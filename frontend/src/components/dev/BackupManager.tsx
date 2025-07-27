import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BackupItem {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  size: string;
  createdAt: string;
  status: 'completed' | 'failed' | 'in_progress';
  description?: string;
  location: string;
}

interface BackupSchedule {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
}

interface RestoreOperation {
  id: string;
  backupId: string;
  backupName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  estimatedCompletion?: string;
}

const BackupManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'backups' | 'schedules' | 'restore'>('backups');
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [restoreOperations, setRestoreOperations] = useState<RestoreOperation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [showCreateBackupModal, setShowCreateBackupModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showBackupDetailModal, setShowBackupDetailModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupItem | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<BackupSchedule | null>(null);

  // Form states
  const [backupName, setBackupName] = useState('');
  const [backupType, setBackupType] = useState<'full' | 'incremental' | 'differential'>('full');
  const [backupDescription, setBackupDescription] = useState('');
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [scheduleTime, setScheduleTime] = useState('02:00');
  const [scheduleEnabled, setScheduleEnabled] = useState(true);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock backup data
    const mockBackups: BackupItem[] = [
      {
        id: '1',
        name: 'Full System Backup',
        type: 'full',
        size: '2.5 GB',
        createdAt: '2024-01-15 02:00:00',
        status: 'completed',
        description: 'Complete system backup including all user data',
        location: '/backups/full/2024-01-15/',
      },
      {
        id: '2',
        name: 'Database Backup',
        type: 'incremental',
        size: '150 MB',
        createdAt: '2024-01-14 14:30:00',
        status: 'completed',
        description: 'Incremental database backup',
        location: '/backups/incremental/2024-01-14/',
      },
      {
        id: '3',
        name: 'User Data Backup',
        type: 'differential',
        size: '800 MB',
        createdAt: '2024-01-14 08:00:00',
        status: 'failed',
        description: 'Differential backup of user data',
        location: '/backups/differential/2024-01-14/',
      },
    ];

    const mockSchedules: BackupSchedule[] = [
      {
        id: '1',
        name: 'Daily Database Backup',
        type: 'incremental',
        frequency: 'daily',
        time: '02:00',
        enabled: true,
        lastRun: '2024-01-15 02:00:00',
        nextRun: '2024-01-16 02:00:00',
      },
      {
        id: '2',
        name: 'Weekly Full Backup',
        type: 'full',
        frequency: 'weekly',
        time: '01:00',
        enabled: true,
        lastRun: '2024-01-14 01:00:00',
        nextRun: '2024-01-21 01:00:00',
      },
    ];

    const mockRestoreOperations: RestoreOperation[] = [
      {
        id: '1',
        backupId: '1',
        backupName: 'Full System Backup',
        status: 'completed',
        progress: 100,
        startedAt: '2024-01-15 10:00:00',
      },
      {
        id: '2',
        backupId: '2',
        backupName: 'Database Backup',
        status: 'in_progress',
        progress: 65,
        startedAt: '2024-01-15 11:30:00',
        estimatedCompletion: '2024-01-15 12:15:00',
      },
    ];

    setBackups(mockBackups);
    setSchedules(mockSchedules);
    setRestoreOperations(mockRestoreOperations);
  };

  const handleCreateBackup = () => {
    if (!backupName.trim()) {
      Alert.alert('错误', '请输入备份名称');
      return;
    }

    const newBackup: BackupItem = {
      id: Date.now().toString(),
      name: backupName,
      type: backupType,
      size: '计算中...',
      createdAt: new Date().toLocaleString(),
      status: 'in_progress',
      description: backupDescription,
      location: `/backups/${backupType}/${new Date().toISOString().split('T')[0]}/`,
    };

    setBackups(prev => [newBackup, ...prev]);
    setShowCreateBackupModal(false);
    setBackupName('');
    setBackupDescription('');
    
    // Simulate backup completion
    setTimeout(() => {
      setBackups(prev => prev.map(backup => 
        backup.id === newBackup.id 
          ? { ...backup, status: 'completed' as const, size: '1.2 GB' }
          : backup
      ));
    }, 3000);

    Alert.alert('成功', '备份任务已开始');
  };

  const handleCreateSchedule = () => {
    if (!scheduleName.trim()) {
      Alert.alert('错误', '请输入计划名称');
      return;
    }

    const newSchedule: BackupSchedule = {
      id: Date.now().toString(),
      name: scheduleName,
      type: backupType,
      frequency: scheduleFrequency,
      time: scheduleTime,
      enabled: scheduleEnabled,
      nextRun: calculateNextRun(scheduleFrequency, scheduleTime),
    };

    setSchedules(prev => [newSchedule, ...prev]);
    setShowScheduleModal(false);
    setScheduleName('');
    
    Alert.alert('成功', '备份计划已创建');
  };

  const calculateNextRun = (frequency: string, time: string): string => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (frequency === 'daily') {
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    } else if (frequency === 'weekly') {
      nextRun.setDate(nextRun.getDate() + (7 - nextRun.getDay()));
    } else if (frequency === 'monthly') {
      nextRun.setMonth(nextRun.getMonth() + 1, 1);
    }
    
    return nextRun.toLocaleString();
  };

  const handleRestoreBackup = (backup: BackupItem) => {
    const newRestore: RestoreOperation = {
      id: Date.now().toString(),
      backupId: backup.id,
      backupName: backup.name,
      status: 'in_progress',
      progress: 0,
      startedAt: new Date().toLocaleString(),
      estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000).toLocaleString(),
    };

    setRestoreOperations(prev => [newRestore, ...prev]);
    setShowRestoreModal(false);
    
    // Simulate restore progress
    const interval = setInterval(() => {
      setRestoreOperations(prev => prev.map(restore => {
        if (restore.id === newRestore.id) {
          const newProgress = Math.min(restore.progress + 10, 100);
          return {
            ...restore,
            progress: newProgress,
            status: newProgress === 100 ? 'completed' as const : restore.status,
          };
        }
        return restore;
      }));
    }, 1000);

    setTimeout(() => clearInterval(interval), 10000);
    
    Alert.alert('成功', '恢复操作已开始');
  };

  const handleDeleteBackup = (backupId: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个备份吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            setBackups(prev => prev.filter(backup => backup.id !== backupId));
            Alert.alert('成功', '备份已删除');
          },
        },
      ]
    );
  };

  const toggleSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, enabled: !schedule.enabled }
        : schedule
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'in_progress': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return 'archive-outline';
      case 'incremental': return 'add-circle-outline';
      case 'differential': return 'git-branch-outline';
      default: return 'document-outline';
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMockData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderBackupItem = ({ item }: { item: BackupItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => {
        setSelectedBackup(item);
        setShowBackupDetailModal(true);
      }}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Ionicons name={getTypeIcon(item.type)} size={24} color="#2196F3" />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemMeta}>{item.size} • {item.createdAt}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.restoreButton]}
          onPress={() => {
            setSelectedBackup(item);
            setShowRestoreModal(true);
          }}
          disabled={item.status !== 'completed'}
        >
          <Ionicons name="refresh-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>恢复</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteBackup(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>删除</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderScheduleItem = ({ item }: { item: BackupSchedule }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Ionicons name="time-outline" size={24} color="#4CAF50" />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemMeta}>
              {item.frequency} at {item.time} • Next: {item.nextRun}
            </Text>
          </View>
        </View>
        <Switch
          value={item.enabled}
          onValueChange={() => toggleSchedule(item.id)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={item.enabled ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>
    </View>
  );

  const renderRestoreItem = ({ item }: { item: RestoreOperation }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Ionicons name="refresh-outline" size={24} color="#FF9800" />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.backupName}</Text>
            <Text style={styles.itemMeta}>Started: {item.startedAt}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      {item.status === 'in_progress' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>备份管理器</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateBackupModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'backups', label: '备份列表', icon: 'archive-outline' },
          { key: 'schedules', label: '计划任务', icon: 'time-outline' },
          { key: 'restore', label: '恢复操作', icon: 'refresh-outline' },
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

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'backups' && (
          <FlatList
            data={backups}
            renderItem={renderBackupItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}

        {activeTab === 'schedules' && (
          <View>
            <TouchableOpacity
              style={styles.createScheduleButton}
              onPress={() => setShowScheduleModal(true)}
            >
              <Ionicons name="add-circle-outline" size={24} color="#2196F3" />
              <Text style={styles.createScheduleText}>创建备份计划</Text>
            </TouchableOpacity>
            <FlatList
              data={schedules}
              renderItem={renderScheduleItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {activeTab === 'restore' && (
          <FlatList
            data={restoreOperations}
            renderItem={renderRestoreItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* Create Backup Modal */}
      <Modal
        visible={showCreateBackupModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>创建备份</Text>
            <TouchableOpacity onPress={() => setShowCreateBackupModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>备份名称</Text>
              <TextInput
                style={styles.input}
                value={backupName}
                onChangeText={setBackupName}
                placeholder="输入备份名称"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>备份类型</Text>
              <View style={styles.typeSelector}>
                {[
                  { key: 'full', label: '完整备份' },
                  { key: 'incremental', label: '增量备份' },
                  { key: 'differential', label: '差异备份' },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeOption,
                      backupType === type.key && styles.selectedType,
                    ]}
                    onPress={() => setBackupType(type.key as any)}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        backupType === type.key && styles.selectedTypeText,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>描述</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={backupDescription}
                onChangeText={setBackupDescription}
                placeholder="输入备份描述（可选）"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowCreateBackupModal(false)}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleCreateBackup}
            >
              <Text style={styles.confirmButtonText}>创建备份</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Schedule Modal */}
      <Modal
        visible={showScheduleModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>创建备份计划</Text>
            <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>计划名称</Text>
              <TextInput
                style={styles.input}
                value={scheduleName}
                onChangeText={setScheduleName}
                placeholder="输入计划名称"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>备份类型</Text>
              <View style={styles.typeSelector}>
                {[
                  { key: 'full', label: '完整备份' },
                  { key: 'incremental', label: '增量备份' },
                  { key: 'differential', label: '差异备份' },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeOption,
                      backupType === type.key && styles.selectedType,
                    ]}
                    onPress={() => setBackupType(type.key as any)}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        backupType === type.key && styles.selectedTypeText,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>执行频率</Text>
              <View style={styles.typeSelector}>
                {[
                  { key: 'daily', label: '每日' },
                  { key: 'weekly', label: '每周' },
                  { key: 'monthly', label: '每月' },
                ].map((freq) => (
                  <TouchableOpacity
                    key={freq.key}
                    style={[
                      styles.typeOption,
                      scheduleFrequency === freq.key && styles.selectedType,
                    ]}
                    onPress={() => setScheduleFrequency(freq.key as any)}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        scheduleFrequency === freq.key && styles.selectedTypeText,
                      ]}
                    >
                      {freq.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>执行时间</Text>
              <TextInput
                style={styles.input}
                value={scheduleTime}
                onChangeText={setScheduleTime}
                placeholder="HH:MM"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>启用计划</Text>
                <Switch
                  value={scheduleEnabled}
                  onValueChange={setScheduleEnabled}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={scheduleEnabled ? '#f5dd4b' : '#f4f3f4'}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowScheduleModal(false)}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleCreateSchedule}
            >
              <Text style={styles.confirmButtonText}>创建计划</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Restore Confirmation Modal */}
      <Modal
        visible={showRestoreModal}
        animationType="fade"
        transparent
      >
        <View style={styles.overlayContainer}>
          <View style={styles.alertContainer}>
            <Text style={styles.alertTitle}>确认恢复</Text>
            <Text style={styles.alertMessage}>
              确定要从备份 "{selectedBackup?.name}" 恢复数据吗？
              {'\n\n'}此操作将覆盖当前数据，请确保已做好准备。
            </Text>
            <View style={styles.alertActions}>
              <TouchableOpacity
                style={[styles.alertButton, styles.cancelAlertButton]}
                onPress={() => setShowRestoreModal(false)}
              >
                <Text style={styles.cancelAlertText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertButton, styles.confirmAlertButton]}
                onPress={() => selectedBackup && handleRestoreBackup(selectedBackup)}
              >
                <Text style={styles.confirmAlertText}>确认恢复</Text>
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
  addButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 15,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemDetails: {
    marginLeft: 12,
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  restoreButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  createScheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    gap: 8,
  },
  createScheduleText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  selectedType: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTypeText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 10,
  },
  alertButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelAlertButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmAlertButton: {
    backgroundColor: '#F44336',
  },
  cancelAlertText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmAlertText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BackupManager;