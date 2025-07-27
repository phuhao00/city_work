import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  FlatList,
  Switch,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: ReportField[];
  charts: ChartConfig[];
  schedule?: ScheduleConfig;
  isActive: boolean;
  createdAt: string;
  lastGenerated?: string;
}

interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  options?: string[];
  defaultValue?: any;
}

interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie';
  title: string;
  dataSource: string;
  xAxis?: string;
  yAxis?: string;
}

interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
}

interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  generatedAt: string;
  status: 'generating' | 'completed' | 'failed';
  size: string;
  format: string;
  downloadUrl?: string;
}

const ReportGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'generated' | 'scheduled'>('templates');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data
  useEffect(() => {
    const mockTemplates: ReportTemplate[] = [
      {
        id: '1',
        name: '员工绩效报告',
        description: '月度员工绩效分析报告',
        category: 'HR',
        fields: [
          { id: '1', name: '部门', type: 'select', required: true, options: ['技术部', '销售部', '市场部'] },
          { id: '2', name: '开始日期', type: 'date', required: true },
          { id: '3', name: '结束日期', type: 'date', required: true },
        ],
        charts: [
          { id: '1', type: 'bar', title: '部门绩效对比', dataSource: 'performance', xAxis: 'department', yAxis: 'score' },
          { id: '2', type: 'line', title: '绩效趋势', dataSource: 'trends', xAxis: 'month', yAxis: 'average' },
        ],
        schedule: {
          frequency: 'monthly',
          time: '09:00',
          recipients: ['hr@company.com', 'manager@company.com'],
          format: 'pdf',
        },
        isActive: true,
        createdAt: '2024-01-15',
        lastGenerated: '2024-01-30',
      },
      {
        id: '2',
        name: '财务月报',
        description: '月度财务状况分析',
        category: '财务',
        fields: [
          { id: '1', name: '报告月份', type: 'date', required: true },
          { id: '2', name: '包含预算对比', type: 'boolean', required: false, defaultValue: true },
        ],
        charts: [
          { id: '1', type: 'pie', title: '支出分布', dataSource: 'expenses', xAxis: 'category', yAxis: 'amount' },
          { id: '2', type: 'line', title: '收入趋势', dataSource: 'revenue', xAxis: 'month', yAxis: 'income' },
        ],
        isActive: true,
        createdAt: '2024-01-10',
        lastGenerated: '2024-01-28',
      },
      {
        id: '3',
        name: '项目进度报告',
        description: '项目执行情况和进度分析',
        category: '项目管理',
        fields: [
          { id: '1', name: '项目ID', type: 'text', required: true },
          { id: '2', name: '报告类型', type: 'select', required: true, options: ['周报', '月报', '季报'] },
        ],
        charts: [
          { id: '1', type: 'bar', title: '任务完成情况', dataSource: 'tasks', xAxis: 'status', yAxis: 'count' },
        ],
        isActive: false,
        createdAt: '2024-01-05',
      },
    ];

    const mockGeneratedReports: GeneratedReport[] = [
      {
        id: '1',
        templateId: '1',
        templateName: '员工绩效报告',
        generatedAt: '2024-01-30 09:00:00',
        status: 'completed',
        size: '2.5 MB',
        format: 'PDF',
        downloadUrl: '/reports/performance-2024-01.pdf',
      },
      {
        id: '2',
        templateId: '2',
        templateName: '财务月报',
        generatedAt: '2024-01-28 10:30:00',
        status: 'completed',
        size: '1.8 MB',
        format: 'Excel',
        downloadUrl: '/reports/finance-2024-01.xlsx',
      },
      {
        id: '3',
        templateId: '1',
        templateName: '员工绩效报告',
        generatedAt: '2024-01-30 14:15:00',
        status: 'generating',
        size: '-',
        format: 'PDF',
      },
    ];

    setTemplates(mockTemplates);
    setGeneratedReports(mockGeneratedReports);
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const handleGenerateReport = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowGenerateModal(true);
  };

  const handleToggleTemplate = (templateId: string) => {
    setTemplates(prev => prev.map(template =>
      template.id === templateId
        ? { ...template, isActive: !template.isActive }
        : template
    ));
  };

  const handleDownloadReport = (report: GeneratedReport) => {
    if (report.downloadUrl) {
      Alert.alert('下载', `开始下载报告: ${report.templateName}`);
    }
  };

  const renderTemplateCard = ({ item }: { item: ReportTemplate }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardCategory}>{item.category}</Text>
        </View>
        <Switch
          value={item.isActive}
          onValueChange={() => handleToggleTemplate(item.id)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={item.isActive ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>
      
      <Text style={styles.cardDescription}>{item.description}</Text>
      
      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.statText}>创建: {item.createdAt}</Text>
        </View>
        {item.lastGenerated && (
          <View style={styles.statItem}>
            <Ionicons name="download-outline" size={16} color="#666" />
            <Text style={styles.statText}>最后生成: {item.lastGenerated}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            setSelectedTemplate(item);
            setShowTemplateModal(true);
          }}
        >
          <Ionicons name="create-outline" size={16} color="#007AFF" />
          <Text style={styles.editButtonText}>编辑</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.generateButton]}
          onPress={() => handleGenerateReport(item)}
          disabled={!item.isActive}
        >
          <Ionicons name="document-text-outline" size={16} color="#fff" />
          <Text style={styles.generateButtonText}>生成报告</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGeneratedReport = ({ item }: { item: GeneratedReport }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Text style={styles.cardName}>{item.templateName}</Text>
          <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
            <Text style={styles.statusText}>
              {item.status === 'completed' ? '已完成' : 
               item.status === 'generating' ? '生成中' : '失败'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.reportInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.generatedAt}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="document-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.format} - {item.size}</Text>
        </View>
      </View>

      {item.status === 'completed' && (
        <TouchableOpacity
          style={[styles.actionButton, styles.downloadButton]}
          onPress={() => handleDownloadReport(item)}
        >
          <Ionicons name="download-outline" size={16} color="#fff" />
          <Text style={styles.downloadButtonText}>下载</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderChartPreview = () => {
    const chartData = {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      datasets: [{
        data: [20, 45, 28, 80, 99, 43]
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>报告预览图表</Text>
        <LineChart
          data={chartData}
          width={width - 60}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#007AFF'
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>报告生成器</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setSelectedTemplate(null);
            setShowTemplateModal(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'templates' && styles.activeTab]}
          onPress={() => setActiveTab('templates')}
        >
          <Text style={[styles.tabText, activeTab === 'templates' && styles.activeTabText]}>
            模板管理
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'generated' && styles.activeTab]}
          onPress={() => setActiveTab('generated')}
        >
          <Text style={[styles.tabText, activeTab === 'generated' && styles.activeTabText]}>
            已生成报告
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scheduled' && styles.activeTab]}
          onPress={() => setActiveTab('scheduled')}
        >
          <Text style={[styles.tabText, activeTab === 'scheduled' && styles.activeTabText]}>
            定时任务
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'templates' && (
        <>
          <View style={styles.filterContainer}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="搜索模板..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    filterCategory === category && styles.activeCategoryButton
                  ]}
                  onPress={() => setFilterCategory(category)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    filterCategory === category && styles.activeCategoryButtonText
                  ]}>
                    {category === 'all' ? '全部' : category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <FlatList
            data={filteredTemplates}
            renderItem={renderTemplateCard}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}

      {activeTab === 'generated' && (
        <FlatList
          data={generatedReports}
          renderItem={renderGeneratedReport}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'scheduled' && (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>定时任务功能开发中...</Text>
        </View>
      )}

      {/* Template Modal */}
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
              <Text style={styles.cancelButton}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedTemplate ? '编辑模板' : '新建模板'}
            </Text>
            <TouchableOpacity>
              <Text style={styles.saveButton}>保存</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>模板名称</Text>
              <TextInput
                style={styles.input}
                placeholder="输入模板名称"
                defaultValue={selectedTemplate?.name}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>描述</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="输入模板描述"
                multiline
                numberOfLines={3}
                defaultValue={selectedTemplate?.description}
              />
            </View>
            
            {renderChartPreview()}
          </ScrollView>
        </View>
      </Modal>

      {/* Generate Report Modal */}
      <Modal
        visible={showGenerateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowGenerateModal(false)}>
              <Text style={styles.cancelButton}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>生成报告</Text>
            <TouchableOpacity>
              <Text style={styles.saveButton}>生成</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedTemplate?.fields.map(field => (
              <View key={field.id} style={styles.formGroup}>
                <Text style={styles.label}>
                  {field.name}
                  {field.required && <Text style={styles.required}> *</Text>}
                </Text>
                {field.type === 'select' ? (
                  <View style={styles.selectContainer}>
                    <Text style={styles.selectText}>请选择...</Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </View>
                ) : (
                  <TextInput
                    style={styles.input}
                    placeholder={`输入${field.name}`}
                    keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                  />
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 10,
    fontSize: 16,
  },
  categoryFilter: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  activeCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeCategoryButtonText: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitle: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 14,
    color: '#007AFF',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  cardStats: {
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: '#f0f8ff',
  },
  editButtonText: {
    color: '#007AFF',
    marginLeft: 5,
    fontSize: 14,
  },
  generateButton: {
    backgroundColor: '#007AFF',
  },
  generateButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  downloadButton: {
    backgroundColor: '#34C759',
    alignSelf: 'flex-start',
  },
  downloadButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statuscompleted: {
    backgroundColor: '#d4edda',
  },
  statusgenerating: {
    backgroundColor: '#fff3cd',
  },
  statusfailed: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reportInfo: {
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  selectText: {
    fontSize: 16,
    color: '#999',
  },
  chartContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default ReportGenerator;