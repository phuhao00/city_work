import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (postData: any) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<'job_post' | 'company_update' | 'user_achievement' | 'industry_news'>('user_achievement');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postTypes = [
    { key: 'user_achievement', label: '个人成就', icon: '🎉' },
    { key: 'job_post', label: '职位发布', icon: '💼' },
    { key: 'company_update', label: '公司动态', icon: '🏢' },
    { key: 'industry_news', label: '行业资讯', icon: '📰' },
  ];

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('提示', '请输入内容');
      return;
    }

    setIsSubmitting(true);
    
    const postData = {
      type: selectedType,
      content: content.trim(),
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      author: {
        _id: 'current_user',
        name: '当前用户',
        title: '软件工程师',
        company: '科技公司',
      },
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    };

    try {
      await onSubmit(postData);
      setContent('');
      setTags('');
      setSelectedType('user_achievement');
      onClose();
      Alert.alert('成功', '发布成功！');
    } catch (error) {
      Alert.alert('错误', '发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setTags('');
    setSelectedType('user_achievement');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 头部 */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={[styles.cancelButton, { color: theme.colors.gray }]}>
              取消
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            发布动态
          </Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            style={[
              styles.submitButton,
              { 
                backgroundColor: (!content.trim() || isSubmitting) 
                  ? theme.colors.gray + '40' 
                  : theme.colors.primary 
              }
            ]}
          >
            <Text style={[
              styles.submitButtonText,
              { 
                color: (!content.trim() || isSubmitting) 
                  ? theme.colors.gray 
                  : '#FFFFFF' 
              }
            ]}>
              {isSubmitting ? '发布中...' : '发布'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 类型选择 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              选择类型
            </Text>
            <View style={styles.typeContainer}>
              {postTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: selectedType === type.key 
                        ? theme.colors.primary + '20' 
                        : theme.colors.card,
                      borderColor: selectedType === type.key 
                        ? theme.colors.primary 
                        : theme.colors.border,
                    }
                  ]}
                  onPress={() => setSelectedType(type.key as any)}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.typeLabel,
                    { 
                      color: selectedType === type.key 
                        ? theme.colors.primary 
                        : theme.colors.text 
                    }
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 内容输入 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              内容
            </Text>
            <TextInput
              style={[
                styles.contentInput,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }
              ]}
              placeholder="分享你的想法..."
              placeholderTextColor={theme.colors.gray}
              multiline
              numberOfLines={6}
              value={content}
              onChangeText={setContent}
              maxLength={500}
            />
            <Text style={[styles.characterCount, { color: theme.colors.gray }]}>
              {content.length}/500
            </Text>
          </View>

          {/* 标签输入 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              标签 (可选)
            </Text>
            <TextInput
              style={[
                styles.tagsInput,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }
              ]}
              placeholder="用逗号分隔多个标签，如：前端开发,React,招聘"
              placeholderTextColor={theme.colors.gray}
              value={tags}
              onChangeText={setTags}
              maxLength={100}
            />
          </View>

          {/* 预览 */}
          {content.trim() && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                预览
              </Text>
              <View style={[styles.preview, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.previewHeader}>
                  <View style={[styles.previewAvatar, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.previewAvatarText}>我</Text>
                  </View>
                  <View style={styles.previewAuthorInfo}>
                    <Text style={[styles.previewAuthorName, { color: theme.colors.text }]}>
                      当前用户
                    </Text>
                    <Text style={[styles.previewAuthorTitle, { color: theme.colors.gray }]}>
                      软件工程师 · 科技公司
                    </Text>
                  </View>
                  <Text style={styles.previewTypeIcon}>
                    {postTypes.find(t => t.key === selectedType)?.icon}
                  </Text>
                </View>
                <Text style={[styles.previewContent, { color: theme.colors.text }]}>
                  {content}
                </Text>
                {tags.trim() && (
                  <View style={styles.previewTags}>
                    {tags.split(',').map((tag, index) => (
                      <View key={index} style={[styles.previewTag, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Text style={[styles.previewTagText, { color: theme.colors.primary }]}>
                          #{tag.trim()}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
  },
  typeIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 8,
  },
  tagsInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  preview: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewAuthorInfo: {
    flex: 1,
  },
  previewAuthorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewAuthorTitle: {
    fontSize: 14,
    marginTop: 2,
  },
  previewTypeIcon: {
    fontSize: 20,
  },
  previewContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  previewTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  previewTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  previewTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
});