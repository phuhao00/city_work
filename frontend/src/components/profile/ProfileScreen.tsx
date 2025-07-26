import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { useTheme } from '../../theme/ThemeProvider';

interface ProfileScreenProps {
  navigation?: any;
  route?: {
    params?: {
      userId?: string;
    };
  };
}

interface WorkExperience {
  _id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  isCurrent: boolean;
}

interface Education {
  _id: string;
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
}

interface Skill {
  _id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  endorsements: number;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'about' | 'experience' | 'education' | 'skills'>('about');
  
  const isOwnProfile = !route?.params?.userId || route.params.userId === user?._id;

  // Mock data - 实际项目中应该从API获取
  const profileData = {
    _id: user?._id || '1',
    firstName: user?.firstName || '张',
    lastName: user?.lastName || '小明',
    title: '高级产品经理',
    company: '字节跳动',
    location: '北京',
    industry: '互联网',
    avatar: '',
    coverImage: '',
    bio: '专注于产品设计和用户体验，拥有5年互联网产品经验。擅长数据分析和用户研究，致力于打造有价值的产品。',
    connections: 156,
    followers: 89,
    following: 67,
    posts: 23,
    isOnline: true,
    joinDate: '2019-03-15',
    email: user?.email || 'zhangxiaoming@example.com',
    phone: '+86 138 0013 8000',
    website: 'https://zhangxiaoming.com',
    workExperience: [
      {
        _id: '1',
        company: '字节跳动',
        position: '高级产品经理',
        startDate: '2022-01',
        endDate: undefined,
        description: '负责抖音电商产品线，主导多个核心功能的设计和优化，用户活跃度提升30%。',
        isCurrent: true,
      },
      {
        _id: '2',
        company: '腾讯科技',
        position: '产品经理',
        startDate: '2020-03',
        endDate: '2021-12',
        description: '负责微信小程序商业化产品，参与广告系统设计，收入增长50%。',
        isCurrent: false,
      },
    ] as WorkExperience[],
    education: [
      {
        _id: '1',
        school: '清华大学',
        degree: '硕士',
        major: '计算机科学与技术',
        startDate: '2017-09',
        endDate: '2019-06',
      },
      {
        _id: '2',
        school: '北京大学',
        degree: '学士',
        major: '软件工程',
        startDate: '2013-09',
        endDate: '2017-06',
      },
    ] as Education[],
    skills: [
      { _id: '1', name: '产品设计', level: 'expert' as const, endorsements: 45 },
      { _id: '2', name: '用户研究', level: 'advanced' as const, endorsements: 32 },
      { _id: '3', name: '数据分析', level: 'advanced' as const, endorsements: 28 },
      { _id: '4', name: '项目管理', level: 'expert' as const, endorsements: 38 },
      { _id: '5', name: 'Figma', level: 'intermediate' as const, endorsements: 15 },
    ] as Skill[],
  };

  const handleEditProfile = () => {
    navigation?.navigate('EditProfile');
  };

  const handleConnect = () => {
    Alert.alert('连接请求已发送');
  };

  const handleMessage = () => {
    navigation?.navigate('Chat', { otherUser: profileData });
  };

  const getSkillLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return '初级';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      case 'expert': return '专家';
      default: return '未知';
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return '#FFC107';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#FF5722';
      case 'expert': return '#F44336';
      default: return theme.colors.gray;
    }
  };

  const renderTabButton = (tab: typeof activeTab, title: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[
        styles.tabButtonText,
        { color: activeTab === tab ? theme.colors.primary : theme.colors.gray }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>关于我</Text>
        <Text style={[styles.bioText, { color: theme.colors.text }]}>{profileData.bio}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>联系信息</Text>
        <View style={styles.contactItem}>
          <Text style={[styles.contactLabel, { color: theme.colors.gray }]}>邮箱</Text>
          <Text style={[styles.contactValue, { color: theme.colors.text }]}>{profileData.email}</Text>
        </View>
        <View style={styles.contactItem}>
          <Text style={[styles.contactLabel, { color: theme.colors.gray }]}>电话</Text>
          <Text style={[styles.contactValue, { color: theme.colors.text }]}>{profileData.phone}</Text>
        </View>
        <View style={styles.contactItem}>
          <Text style={[styles.contactLabel, { color: theme.colors.gray }]}>网站</Text>
          <Text style={[styles.contactValue, { color: theme.colors.primary }]}>{profileData.website}</Text>
        </View>
      </View>
    </View>
  );

  const renderExperienceTab = () => (
    <View style={styles.tabContent}>
      {profileData.workExperience.map((exp) => (
        <View key={exp._id} style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.experienceHeader}>
            <Text style={[styles.experiencePosition, { color: theme.colors.text }]}>{exp.position}</Text>
            {exp.isCurrent && (
              <View style={[styles.currentBadge, { backgroundColor: theme.colors.success }]}>
                <Text style={styles.currentBadgeText}>当前</Text>
              </View>
            )}
          </View>
          <Text style={[styles.experienceCompany, { color: theme.colors.primary }]}>{exp.company}</Text>
          <Text style={[styles.experienceDate, { color: theme.colors.gray }]}>
            {exp.startDate} - {exp.endDate || '至今'}
          </Text>
          <Text style={[styles.experienceDescription, { color: theme.colors.text }]}>{exp.description}</Text>
        </View>
      ))}
    </View>
  );

  const renderEducationTab = () => (
    <View style={styles.tabContent}>
      {profileData.education.map((edu) => (
        <View key={edu._id} style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.educationSchool, { color: theme.colors.text }]}>{edu.school}</Text>
          <Text style={[styles.educationDegree, { color: theme.colors.primary }]}>
            {edu.degree} · {edu.major}
          </Text>
          <Text style={[styles.educationDate, { color: theme.colors.gray }]}>
            {edu.startDate} - {edu.endDate}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderSkillsTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>技能专长</Text>
        {profileData.skills.map((skill) => (
          <View key={skill._id} style={styles.skillItem}>
            <View style={styles.skillHeader}>
              <Text style={[styles.skillName, { color: theme.colors.text }]}>{skill.name}</Text>
              <View style={[styles.skillLevel, { backgroundColor: getSkillLevelColor(skill.level) }]}>
                <Text style={styles.skillLevelText}>{getSkillLevelText(skill.level)}</Text>
              </View>
            </View>
            <Text style={[styles.skillEndorsements, { color: theme.colors.gray }]}>
              {skill.endorsements}人认可
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 头部背景 */}
      <View style={[styles.coverSection, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {profileData.firstName[0]}{profileData.lastName[0]}
            </Text>
            {profileData.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: '#FFFFFF' }]}>
              {profileData.firstName}{profileData.lastName}
            </Text>
            <Text style={[styles.profileTitle, { color: '#FFFFFF' }]}>
              {profileData.title} · {profileData.company}
            </Text>
            <Text style={[styles.profileLocation, { color: '#FFFFFF' }]}>
              {profileData.location} · {profileData.industry}
            </Text>
          </View>
        </View>

        {/* 统计信息 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FFFFFF' }]}>{profileData.connections}</Text>
            <Text style={[styles.statLabel, { color: '#FFFFFF' }]}>联系人</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FFFFFF' }]}>{profileData.followers}</Text>
            <Text style={[styles.statLabel, { color: '#FFFFFF' }]}>关注者</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FFFFFF' }]}>{profileData.posts}</Text>
            <Text style={[styles.statLabel, { color: '#FFFFFF' }]}>动态</Text>
          </View>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actionButtonsContainer}>
          {isOwnProfile ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton, { backgroundColor: '#FFFFFF' }]}
              onPress={handleEditProfile}
            >
              <Text style={[styles.editButtonText, { color: theme.colors.primary }]}>编辑资料</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.connectButton, { backgroundColor: '#FFFFFF' }]}
                onPress={handleConnect}
              >
                <Text style={[styles.connectButtonText, { color: theme.colors.primary }]}>+ 连接</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.messageButton, { borderColor: '#FFFFFF' }]}
                onPress={handleMessage}
              >
                <Text style={styles.messageButtonText}>发消息</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* 标签页 */}
      <View style={[styles.tabContainer, { backgroundColor: theme.colors.card }]}>
        {renderTabButton('about', '关于')}
        {renderTabButton('experience', '经历')}
        {renderTabButton('education', '教育')}
        {renderTabButton('skills', '技能')}
      </View>

      {/* 标签页内容 */}
      {activeTab === 'about' && renderAboutTab()}
      {activeTab === 'experience' && renderExperienceTab()}
      {activeTab === 'education' && renderEducationTab()}
      {activeTab === 'skills' && renderSkillsTab()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverSection: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  profileLocation: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#FFFFFF',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  connectButton: {
    backgroundColor: '#FFFFFF',
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabContent: {
    padding: 20,
  },
  section: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  contactLabel: {
    fontSize: 14,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  experienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  experiencePosition: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  experienceCompany: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  experienceDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  experienceDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  educationSchool: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  educationDegree: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  educationDate: {
    fontSize: 12,
  },
  skillItem: {
    marginBottom: 16,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '500',
  },
  skillLevel: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  skillLevelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  skillEndorsements: {
    fontSize: 12,
  },
});