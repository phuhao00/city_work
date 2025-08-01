'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/features/auth/authSlice';
import Navbar from '@/components/navigation/Navbar';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  Sun, 
  Eye, 
  EyeOff,
  Save,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Lock,
  Trash2,
  Download,
  Upload
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'notifications' | 'account'>('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // 个人资料状态
  const [profileData, setProfileData] = useState({
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '+86 138 0013 8000',
    location: '北京市朝阳区',
    company: '字节跳动',
    position: '前端开发工程师',
    bio: '热爱技术，专注于前端开发和用户体验设计。'
  });
  
  // 隐私设置状态
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public', // public, connections, private
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    allowConnections: true,
    searchable: true
  });
  
  // 通知设置状态
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    messageNotifications: true,
    connectionRequests: true,
    companyUpdates: false,
    weeklyDigest: true,
    marketingEmails: false
  });
  
  // 密码修改状态
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // 模拟保存
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('个人资料已保存');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1000);
  };

  const handleSavePrivacy = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('隐私设置已保存');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1000);
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('通知设置已保存');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1000);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveMessage('新密码确认不匹配');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('密码已修改');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1000);
  };

  const handleDeleteAccount = () => {
    if (confirm('确定要删除账户吗？此操作不可撤销。')) {
      // 模拟删除账户
      dispatch(logout());
      router.push('/login');
    }
  };

  const handleExportData = () => {
    // 模拟导出数据
    const data = {
      profile: profileData,
      privacy: privacySettings,
      notifications: notificationSettings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'privacy', label: '隐私设置', icon: Shield },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'account', label: '账户安全', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>
        
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">设置</h1>
          <p className="text-gray-600">管理你的账户设置和偏好</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏导航 */}
          <div className="lg:col-span-1">
           <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
          
          {/* 主要内容区域 */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              {/* 保存消息 */}
              {saveMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  {saveMessage}
                </div>
              )}
              
              {/* 个人资料 */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text mb-4">个人资料</h2>
                    <p className="text-gray-600 mb-6">更新你的个人信息和联系方式</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        姓名
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        邮箱
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        电话
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        位置
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Briefcase className="w-4 h-4 inline mr-2" />
                        公司
                      </label>
                      <input
                        type="text"
                        value={profileData.company}
                        onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        职位
                      </label>
                      <input
                        type="text"
                        value={profileData.position}
                        onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      个人简介
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="input-field"
                      placeholder="介绍一下你自己..."
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="btn-primary px-6 py-2 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? '保存中...' : '保存更改'}</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* 隐私设置 */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text mb-4">隐私设置</h2>
                    <p className="text-gray-600 mb-6">控制你的信息可见性和隐私偏好</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        个人资料可见性
                      </label>
                      <select
                        value={privacySettings.profileVisibility}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                        className="input-field"
                      >
                        <option value="public">公开 - 所有人可见</option>
                        <option value="connections">仅联系人可见</option>
                        <option value="private">私密 - 仅自己可见</option>
                      </select>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">显示邮箱地址</h3>
                          <p className="text-sm text-gray-600">允许其他用户查看你的邮箱地址</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings.showEmail}
                            onChange={(e) => setPrivacySettings(prev => ({ ...prev, showEmail: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">显示电话号码</h3>
                          <p className="text-sm text-gray-600">允许其他用户查看你的电话号码</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings.showPhone}
                            onChange={(e) => setPrivacySettings(prev => ({ ...prev, showPhone: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">允许接收消息</h3>
                          <p className="text-sm text-gray-600">允许其他用户向你发送私信</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings.allowMessages}
                            onChange={(e) => setPrivacySettings(prev => ({ ...prev, allowMessages: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">允许连接请求</h3>
                          <p className="text-sm text-gray-600">允许其他用户向你发送连接请求</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings.allowConnections}
                            onChange={(e) => setPrivacySettings(prev => ({ ...prev, allowConnections: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">允许搜索</h3>
                          <p className="text-sm text-gray-600">允许其他用户通过搜索找到你</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings.searchable}
                            onChange={(e) => setPrivacySettings(prev => ({ ...prev, searchable: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleSavePrivacy}
                      disabled={isSaving}
                      className="btn-primary px-6 py-2 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? '保存中...' : '保存更改'}</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* 通知设置 */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text mb-4">通知设置</h2>
                    <p className="text-gray-600 mb-6">管理你希望接收的通知类型</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">通知方式</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">邮件通知</h4>
                            <p className="text-sm text-gray-600">通过邮件接收重要通知</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.emailNotifications}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">推送通知</h4>
                            <p className="text-sm text-gray-600">在浏览器中接收推送通知</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.pushNotifications}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">通知内容</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">职位推荐</h4>
                            <p className="text-sm text-gray-600">接收匹配的职位推荐</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.jobAlerts}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, jobAlerts: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">消息通知</h4>
                            <p className="text-sm text-gray-600">接收新消息通知</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.messageNotifications}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, messageNotifications: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">连接请求</h4>
                            <p className="text-sm text-gray-600">接收新的连接请求通知</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.connectionRequests}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, connectionRequests: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">公司动态</h4>
                            <p className="text-sm text-gray-600">接收关注公司的最新动态</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.companyUpdates}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, companyUpdates: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">周报摘要</h4>
                            <p className="text-sm text-gray-600">每周接收活动摘要邮件</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.weeklyDigest}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyDigest: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">营销邮件</h4>
                            <p className="text-sm text-gray-600">接收产品更新和营销信息</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.marketingEmails}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotifications}
                      disabled={isSaving}
                      className="btn-primary px-6 py-2 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? '保存中...' : '保存更改'}</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* 账户安全 */}
              {activeTab === 'account' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-text mb-4">账户安全</h2>
                    <p className="text-gray-600 mb-6">管理你的密码和账户安全设置</p>
                  </div>
                  
                  {/* 修改密码 */}
                  <div className="border border-border rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">修改密码</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          当前密码
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="input-field pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          新密码
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="input-field pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          确认新密码
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="input-field"
                        />
                      </div>
                      
                      <button
                        onClick={handleChangePassword}
                        disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="btn-primary px-6 py-2 flex items-center space-x-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>{isSaving ? '修改中...' : '修改密码'}</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* 数据管理 */}
                  <div className="border border-border rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">数据管理</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">导出数据</h4>
                          <p className="text-sm text-gray-600">下载你的个人数据副本</p>
                        </div>
                        <button
                          onClick={handleExportData}
                          className="btn-outline px-4 py-2 flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>导出</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* 危险操作 */}
                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <h3 className="text-lg font-medium text-red-900 mb-4">危险操作</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-900">删除账户</h4>
                          <p className="text-sm text-red-700">永久删除你的账户和所有数据，此操作不可撤销</p>
                        </div>
                        <button
                          onClick={handleDeleteAccount}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>删除账户</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}