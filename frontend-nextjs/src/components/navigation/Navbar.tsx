'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useTheme } from '../providers/ThemeProvider';
import { 
  Home, 
  Briefcase, 
  Users, 
  MessageCircle, 
  User, 
  Search,
  Bell,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

const navigationItems = [
  { name: '首页', href: '/', icon: Home },
  { name: '职位', href: '/jobs', icon: Briefcase },
  { name: '网络', href: '/network', icon: Users },
  { name: '消息', href: '/messages', icon: MessageCircle },
  { name: '我的', href: '/profile', icon: User },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const { mode, toggleTheme } = useTheme();

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-medium flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-text">City Work</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-medium text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-gray hover:text-text hover:bg-gray/10'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray" />
              </div>
              <input
                type="text"
                placeholder="搜索职位、公司..."
                className="input pl-10 w-64"
              />
            </div>

            {/* Notifications */}
            <button className="p-2 text-gray hover:text-text hover:bg-gray/10 rounded-medium transition-colors">
              <Bell size={20} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray hover:text-text hover:bg-gray/10 rounded-medium transition-colors"
            >
              {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* User Avatar */}
            {user ? (
              <Link href="/profile" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </Link>
            ) : (
              <Link href="/login" className="btn btn-primary">
                登录
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray hover:text-text hover:bg-gray/10 rounded-medium transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-medium text-base font-medium transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-gray hover:text-text hover:bg-gray/10'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Mobile Search */}
            <div className="px-3 py-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray" />
                </div>
                <input
                  type="text"
                  placeholder="搜索职位、公司..."
                  className="input pl-10 w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}