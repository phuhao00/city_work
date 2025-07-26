import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert 
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useGetJobsQuery } from '../../services/jobsApi';

interface JobListScreenProps {
  navigation?: any;
}

export const JobListScreen: React.FC<JobListScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    data: jobs, 
    isLoading, 
    error, 
    refetch 
  } = useGetJobsQuery({
    page: 1,
    limit: 20
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh jobs:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleJobPress = (job: any) => {
    // Navigate to job detail when implemented
    navigation?.navigate('JobDetail', { jobId: job._id });
  };

  const formatSalary = (salary: any) => {
    if (!salary) return 'Salary not specified';
    if (salary.min && salary.max) {
      return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`;
    }
    if (salary.min) {
      return `From $${salary.min.toLocaleString()}`;
    }
    if (salary.max) {
      return `Up to $${salary.max.toLocaleString()}`;
    }
    return 'Salary not specified';
  };

  const renderJobItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.jobCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      onPress={() => handleJobPress(item)}
    >
      <Text style={[styles.jobTitle, { color: theme.colors.text }]}>{item.title}</Text>
      <Text style={[styles.companyName, { color: theme.colors.gray }]}>
        {item.company?.name || 'Company not specified'}
      </Text>
      <Text style={[styles.location, { color: theme.colors.gray }]}>
        {item.location || 'Location not specified'}
      </Text>
      <View style={styles.salaryContainer}>
        <Text style={[styles.salary, { color: theme.colors.primary }]}>
          {formatSalary(item.salary)}
        </Text>
        <Text style={[styles.jobType, { color: theme.colors.gray }]}>
          {item.type || 'full-time'}
        </Text>
      </View>
      {item.description && (
        <Text 
          style={[styles.description, { color: theme.colors.gray }]} 
          numberOfLines={2}
        >
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.gray }]}>
        No jobs available at the moment
      </Text>
      <TouchableOpacity 
        style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
        onPress={onRefresh}
      >
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.error }]}>
        Failed to load jobs
      </Text>
      <TouchableOpacity 
        style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
        onPress={onRefresh}
      >
        <Text style={styles.refreshButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.gray }]}>Loading jobs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.header, { color: theme.colors.text }]}>Available Jobs</Text>
        {renderError()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.text }]}>Available Jobs</Text>
      <FlatList
        data={jobs?.data || []}
        renderItem={renderJobItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContainer,
          (!jobs?.data || jobs.data.length === 0) && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  jobCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    marginBottom: 8,
  },
  salaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  salary: {
    fontSize: 16,
    fontWeight: '600',
  },
  jobType: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});