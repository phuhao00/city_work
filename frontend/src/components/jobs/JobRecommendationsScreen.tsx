import React, { useState, useEffect } from 'react';
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
import { useGetJobsQuery, useSaveJobMutation, Job } from '../../features/jobs/jobsSlice';

interface RecommendationReason {
  type: 'skill_match' | 'location_match' | 'salary_match' | 'company_type' | 'experience_level';
  description: string;
  score: number;
}

interface JobRecommendation extends Job {
  recommendationScore: number;
  reasons: RecommendationReason[];
}

export const JobRecommendationsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { data: jobsData, refetch } = useGetJobsQuery({ page: 1, limit: 50 });
  const [saveJob] = useSaveJobMutation();

  // Mock user preferences (in real app, this would come from user profile)
  const userPreferences = {
    skills: ['React', 'TypeScript', 'Node.js', 'JavaScript'],
    preferredLocation: 'San Francisco',
    salaryRange: { min: 80000, max: 150000 },
    experienceLevel: 'mid',
    preferredCompanySize: 'medium',
    remotePreference: true,
  };

  useEffect(() => {
    if (jobsData?.jobs) {
      generateRecommendations(jobsData.jobs);
    }
  }, [jobsData]);

  const generateRecommendations = (jobs: Job[]) => {
    setIsLoading(true);
    
    const recommendationsWithScores = jobs.map(job => {
      const reasons: RecommendationReason[] = [];
      let totalScore = 0;

      // Skill matching
      const matchingSkills = job.skills.filter(skill => 
        userPreferences.skills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      
      if (matchingSkills.length > 0) {
        const skillScore = (matchingSkills.length / Math.max(job.skills.length, userPreferences.skills.length)) * 40;
        totalScore += skillScore;
        reasons.push({
          type: 'skill_match',
          description: `${matchingSkills.length} matching skills: ${matchingSkills.slice(0, 2).join(', ')}${matchingSkills.length > 2 ? '...' : ''}`,
          score: skillScore,
        });
      }

      // Location matching
      if (job.location.toLowerCase().includes(userPreferences.preferredLocation.toLowerCase())) {
        const locationScore = 25;
        totalScore += locationScore;
        reasons.push({
          type: 'location_match',
          description: `Located in your preferred area: ${job.location}`,
          score: locationScore,
        });
      }

      // Salary matching
      if (job.salaryMin && job.salaryMax) {
        const jobSalaryMid = (job.salaryMin + job.salaryMax) / 2;
        const userSalaryMid = (userPreferences.salaryRange.min + userPreferences.salaryRange.max) / 2;
        const salaryDiff = Math.abs(jobSalaryMid - userSalaryMid) / userSalaryMid;
        
        if (salaryDiff < 0.3) { // Within 30% of preferred salary
          const salaryScore = (1 - salaryDiff) * 20;
          totalScore += salaryScore;
          reasons.push({
            type: 'salary_match',
            description: `Salary range matches your expectations`,
            score: salaryScore,
          });
        }
      }

      // Company type/size (mock logic)
      if (Math.random() > 0.7) { // 30% chance for company match
        const companyScore = 10;
        totalScore += companyScore;
        reasons.push({
          type: 'company_type',
          description: `Company culture aligns with your preferences`,
          score: companyScore,
        });
      }

      // Experience level (mock logic)
      if (Math.random() > 0.6) { // 40% chance for experience match
        const experienceScore = 15;
        totalScore += experienceScore;
        reasons.push({
          type: 'experience_level',
          description: `Experience level matches your background`,
          score: experienceScore,
        });
      }

      return {
        ...job,
        recommendationScore: Math.min(totalScore, 100),
        reasons,
      } as JobRecommendation;
    });

    // Sort by recommendation score and filter out low scores
    const filteredRecommendations = recommendationsWithScores
      .filter(job => job.recommendationScore > 20)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 20); // Top 20 recommendations

    setRecommendations(filteredRecommendations);
    setIsLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      await saveJob(jobId).unwrap();
      Alert.alert('Success', 'Job saved to your list!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save job. Please try again.');
    }
  };

  const handleJobPress = (jobId: string) => {
    navigation.navigate('JobDetail' as never, { jobId } as never);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Salary not specified';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FF9800'; // Orange
    if (score >= 40) return '#2196F3'; // Blue
    return theme.colors.gray;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Potential Match';
  };

  const renderRecommendationItem = ({ item }: { item: JobRecommendation }) => (
    <TouchableOpacity
      style={[styles.jobCard, { backgroundColor: theme.colors.card }]}
      onPress={() => handleJobPress(item._id)}
    >
      {/* Match Score Badge */}
      <View style={styles.scoreContainer}>
        <View
          style={[
            styles.scoreBadge,
            { backgroundColor: getScoreColor(item.recommendationScore) }
          ]}
        >
          <Text style={styles.scoreText}>{Math.round(item.recommendationScore)}%</Text>
        </View>
        <Text style={[styles.scoreLabel, { color: getScoreColor(item.recommendationScore) }]}>
          {getScoreLabel(item.recommendationScore)}
        </Text>
      </View>

      {/* Job Info */}
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
        <Text style={[styles.salary, { color: theme.colors.text }]}>
          {formatSalary(item.salaryMin, item.salaryMax)}
        </Text>
      </View>

      {/* Recommendation Reasons */}
      <View style={styles.reasonsContainer}>
        <Text style={[styles.reasonsTitle, { color: theme.colors.text }]}>
          Why this job matches you:
        </Text>
        {item.reasons.slice(0, 2).map((reason, index) => (
          <View key={index} style={styles.reasonItem}>
            <Text style={[styles.reasonText, { color: theme.colors.gray }]}>
              • {reason.description}
            </Text>
          </View>
        ))}
        {item.reasons.length > 2 && (
          <Text style={[styles.moreReasons, { color: theme.colors.primary }]}>
            +{item.reasons.length - 2} more reasons
          </Text>
        )}
      </View>

      {/* Skills */}
      {item.skills && item.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {item.skills.slice(0, 3).map((skill, index) => {
            const isMatching = userPreferences.skills.some(userSkill => 
              userSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(userSkill.toLowerCase())
            );
            
            return (
              <View
                key={index}
                style={[
                  styles.skillTag,
                  {
                    backgroundColor: isMatching 
                      ? theme.colors.primary + '30' 
                      : theme.colors.gray + '20'
                  }
                ]}
              >
                <Text
                  style={[
                    styles.skillText,
                    {
                      color: isMatching ? theme.colors.primary : theme.colors.gray,
                      fontWeight: isMatching ? '600' : '400',
                    }
                  ]}
                >
                  {skill}
                </Text>
              </View>
            );
          })}
          {item.skills.length > 3 && (
            <Text style={[styles.moreSkills, { color: theme.colors.gray }]}>
              +{item.skills.length - 3} more
            </Text>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.saveButton, { borderColor: theme.colors.primary }]}
          onPress={() => handleSaveJob(item._id)}
        >
          <Text style={[styles.saveButtonText, { color: theme.colors.primary }]}>
            Save
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleJobPress(item._id)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.gray }]}>
          Generating personalized recommendations...
        </Text>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          No Recommendations Available
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.gray }]}>
          Complete your profile to get personalized job recommendations
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Recommended for You
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.gray }]}>
          {recommendations.length} personalized job matches
        </Text>
      </View>

      <FlatList
        data={recommendations}
        renderItem={renderRecommendationItem}
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
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  scoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  jobInfo: {
    marginBottom: 12,
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
    marginBottom: 4,
  },
  salary: {
    fontSize: 16,
    fontWeight: '600',
  },
  reasonsContainer: {
    marginBottom: 12,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  reasonItem: {
    marginBottom: 2,
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 18,
  },
  moreReasons: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
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
  },
  moreSkills: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewButton: {
    flex: 2,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
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
  },
});