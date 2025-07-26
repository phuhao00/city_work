import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { 
  useGetAppliedJobsQuery, 
  useWithdrawApplicationMutation,
} from '../../services/jobsApi';
import { ApplicationDetailScreen } from './ApplicationDetailScreen';

interface Application {
  _id: string;
  jobId: string;
  job: {
    title: string;
    company: {
      name: string;
      logo?: string;
    };
    location: string;
    type: string;
  };
  status: 'pending' | 'reviewing' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  appliedAt: string;
  coverLetter?: string;
  notes?: string;
}

export const MyApplicationsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { data: applications = [], isLoading, error, refetch } = useGetAppliedJobsQuery();
  const [withdrawApplication, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // If an application is selected, show the detail screen
  if (selectedApplicationId) {
    return (
      <ApplicationDetailScreen
        applicationId={selectedApplicationId}
        onBack={() => setSelectedApplicationId(null)}
      />
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning || '#FFA500';
      case 'reviewing':
        return theme.colors.info || '#2196F3';
      case 'interview':
        return theme.colors.primary;
      case 'offer':
        return theme.colors.success || '#4CAF50';
      case 'rejected':
        return theme.colors.error;
      case 'withdrawn':
        return theme.colors.gray;
      default:
        return theme.colors.gray;
    }
  };

  const getStatusText = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'reviewing':
        return 'Under Review';
      case 'interview':
        return 'Interview Scheduled';
      case 'offer':
        return 'Offer Received';
      case 'rejected':
        return 'Not Selected';
      case 'withdrawn':
        return 'Withdrawn';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleWithdrawApplication = (jobId: string) => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await withdrawApplication(jobId).unwrap();
              Alert.alert('Success', 'Application withdrawn successfully');
              refetch();
            } catch (error) {
              Alert.alert('Error', 'Failed to withdraw application. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderApplicationItem = ({ item }: { item: Application }) => (
    <TouchableOpacity
      style={[styles.applicationCard, { backgroundColor: theme.colors.card }]}
      onPress={() => setSelectedApplicationId(item._id)}
    >
      <View style={styles.applicationHeader}>
        <View style={styles.jobInfo}>
          <Text style={[styles.jobTitle, { color: theme.colors.text }]}>
            {item.job.title}
          </Text>
          <Text style={[styles.companyName, { color: theme.colors.primary }]}>
            {item.job.company.name}
          </Text>
          <Text style={[styles.jobLocation, { color: theme.colors.gray }]}>
            {item.job.location} • {item.job.type}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '20' }
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) }
              ]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.applicationFooter}>
        <Text style={[styles.appliedDate, { color: theme.colors.gray }]}>
          Applied on {formatDate(item.appliedAt)}
        </Text>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.withdrawButton, { borderColor: theme.colors.error }]}
            onPress={() => handleWithdrawApplication(item.jobId)}
            disabled={isWithdrawing}
          >
            {isWithdrawing ? (
              <ActivityIndicator size="small" color={theme.colors.error} />
            ) : (
              <Text style={[styles.withdrawButtonText, { color: theme.colors.error }]}>
                Withdraw
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={[styles.notesLabel, { color: theme.colors.gray }]}>Notes:</Text>
          <Text style={[styles.notesText, { color: theme.colors.text }]}>
            {item.notes}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.gray }]}>
          Loading your applications...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Failed to load applications
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (applications.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          No Applications Yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.gray }]}>
          Start applying for jobs to see your applications here
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={applications}
        renderItem={renderApplicationItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  applicationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  jobLocation: {
    fontSize: 14,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  applicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedDate: {
    fontSize: 14,
  },
  withdrawButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  withdrawButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});