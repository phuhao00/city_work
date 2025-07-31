'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/features/auth/authSlice';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navigation/Navbar';
import { User, MapPin, Mail, Phone, Calendar, Edit, Settings, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '张三',
    email: user?.email || 'zhangsan@example.com',
    phone: '+86 138 0013 8000',
    location: '北京市朝阳区',
    bio: '资深前端开发工程师，专注于React和Vue.js开发，有5年以上工作经验。',
    company: '阿里巴巴集团',
    position: '高级前端工程师',
    experience: '5年',
    education: '北京大学 - 计算机科学与技术',
    skills: ['React', 'Vue.js', 'TypeScript', 'Node.js', 'Python']
  });

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const handleSave = () => {
    // 这里应该调用API保存用户信息
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 个人信息卡片 */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-2xl font-bold bg-transparent border-b border-border focus:outline-none focus:border-primary"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-text">{profileData.name}</h1>
                )}
                <p className="text-gray-600">{profileData.position}</p>
                <p className="text-gray-500">{profileData.company}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="btn-primary px-4 py-2"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-outline px-4 py-2"
                  >
                    取消
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-outline px-4 py-2 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>编辑</span>
                </button>
              )}
            </div>
          </div>
          
          {/* 联系信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <Mail className="w-4 h-4" />
              {isEditing ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-transparent border-b border-border focus:outline-none focus:border-primary flex-1"
                />
              ) : (
                <span>{profileData.email}</span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Phone className="w-4 h-4" />
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-transparent border-b border-border focus:outline-none focus:border-primary flex-1"
                />
              ) : (
                <span>{profileData.phone}</span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="bg-transparent border-b border-border focus:outline-none focus:border-primary flex-1"
                />
              ) : (
                <span>{profileData.location}</span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{profileData.experience} 工作经验</span>
            </div>
          </div>
          
          {/* 个人简介 */}
          <div>
            <h3 className="text-lg font-semibold mb-2">个人简介</h3>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            ) : (
              <p className="text-gray-600">{profileData.bio}</p>
            )}
          </div>
        </div>
        
        {/* 技能标签 */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">技能标签</h3>
          <div className="flex flex-wrap gap-2">
            {profileData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        {/* 教育背景 */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">教育背景</h3>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{profileData.education}</h4>
              <p className="text-gray-600">2015 - 2019</p>
            </div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex space-x-4">
          <button className="btn-outline px-6 py-3 flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>账户设置</span>
          </button>
          <button
            onClick={handleLogout}
            className="btn-outline px-6 py-3 flex items-center space-x-2 text-error border-error hover:bg-error hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </div>
  );
}