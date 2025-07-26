import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { 
  useGetCompanyByIdQuery, 
  useGetCompanyJobsQuery,
  useFollowCompanyMutation,
  useUnfollowCompanyMutation,
  useCheckFollowStatusQuery,
} from '../../services/companiesApi';

interface CompanyStats {
  totalEmployees: number;
  openPositions: number;
  averageRating: number;
  foundedYear: number;
  headquarters: string;
  website: string;
  industry: string;
  companySize: string;
}

interface CompanyBenefit {
  icon: string;
  title: string;
  description: string;
}

interface CompanyReview {
  id: string;
  rating: number;
  title: string;
  pros: string;
  cons: string;
  author: string;
  position: string;
  date: string;
  isCurrentEmployee: boolean;
}

export const CompanyDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { companyId } = route.params as { companyId: string };
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'reviews' | 'culture'>('overview');
  
  const { data: company, isLoading, error } = useGetCompanyByIdQuery(companyId);
  const { data: jobsData } = useGetCompanyJobsQuery(companyId);
  const { data: followStatus } = useCheckFollowStatusQuery(companyId);
  const [followCompany] = useFollowCompanyMutation();
  const [unfollowCompany] = useUnfollowCompanyMutation();

  // Mock data for enhanced company information
  const companyStats: CompanyStats = {
    totalEmployees: 1250,
    openPositions: 23,
    averageRating: 4.2,
    foundedYear: 2010,
    headquarters: 'San Francisco, CA',
    website: 'https://example.com',
    industry: 'Technology',
    companySize: 'Large (1000+ employees)',
  };

  const companyBenefits: CompanyBenefit[] = [
    {
      icon: '🏥',
      title: 'Health Insurance',
      description: 'Comprehensive medical, dental, and vision coverage',
    },
    {
      icon: '💰',
      title: 'Competitive Salary',
      description: 'Above market rate compensation with equity options',
    },
    {
      icon: '🏠',
      title: 'Remote Work',
      description: 'Flexible work from home options',
    },
    {
      icon: '📚',
      title: 'Learning Budget',
      description: '$2000 annual budget for courses and conferences',
    },
    {
      icon: '🌴',
      title: 'Unlimited PTO',
      description: 'Take time off when you need it',
    },
    {
      icon: '🍎',
      title: 'Free Meals',
      description: 'Catered lunch and snacks in the office',
    },
  ];

  const companyReviews: CompanyReview[] = [
    {
      id: '1',
      rating: 5,
      title: 'Great place to work with amazing culture',
      pros: 'Excellent work-life balance, supportive management, cutting-edge technology',
      cons: 'Fast-paced environment might not suit everyone',
      author: 'Software Engineer',
      position: 'Current Employee',
      date: '2024-01-15',
      isCurrentEmployee: true,
    },
    {
      id: '2',
      rating: 4,
      title: 'Good growth opportunities',
      pros: 'Learning opportunities, good benefits, collaborative team',
      cons: 'Limited parking, can be stressful during deadlines',
      author: 'Product Manager',
      position: 'Former Employee',
      date: '2023-12-10',
      isCurrentEmployee: false,
    },
    {
      id: '3',
      rating: 4,
      title: 'Innovative and forward-thinking',
      pros: 'Latest technology stack, flexible hours, great mentorship',
      cons: 'High expectations, competitive environment',
      author: 'Senior Developer',
      position: 'Current Employee',
      date: '2024-01-08',
      isCurrentEmployee: true,
    },
  ];

  useEffect(() => {
    // Update follow status when API data is available
    if (followStatus) {
      setIsFollowing(followStatus.isFollowing);
    }
  }, [followStatus]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowCompany(companyId).unwrap();
        setIsFollowing(false);
        Alert.alert('Success', 'Unfollowed company');
      } else {
        await followCompany(companyId).unwrap();
        setIsFollowing(true);
        Alert.alert('Success', 'Following company');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const handleWebsitePress = () => {
    Linking.openURL(companyStats.website);
  };

  const handleJobPress = (jobId: string) => {
    navigation.navigate('JobDetail' as never, { jobId } as never);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={[styles.star, { color: i <= rating ? '#FFD700' : theme.colors.gray }]}>
          ★
        </Text>
      );
    }
    return stars;
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Company Stats */}
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {companyStats.totalEmployees.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.gray }]}>Employees</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {companyStats.openPositions}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.gray }]}>Open Jobs</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {companyStats.averageRating}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.gray }]}>Rating</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {new Date().getFullYear() - companyStats.foundedYear}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.gray }]}>Years</Text>
        </View>
      </View>

      {/* Company Info */}
      <View style={[styles.infoSection, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Company Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.colors.gray }]}>Industry:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>{companyStats.industry}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.colors.gray }]}>Company Size:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>{companyStats.companySize}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.colors.gray }]}>Founded:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>{companyStats.foundedYear}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.colors.gray }]}>Headquarters:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>{companyStats.headquarters}</Text>
        </View>
        
        <TouchableOpacity style={styles.infoRow} onPress={handleWebsitePress}>
          <Text style={[styles.infoLabel, { color: theme.colors.gray }]}>Website:</Text>
          <Text style={[styles.infoValue, styles.link, { color: theme.colors.primary }]}>
            {companyStats.website}
          </Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={[styles.aboutSection, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About</Text>
        <Text style={[styles.aboutText, { color: theme.colors.text }]}>
          {company?.description || 'We are a leading technology company focused on innovation and excellence. Our mission is to create products that make a positive impact on the world while fostering a culture of creativity, collaboration, and continuous learning.'}
        </Text>
      </View>

      {/* Benefits */}
      <View style={[styles.benefitsSection, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Benefits & Perks</Text>
        <View style={styles.benefitsGrid}>
          {companyBenefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>{benefit.icon}</Text>
              <Text style={[styles.benefitTitle, { color: theme.colors.text }]}>
                {benefit.title}
              </Text>
              <Text style={[styles.benefitDescription, { color: theme.colors.gray }]}>
                {benefit.description}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderJobs = () => (
    <View style={styles.tabContent}>
      {jobsData?.jobs && jobsData.jobs.length > 0 ? (
        <FlatList
          data={jobsData.jobs}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.jobCard, { backgroundColor: theme.colors.card }]}
              onPress={() => handleJobPress(item._id)}
            >
              <Text style={[styles.jobTitle, { color: theme.colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.jobLocation, { color: theme.colors.gray }]}>
                {item.location} • {item.type}
              </Text>
              <Text style={[styles.jobSalary, { color: theme.colors.primary }]}>
                {item.salaryMin && item.salaryMax 
                  ? `$${item.salaryMin.toLocaleString()} - $${item.salaryMax.toLocaleString()}`
                  : 'Salary not specified'
                }
              </Text>
              {item.skills && item.skills.length > 0 && (
                <View style={styles.skillsContainer}>
                  {item.skills.slice(0, 3).map((skill, index) => (
                    <View key={index} style={[styles.skillTag, { backgroundColor: theme.colors.primary + '20' }]}>
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
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.colors.gray }]}>
            No open positions at the moment
          </Text>
        </View>
      )}
    </View>
  );

  const renderReviews = () => (
    <View style={styles.tabContent}>
      <View style={[styles.reviewsHeader, { backgroundColor: theme.colors.card }]}>
        <View style={styles.ratingOverview}>
          <Text style={[styles.overallRating, { color: theme.colors.text }]}>
            {companyStats.averageRating}
          </Text>
          <View style={styles.starsContainer}>
            {renderStars(Math.round(companyStats.averageRating))}
          </View>
          <Text style={[styles.reviewCount, { color: theme.colors.gray }]}>
            Based on {companyReviews.length} reviews
          </Text>
        </View>
      </View>

      <FlatList
        data={companyReviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.reviewCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.reviewHeader}>
              <View style={styles.starsContainer}>
                {renderStars(item.rating)}
              </View>
              <Text style={[styles.reviewDate, { color: theme.colors.gray }]}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            
            <Text style={[styles.reviewTitle, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            
            <View style={styles.reviewAuthor}>
              <Text style={[styles.authorPosition, { color: theme.colors.primary }]}>
                {item.author}
              </Text>
              <Text style={[styles.employmentStatus, { color: theme.colors.gray }]}>
                {item.position} • {item.isCurrentEmployee ? 'Current' : 'Former'} Employee
              </Text>
            </View>

            <View style={styles.prosConsContainer}>
              <View style={styles.prosContainer}>
                <Text style={[styles.prosConsTitle, { color: '#4CAF50' }]}>Pros</Text>
                <Text style={[styles.prosConsText, { color: theme.colors.text }]}>
                  {item.pros}
                </Text>
              </View>
              
              <View style={styles.consContainer}>
                <Text style={[styles.prosConsTitle, { color: '#F44336' }]}>Cons</Text>
                <Text style={[styles.prosConsText, { color: theme.colors.text }]}>
                  {item.cons}
                </Text>
              </View>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderCulture = () => (
    <View style={styles.tabContent}>
      <View style={[styles.cultureSection, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Company Culture</Text>
        
        <View style={styles.cultureItem}>
          <Text style={[styles.cultureTitle, { color: theme.colors.text }]}>Our Values</Text>
          <Text style={[styles.cultureText, { color: theme.colors.gray }]}>
            Innovation, Integrity, Collaboration, Excellence, and Customer Focus drive everything we do.
          </Text>
        </View>

        <View style={styles.cultureItem}>
          <Text style={[styles.cultureTitle, { color: theme.colors.text }]}>Work Environment</Text>
          <Text style={[styles.cultureText, { color: theme.colors.gray }]}>
            Open, collaborative workspace with flexible hours and remote work options. We believe in work-life balance.
          </Text>
        </View>

        <View style={styles.cultureItem}>
          <Text style={[styles.cultureTitle, { color: theme.colors.text }]}>Growth & Development</Text>
          <Text style={[styles.cultureText, { color: theme.colors.gray }]}>
            Continuous learning opportunities, mentorship programs, and clear career progression paths.
          </Text>
        </View>

        <View style={styles.cultureItem}>
          <Text style={[styles.cultureTitle, { color: theme.colors.text }]}>Diversity & Inclusion</Text>
          <Text style={[styles.cultureText, { color: theme.colors.gray }]}>
            We celebrate diversity and are committed to creating an inclusive environment for all employees.
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !company) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Failed to load company details
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
          <View style={styles.companyInfo}>
            <Image
              source={{ uri: company.logo || 'https://via.placeholder.com/80' }}
              style={styles.companyLogo}
            />
            <View style={styles.companyDetails}>
              <Text style={[styles.companyName, { color: theme.colors.text }]}>
                {company.name}
              </Text>
              <Text style={[styles.companyLocation, { color: theme.colors.gray }]}>
                {companyStats.headquarters}
              </Text>
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  {renderStars(Math.round(companyStats.averageRating))}
                </View>
                <Text style={[styles.ratingText, { color: theme.colors.gray }]}>
                  {companyStats.averageRating} ({companyReviews.length} reviews)
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            style={[
              styles.followButton,
              {
                backgroundColor: isFollowing ? theme.colors.gray : theme.colors.primary,
              }
            ]}
            onPress={handleFollow}
          >
            <Text style={styles.followButtonText}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'jobs', label: `Jobs (${jobsData?.jobs?.length || 0})` },
            { key: 'reviews', label: 'Reviews' },
            { key: 'culture', label: 'Culture' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                {
                  borderBottomColor: activeTab === tab.key
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
                      ? theme.colors.primary
                      : theme.colors.gray,
                  }
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'jobs' && renderJobs()}
        {activeTab === 'reviews' && renderReviews()}
        {activeTab === 'culture' && renderCulture()}
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
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  companyLogo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  companyDetails: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyLocation: {
    fontSize: 16,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  star: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 14,
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  infoSection: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  link: {
    textDecorationLine: 'underline',
  },
  aboutSection: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
  },
  benefitsSection: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitItem: {
    width: '48%',
    marginBottom: 20,
  },
  benefitIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  jobCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  jobLocation: {
    fontSize: 14,
    marginBottom: 4,
  },
  jobSalary: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
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
  },
  moreSkills: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
  },
  reviewsHeader: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  ratingOverview: {
    alignItems: 'center',
  },
  overallRating: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reviewCount: {
    fontSize: 14,
    marginTop: 4,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reviewAuthor: {
    marginBottom: 12,
  },
  authorPosition: {
    fontSize: 14,
    fontWeight: '600',
  },
  employmentStatus: {
    fontSize: 12,
  },
  prosConsContainer: {
    gap: 12,
  },
  prosContainer: {
    marginBottom: 8,
  },
  consContainer: {},
  prosConsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  prosConsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  cultureSection: {
    padding: 20,
    borderRadius: 12,
  },
  cultureItem: {
    marginBottom: 20,
  },
  cultureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cultureText: {
    fontSize: 14,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});