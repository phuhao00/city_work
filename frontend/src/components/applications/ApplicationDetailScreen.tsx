import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { 
  useGetApplicationDetailsQuery,
  useWithdrawApplicationMutation,
} from '../../services/jobsApi';

interface ApplicationDetailScreenProps {
  applicationId: string;
  onBack: () => void;
}

export const ApplicationDetailScreen: React.FC<ApplicationDetailScreenProps> = ({
  applicationId,
  onBack,
}) => {
  const { theme } = useTheme();
  const { data: application, isLoading, error, refetch } = useGetApplicationDetailsQuery(applicationId);
  const [withdrawApplication, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();

  const handleWithdrawApplication = () => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await withdrawApplication(application?.job?._id).unwrap();
              Alert.alert('Success', 'Application withdrawn successfully', [
                { text: 'OK', onPress: onBack }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to withdraw application. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return theme.colors.warning;
      case 'reviewing':
        return theme.colors.info;
      case 'interview':
        return theme.colors.primary;
      case 'accepted':
        return theme.colors.success;
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Application Submitted';
      case 'reviewing':
        return 'Under Review';
      case 'interview':
        return 'Interview Scheduled';
      case 'accepted':
        return 'Offer Extended';
      case 'rejected':
        return 'Application Declined';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading application details...</Text>
      </View>
    );
  }

  if (error || !application) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Failed to load application details</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Application Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Job Information */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Job Information</Text>
          <Text style={[styles.jobTitle, { color: theme.colors.text }]}>{application.job.title}</Text>
          <Text style={[styles.companyName, { color: theme.colors.textSecondary }]}>{application.job.company}</Text>
          <Text style={[styles.jobLocation, { color: theme.colors.textSecondary }]}>{application.job.location}</Text>
        </View>

        {/* Application Status */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Application Status</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
              <Text style={styles.statusText}>{getStatusText(application.status)}</Text>
            </View>
            <Text style={[styles.appliedDate, { color: theme.colors.textSecondary }]}>
              Applied on {new Date(application.appliedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Application Timeline */}
        {application.timeline && application.timeline.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Application Timeline</Text>
            {application.timeline.map((event: any, index: number) => (
              <View key={index} style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: getStatusColor(event.status) }]} />
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineStatus, { color: theme.colors.text }]}>
                    {getStatusText(event.status)}
                  </Text>
                  <Text style={[styles.timelineDate, { color: theme.colors.textSecondary }]}>
                    {new Date(event.date).toLocaleDateString()}
                  </Text>
                  {event.note && (
                    <Text style={[styles.timelineNote, { color: theme.colors.textSecondary }]}>
                      {event.note}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Cover Letter */}
        {application.coverLetter && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Cover Letter</Text>
            <Text style={[styles.coverLetter, { color: theme.colors.text }]}>{application.coverLetter}</Text>
          </View>
        )}

        {/* Resume */}
        {application.resume && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Resume</Text>
            <TouchableOpacity style={[styles.resumeButton, { borderColor: theme.colors.primary }]}>
              <Text style={[styles.resumeButtonText, { color: theme.colors.primary }]}>
                📄 {application.resume}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Actions */}
        {application.status.toLowerCase() === 'pending' && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Actions</Text>
            <TouchableOpacity
              style={[styles.withdrawButton, { borderColor: theme.colors.error }]}
              onPress={handleWithdrawApplication}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? (
                <ActivityIndicator size="small" color={theme.colors.error} />
              ) : (
                <Text style={[styles.withdrawButtonText, { color: theme.colors.error }]}>
                  Withdraw Application
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  appliedDate: {
    fontSize: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  timelineNote: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  coverLetter: {
    fontSize: 14,
    lineHeight: 20,
  },
  resumeButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  resumeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  withdrawButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
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
});