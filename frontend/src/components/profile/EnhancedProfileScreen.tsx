import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '../../services/userApi';
import {
  EnhancedButton,
  EnhancedCard,
  EnhancedInput,
  BottomSheet,
  toastManager,
} from '../ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EnhancedProfileScreenProps {
  navigation?: any;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  title?: string;
  company?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: {
    company: string;
    position: string;
    duration: string;
    description?: string;
  }[];
  education?: {
    school: string;
    degree: string;
    field: string;
    year: string;
  }[];
  languages?: {
    name: string;
    level: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
  }[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  preferences?: {
    jobType: string[];
    salaryRange: [number, number];
    locations: string[];
    remote: boolean;
  };
  stats?: {
    profileViews: number;
    applicationsSent: number;
    savedJobs: number;
  };
}

export const EnhancedProfileScreen: React.FC<EnhancedProfileScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [editSection, setEditSection] = useState<string>('');
  const [editData, setEditData] = useState<any>({});

  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = useGetUserProfileQuery();

  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

  const profile: UserProfile | undefined = profileData?.data;

  const handleEditSection = useCallback((section: string, data: any = {}) => {
    setEditSection(section);
    setEditData(data);
    setShowEditSheet(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    try {
      await updateProfile({
        [editSection]: editData,
      }).unwrap();
      
      toastManager.show({
        message: '更新成功',
        type: 'success',
        duration: 2000,
      });
      
      setShowEditSheet(false);
      refetch();
    } catch (error) {
      toastManager.show({
        message: '更新失败，请重试',
        type: 'error',
        duration: 3000,
      });
    }
  }, [editSection, editData, updateProfile, refetch]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      '确认退出',
      '您确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '退出',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement logout logic
            navigation?.navigate('Login');
          },
        },
      ]
    );
  }, [navigation]);

  const renderHeader = () => (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>个人资料</Text>
          <EnhancedButton
            title=""
            onPress={() => navigation?.navigate('Settings')}
            variant="ghost"
            size="medium"
            icon="settings-outline"
            style={styles.settingsButton}
          />
        </View>
        
        {profile && (
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: profile.avatar || 'https://via.placeholder.com/120x120?text=Avatar'
                }}
                style={styles.avatar}
              />
              <EnhancedButton
                title=""
                onPress={() => handleEditSection('avatar')}
                variant="primary"
                size="small"
                icon="camera"
                style={styles.avatarEditButton}
              />
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileTitle}>
                {profile.title || '添加职位标题'}
              </Text>
              <Text style={styles.profileLocation}>
                {profile.location || '添加位置'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </LinearGradient>
  );

  const renderStats = () => {
    if (!profile?.stats) return null;

    return (
      <EnhancedCard style={styles.statsCard} variant="elevated">
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {profile.stats.profileViews}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.gray }]}>
              资料浏览
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {profile.stats.applicationsSent}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.gray }]}>
              已申请
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {profile.stats.savedJobs}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.gray }]}>
              已收藏
            </Text>
          </View>
        </View>
      </EnhancedCard>
    );
  };

  const renderBasicInfo = () => (
    <EnhancedCard style={styles.sectionCard} variant="outlined">
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="person" size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            基本信息
          </Text>
        </View>
        <EnhancedButton
          title=""
          onPress={() => handleEditSection('basicInfo', {
            name: profile?.name,
            email: profile?.email,
            phone: profile?.phone,
            title: profile?.title,
            company: profile?.company,
            location: profile?.location,
            bio: profile?.bio,
          })}
          variant="ghost"
          size="small"
          icon="create-outline"
          style={styles.editButton}
        />
      </View>
      
      <View style={styles.infoList}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.gray }]}>邮箱</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>
            {profile?.email || '未设置'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.gray }]}>电话</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>
            {profile?.phone || '未设置'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.gray }]}>公司</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text }]}>
            {profile?.company || '未设置'}
          </Text>
        </View>
        {profile?.bio && (
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: theme.colors.gray }]}>个人简介</Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {profile.bio}
            </Text>
          </View>
        )}
      </View>
    </EnhancedCard>
  );

  const renderSkills = () => (
    <EnhancedCard style={styles.sectionCard} variant="outlined">
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="code-slash" size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            技能专长
          </Text>
        </View>
        <EnhancedButton
          title=""
          onPress={() => handleEditSection('skills', profile?.skills || [])}
          variant="ghost"
          size="small"
          icon="create-outline"
          style={styles.editButton}
        />
      </View>
      
      {profile?.skills && profile.skills.length > 0 ? (
        <View style={styles.skillsContainer}>
          {profile.skills.map((skill, index) => (
            <View key={index} style={[styles.skillTag, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.skillText, { color: theme.colors.primary }]}>
                {skill}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: theme.colors.gray }]}>
          添加您的技能专长
        </Text>
      )}
    </EnhancedCard>
  );

  const renderExperience = () => (
    <EnhancedCard style={styles.sectionCard} variant="outlined">
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="briefcase" size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            工作经历
          </Text>
        </View>
        <EnhancedButton
          title=""
          onPress={() => handleEditSection('experience', profile?.experience || [])}
          variant="ghost"
          size="small"
          icon="create-outline"
          style={styles.editButton}
        />
      </View>
      
      {profile?.experience && profile.experience.length > 0 ? (
        <View style={styles.experienceList}>
          {profile.experience.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <Text style={[styles.experiencePosition, { color: theme.colors.text }]}>
                {exp.position}
              </Text>
              <Text style={[styles.experienceCompany, { color: theme.colors.primary }]}>
                {exp.company}
              </Text>
              <Text style={[styles.experienceDuration, { color: theme.colors.gray }]}>
                {exp.duration}
              </Text>
              {exp.description && (
                <Text style={[styles.experienceDescription, { color: theme.colors.gray }]}>
                  {exp.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: theme.colors.gray }]}>
          添加您的工作经历
        </Text>
      )}
    </EnhancedCard>
  );

  const renderEducation = () => (
    <EnhancedCard style={styles.sectionCard} variant="outlined">
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="school" size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            教育背景
          </Text>
        </View>
        <EnhancedButton
          title=""
          onPress={() => handleEditSection('education', profile?.education || [])}
          variant="ghost"
          size="small"
          icon="create-outline"
          style={styles.editButton}
        />
      </View>
      
      {profile?.education && profile.education.length > 0 ? (
        <View style={styles.educationList}>
          {profile.education.map((edu, index) => (
            <View key={index} style={styles.educationItem}>
              <Text style={[styles.educationDegree, { color: theme.colors.text }]}>
                {edu.degree} - {edu.field}
              </Text>
              <Text style={[styles.educationSchool, { color: theme.colors.primary }]}>
                {edu.school}
              </Text>
              <Text style={[styles.educationYear, { color: theme.colors.gray }]}>
                {edu.year}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: theme.colors.gray }]}>
          添加您的教育背景
        </Text>
      )}
    </EnhancedCard>
  );

  const renderQuickActions = () => (
    <EnhancedCard style={styles.actionsCard} variant="outlined">
      <Text style={[styles.actionsTitle, { color: theme.colors.text }]}>
        快捷操作
      </Text>
      <View style={styles.actionsList}>
        <EnhancedButton
          title="我的申请"
          onPress={() => navigation?.navigate('MyApplications')}
          variant="outline"
          size="medium"
          icon="document-text"
          style={styles.actionButton}
        />
        <EnhancedButton
          title="收藏的职位"
          onPress={() => navigation?.navigate('SavedJobs')}
          variant="outline"
          size="medium"
          icon="heart"
          style={styles.actionButton}
        />
        <EnhancedButton
          title="简历管理"
          onPress={() => navigation?.navigate('ResumeManager')}
          variant="outline"
          size="medium"
          icon="document"
          style={styles.actionButton}
        />
        <EnhancedButton
          title="账户设置"
          onPress={() => navigation?.navigate('Settings')}
          variant="outline"
          size="medium"
          icon="settings"
          style={styles.actionButton}
        />
      </View>
      
      <EnhancedButton
        title="退出登录"
        onPress={handleLogout}
        variant="outline"
        size="medium"
        icon="log-out"
        style={[styles.logoutButton, { borderColor: '#FF5722' }]}
        textStyle={{ color: '#FF5722' }}
      />
    </EnhancedCard>
  );

  const renderEditSheet = () => (
    <BottomSheet
      visible={showEditSheet}
      onClose={() => setShowEditSheet(false)}
      title={`编辑${editSection === 'basicInfo' ? '基本信息' : 
                editSection === 'skills' ? '技能专长' : 
                editSection === 'experience' ? '工作经历' : 
                editSection === 'education' ? '教育背景' : '信息'}`}
      snapPoints={[0.8]}
    >
      <View style={styles.editContent}>
        {editSection === 'basicInfo' && (
          <View style={styles.editForm}>
            <EnhancedInput
              label="姓名"
              value={editData.name || ''}
              onChangeText={(value) => setEditData(prev => ({ ...prev, name: value }))}
              placeholder="输入您的姓名"
              variant="outlined"
            />
            <EnhancedInput
              label="职位标题"
              value={editData.title || ''}
              onChangeText={(value) => setEditData(prev => ({ ...prev, title: value }))}
              placeholder="例如：高级前端工程师"
              variant="outlined"
            />
            <EnhancedInput
              label="公司"
              value={editData.company || ''}
              onChangeText={(value) => setEditData(prev => ({ ...prev, company: value }))}
              placeholder="当前工作公司"
              variant="outlined"
            />
            <EnhancedInput
              label="位置"
              value={editData.location || ''}
              onChangeText={(value) => setEditData(prev => ({ ...prev, location: value }))}
              placeholder="所在城市"
              variant="outlined"
            />
            <EnhancedInput
              label="个人简介"
              value={editData.bio || ''}
              onChangeText={(value) => setEditData(prev => ({ ...prev, bio: value }))}
              placeholder="简单介绍一下自己"
              variant="outlined"
              multiline
              numberOfLines={4}
            />
          </View>
        )}
        
        <View style={styles.editActions}>
          <EnhancedButton
            title="取消"
            onPress={() => setShowEditSheet(false)}
            variant="outline"
            size="medium"
            style={styles.cancelButton}
          />
          <EnhancedButton
            title={isUpdating ? "保存中..." : "保存"}
            onPress={handleSaveEdit}
            variant="primary"
            size="medium"
            loading={isUpdating}
            disabled={isUpdating}
            style={styles.saveButton}
          />
        </View>
      </View>
    </BottomSheet>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.gray }]}>
            加载中...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.gray} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            加载失败
          </Text>
          <Text style={[styles.errorSubtitle, { color: theme.colors.gray }]}>
            无法加载个人资料，请重试
          </Text>
          <EnhancedButton
            title="重试"
            onPress={() => refetch()}
            variant="outline"
            size="medium"
            icon="refresh"
            style={styles.retryButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderStats()}
        {renderBasicInfo()}
        {renderSkills()}
        {renderExperience()}
        {renderEducation()}
        {renderQuickActions()}
      </ScrollView>
      
      {renderEditSheet()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsCard: {
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
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
    fontSize: 12,
    fontWeight: '500',
  },
  experienceList: {
    gap: 16,
  },
  experienceItem: {
    gap: 4,
  },
  experiencePosition: {
    fontSize: 16,
    fontWeight: '600',
  },
  experienceCompany: {
    fontSize: 14,
    fontWeight: '500',
  },
  experienceDuration: {
    fontSize: 12,
  },
  experienceDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  educationList: {
    gap: 16,
  },
  educationItem: {
    gap: 4,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: '600',
  },
  educationSchool: {
    fontSize: 14,
    fontWeight: '500',
  },
  educationYear: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  actionsCard: {
    marginBottom: 20,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionsList: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    justifyContent: 'flex-start',
  },
  logoutButton: {
    justifyContent: 'center',
  },
  editContent: {
    gap: 20,
  },
  editForm: {
    gap: 16,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
  },
});