import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { 
  useGetJobByIdQuery, 
  useApplyForJobMutation, 
  useSaveJobMutation, 
  useUnsaveJobMutation 
} from '../../features/jobs/jobsSlice';

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
  } = useGetJobByIdQuery(jobId);

  // Mutations
  const [applyForJob, { isLoading: isApplying }] = useApplyForJobMutation();
  const [saveJob, { isLoading: isSaving }] = useSaveJobMutation();
  const [unsaveJob, { isLoading: isUnsaving }] = useUnsaveJobMutation();
  
  // Local state
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isJobSaved, setIsJobSaved] = useState(false);

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
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async () => {
    try {
      await applyForJob({
        jobId,
        coverLetter: coverLetter.trim() || undefined,
      }).unwrap();
      
      setShowApplicationModal(false);
      setCoverLetter('');
      
      Alert.alert(
        'Application Submitted!',
        'Your application has been successfully submitted. The employer will review it and get back to you.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Application Failed',
        'There was an error submitting your application. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSave = async () => {
    try {
      if (isJobSaved) {
        await unsaveJob(jobId).unwrap();
        setIsJobSaved(false);
        Alert.alert('Job Removed', 'Job removed from your saved list.');
      } else {
        await saveJob(jobId).unwrap();
        setIsJobSaved(true);
        Alert.alert('Job Saved', 'Job added to your saved list.');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'There was an error saving the job. Please try again.',
        [{ text: 'OK' }]
      );
    }
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
          disabled={isSaving || isUnsaving}
        >
          <Text style={[styles.saveButtonText, { color: theme.colors.primary }]}>
            {isSaving || isUnsaving ? 'Loading...' : isJobSaved ? 'Unsave' : 'Save'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleApply}
          disabled={isApplying}
        >
          <Text style={styles.applyButtonText}>
            {isApplying ? 'Applying...' : 'Apply Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Application Modal */}
      <Modal
        visible={showApplicationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowApplicationModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => setShowApplicationModal(false)}>
              <Text style={[styles.modalCancelText, { color: theme.colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Apply for Job</Text>
            <TouchableOpacity onPress={handleSubmitApplication} disabled={isApplying}>
              <Text style={[styles.modalSubmitText, { color: theme.colors.primary }]}>
                {isApplying ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={[styles.modalJobTitle, { color: theme.colors.text }]}>{job?.title}</Text>
            <Text style={[styles.modalCompanyName, { color: theme.colors.gray }]}>
              {job?.company?.name || 'Company Name'}
            </Text>
            
            <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>Cover Letter (Optional)</Text>
            <TextInput
              style={[styles.coverLetterInput, { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              placeholder="Write a brief cover letter to introduce yourself..."
              placeholderTextColor={theme.colors.gray}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              value={coverLetter}
              onChangeText={setCoverLetter}
            />
          </ScrollView>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalJobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalCompanyName: {
    fontSize: 16,
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  coverLetterInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
});