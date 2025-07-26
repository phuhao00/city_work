import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  appliedDate: Date;
  status: 'pending' | 'reviewing' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  lastUpdate: Date;
  notes?: string;
  interviewDate?: Date;
  salary?: {
    offered?: number;
    currency: string;
  };
}

interface ApplicationsScreenProps {
  navigation?: any;
}

export const ApplicationsScreen: React.FC<ApplicationsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [applications, setApplications] = useState<Application[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');

  // Mock data - replace with actual API calls
  const mockApplications: Application[] = [
    {
      id: '1',
      jobId: '1',
      jobTitle: 'Senior Software Engineer',
      companyName: 'TechCorp Solutions',
      companyLogo: 'https://via.placeholder.com/50x50/4A90E2/FFFFFF?text=TC',
      appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      status: 'interview',
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      interviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      notes: 'Technical interview scheduled for next week',
    },
    {
      id: '2',
      jobId: '2',
      jobTitle: 'Product Manager',
      companyName: 'InnovateCorp',
      companyLogo: 'https://via.placeholder.com/50x50/50C878/FFFFFF?text=IC',
      appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      status: 'offer',
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      salary: { offered: 120000, currency: 'USD' },
      notes: 'Offer received! Need to respond by Friday',
    },
    {
      id: '3',
      jobId: '3',
      jobTitle: 'UX Designer',
      companyName: 'DesignStudio',
      companyLogo: 'https://via.placeholder.com/50x50/FF6B6B/FFFFFF?text=DS',
      appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      status: 'reviewing',
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
    {
      id: '4',
      jobId: '4',
      jobTitle: 'Frontend Developer',
      companyName: 'WebTech Inc',
      companyLogo: 'https://via.placeholder.com/50x50/9B59B6/FFFFFF?text=WT',
      appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      status: 'rejected',
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      notes: 'Position filled internally',
    },
    {
      id: '5',
      jobId: '5',
      jobTitle: 'Data Scientist',
      companyName: 'DataCorp',
      companyLogo: 'https://via.placeholder.com/50x50/F39C12/FFFFFF?text=DC',
      appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      status: 'pending',
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
  ];

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      // Replace with actual API call
      setApplications(mockApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'reviewing':
        return '#2196F3';
      case 'interview':
        return '#9C27B0';
      case 'offer':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'withdrawn':
        return '#757575';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return 'Application Submitted';
      case 'reviewing':
        return 'Under Review';
      case 'interview':
        return 'Interview Scheduled';
      case 'offer':
        return 'Offer Received';
      case 'rejected':
        return 'Not Selected';
      case 'withdrawn':
        return 'Application Withdrawn';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleWithdrawApplication = (applicationId: string) => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: () => {
            setApplications(prev =>
              prev.map(app =>
                app.id === applicationId
                  ? { ...app, status: 'withdrawn' as const, lastUpdate: new Date() }
                  : app
              )
            );
          },
        },
      ]
    );
  };

  const handleAddNotes = (application: Application) => {
    setSelectedApplication(application);
    setNotes(application.notes || '');
    setShowNotesModal(true);
  };

  const saveNotes = () => {
    if (selectedApplication) {
      setApplications(prev =>
        prev.map(app =>
          app.id === selectedApplication.id
            ? { ...app, notes }
            : app
        )
      );
    }
    setShowNotesModal(false);
    setSelectedApplication(null);
    setNotes('');
  };

  const filteredApplications = filterStatus === 'all'
    ? applications
    : applications.filter(app => app.status === filterStatus);

  const getApplicationStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const reviewing = applications.filter(app => app.status === 'reviewing').length;
    const interviews = applications.filter(app => app.status === 'interview').length;
    const offers = applications.filter(app => app.status === 'offer').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;

    return { total, pending, reviewing, interviews, offers, rejected };
  };

  const stats = getApplicationStats();

  const renderApplicationItem = ({ item }: { item: Application }) => (
    <TouchableOpacity
      style={[styles.applicationItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation?.navigate('JobDetail', { jobId: item.jobId })}
    >
      <View style={styles.applicationHeader}>
        <View style={styles.companyInfo}>
          <View style={styles.companyLogo}>
            <Text style={styles.companyLogoText}>
              {item.companyName.charAt(0)}
            </Text>
          </View>
          <View style={styles.jobInfo}>
            <Text style={[styles.jobTitle, { color: theme.colors.text }]}>
              {item.jobTitle}
            </Text>
            <Text style={[styles.companyName, { color: theme.colors.textSecondary }]}>
              {item.companyName}
            </Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.applicationDetails}>
        <Text style={[styles.appliedDate, { color: theme.colors.textSecondary }]}>
          Applied: {formatDate(item.appliedDate)}
        </Text>
        <Text style={[styles.lastUpdate, { color: theme.colors.textSecondary }]}>
          Updated: {formatDate(item.lastUpdate)}
        </Text>
      </View>

      {item.interviewDate && (
        <View style={[styles.interviewInfo, { backgroundColor: theme.colors.primary + '10' }]}>
          <Text style={[styles.interviewText, { color: theme.colors.primary }]}>
            📅 Interview: {formatDate(item.interviewDate)}
          </Text>
        </View>
      )}

      {item.salary?.offered && (
        <View style={[styles.offerInfo, { backgroundColor: '#4CAF50' + '10' }]}>
          <Text style={[styles.offerText, { color: '#4CAF50' }]}>
            💰 Offer: ${item.salary.offered.toLocaleString()} {item.salary.currency}
          </Text>
        </View>
      )}

      {item.notes && (
        <View style={styles.notesPreview}>
          <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>
            📝 {item.notes}
          </Text>
        </View>
      )}

      <View style={styles.applicationActions}>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: theme.colors.primary }]}
          onPress={() => handleAddNotes(item)}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
            {item.notes ? 'Edit Notes' : 'Add Notes'}
          </Text>
        </TouchableOpacity>
        
        {item.status !== 'withdrawn' && item.status !== 'rejected' && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: '#F44336' }]}
            onPress={() => handleWithdrawApplication(item.id)}
          >
            <Text style={[styles.actionButtonText, { color: '#F44336' }]}>
              Withdraw
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderStats = () => (
    <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
        Application Overview
      </Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.text }]}>
            {stats.total}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Total
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FFA500' }]}>
            {stats.pending}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Pending
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#9C27B0' }]}>
            {stats.interviews}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Interviews
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
            {stats.offers}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Offers
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filtersContainer}
      contentContainerStyle={styles.filtersContent}
    >
      {[
        { key: 'all', label: 'All', count: stats.total },
        { key: 'pending', label: 'Pending', count: stats.pending },
        { key: 'reviewing', label: 'Reviewing', count: stats.reviewing },
        { key: 'interview', label: 'Interview', count: stats.interviews },
        { key: 'offer', label: 'Offers', count: stats.offers },
        { key: 'rejected', label: 'Rejected', count: stats.rejected },
      ].map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            {
              backgroundColor: filterStatus === filter.key
                ? theme.colors.primary
                : theme.colors.surface,
            },
          ]}
          onPress={() => setFilterStatus(filter.key)}
        >
          <Text
            style={[
              styles.filterButtonText,
              {
                color: filterStatus === filter.key
                  ? theme.colors.surface
                  : theme.colors.text,
              },
            ]}
          >
            {filter.label} ({filter.count})
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={filteredApplications}
        renderItem={renderApplicationItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {renderStats()}
            {renderFilters()}
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Notes Modal */}
      <Modal
        visible={showNotesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Application Notes
            </Text>
            
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add your notes about this application..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.colors.border }]}
                onPress={() => setShowNotesModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={saveNotes}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.surface }]}>
                  Save
                </Text>
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
  },
  listContent: {
    paddingBottom: 20,
  },
  statsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  filtersContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filtersContent: {
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  applicationItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyLogoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  applicationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  appliedDate: {
    fontSize: 12,
  },
  lastUpdate: {
    fontSize: 12,
  },
  interviewInfo: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  interviewText: {
    fontSize: 14,
    fontWeight: '600',
  },
  offerInfo: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  offerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesPreview: {
    marginBottom: 12,
  },
  notesText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  applicationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 120,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});