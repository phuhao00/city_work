import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useGetJobQuery } from '../../services/jobsApi';

interface JobDetailScreenProps {
  route: {
    params: {
      jobId: string;
    };
  };
  navigation?: any;
}

export const JobDetailScreen: React.FC<JobDetailScreenProps> = ({ route, navigation }) => {
  const { jobId } = route.params;
  const { theme } = useTheme();

  const {
    data: job,
    isLoading,
    error,
    refetch
  } = useGetJobQuery(jobId);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Salary not specified';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleApply = () => {
    // TODO: Implement job application logic
    console.log('Apply for job:', jobId);
  };

  const handleSave = () => {
    // TODO: Implement save job logic
    console.log('Save job:', jobId);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.gray }]}>Loading job details...</Text>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Failed to load job details
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Job Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.jobTitle, { color: theme.colors.text }]}>{job.title}</Text>
          <Text style={[styles.companyName, { color: theme.colors.primary }]}>
            {job.company?.name || 'Company Name'}
          </Text>
          <Text style={[styles.location, { color: theme.colors.gray }]}>{job.location}</Text>
          <Text style={[styles.salary, { color: theme.colors.text }]}>
            {formatSalary(job.salaryMin, job.salaryMax)}
          </Text>
        </View>

        {/* Job Info */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Job Information</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.gray }]}>Type:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>{job.type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.gray }]}>Posted:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {formatDate(job.createdAt)}
            </Text>
          </View>
          {job.deadline && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.gray }]}>Deadline:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formatDate(job.deadline)}
              </Text>
            </View>
          )}
        </View>

        {/* Job Description */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>
            {job.description}
          </Text>
        </View>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Requirements</Text>
            {job.requirements.map((requirement: string, index: number) => (
              <View key={index} style={styles.requirementItem}>
                <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
                <Text style={[styles.requirementText, { color: theme.colors.text }]}>
                  {requirement}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Required Skills</Text>
            <View style={styles.skillsContainer}>
              {job.skills.map((skill: string, index: number) => (
                <View key={index} style={[styles.skillTag, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.skillText, { color: theme.colors.primary }]}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Company Info */}
        {job.company && (
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About the Company</Text>
            <Text style={[styles.companyDescription, { color: theme.colors.text }]}>
              {job.company.description || 'No company description available.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionContainer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.primary }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { color: theme.colors.primary }]}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>Apply Now</Text>
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    marginBottom: 8,
  },
  salary: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    width: 80,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    flex: 1,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  requirementText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  companyDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});