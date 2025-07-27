import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animated = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      return () => animation.stop();
    }
  }, [animated, animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: animated ? opacity : 0.3,
        },
        style,
      ]}
    />
  );
};

interface SkeletonCardProps {
  showAvatar?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showContent?: boolean;
  lines?: number;
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = true,
  showTitle = true,
  showSubtitle = true,
  showContent = true,
  lines = 3,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        {showAvatar && (
          <Skeleton width={50} height={50} borderRadius={25} style={styles.avatar} />
        )}
        <View style={styles.headerText}>
          {showTitle && <Skeleton width="70%" height={16} style={styles.title} />}
          {showSubtitle && <Skeleton width="50%" height={12} style={styles.subtitle} />}
        </View>
      </View>
      
      {showContent && (
        <View style={styles.content}>
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              width={index === lines - 1 ? '60%' : '100%'}
              height={12}
              style={styles.contentLine}
            />
          ))}
        </View>
      )}
    </View>
  );
};

interface SkeletonListProps {
  itemCount?: number;
  showAvatar?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showContent?: boolean;
  lines?: number;
  style?: ViewStyle;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  itemCount = 5,
  showAvatar = true,
  showTitle = true,
  showSubtitle = true,
  showContent = true,
  lines = 2,
  style,
}) => {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <SkeletonCard
          key={index}
          showAvatar={showAvatar}
          showTitle={showTitle}
          showSubtitle={showSubtitle}
          showContent={showContent}
          lines={lines}
          style={styles.listItem}
        />
      ))}
    </View>
  );
};

interface SkeletonJobCardProps {
  style?: ViewStyle;
}

export const SkeletonJobCard: React.FC<SkeletonJobCardProps> = ({ style }) => {
  return (
    <View style={[styles.jobCard, style]}>
      <View style={styles.jobHeader}>
        <Skeleton width={40} height={40} borderRadius={8} style={styles.companyLogo} />
        <View style={styles.jobInfo}>
          <Skeleton width="80%" height={18} style={styles.jobTitle} />
          <Skeleton width="60%" height={14} style={styles.companyName} />
          <Skeleton width="40%" height={12} style={styles.location} />
        </View>
      </View>
      
      <View style={styles.jobDetails}>
        <Skeleton width="100%" height={12} style={styles.description} />
        <Skeleton width="80%" height={12} style={styles.description} />
        <Skeleton width="60%" height={12} style={styles.description} />
      </View>
      
      <View style={styles.jobFooter}>
        <Skeleton width="30%" height={14} style={styles.salary} />
        <Skeleton width="20%" height={14} style={styles.jobType} />
      </View>
    </View>
  );
};

interface SkeletonProfileProps {
  style?: ViewStyle;
}

export const SkeletonProfile: React.FC<SkeletonProfileProps> = ({ style }) => {
  return (
    <View style={[styles.profile, style]}>
      <View style={styles.profileHeader}>
        <Skeleton width={80} height={80} borderRadius={40} style={styles.profileAvatar} />
        <View style={styles.profileInfo}>
          <Skeleton width="70%" height={20} style={styles.profileName} />
          <Skeleton width="50%" height={16} style={styles.profileTitle} />
          <Skeleton width="60%" height={14} style={styles.profileLocation} />
        </View>
      </View>
      
      <View style={styles.profileStats}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.statItem}>
            <Skeleton width={40} height={16} style={styles.statValue} />
            <Skeleton width={60} height={12} style={styles.statLabel} />
          </View>
        ))}
      </View>
      
      <View style={styles.profileContent}>
        <Skeleton width="100%" height={12} style={styles.bio} />
        <Skeleton width="90%" height={12} style={styles.bio} />
        <Skeleton width="70%" height={12} style={styles.bio} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
  card: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    marginBottom: 6,
  },
  subtitle: {},
  content: {
    marginTop: 8,
  },
  contentLine: {
    marginBottom: 6,
  },
  list: {
    padding: 16,
  },
  listItem: {
    marginBottom: 8,
  },
  jobCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyLogo: {
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    marginBottom: 6,
  },
  companyName: {
    marginBottom: 4,
  },
  location: {},
  jobDetails: {
    marginBottom: 12,
  },
  description: {
    marginBottom: 4,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salary: {},
  jobType: {},
  profile: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    marginBottom: 8,
  },
  profileTitle: {
    marginBottom: 6,
  },
  profileLocation: {},
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    marginBottom: 4,
  },
  statLabel: {},
  profileContent: {},
  bio: {
    marginBottom: 6,
  },
});