import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { useGetSavedJobsQuery, useUnsaveJobMutation, Job } from '../../features/jobs/jobsSlice';

export const SavedJobsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { data: savedJobs = [], isLoading, error, refetch } = useGetSavedJobsQuery();
  const [unsaveJob] = useUnsaveJobMutation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Salary not specified';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleUnsaveJob = (jobId: string, jobTitle: string) => {
    Alert.alert(
      'Remove from Saved',
      `Remove "${jobTitle}" from your saved jobs?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await unsaveJob(jobId).unwrap();
              Alert.alert('Removed', 'Job removed from your saved list.');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove job. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleJobPress = (jobId: string) => {
    navigation.navigate('JobDetail' as never, { jobId } as never);
  };

  const renderJobItem = ({ item }: { item: Job }) => (
    <TouchableOpacity
      style={[styles.jobCard, { backgroundColor: theme.colors.card }]}
      onPress={() => handleJobPress(item._id)}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobInfo}>
          <Text style={[styles.jobTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.companyName, { color: theme.colors.primary }]}>
            {item.company?.name || 'Company Name'}
          </Text>
          <Text style={[styles.jobLocation, { color: theme.colors.gray }]}>
            {item.location} • {item.type}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.unsaveButton, { borderColor: theme.colors.error }]}
          onPress={() => handleUnsaveJob(item._id, item.title)}
        >
          <Text style={[styles.unsaveButtonText, { color: theme.colors.error }]}>
            Remove
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.jobDetails}>
        <Text style={[styles.salary, { color: theme.colors.text }]}>
          {formatSalary(item.salaryMin, item.salaryMax)}
        </Text>
        <Text style={[styles.postedDate, { color: theme.colors.gray }]}>
          Posted {formatDate(item.createdAt)}
        </Text>
      </View>

      {item.skills && item.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {item.skills.slice(0, 3).map((skill, index) => (
            <View
              key={index}
              style={[styles.skillTag, { backgroundColor: theme.colors.primary + '20' }]}
            >
              <Text style={[styles.skillText, { color: theme.colors.primary }]}>
                {skill}
              </Text>
            </View>
          ))}
          {item.skills.length > 3 && (
            <Text style={[styles.moreSkills, { color: theme.colors.gray }]}>
              +{item.skills.length - 3} more
            </Text>
          )}
        </View>
      )}

      <View style={styles.jobFooter}>
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleJobPress(item._id)}
        >
          <Text style={styles.applyButtonText}>View & Apply</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.gray }]}>
          Loading saved jobs...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Failed to load saved jobs
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

  if (savedJobs.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          No Saved Jobs
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.gray }]}>
          Save interesting jobs to review them later
        </Text>
        <TouchableOpacity
          style={[styles.browseButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Jobs' as never)}
        >
          <Text style={styles.browseButtonText}>Browse Jobs</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Saved Jobs ({savedJobs.length})
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.gray }]}>
          Jobs you've saved for later
        </Text>
      </View>

      <FlatList
        data={savedJobs}
        renderItem={renderJobItem}
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
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  jobCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobHeader: {
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
  unsaveButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  unsaveButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  salary: {
    fontSize: 16,
    fontWeight: '600',
  },
  postedDate: {
    fontSize: 14,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 16,
  },
  skillTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreSkills: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  jobFooter: {
    alignItems: 'flex-end',
  },
  applyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});