import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface JobListScreenProps {
  navigation?: any;
}

// Mock job data for now
const mockJobs = [
  {
    _id: '1',
    title: 'Frontend Developer',
    company: { name: 'Tech Corp' },
    location: 'New York, NY',
    salary: { min: 80000, max: 120000 },
    type: 'full-time',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Backend Developer',
    company: { name: 'StartupXYZ' },
    location: 'San Francisco, CA',
    salary: { min: 90000, max: 140000 },
    type: 'full-time',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '3',
    title: 'UI/UX Designer',
    company: { name: 'Design Studio' },
    location: 'Los Angeles, CA',
    salary: { min: 70000, max: 100000 },
    type: 'contract',
    createdAt: new Date().toISOString(),
  },
];

export const JobListScreen: React.FC<JobListScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();

  const renderJobItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.jobCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => {
        // Navigate to job detail when implemented
        console.log('Job selected:', item.title);
      }}
    >
      <Text style={[styles.jobTitle, { color: theme.colors.text }]}>{item.title}</Text>
      <Text style={[styles.companyName, { color: theme.colors.gray }]}>{item.company.name}</Text>
      <Text style={[styles.location, { color: theme.colors.gray }]}>{item.location}</Text>
      <View style={styles.salaryContainer}>
        <Text style={[styles.salary, { color: theme.colors.primary }]}>
          ${item.salary.min.toLocaleString()} - ${item.salary.max.toLocaleString()}
        </Text>
        <Text style={[styles.jobType, { color: theme.colors.gray }]}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.text }]}>Available Jobs</Text>
      <FlatList
        data={mockJobs}
        renderItem={renderJobItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
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
  },
  salary: {
    fontSize: 16,
    fontWeight: '600',
  },
  jobType: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
});