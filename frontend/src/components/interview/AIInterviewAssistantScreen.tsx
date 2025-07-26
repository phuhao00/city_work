import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswer?: string;
  tips?: string[];
}

interface MockInterview {
  id: string;
  jobTitle: string;
  questions: InterviewQuestion[];
  duration: number;
  score?: number;
  feedback?: string[];
}

interface SkillAssessment {
  skill: string;
  level: number;
  questions: number;
  score?: number;
  recommendations?: string[];
}

const AIInterviewAssistantScreen: React.FC = () => {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'prepare' | 'mock' | 'assess'>('prepare');
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [mockInterviews, setMockInterviews] = useState<MockInterview[]>([]);
  const [skillAssessments, setSkillAssessments] = useState<SkillAssessment[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadInterviewData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadInterviewData = async () => {
    setLoading(true);
    try {
      // 模拟 API 调用
      setTimeout(() => {
        setInterviewQuestions([
          {
            id: '1',
            question: '请介绍一下你自己',
            category: 'behavioral',
            difficulty: 'easy',
            tips: [
              '简洁明了地介绍背景',
              '突出相关经验和技能',
              '表达对职位的兴趣',
            ],
          },
          {
            id: '2',
            question: '解释一下 JavaScript 中的闭包概念',
            category: 'technical',
            difficulty: 'medium',
            expectedAnswer: '闭包是指函数能够访问其外部作用域中的变量，即使在外部函数已经返回之后。',
            tips: [
              '用简单的例子说明',
              '解释实际应用场景',
              '提到内存管理注意事项',
            ],
          },
          {
            id: '3',
            question: '描述一次你解决复杂技术问题的经历',
            category: 'situational',
            difficulty: 'hard',
            tips: [
              '使用 STAR 方法回答',
              '详细描述解决过程',
              '强调学到的经验',
            ],
          },
        ]);

        setMockInterviews([
          {
            id: '1',
            jobTitle: '前端开发工程师',
            questions: [],
            duration: 45,
            score: 85,
            feedback: [
              '技术回答准确',
              '表达清晰流畅',
              '可以更多展示项目经验',
            ],
          },
          {
            id: '2',
            jobTitle: '全栈开发工程师',
            questions: [],
            duration: 60,
          },
        ]);

        setSkillAssessments([
          {
            skill: 'React',
            level: 4,
            questions: 20,
            score: 88,
            recommendations: [
              '深入学习 React Hooks',
              '了解性能优化技巧',
              '掌握状态管理最佳实践',
            ],
          },
          {
            skill: 'Node.js',
            level: 3,
            questions: 15,
            score: 76,
            recommendations: [
              '学习异步编程模式',
              '掌握数据库操作',
              '了解微服务架构',
            ],
          },
          {
            skill: 'TypeScript',
            level: 3,
            questions: 18,
          },
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('加载面试数据失败:', error);
      Alert.alert('错误', '加载数据失败，请稍后重试');
      setLoading(false);
    }
  };

  const startMockInterview = (interview: MockInterview) => {
    Alert.alert(
      '开始模拟面试',
      `准备开始 ${interview.jobTitle} 的模拟面试，预计时长 ${interview.duration} 分钟。`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '开始', 
          onPress: () => {
            // 这里可以导航到面试界面
            Alert.alert('功能开发中', '模拟面试功能正在开发中...');
          }
        },
      ]
    );
  };

  const startSkillAssessment = (assessment: SkillAssessment) => {
    Alert.alert(
      '技能评估',
      `开始 ${assessment.skill} 技能评估，共 ${assessment.questions} 道题目。`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '开始', 
          onPress: () => {
            // 这里可以导航到评估界面
            Alert.alert('功能开发中', '技能评估功能正在开发中...');
          }
        },
      ]
    );
  };

  const showQuestionDetail = (question: InterviewQuestion) => {
    setCurrentQuestion(question);
    setUserAnswer('');
    setShowFeedback(false);
  };

  const submitAnswer = () => {
    if (!userAnswer.trim()) {
      Alert.alert('提示', '请输入您的答案');
      return;
    }

    // 模拟 AI 分析
    setLoading(true);
    setTimeout(() => {
      setShowFeedback(true);
      setLoading(false);
    }, 2000);
  };

  const renderPrepareTab = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>面试题库</Text>
        
        <View style={styles.categoryFilter}>
          {['all', 'technical', 'behavioral', 'situational'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.filterButton, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.filterButtonText, { color: theme.text }]}>
                {category === 'all' ? '全部' : 
                 category === 'technical' ? '技术' :
                 category === 'behavioral' ? '行为' : '情境'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.questionsList}>
          {interviewQuestions.map((question) => (
            <TouchableOpacity
              key={question.id}
              style={[styles.questionCard, { backgroundColor: theme.surface }]}
              onPress={() => showQuestionDetail(question)}
            >
              <View style={styles.questionHeader}>
                <View style={[
                  styles.categoryBadge,
                  { backgroundColor: 
                    question.category === 'technical' ? theme.primary :
                    question.category === 'behavioral' ? theme.success :
                    theme.warning
                  }
                ]}>
                  <Text style={[styles.categoryText, { color: theme.background }]}>
                    {question.category === 'technical' ? '技术' :
                     question.category === 'behavioral' ? '行为' : '情境'}
                  </Text>
                </View>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: 
                    question.difficulty === 'easy' ? theme.success :
                    question.difficulty === 'medium' ? theme.warning :
                    theme.error
                  }
                ]}>
                  <Text style={[styles.difficultyText, { color: theme.background }]}>
                    {question.difficulty === 'easy' ? '简单' :
                     question.difficulty === 'medium' ? '中等' : '困难'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.questionText, { color: theme.text }]}>
                {question.question}
              </Text>
              <View style={styles.questionFooter}>
                <Ionicons name="bulb" size={16} color={theme.warning} />
                <Text style={[styles.tipsCount, { color: theme.textSecondary }]}>
                  {question.tips?.length || 0} 个提示
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderMockTab = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>模拟面试</Text>
        
        <TouchableOpacity 
          style={[styles.createButton, { backgroundColor: theme.primary }]}
          onPress={() => Alert.alert('功能开发中', '创建自定义面试功能正在开发中...')}
        >
          <Ionicons name="add" size={20} color={theme.background} />
          <Text style={[styles.createButtonText, { color: theme.background }]}>
            创建自定义面试
          </Text>
        </TouchableOpacity>

        <View style={styles.interviewsList}>
          {mockInterviews.map((interview) => (
            <View key={interview.id} style={[styles.interviewCard, { backgroundColor: theme.surface }]}>
              <View style={styles.interviewHeader}>
                <Text style={[styles.interviewTitle, { color: theme.text }]}>
                  {interview.jobTitle}
                </Text>
                {interview.score && (
                  <View style={[styles.scoreBadge, { backgroundColor: theme.success }]}>
                    <Text style={[styles.scoreText, { color: theme.background }]}>
                      {interview.score}分
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.interviewInfo}>
                <View style={styles.infoItem}>
                  <Ionicons name="time" size={16} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    {interview.duration} 分钟
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="help-circle" size={16} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    {interview.questions.length || '10+'} 道题
                  </Text>
                </View>
              </View>

              {interview.feedback && (
                <View style={styles.feedbackSection}>
                  <Text style={[styles.feedbackTitle, { color: theme.text }]}>反馈建议:</Text>
                  {interview.feedback.map((item, index) => (
                    <Text key={index} style={[styles.feedbackItem, { color: theme.textSecondary }]}>
                      • {item}
                    </Text>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: theme.primary }]}
                onPress={() => startMockInterview(interview)}
              >
                <Text style={[styles.startButtonText, { color: theme.background }]}>
                  {interview.score ? '重新面试' : '开始面试'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderAssessTab = () => (
    <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>技能评估</Text>
        
        <View style={styles.assessmentsList}>
          {skillAssessments.map((assessment, index) => (
            <View key={index} style={[styles.assessmentCard, { backgroundColor: theme.surface }]}>
              <View style={styles.assessmentHeader}>
                <Text style={[styles.assessmentTitle, { color: theme.text }]}>
                  {assessment.skill}
                </Text>
                <View style={styles.levelContainer}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Ionicons
                      key={level}
                      name={level <= assessment.level ? 'star' : 'star-outline'}
                      size={16}
                      color={level <= assessment.level ? theme.warning : theme.border}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.assessmentInfo}>
                <Text style={[styles.questionsCount, { color: theme.textSecondary }]}>
                  {assessment.questions} 道题目
                </Text>
                {assessment.score && (
                  <Text style={[styles.assessmentScore, { color: theme.success }]}>
                    得分: {assessment.score}%
                  </Text>
                )}
              </View>

              {assessment.recommendations && (
                <View style={styles.recommendationsSection}>
                  <Text style={[styles.recommendationsTitle, { color: theme.text }]}>
                    学习建议:
                  </Text>
                  {assessment.recommendations.map((rec, recIndex) => (
                    <Text key={recIndex} style={[styles.recommendationItem, { color: theme.textSecondary }]}>
                      • {rec}
                    </Text>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[styles.assessButton, { backgroundColor: theme.primary }]}
                onPress={() => startSkillAssessment(assessment)}
              >
                <Text style={[styles.assessButtonText, { color: theme.background }]}>
                  {assessment.score ? '重新评估' : '开始评估'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );

  if (loading && !interviewQuestions.length) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>加载面试助手中...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>AI 面试助手</Text>
        <Ionicons name="brain" size={24} color={theme.primary} />
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'prepare' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setSelectedTab('prepare')}
        >
          <Text style={[
            styles.tabButtonText,
            { color: selectedTab === 'prepare' ? theme.background : theme.textSecondary }
          ]}>
            面试准备
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'mock' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setSelectedTab('mock')}
        >
          <Text style={[
            styles.tabButtonText,
            { color: selectedTab === 'mock' ? theme.background : theme.textSecondary }
          ]}>
            模拟面试
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'assess' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setSelectedTab('assess')}
        >
          <Text style={[
            styles.tabButtonText,
            { color: selectedTab === 'assess' ? theme.background : theme.textSecondary }
          ]}>
            技能评估
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'prepare' && renderPrepareTab()}
      {selectedTab === 'mock' && renderMockTab()}
      {selectedTab === 'assess' && renderAssessTab()}

      {/* 问题详情模态框 */}
      <Modal
        visible={!!currentQuestion}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>面试问题</Text>
            <TouchableOpacity onPress={() => setCurrentQuestion(null)}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {currentQuestion && (
            <ScrollView style={styles.modalContent}>
              <Text style={[styles.questionDetailText, { color: theme.text }]}>
                {currentQuestion.question}
              </Text>

              {currentQuestion.tips && (
                <View style={styles.tipsSection}>
                  <Text style={[styles.tipsTitle, { color: theme.text }]}>回答提示:</Text>
                  {currentQuestion.tips.map((tip, index) => (
                    <Text key={index} style={[styles.tipItem, { color: theme.textSecondary }]}>
                      • {tip}
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.answerSection}>
                <Text style={[styles.answerTitle, { color: theme.text }]}>您的答案:</Text>
                <TextInput
                  style={[styles.answerInput, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  multiline
                  numberOfLines={6}
                  placeholder="请输入您的答案..."
                  placeholderTextColor={theme.textSecondary}
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                />
                
                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: theme.primary }]}
                  onPress={submitAnswer}
                  disabled={loading}
                >
                  <Text style={[styles.submitButtonText, { color: theme.background }]}>
                    {loading ? '分析中...' : '获取 AI 反馈'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showFeedback && (
                <View style={[styles.feedbackSection, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.feedbackTitle, { color: theme.text }]}>AI 反馈:</Text>
                  <Text style={[styles.feedbackContent, { color: theme.textSecondary }]}>
                    您的回答结构清晰，内容丰富。建议可以更多地结合具体例子来说明您的观点，这样会更有说服力。
                  </Text>
                  
                  <View style={styles.scoreContainer}>
                    <Text style={[styles.scoreLabel, { color: theme.text }]}>评分:</Text>
                    <Text style={[styles.scoreValue, { color: theme.success }]}>85/100</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
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
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  categoryFilter: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  questionsList: {
    marginBottom: 20,
  },
  questionCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  questionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipsCount: {
    fontSize: 12,
    marginLeft: 5,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  interviewsList: {
    marginBottom: 20,
  },
  interviewCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  interviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  interviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  interviewInfo: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 5,
  },
  feedbackSection: {
    marginBottom: 15,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  feedbackItem: {
    fontSize: 12,
    lineHeight: 18,
  },
  startButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  assessmentsList: {
    marginBottom: 20,
  },
  assessmentCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assessmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelContainer: {
    flexDirection: 'row',
  },
  assessmentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  questionsCount: {
    fontSize: 14,
  },
  assessmentScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationsSection: {
    marginBottom: 15,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  recommendationItem: {
    fontSize: 12,
    lineHeight: 18,
  },
  assessButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  assessButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  questionDetailText: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 20,
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  answerSection: {
    marginBottom: 20,
  },
  answerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  answerInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AIInterviewAssistantScreen;