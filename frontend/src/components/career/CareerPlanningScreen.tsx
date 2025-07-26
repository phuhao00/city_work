import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface CareerGoal {
  id: string;
  title: string;
  description: string;
  targetPosition: string;
  targetSalary: number;
  targetDate: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  skills: string[];
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  type: 'skill' | 'experience' | 'certification' | 'network';
}

interface SkillAssessment {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  importance: number;
  marketDemand: number;
  learningResources: LearningResource[];
}

interface LearningResource {
  id: string;
  title: string;
  type: 'course' | 'book' | 'video' | 'practice' | 'certification';
  provider: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  price: number;
  url: string;
}

interface CareerPath {
  id: string;
  title: string;
  description: string;
  positions: CareerPosition[];
  averageTimeframe: string;
  salaryRange: {
    min: number;
    max: number;
  };
  requiredSkills: string[];
  growthRate: number;
}

interface CareerPosition {
  id: string;
  title: string;
  level: number;
  description: string;
  averageSalary: number;
  requiredExperience: string;
  keySkills: string[];
}

const CareerPlanningScreen: React.FC = () => {
  const { theme } = useTheme();
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [skills, setSkills] = useState<SkillAssessment[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedTab, setSelectedTab] = useState<'goals' | 'skills' | 'paths' | 'analytics'>('goals');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<CareerGoal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCareerData();
  }, []);

  const loadCareerData = async () => {
    try {
      // 模拟 API 调用
      setTimeout(() => {
        setGoals([
          {
            id: '1',
            title: '成为高级前端工程师',
            description: '在2年内晋升为高级前端工程师，掌握现代前端技术栈',
            targetPosition: '高级前端工程师',
            targetSalary: 25000,
            targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2),
            priority: 'high',
            status: 'in_progress',
            progress: 65,
            skills: ['React', 'TypeScript', 'Node.js', '微前端', '性能优化'],
            milestones: [
              {
                id: '1',
                title: '掌握 TypeScript',
                description: '深入学习 TypeScript，能够在项目中熟练使用',
                dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
                completed: true,
                type: 'skill',
              },
              {
                id: '2',
                title: '完成微前端项目',
                description: '参与或主导一个微前端架构的项目',
                dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
                completed: false,
                type: 'experience',
              },
              {
                id: '3',
                title: '获得前端认证',
                description: '获得相关的前端技术认证',
                dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 270),
                completed: false,
                type: 'certification',
              },
            ],
          },
          {
            id: '2',
            title: '转型产品经理',
            description: '从技术岗位转型为产品经理，培养产品思维',
            targetPosition: '产品经理',
            targetSalary: 22000,
            targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 3),
            priority: 'medium',
            status: 'not_started',
            progress: 15,
            skills: ['产品设计', '用户研究', '数据分析', '项目管理'],
            milestones: [
              {
                id: '4',
                title: '学习产品设计',
                description: '系统学习产品设计理论和实践',
                dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120),
                completed: false,
                type: 'skill',
              },
              {
                id: '5',
                title: '参与产品项目',
                description: '参与产品规划和设计工作',
                dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 240),
                completed: false,
                type: 'experience',
              },
            ],
          },
        ]);

        setSkills([
          {
            id: '1',
            name: 'React',
            category: '前端框架',
            currentLevel: 8,
            targetLevel: 9,
            importance: 9,
            marketDemand: 9,
            learningResources: [
              {
                id: '1',
                title: 'React 高级进阶课程',
                type: 'course',
                provider: '极客时间',
                duration: '20小时',
                difficulty: 'advanced',
                rating: 4.8,
                price: 299,
                url: 'https://example.com',
              },
            ],
          },
          {
            id: '2',
            name: 'TypeScript',
            category: '编程语言',
            currentLevel: 7,
            targetLevel: 9,
            importance: 8,
            marketDemand: 8,
            learningResources: [],
          },
          {
            id: '3',
            name: '微前端',
            category: '架构设计',
            currentLevel: 4,
            targetLevel: 8,
            importance: 7,
            marketDemand: 7,
            learningResources: [],
          },
          {
            id: '4',
            name: '产品设计',
            category: '产品技能',
            currentLevel: 3,
            targetLevel: 7,
            importance: 6,
            marketDemand: 8,
            learningResources: [],
          },
        ]);

        setCareerPaths([
          {
            id: '1',
            title: '前端工程师发展路径',
            description: '从初级前端工程师到技术专家的完整发展路径',
            averageTimeframe: '5-7年',
            salaryRange: { min: 8000, max: 50000 },
            requiredSkills: ['JavaScript', 'React', 'Vue', 'Node.js', '工程化'],
            growthRate: 15,
            positions: [
              {
                id: '1',
                title: '初级前端工程师',
                level: 1,
                description: '掌握基础前端技术，能够独立完成简单页面开发',
                averageSalary: 10000,
                requiredExperience: '0-1年',
                keySkills: ['HTML', 'CSS', 'JavaScript'],
              },
              {
                id: '2',
                title: '中级前端工程师',
                level: 2,
                description: '熟练使用前端框架，能够开发复杂的单页应用',
                averageSalary: 16000,
                requiredExperience: '1-3年',
                keySkills: ['React/Vue', 'TypeScript', 'Webpack'],
              },
              {
                id: '3',
                title: '高级前端工程师',
                level: 3,
                description: '具备架构设计能力，能够解决复杂技术问题',
                averageSalary: 25000,
                requiredExperience: '3-5年',
                keySkills: ['架构设计', '性能优化', '团队协作'],
              },
              {
                id: '4',
                title: '前端技术专家',
                level: 4,
                description: '技术深度和广度兼备，能够引领技术方向',
                averageSalary: 40000,
                requiredExperience: '5年以上',
                keySkills: ['技术创新', '团队管理', '业务理解'],
              },
            ],
          },
          {
            id: '2',
            title: '产品经理发展路径',
            description: '从产品助理到产品总监的发展路径',
            averageTimeframe: '6-8年',
            salaryRange: { min: 12000, max: 60000 },
            requiredSkills: ['产品设计', '用户研究', '数据分析', '项目管理'],
            growthRate: 12,
            positions: [
              {
                id: '5',
                title: '产品助理',
                level: 1,
                description: '协助产品经理完成产品相关工作',
                averageSalary: 12000,
                requiredExperience: '0-1年',
                keySkills: ['产品基础', '文档撰写', '沟通协调'],
              },
              {
                id: '6',
                title: '产品经理',
                level: 2,
                description: '独立负责产品模块的规划和设计',
                averageSalary: 22000,
                requiredExperience: '1-3年',
                keySkills: ['需求分析', '原型设计', '项目管理'],
              },
              {
                id: '7',
                title: '高级产品经理',
                level: 3,
                description: '负责重要产品线的整体规划',
                averageSalary: 35000,
                requiredExperience: '3-5年',
                keySkills: ['战略规划', '团队协作', '商业分析'],
              },
              {
                id: '8',
                title: '产品总监',
                level: 4,
                description: '负责公司产品战略和团队管理',
                averageSalary: 55000,
                requiredExperience: '5年以上',
                keySkills: ['战略思维', '团队管理', '商业洞察'],
              },
            ],
          },
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('加载职业数据失败:', error);
      Alert.alert('错误', '加载数据失败，请稍后重试');
      setLoading(false);
    }
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? { ...goal, progress, status: progress === 100 ? 'completed' : 'in_progress' }
          : goal
      )
    );
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              milestones: goal.milestones.map(milestone =>
                milestone.id === milestoneId
                  ? { ...milestone, completed: !milestone.completed }
                  : milestone
              ),
            }
          : goal
      )
    );
  };

  const getSkillGapData = () => {
    return skills.map(skill => ({
      name: skill.name,
      current: skill.currentLevel,
      target: skill.targetLevel,
      gap: skill.targetLevel - skill.currentLevel,
    }));
  };

  const getCareerProgressData = () => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
    return {
      labels: months,
      datasets: [
        {
          data: [20, 35, 45, 55, 65, 75],
          color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  };

  const getSkillDistributionData = () => {
    const categories = ['前端框架', '编程语言', '架构设计', '产品技能'];
    const data = categories.map((category, index) => ({
      name: category,
      population: skills.filter(skill => skill.category === category).length,
      color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][index],
      legendFontColor: theme.text,
      legendFontSize: 12,
    }));
    return data;
  };

  const renderGoalsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>职业目标</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => setShowGoalModal(true)}
        >
          <Ionicons name="add" size={20} color={theme.background} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[styles.goalCard, { backgroundColor: theme.surface }]}
            onPress={() => setSelectedGoal(goal)}
          >
            <View style={styles.goalHeader}>
              <View style={styles.goalInfo}>
                <Text style={[styles.goalTitle, { color: theme.text }]}>
                  {goal.title}
                </Text>
                <Text style={[styles.goalTarget, { color: theme.textSecondary }]}>
                  目标：{goal.targetPosition} • ¥{goal.targetSalary.toLocaleString()}
                </Text>
              </View>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: goal.priority === 'high' ? theme.error : 
                                 goal.priority === 'medium' ? theme.warning : theme.success }
              ]}>
                <Text style={[styles.priorityText, { color: theme.background }]}>
                  {goal.priority === 'high' ? '高' : goal.priority === 'medium' ? '中' : '低'}
                </Text>
              </View>
            </View>

            <Text style={[styles.goalDescription, { color: theme.textSecondary }]}>
              {goal.description}
            </Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: theme.text }]}>
                  进度
                </Text>
                <Text style={[styles.progressValue, { color: theme.primary }]}>
                  {goal.progress}%
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { 
                      backgroundColor: theme.primary,
                      width: `${goal.progress}%`
                    }
                  ]}
                />
              </View>
            </View>

            <View style={styles.goalFooter}>
              <Text style={[styles.goalDeadline, { color: theme.textSecondary }]}>
                截止：{goal.targetDate.toLocaleDateString('zh-CN')}
              </Text>
              <View style={styles.goalSkills}>
                {goal.skills.slice(0, 3).map((skill, index) => (
                  <View key={index} style={[styles.skillTag, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.skillTagText, { color: theme.primary }]}>
                      {skill}
                    </Text>
                  </View>
                ))}
                {goal.skills.length > 3 && (
                  <Text style={[styles.moreSkills, { color: theme.textSecondary }]}>
                    +{goal.skills.length - 3}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSkillsTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>技能评估</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {skills.map((skill) => (
          <View key={skill.id} style={[styles.skillCard, { backgroundColor: theme.surface }]}>
            <View style={styles.skillHeader}>
              <View style={styles.skillInfo}>
                <Text style={[styles.skillName, { color: theme.text }]}>
                  {skill.name}
                </Text>
                <Text style={[styles.skillCategory, { color: theme.textSecondary }]}>
                  {skill.category}
                </Text>
              </View>
              <View style={styles.skillLevels}>
                <Text style={[styles.skillLevel, { color: theme.primary }]}>
                  {skill.currentLevel}/10
                </Text>
                <Ionicons name="arrow-forward" size={16} color={theme.textSecondary} />
                <Text style={[styles.skillLevel, { color: theme.success }]}>
                  {skill.targetLevel}/10
                </Text>
              </View>
            </View>

            <View style={styles.skillProgress}>
              <View style={styles.skillProgressBar}>
                <View style={[styles.skillProgressTrack, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.skillProgressCurrent,
                      { 
                        backgroundColor: theme.primary,
                        width: `${(skill.currentLevel / 10) * 100}%`
                      }
                    ]}
                  />
                  <View
                    style={[
                      styles.skillProgressTarget,
                      { 
                        backgroundColor: theme.success + '40',
                        width: `${(skill.targetLevel / 10) * 100}%`
                      }
                    ]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.skillMetrics}>
              <View style={styles.skillMetric}>
                <Text style={[styles.skillMetricLabel, { color: theme.textSecondary }]}>
                  重要性
                </Text>
                <View style={styles.skillMetricStars}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < skill.importance / 2 ? "star" : "star-outline"}
                      size={12}
                      color="#FFD700"
                    />
                  ))}
                </View>
              </View>
              <View style={styles.skillMetric}>
                <Text style={[styles.skillMetricLabel, { color: theme.textSecondary }]}>
                  市场需求
                </Text>
                <View style={styles.skillMetricStars}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < skill.marketDemand / 2 ? "star" : "star-outline"}
                      size={12}
                      color="#FFD700"
                    />
                  ))}
                </View>
              </View>
            </View>

            {skill.learningResources.length > 0 && (
              <TouchableOpacity style={styles.learningResourcesButton}>
                <Ionicons name="book" size={16} color={theme.primary} />
                <Text style={[styles.learningResourcesText, { color: theme.primary }]}>
                  查看学习资源 ({skill.learningResources.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderPathsTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>职业路径</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {careerPaths.map((path) => (
          <View key={path.id} style={[styles.pathCard, { backgroundColor: theme.surface }]}>
            <LinearGradient
              colors={[theme.primary, theme.primary + '80']}
              style={styles.pathHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.pathTitle}>{path.title}</Text>
              <Text style={styles.pathDescription}>{path.description}</Text>
              <View style={styles.pathMetrics}>
                <View style={styles.pathMetric}>
                  <Ionicons name="time" size={16} color="white" />
                  <Text style={styles.pathMetricText}>{path.averageTimeframe}</Text>
                </View>
                <View style={styles.pathMetric}>
                  <Ionicons name="trending-up" size={16} color="white" />
                  <Text style={styles.pathMetricText}>{path.growthRate}% 增长</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.pathContent}>
              <View style={styles.salaryRange}>
                <Text style={[styles.salaryLabel, { color: theme.textSecondary }]}>
                  薪资范围
                </Text>
                <Text style={[styles.salaryValue, { color: theme.text }]}>
                  ¥{path.salaryRange.min.toLocaleString()} - ¥{path.salaryRange.max.toLocaleString()}
                </Text>
              </View>

              <Text style={[styles.positionsTitle, { color: theme.text }]}>
                职业阶梯
              </Text>
              {path.positions.map((position, index) => (
                <View key={position.id} style={styles.positionItem}>
                  <View style={styles.positionLevel}>
                    <View style={[styles.positionLevelCircle, { backgroundColor: theme.primary }]}>
                      <Text style={[styles.positionLevelText, { color: theme.background }]}>
                        {position.level}
                      </Text>
                    </View>
                    {index < path.positions.length - 1 && (
                      <View style={[styles.positionLevelLine, { backgroundColor: theme.border }]} />
                    )}
                  </View>
                  <View style={styles.positionInfo}>
                    <Text style={[styles.positionTitle, { color: theme.text }]}>
                      {position.title}
                    </Text>
                    <Text style={[styles.positionSalary, { color: theme.primary }]}>
                      ¥{position.averageSalary.toLocaleString()}/月
                    </Text>
                    <Text style={[styles.positionExperience, { color: theme.textSecondary }]}>
                      {position.requiredExperience}
                    </Text>
                    <View style={styles.positionSkills}>
                      {position.keySkills.map((skill, skillIndex) => (
                        <View key={skillIndex} style={[styles.positionSkillTag, { backgroundColor: theme.primary + '20' }]}>
                          <Text style={[styles.positionSkillText, { color: theme.primary }]}>
                            {skill}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>职业分析</Text>
      
      <View style={[styles.chartCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>职业发展进度</Text>
        <LineChart
          data={getCareerProgressData()}
          width={screenWidth - 80}
          height={200}
          chartConfig={{
            backgroundColor: theme.surface,
            backgroundGradientFrom: theme.surface,
            backgroundGradientTo: theme.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
            labelColor: (opacity = 1) => theme.textSecondary,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={[styles.chartCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>技能差距分析</Text>
        <BarChart
          data={{
            labels: getSkillGapData().map(item => item.name),
            datasets: [
              {
                data: getSkillGapData().map(item => item.gap),
              },
            ],
          }}
          width={screenWidth - 80}
          height={200}
          chartConfig={{
            backgroundColor: theme.surface,
            backgroundGradientFrom: theme.surface,
            backgroundGradientTo: theme.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
            labelColor: (opacity = 1) => theme.textSecondary,
          }}
          style={styles.chart}
        />
      </View>

      <View style={[styles.chartCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>技能分布</Text>
        <PieChart
          data={getSkillDistributionData()}
          width={screenWidth - 80}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>

      <View style={[styles.insightsCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.insightsTitle, { color: theme.text }]}>职业洞察</Text>
        <View style={styles.insightItem}>
          <Ionicons name="trending-up" size={20} color={theme.success} />
          <Text style={[styles.insightText, { color: theme.textSecondary }]}>
            您的技能发展速度超过平均水平 15%
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="star" size={20} color={theme.warning} />
          <Text style={[styles.insightText, { color: theme.textSecondary }]}>
            建议重点提升 TypeScript 和微前端技能
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="time" size={20} color={theme.info} />
          <Text style={[styles.insightText, { color: theme.textSecondary }]}>
            按当前进度，预计 18 个月达成主要目标
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>加载职业规划数据中...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>职业规划</Text>
        <TouchableOpacity>
          <Ionicons name="settings" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
        {[
          { key: 'goals', label: '目标', icon: 'flag' },
          { key: 'skills', label: '技能', icon: 'school' },
          { key: 'paths', label: '路径', icon: 'map' },
          { key: 'analytics', label: '分析', icon: 'analytics' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && { backgroundColor: theme.primary }
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={selectedTab === tab.key ? theme.background : theme.textSecondary}
            />
            <Text style={[
              styles.tabButtonText,
              { color: selectedTab === tab.key ? theme.background : theme.textSecondary }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === 'goals' && renderGoalsTab()}
      {selectedTab === 'skills' && renderSkillsTab()}
      {selectedTab === 'paths' && renderPathsTab()}
      {selectedTab === 'analytics' && renderAnalyticsTab()}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    borderRadius: 16,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  goalTarget: {
    fontSize: 14,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  goalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalDeadline: {
    fontSize: 12,
  },
  goalSkills: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 5,
  },
  skillTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreSkills: {
    fontSize: 12,
    marginLeft: 5,
  },
  skillCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  skillCategory: {
    fontSize: 14,
  },
  skillLevels: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  skillProgress: {
    marginBottom: 15,
  },
  skillProgressBar: {
    position: 'relative',
  },
  skillProgressTrack: {
    height: 8,
    borderRadius: 4,
    position: 'relative',
  },
  skillProgressCurrent: {
    position: 'absolute',
    height: '100%',
    borderRadius: 4,
    zIndex: 2,
  },
  skillProgressTarget: {
    position: 'absolute',
    height: '100%',
    borderRadius: 4,
    zIndex: 1,
  },
  skillMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  skillMetric: {
    alignItems: 'center',
  },
  skillMetricLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  skillMetricStars: {
    flexDirection: 'row',
  },
  learningResourcesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  learningResourcesText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  pathCard: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pathHeader: {
    padding: 20,
  },
  pathTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  pathDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
  },
  pathMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pathMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pathMetricText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 5,
  },
  pathContent: {
    padding: 20,
  },
  salaryRange: {
    marginBottom: 20,
  },
  salaryLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  salaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  positionItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  positionLevel: {
    alignItems: 'center',
    marginRight: 15,
  },
  positionLevelCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionLevelText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  positionLevelLine: {
    width: 2,
    height: 40,
    marginTop: 5,
  },
  positionInfo: {
    flex: 1,
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  positionSalary: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  positionExperience: {
    fontSize: 14,
    marginBottom: 10,
  },
  positionSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  positionSkillTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  positionSkillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 16,
  },
  insightsCard: {
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
});

export default CareerPlanningScreen;