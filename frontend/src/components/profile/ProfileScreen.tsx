import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/index';
import { useTheme } from '../../theme/ThemeProvider';
import { logout } from '../../features/auth/authSlice';

interface ProfileScreenProps {
  navigation?: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen when implemented
    console.log('Edit profile pressed');
  };

  const menuItems = [
    {
      title: 'Edit Profile',
      onPress: handleEditProfile,
      icon: '✏️',
    },
    {
      title: 'My Applications',
      onPress: () => console.log('My applications pressed'),
      icon: '📄',
    },
    {
      title: 'Saved Jobs',
      onPress: () => console.log('Saved jobs pressed'),
      icon: '💾',
    },
    {
      title: 'Settings',
      onPress: () => console.log('Settings pressed'),
      icon: '⚙️',
    },
    {
      title: 'Help & Support',
      onPress: () => console.log('Help pressed'),
      icon: '❓',
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: theme.colors.card }]}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
            </Text>
          )}
        </View>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {user?.firstName && user?.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user?.email || 'User'
          }
        </Text>
        <Text style={[styles.userEmail, { color: theme.colors.gray }]}>
          {user?.email || 'No email'}
        </Text>
        <Text style={[styles.userRole, { color: theme.colors.primary }]}>
          {user?.role || 'JOBSEEKER'}
        </Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }
            ]}
            onPress={item.onPress}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.menuArrow, { color: theme.colors.gray }]}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={[styles.appInfoText, { color: theme.colors.gray }]}>
          City Work v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    padding: 16,
  },
  appInfoText: {
    fontSize: 12,
  },
});