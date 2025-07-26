import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface UserSettings {
  notifications: {
    jobAlerts: boolean;
    applicationUpdates: boolean;
    messages: boolean;
    companyUpdates: boolean;
    weeklyDigest: boolean;
    pushNotifications: boolean;
    emailNotifications: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'connections';
    showSalaryExpectations: boolean;
    showLocation: boolean;
    allowRecruiterContact: boolean;
  };
  jobPreferences: {
    jobTypes: string[];
    industries: string[];
    locations: string[];
    salaryRange: {
      min: number;
      max: number;
      currency: string;
    };
    remoteWork: boolean;
    willingToRelocate: boolean;
  };
  account: {
    language: string;
    timezone: string;
    currency: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

interface SettingsScreenProps {
  navigation?: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      jobAlerts: true,
      applicationUpdates: true,
      messages: true,
      companyUpdates: false,
      weeklyDigest: true,
      pushNotifications: true,
      emailNotifications: true,
    },
    privacy: {
      profileVisibility: 'public',
      showSalaryExpectations: true,
      showLocation: true,
      allowRecruiterContact: true,
    },
    jobPreferences: {
      jobTypes: ['full-time', 'contract'],
      industries: ['Technology', 'Finance'],
      locations: ['San Francisco', 'Remote'],
      salaryRange: {
        min: 80000,
        max: 150000,
        currency: 'USD',
      },
      remoteWork: true,
      willingToRelocate: false,
    },
    account: {
      language: 'English',
      timezone: 'PST',
      currency: 'USD',
      theme: 'light',
    },
  });

  const [activeSection, setActiveSection] = useState<string>('notifications');
  const [showJobTypesModal, setShowJobTypesModal] = useState(false);
  const [showIndustriesModal, setShowIndustriesModal] = useState(false);
  const [showLocationsModal, setShowLocationsModal] = useState(false);

  const jobTypeOptions = [
    'full-time',
    'part-time',
    'contract',
    'freelance',
    'internship',
    'temporary',
  ];

  const industryOptions = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Marketing',
    'Sales',
    'Design',
    'Engineering',
    'Consulting',
    'Non-profit',
  ];

  const locationOptions = [
    'San Francisco',
    'New York',
    'Los Angeles',
    'Chicago',
    'Boston',
    'Seattle',
    'Austin',
    'Remote',
    'Hybrid',
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Replace with actual API call to load user settings
      console.log('Loading user settings...');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      // Replace with actual API call to save settings
      console.log('Saving settings...', settings);
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const updateNotificationSetting = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updatePrivacySetting = (key: keyof UserSettings['privacy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  const updateJobPreference = (key: keyof UserSettings['jobPreferences'], value: any) => {
    setSettings(prev => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        [key]: value,
      },
    }));
  };

  const updateAccountSetting = (key: keyof UserSettings['account'], value: any) => {
    setSettings(prev => ({
      ...prev,
      account: {
        ...prev.account,
        [key]: value,
      },
    }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Handle account deletion
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            // Handle logout
            navigation?.navigate('Login');
          },
        },
      ]
    );
  };

  const renderMultiSelectModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: string[],
    selectedValues: string[],
    onSelectionChange: (values: string[]) => void
  ) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  const newSelection = selectedValues.includes(item)
                    ? selectedValues.filter(v => v !== item)
                    : [...selectedValues, item];
                  onSelectionChange(newSelection);
                }}
              >
                <Text style={[styles.optionText, { color: theme.colors.text }]}>
                  {item}
                </Text>
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: selectedValues.includes(item)
                        ? theme.colors.primary
                        : 'transparent',
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  {selectedValues.includes(item) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            style={styles.optionsList}
          />
          
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderNotificationsSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Notifications
      </Text>
      
      {Object.entries(settings.notifications).map(([key, value]) => (
        <View key={key} style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </Text>
          <Switch
            value={value}
            onValueChange={(newValue) =>
              updateNotificationSetting(key as keyof UserSettings['notifications'], newValue)
            }
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>
      ))}
    </View>
  );

  const renderPrivacySection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Privacy
      </Text>
      
      <View style={styles.settingRow}>
        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
          Profile Visibility
        </Text>
        <View style={styles.segmentedControl}>
          {(['public', 'private', 'connections'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.segmentButton,
                {
                  backgroundColor: settings.privacy.profileVisibility === option
                    ? theme.colors.primary
                    : 'transparent',
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => updatePrivacySetting('profileVisibility', option)}
            >
              <Text
                style={[
                  styles.segmentText,
                  {
                    color: settings.privacy.profileVisibility === option
                      ? theme.colors.surface
                      : theme.colors.primary,
                  },
                ]}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {['showSalaryExpectations', 'showLocation', 'allowRecruiterContact'].map((key) => (
        <View key={key} style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </Text>
          <Switch
            value={settings.privacy[key as keyof UserSettings['privacy']] as boolean}
            onValueChange={(newValue) =>
              updatePrivacySetting(key as keyof UserSettings['privacy'], newValue)
            }
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>
      ))}
    </View>
  );

  const renderJobPreferencesSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Job Preferences
      </Text>
      
      <TouchableOpacity
        style={styles.settingRow}
        onPress={() => setShowJobTypesModal(true)}
      >
        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
          Job Types
        </Text>
        <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
          {settings.jobPreferences.jobTypes.join(', ')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingRow}
        onPress={() => setShowIndustriesModal(true)}
      >
        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
          Industries
        </Text>
        <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
          {settings.jobPreferences.industries.join(', ')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingRow}
        onPress={() => setShowLocationsModal(true)}
      >
        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
          Preferred Locations
        </Text>
        <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
          {settings.jobPreferences.locations.join(', ')}
        </Text>
      </TouchableOpacity>

      <View style={styles.settingRow}>
        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
          Salary Range
        </Text>
        <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
          ${settings.jobPreferences.salaryRange.min.toLocaleString()} - 
          ${settings.jobPreferences.salaryRange.max.toLocaleString()}
        </Text>
      </View>

      <View style={styles.settingRow}>
        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
          Remote Work
        </Text>
        <Switch
          value={settings.jobPreferences.remoteWork}
          onValueChange={(value) => updateJobPreference('remoteWork', value)}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={theme.colors.surface}
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
          Willing to Relocate
        </Text>
        <Switch
          value={settings.jobPreferences.willingToRelocate}
          onValueChange={(value) => updateJobPreference('willingToRelocate', value)}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={theme.colors.surface}
        />
      </View>
    </View>
  );

  const renderAccountSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Account
      </Text>
      
      <View style={styles.settingRow}>
        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
          Theme
        </Text>
        <TouchableOpacity
          style={[styles.themeButton, { borderColor: theme.colors.primary }]}
          onPress={toggleTheme}
        >
          <Text style={[styles.themeButtonText, { color: theme.colors.primary }]}>
            {theme.dark ? 'Dark' : 'Light'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.settingRow}>
        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
          Language
        </Text>
        <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
          {settings.account.language}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingRow}>
        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
          Timezone
        </Text>
        <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
          {settings.account.timezone}
        </Text>
      </TouchableOpacity>

      <View style={styles.dangerZone}>
        <Text style={[styles.dangerTitle, { color: '#F44336' }]}>
          Danger Zone
        </Text>
        
        <TouchableOpacity
          style={[styles.dangerButton, { borderColor: '#F44336' }]}
          onPress={handleLogout}
        >
          <Text style={[styles.dangerButtonText, { color: '#F44336' }]}>
            Logout
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.dangerButton, { borderColor: '#F44336' }]}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.dangerButtonText, { color: '#F44336' }]}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const sections = [
    { key: 'notifications', label: 'Notifications', component: renderNotificationsSection },
    { key: 'privacy', label: 'Privacy', component: renderPrivacySection },
    { key: 'jobPreferences', label: 'Job Preferences', component: renderJobPreferencesSection },
    { key: 'account', label: 'Account', component: renderAccountSection },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Section Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {sections.map((section) => (
          <TouchableOpacity
            key={section.key}
            style={[
              styles.tab,
              {
                backgroundColor: activeSection === section.key
                  ? theme.colors.primary
                  : theme.colors.surface,
              },
            ]}
            onPress={() => setActiveSection(section.key)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeSection === section.key
                    ? theme.colors.surface
                    : theme.colors.text,
                },
              ]}
            >
              {section.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content}>
        {sections.find(s => s.key === activeSection)?.component()}
        
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={saveSettings}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      {renderMultiSelectModal(
        showJobTypesModal,
        () => setShowJobTypesModal(false),
        'Select Job Types',
        jobTypeOptions,
        settings.jobPreferences.jobTypes,
        (values) => updateJobPreference('jobTypes', values)
      )}

      {renderMultiSelectModal(
        showIndustriesModal,
        () => setShowIndustriesModal(false),
        'Select Industries',
        industryOptions,
        settings.jobPreferences.industries,
        (values) => updateJobPreference('industries', values)
      )}

      {renderMultiSelectModal(
        showLocationsModal,
        () => setShowLocationsModal(false),
        'Select Locations',
        locationOptions,
        settings.jobPreferences.locations,
        (values) => updateJobPreference('locations', values)
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
    marginRight: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  themeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dangerZone: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dangerButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});