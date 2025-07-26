import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface JobFilters {
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'internship';
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  isRemote?: boolean;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industry?: string;
  postedWithin?: '24h' | '3d' | '7d' | '30d';
}

interface AdvancedFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  filters: JobFilters;
  onApplyFilters: (filters: JobFilters) => void;
  onClearFilters: () => void;
}

export const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
}) => {
  const { theme } = useTheme();
  const [localFilters, setLocalFilters] = useState<JobFilters>(filters);
  const [skillInput, setSkillInput] = useState('');

  const jobTypes = [
    { key: 'full-time', label: 'Full-time' },
    { key: 'part-time', label: 'Part-time' },
    { key: 'contract', label: 'Contract' },
    { key: 'internship', label: 'Internship' },
  ];

  const experienceLevels = [
    { key: 'entry', label: 'Entry Level' },
    { key: 'mid', label: 'Mid Level' },
    { key: 'senior', label: 'Senior Level' },
    { key: 'executive', label: 'Executive' },
  ];

  const companySizes = [
    { key: 'startup', label: 'Startup (1-10)' },
    { key: 'small', label: 'Small (11-50)' },
    { key: 'medium', label: 'Medium (51-200)' },
    { key: 'large', label: 'Large (201-1000)' },
    { key: 'enterprise', label: 'Enterprise (1000+)' },
  ];

  const postedWithinOptions = [
    { key: '24h', label: 'Last 24 hours' },
    { key: '3d', label: 'Last 3 days' },
    { key: '7d', label: 'Last week' },
    { key: '30d', label: 'Last month' },
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Media',
    'Government',
    'Non-profit',
  ];

  const handleAddSkill = () => {
    if (skillInput.trim() && !localFilters.skills?.includes(skillInput.trim())) {
      setLocalFilters(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setLocalFilters(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const renderFilterSection = (title: string, children: React.ReactNode) => (
    <View style={styles.filterSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {children}
    </View>
  );

  const renderOptionButtons = (
    options: Array<{ key: string; label: string }>,
    selectedValue: string | undefined,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.optionButtons}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.optionButton,
            { borderColor: theme.colors.border },
            selectedValue === option.key && {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={() => onSelect(selectedValue === option.key ? '' : option.key)}
        >
          <Text
            style={[
              styles.optionButtonText,
              { color: theme.colors.text },
              selectedValue === option.key && { color: 'white' },
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.headerButton, { color: theme.colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Advanced Filters</Text>
          <TouchableOpacity onPress={handleApply}>
            <Text style={[styles.headerButton, { color: theme.colors.primary }]}>Apply</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Location */}
          {renderFilterSection(
            'Location',
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              placeholder="Enter city, state, or country"
              placeholderTextColor={theme.colors.gray}
              value={localFilters.location || ''}
              onChangeText={(text) => setLocalFilters(prev => ({ ...prev, location: text }))}
            />
          )}

          {/* Remote Work */}
          {renderFilterSection(
            'Remote Work',
            <View style={styles.switchContainer}>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>
                Include remote positions
              </Text>
              <Switch
                value={localFilters.isRemote || false}
                onValueChange={(value) => setLocalFilters(prev => ({ ...prev, isRemote: value }))}
                trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
                thumbColor="white"
              />
            </View>
          )}

          {/* Job Type */}
          {renderFilterSection(
            'Job Type',
            renderOptionButtons(
              jobTypes,
              localFilters.type,
              (value) => setLocalFilters(prev => ({ ...prev, type: value as any }))
            )
          )}

          {/* Experience Level */}
          {renderFilterSection(
            'Experience Level',
            renderOptionButtons(
              experienceLevels,
              localFilters.experienceLevel,
              (value) => setLocalFilters(prev => ({ ...prev, experienceLevel: value as any }))
            )
          )}

          {/* Salary Range */}
          {renderFilterSection(
            'Salary Range',
            <View style={styles.salaryContainer}>
              <View style={styles.salaryInputContainer}>
                <Text style={[styles.salaryLabel, { color: theme.colors.gray }]}>Min</Text>
                <TextInput
                  style={[
                    styles.salaryInput,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="$0"
                  placeholderTextColor={theme.colors.gray}
                  value={localFilters.salaryMin?.toString() || ''}
                  onChangeText={(text) => {
                    const value = parseInt(text.replace(/[^0-9]/g, ''));
                    setLocalFilters(prev => ({ ...prev, salaryMin: isNaN(value) ? undefined : value }));
                  }}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.salaryInputContainer}>
                <Text style={[styles.salaryLabel, { color: theme.colors.gray }]}>Max</Text>
                <TextInput
                  style={[
                    styles.salaryInput,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="$200,000"
                  placeholderTextColor={theme.colors.gray}
                  value={localFilters.salaryMax?.toString() || ''}
                  onChangeText={(text) => {
                    const value = parseInt(text.replace(/[^0-9]/g, ''));
                    setLocalFilters(prev => ({ ...prev, salaryMax: isNaN(value) ? undefined : value }));
                  }}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {/* Company Size */}
          {renderFilterSection(
            'Company Size',
            renderOptionButtons(
              companySizes,
              localFilters.companySize,
              (value) => setLocalFilters(prev => ({ ...prev, companySize: value as any }))
            )
          )}

          {/* Industry */}
          {renderFilterSection(
            'Industry',
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionButtons}>
                {industries.map((industry) => (
                  <TouchableOpacity
                    key={industry}
                    style={[
                      styles.optionButton,
                      { borderColor: theme.colors.border },
                      localFilters.industry === industry && {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                    onPress={() => setLocalFilters(prev => ({ 
                      ...prev, 
                      industry: prev.industry === industry ? undefined : industry 
                    }))}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        { color: theme.colors.text },
                        localFilters.industry === industry && { color: 'white' },
                      ]}
                    >
                      {industry}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Posted Within */}
          {renderFilterSection(
            'Posted Within',
            renderOptionButtons(
              postedWithinOptions,
              localFilters.postedWithin,
              (value) => setLocalFilters(prev => ({ ...prev, postedWithin: value as any }))
            )
          )}

          {/* Skills */}
          {renderFilterSection(
            'Required Skills',
            <View>
              <View style={styles.skillInputContainer}>
                <TextInput
                  style={[
                    styles.skillInput,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="Add a skill (e.g., React, Python)"
                  placeholderTextColor={theme.colors.gray}
                  value={skillInput}
                  onChangeText={setSkillInput}
                  onSubmitEditing={handleAddSkill}
                />
                <TouchableOpacity
                  style={[styles.addSkillButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleAddSkill}
                >
                  <Text style={styles.addSkillButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
              {localFilters.skills && localFilters.skills.length > 0 && (
                <View style={styles.skillTags}>
                  {localFilters.skills.map((skill, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.skillTag, { backgroundColor: theme.colors.primary + '20' }]}
                      onPress={() => handleRemoveSkill(skill)}
                    >
                      <Text style={[styles.skillTagText, { color: theme.colors.primary }]}>
                        {skill} ×
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: theme.colors.border }]}
            onPress={handleClear}
          >
            <Text style={[styles.clearButtonText, { color: theme.colors.text }]}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  salaryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  salaryInputContainer: {
    flex: 1,
  },
  salaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  salaryInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  skillInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  skillInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addSkillButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addSkillButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  skillTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});