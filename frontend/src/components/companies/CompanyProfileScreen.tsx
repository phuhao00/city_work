import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  size: string;
  founded: number;
  website: string;
  description: string;
  culture: string[];
  benefits: string[];
  openPositions: number;
  followers: number;
  isFollowing: boolean;
  rating: number;
  reviews: number;
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  postedDate: Date;
  applicants: number;
}

interface CompanyProfileScreenProps {
  route?: {
    params: {
      companyId: string;
    };
  };
  navigation?: any;
}

export const CompanyProfileScreen: React.FC<CompanyProfileScreenProps> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'reviews'>('overview');
  const [loading, setLoading] = useState(true);

  const companyId = route?.params?.companyId || '1';

  // Mock data - replace with actual API calls
  const mockCompany: Company = {
    id: '1',
    name: 'TechCorp Solutions',
    logo: 'https://via.placeholder.com/100x100/4A90E2/FFFFFF?text=TC',
    industry: 'Technology',
    location: 'San Francisco, CA',
    size: '1000-5000 employees',
    founded: 2010,
    website: 'https://techcorp.com',
    description: 'TechCorp Solutions is a leading technology company specializing in innovative software solutions for businesses worldwide. We are committed to creating cutting-edge products that transform how companies operate and grow.',
    culture: ['Innovation', 'Collaboration', 'Work-Life Balance', 'Diversity & Inclusion'],
    benefits: [
      'Health, Dental & Vision Insurance',
      'Flexible Work Hours',
      'Remote Work Options',
      'Professional Development Budget',
      'Stock Options',
      'Unlimited PTO',
      'Gym Membership',
      'Free Meals',
    ],
    openPositions: 15,
    followers: 2847,
    isFollowing: false,
    rating: 4.5,
    reviews: 234,
  };

  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'full-time',
      salary: { min: 120000, max: 180000, currency: 'USD' },
      postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      applicants: 45,
    },
    {
      id: '2',
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      type: 'full-time',
      salary: { min: 100000, max: 150000, currency: 'USD' },
      postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      applicants: 32,
    },
    {
      id: '3',
      title: 'UX Designer',
      department: 'Design',
      location: 'San Francisco, CA',
      type: 'full-time',
      salary: { min: 90000, max: 130000, currency: 'USD' },
      postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      applicants: 28,
    },
    {
      id: '4',
      title: 'Data Scientist Intern',
      department: 'Data Science',
      location: 'San Francisco, CA',
      type: 'internship',
      salary: { min: 25, max: 35, currency: 'USD' },
      postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      applicants: 67,
    },
  ];

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      // Replace with actual API calls
      setCompany(mockCompany);
      setJobs(mockJobs);
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowCompany = async () => {
    if (!company) return;

    try {
      const newFollowingStatus = !company.isFollowing;
      setCompany(prev => prev ? {
        ...prev,
        isFollowing: newFollowingStatus,
        followers: newFollowingStatus ? prev.followers + 1 : prev.followers - 1,
      } : null);
      
      // API call to follow/unfollow company
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const handleApplyToJob = (jobId: string) => {
    Alert.alert(
      'Apply to Job',
      'Would you like to apply to this position?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            // Navigate to application screen or handle application
            navigation?.navigate('JobApplication', { jobId });
          },
        },
      ]
    );
  };

  const formatSalary = (salary: Job['salary']) => {
    const { min, max, currency } = salary;
    if (salary.currency === 'USD' && min < 100) {
      return `$${min}-${max}/hour`;
    }
    return `$${(min / 1000).toFixed(0)}k-${(max / 1000).toFixed(0)}k`;
  };

  const formatDate = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} days ago`;
  };

  const renderJobItem = ({ item }: { item: Job }) => (
    <TouchableOpacity
      style={[styles.jobItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation?.navigate('JobDetail', { jobId: item.id })}
    >
      <View style={styles.jobHeader}>
        <Text style={[styles.jobTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.jobDepartment, { color: theme.colors.textSecondary }]}>
          {item.department}
        </Text>
      </View>
      
      <View style={styles.jobDetails}>
        <Text style={[styles.jobLocation, { color: theme.colors.textSecondary }]}>
          📍 {item.location}
        </Text>
        <Text style={[styles.jobType, { color: theme.colors.textSecondary }]}>
          💼 {item.type}
        </Text>
      </View>
      
      <View style={styles.jobFooter}>
        <Text style={[styles.jobSalary, { color: theme.colors.primary }]}>
          {formatSalary(item.salary)}
        </Text>
        <Text style={[styles.jobPosted, { color: theme.colors.textSecondary }]}>
          {formatDate(item.postedDate)}
        </Text>
      </View>
      
      <View style={styles.jobActions}>
        <Text style={[styles.applicantCount, { color: theme.colors.textSecondary }]}>
          {item.applicants} applicants
        </Text>
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleApplyToJob(item.id)}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          About
        </Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {company?.description}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Company Culture
        </Text>
        <View style={styles.cultureContainer}>
          {company?.culture.map((value, index) => (
            <View
              key={index}
              style={[styles.cultureTag, { backgroundColor: theme.colors.primary + '20' }]}
            >
              <Text style={[styles.cultureText, { color: theme.colors.primary }]}>
                {value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Benefits & Perks
        </Text>
        {company?.benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={[styles.benefitText, { color: theme.colors.textSecondary }]}>
              {benefit}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderJobs = () => (
    <FlatList
      data={jobs}
      renderItem={renderJobItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.jobsList}
      showsVerticalScrollIndicator={false}
    />
  );

  const renderReviews = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.comingSoon, { color: theme.colors.textSecondary }]}>
        Reviews feature coming soon...
      </Text>
    </View>
  );

  if (loading || !company) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading company profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Image source={{ uri: company.logo }} style={styles.logo} />
        <View style={styles.headerInfo}>
          <Text style={[styles.companyName, { color: theme.colors.text }]}>
            {company.name}
          </Text>
          <Text style={[styles.industry, { color: theme.colors.textSecondary }]}>
            {company.industry} • {company.location}
          </Text>
          <Text style={[styles.companySize, { color: theme.colors.textSecondary }]}>
            {company.size} • Founded {company.founded}
          </Text>
          
          <View style={styles.stats}>
            <Text style={[styles.stat, { color: theme.colors.textSecondary }]}>
              ⭐ {company.rating} ({company.reviews} reviews)
            </Text>
            <Text style={[styles.stat, { color: theme.colors.textSecondary }]}>
              👥 {company.followers} followers
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.followButton,
            {
              backgroundColor: company.isFollowing
                ? theme.colors.border
                : theme.colors.primary,
            },
          ]}
          onPress={handleFollowCompany}
        >
          <Text
            style={[
              styles.followButtonText,
              {
                color: company.isFollowing
                  ? theme.colors.text
                  : theme.colors.surface,
              },
            ]}
          >
            {company.isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.websiteButton, { borderColor: theme.colors.primary }]}
          onPress={() => {
            // Open website
          }}
        >
          <Text style={[styles.websiteButtonText, { color: theme.colors.primary }]}>
            Visit Website
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: theme.colors.surface }]}>
        {(['overview', 'jobs', 'reviews'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && {
                borderBottomColor: theme.colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'jobs' && ` (${company.openPositions})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'jobs' && renderJobs()}
        {activeTab === 'reviews' && renderReviews()}
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
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  industry: {
    fontSize: 14,
    marginBottom: 2,
  },
  companySize: {
    fontSize: 14,
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  followButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  websiteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  websiteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  cultureContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cultureTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cultureText: {
    fontSize: 12,
    fontWeight: '600',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
  },
  jobsList: {
    padding: 16,
  },
  jobItem: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  jobHeader: {
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  jobDepartment: {
    fontSize: 14,
  },
  jobDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  jobLocation: {
    fontSize: 12,
  },
  jobType: {
    fontSize: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jobSalary: {
    fontSize: 14,
    fontWeight: '600',
  },
  jobPosted: {
    fontSize: 12,
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicantCount: {
    fontSize: 12,
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  comingSoon: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
});