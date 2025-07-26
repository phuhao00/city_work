import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { 
  useGetUserProfileQuery, 
  useUpdateUserProfileMutation,
  UserProfile as ApiUserProfile,
} from '../../services/userProfileApi';

interface UserProfile {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
  };
  preferences: {
    skills: string[];
    preferredLocation: string;
    salaryRange: { min: number; max: number };
    experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
    jobTypes: string[];
    remotePreference: boolean;
    companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
    industries: string[];
    notificationsEnabled: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showSalaryExpectations: boolean;
    allowRecruiterContact: boolean;
  };
}

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (2-5 years)' },
  { value: 'senior', label: 'Senior Level (5-8 years)' },
  { value: 'lead', label: 'Lead/Principal (8+ years)' },
];

const JOB_TYPES = [
  'Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Remote'
];

const COMPANY_SIZES = [
  { value: 'startup', label: 'Startup (1-10 employees)' },
  { value: 'small', label: 'Small (11-50 employees)' },
  { value: 'medium', label: 'Medium (51-200 employees)' },
  { value: 'large', label: 'Large (201-1000 employees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)' },
];

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
  'Manufacturing', 'Consulting', 'Media', 'Government', 'Non-profit'
];

export const UserProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { data: profileData, isLoading, error, refetch } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  
  const [profile, setProfile] = useState<UserProfile>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      bio: '',
    },
    preferences: {
      skills: [],
      preferredLocation: '',
      salaryRange: { min: 0, max: 0 },
      experienceLevel: 'entry',
      jobTypes: [],
      remotePreference: false,
      companySize: 'startup',
      industries: [],
      notificationsEnabled: true,
    },
    privacy: {
      profileVisible: true,
      showSalaryExpectations: false,
      allowRecruiterContact: true,
    },
  });

  const [newSkill, setNewSkill] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'preferences' | 'privacy'>('personal');

  // Load profile data when component mounts or data changes
  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
    }
  }, [profileData]);

  const updatePersonalInfo = (field: keyof UserProfile['personalInfo'], value: string) => {
    setProfile(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const updatePreferences = (field: keyof UserProfile['preferences'], value: any) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      },
    }));
  };

  const updatePrivacy = (field: keyof UserProfile['privacy'], value: boolean) => {
    setProfile(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value,
      },
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.preferences.skills.includes(newSkill.trim())) {
      updatePreferences('skills', [...profile.preferences.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updatePreferences('skills', profile.preferences.skills.filter(skill => skill !== skillToRemove));
  };

  const toggleJobType = (jobType: string) => {
    const currentTypes = profile.preferences.jobTypes;
    if (currentTypes.includes(jobType)) {
      updatePreferences('jobTypes', currentTypes.filter(type => type !== jobType));
    } else {
      updatePreferences('jobTypes', [...currentTypes, jobType]);
    }
  };

  const toggleIndustry = (industry: string) => {
    const currentIndustries = profile.preferences.industries;
    if (currentIndustries.includes(industry)) {
      updatePreferences('industries', currentIndustries.filter(ind => ind !== industry));
    } else {
      updatePreferences('industries', [...currentIndustries, industry]);
    }
  };

  const saveProfile = async () => {
    try {
      await updateProfile(profile).unwrap();
      Alert.alert('Success', 'Profile updated successfully!');
      refetch(); // Refresh the profile data
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      Alert.alert(
        'Error', 
        error?.data?.message || 'Failed to update profile. Please try again.'
      );
    }
  };

  // Show loading spinner while fetching profile data
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading profile...</Text>
      </View>
    );
  }

  // Show error message if failed to load profile
  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Failed to load profile</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderPersonalInfo = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Personal Information
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Full Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          value={profile.personalInfo.name}
          onChangeText={(value) => updatePersonalInfo('name', value)}
          placeholder="Enter your full name"
          placeholderTextColor={theme.colors.gray}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          value={profile.personalInfo.email}
          onChangeText={(value) => updatePersonalInfo('email', value)}
          placeholder="Enter your email"
          placeholderTextColor={theme.colors.gray}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Phone</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          value={profile.personalInfo.phone}
          onChangeText={(value) => updatePersonalInfo('phone', value)}
          placeholder="Enter your phone number"
          placeholderTextColor={theme.colors.gray}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Location</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          value={profile.personalInfo.location}
          onChangeText={(value) => updatePersonalInfo('location', value)}
          placeholder="Enter your location"
          placeholderTextColor={theme.colors.gray}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Bio</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          value={profile.personalInfo.bio}
          onChangeText={(value) => updatePersonalInfo('bio', value)}
          placeholder="Tell us about yourself..."
          placeholderTextColor={theme.colors.gray}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderPreferences = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Job Preferences
      </Text>

      {/* Skills */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Skills</Text>
        <View style={styles.skillsContainer}>
          {profile.preferences.skills.map((skill, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.skillTag, { backgroundColor: theme.colors.primary }]}
              onPress={() => removeSkill(skill)}
            >
              <Text style={styles.skillTagText}>{skill}</Text>
              <Text style={styles.removeSkill}>×</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.addSkillContainer}>
          <TextInput
            style={[styles.skillInput, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={newSkill}
            onChangeText={setNewSkill}
            placeholder="Add a skill"
            placeholderTextColor={theme.colors.gray}
            onSubmitEditing={addSkill}
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={addSkill}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preferred Location */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Preferred Location</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          value={profile.preferences.preferredLocation}
          onChangeText={(value) => updatePreferences('preferredLocation', value)}
          placeholder="Enter preferred location"
          placeholderTextColor={theme.colors.gray}
        />
      </View>

      {/* Salary Range */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Salary Range (USD)</Text>
        <View style={styles.salaryContainer}>
          <TextInput
            style={[styles.salaryInput, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={profile.preferences.salaryRange.min.toString()}
            onChangeText={(value) => updatePreferences('salaryRange', {
              ...profile.preferences.salaryRange,
              min: parseInt(value) || 0
            })}
            placeholder="Min"
            placeholderTextColor={theme.colors.gray}
            keyboardType="numeric"
          />
          <Text style={[styles.salaryDash, { color: theme.colors.gray }]}>-</Text>
          <TextInput
            style={[styles.salaryInput, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
            value={profile.preferences.salaryRange.max.toString()}
            onChangeText={(value) => updatePreferences('salaryRange', {
              ...profile.preferences.salaryRange,
              max: parseInt(value) || 0
            })}
            placeholder="Max"
            placeholderTextColor={theme.colors.gray}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Experience Level */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Experience Level</Text>
        <View style={styles.optionsContainer}>
          {EXPERIENCE_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.optionButton,
                {
                  backgroundColor: profile.preferences.experienceLevel === level.value
                    ? theme.colors.primary
                    : theme.colors.card,
                }
              ]}
              onPress={() => updatePreferences('experienceLevel', level.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: profile.preferences.experienceLevel === level.value
                      ? 'white'
                      : theme.colors.text,
                  }
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Job Types */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Job Types</Text>
        <View style={styles.optionsContainer}>
          {JOB_TYPES.map((jobType) => (
            <TouchableOpacity
              key={jobType}
              style={[
                styles.optionButton,
                {
                  backgroundColor: profile.preferences.jobTypes.includes(jobType)
                    ? theme.colors.primary
                    : theme.colors.card,
                }
              ]}
              onPress={() => toggleJobType(jobType)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: profile.preferences.jobTypes.includes(jobType)
                      ? 'white'
                      : theme.colors.text,
                  }
                ]}
              >
                {jobType}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Remote Preference */}
      <View style={styles.switchContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Remote Work Preference</Text>
        <Switch
          value={profile.preferences.remotePreference}
          onValueChange={(value) => updatePreferences('remotePreference', value)}
          trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
        />
      </View>

      {/* Company Size */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Preferred Company Size</Text>
        <View style={styles.optionsContainer}>
          {COMPANY_SIZES.map((size) => (
            <TouchableOpacity
              key={size.value}
              style={[
                styles.optionButton,
                {
                  backgroundColor: profile.preferences.companySize === size.value
                    ? theme.colors.primary
                    : theme.colors.card,
                }
              ]}
              onPress={() => updatePreferences('companySize', size.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: profile.preferences.companySize === size.value
                      ? 'white'
                      : theme.colors.text,
                  }
                ]}
              >
                {size.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Industries */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Preferred Industries</Text>
        <View style={styles.optionsContainer}>
          {INDUSTRIES.map((industry) => (
            <TouchableOpacity
              key={industry}
              style={[
                styles.optionButton,
                {
                  backgroundColor: profile.preferences.industries.includes(industry)
                    ? theme.colors.primary
                    : theme.colors.card,
                }
              ]}
              onPress={() => toggleIndustry(industry)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: profile.preferences.industries.includes(industry)
                      ? 'white'
                      : theme.colors.text,
                  }
                ]}
              >
                {industry}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPrivacy = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Privacy Settings
      </Text>

      <View style={styles.switchContainer}>
        <View style={styles.switchInfo}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Profile Visibility</Text>
          <Text style={[styles.switchDescription, { color: theme.colors.gray }]}>
            Make your profile visible to recruiters and employers
          </Text>
        </View>
        <Switch
          value={profile.privacy.profileVisible}
          onValueChange={(value) => updatePrivacy('profileVisible', value)}
          trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
        />
      </View>

      <View style={styles.switchContainer}>
        <View style={styles.switchInfo}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Show Salary Expectations</Text>
          <Text style={[styles.switchDescription, { color: theme.colors.gray }]}>
            Display your salary range on your profile
          </Text>
        </View>
        <Switch
          value={profile.privacy.showSalaryExpectations}
          onValueChange={(value) => updatePrivacy('showSalaryExpectations', value)}
          trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
        />
      </View>

      <View style={styles.switchContainer}>
        <View style={styles.switchInfo}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Allow Recruiter Contact</Text>
          <Text style={[styles.switchDescription, { color: theme.colors.gray }]}>
            Allow recruiters to contact you directly
          </Text>
        </View>
        <Switch
          value={profile.privacy.allowRecruiterContact}
          onValueChange={(value) => updatePrivacy('allowRecruiterContact', value)}
          trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
        />
      </View>

      <View style={styles.switchContainer}>
        <View style={styles.switchInfo}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Notifications</Text>
          <Text style={[styles.switchDescription, { color: theme.colors.gray }]}>
            Receive job recommendations and updates
          </Text>
        </View>
        <Switch
          value={profile.preferences.notificationsEnabled}
          onValueChange={(value) => updatePreferences('notificationsEnabled', value)}
          trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'personal', label: 'Personal' },
          { key: 'preferences', label: 'Preferences' },
          { key: 'privacy', label: 'Privacy' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === tab.key
                  ? theme.colors.primary
                  : 'transparent',
              }
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab.key
                    ? 'white'
                    : theme.colors.text,
                }
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'personal' && renderPersonalInfo()}
        {activeTab === 'preferences' && renderPreferences()}
        {activeTab === 'privacy' && renderPrivacy()}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton, 
            { 
              backgroundColor: isUpdating ? theme.colors.gray : theme.colors.primary,
              opacity: isUpdating ? 0.7 : 1,
            }
          ]}
          onPress={saveProfile}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <View style={styles.savingContainer}>
              <ActivityIndicator size="small" color="white" style={styles.savingSpinner} />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillTagText: {
    color: 'white',
    fontSize: 14,
    marginRight: 4,
  },
  removeSkill: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addSkillContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  skillInput: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  salaryInput: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  salaryDash: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingSpinner: {
    marginRight: 8,
  },
});