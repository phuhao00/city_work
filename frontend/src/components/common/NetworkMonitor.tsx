import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface NetworkState {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean;
  strength?: number;
  speed?: number;
}

interface NetworkMonitorProps {
  onNetworkChange?: (state: NetworkState) => void;
  showNotification?: boolean;
  autoHide?: boolean;
  hideDelay?: number;
}

const NetworkMonitor: React.FC<NetworkMonitorProps> = ({
  onNetworkChange,
  showNotification = true,
  autoHide = true,
  hideDelay = 3000,
}) => {
  const { theme } = useTheme();
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    type: 'unknown',
    isInternetReachable: true,
  });
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  // 网络状态检测
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const newNetworkState: NetworkState = {
        isConnected: state.isConnected ?? false,
        type: state.type,
        isInternetReachable: state.isInternetReachable ?? false,
        strength: state.details?.strength,
        speed: state.details?.downlinkMax,
      };

      setNetworkState(newNetworkState);
      onNetworkChange?.(newNetworkState);

      // 显示网络状态通知
      if (showNotification) {
        handleNetworkStatusChange(newNetworkState);
      }
    });

    return () => unsubscribe();
  }, [onNetworkChange, showNotification]);

  // 处理网络状态变化
  const handleNetworkStatusChange = useCallback((state: NetworkState) => {
    let message = '';
    let shouldShow = false;

    if (!state.isConnected) {
      message = '网络连接已断开';
      shouldShow = true;
    } else if (!state.isInternetReachable) {
      message = '网络连接不稳定';
      shouldShow = true;
    } else if (state.type === 'cellular') {
      message = '正在使用移动网络';
      shouldShow = true;
    } else if (state.type === 'wifi') {
      message = '已连接到WiFi';
      shouldShow = autoHide; // 只有在自动隐藏时才显示WiFi连接消息
    }

    if (shouldShow) {
      setBannerMessage(message);
      showBannerNotification();
    }
  }, [autoHide]);

  // 显示横幅通知
  const showBannerNotification = useCallback(() => {
    setShowBanner(true);
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (autoHide) {
      setTimeout(() => {
        hideBannerNotification();
      }, hideDelay);
    }
  }, [slideAnim, autoHide, hideDelay]);

  // 隐藏横幅通知
  const hideBannerNotification = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowBanner(false);
    });
  }, [slideAnim]);

  // 获取网络图标
  const getNetworkIcon = () => {
    if (!networkState.isConnected) {
      return 'wifi-off';
    }
    
    switch (networkState.type) {
      case 'wifi':
        return 'wifi';
      case 'cellular':
        return 'cellular';
      case 'ethernet':
        return 'globe';
      default:
        return 'help-circle';
    }
  };

  // 获取网络状态颜色
  const getStatusColor = () => {
    if (!networkState.isConnected || !networkState.isInternetReachable) {
      return theme.colors.error;
    }
    
    switch (networkState.type) {
      case 'wifi':
        return theme.colors.success;
      case 'cellular':
        return theme.colors.warning;
      default:
        return theme.colors.primary;
    }
  };

  // 获取信号强度
  const getSignalStrength = () => {
    if (!networkState.strength) return null;
    
    const strength = networkState.strength;
    if (strength >= 80) return 'excellent';
    if (strength >= 60) return 'good';
    if (strength >= 40) return 'fair';
    return 'poor';
  };

  // 格式化网络速度
  const formatSpeed = (speed?: number) => {
    if (!speed) return 'Unknown';
    
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(1)} Gbps`;
    }
    return `${speed.toFixed(1)} Mbps`;
  };

  const styles = StyleSheet.create({
    banner: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: getStatusColor(),
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    bannerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    bannerIcon: {
      marginRight: 8,
    },
    bannerText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
    },
    closeButton: {
      padding: 4,
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginHorizontal: 16,
      marginVertical: 8,
    },
    statusIcon: {
      marginRight: 6,
    },
    statusText: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: '500',
    },
    detailsContainer: {
      backgroundColor: theme.colors.surface,
      margin: 16,
      padding: 16,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
    },
    detailsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
    },
    detailLabel: {
      fontSize: 14,
      color: theme.colors.gray,
    },
    detailValue: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },
  });

  return (
    <>
      {/* 网络状态横幅 */}
      {showBanner && (
        <Animated.View
          style={[
            styles.banner,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.bannerContent}>
            <Ionicons
              name={getNetworkIcon()}
              size={20}
              color="#fff"
              style={styles.bannerIcon}
            />
            <Text style={styles.bannerText}>{bannerMessage}</Text>
          </View>
          {!autoHide && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={hideBannerNotification}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </>
  );
};

// 网络状态指示器组件
export const NetworkStatusIndicator: React.FC = () => {
  const { theme } = useTheme();
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    type: 'unknown',
    isInternetReachable: true,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        type: state.type,
        isInternetReachable: state.isInternetReachable ?? false,
        strength: state.details?.strength,
        speed: state.details?.downlinkMax,
      });
    });

    return () => unsubscribe();
  }, []);

  const getNetworkIcon = () => {
    if (!networkState.isConnected) return 'wifi-off';
    
    switch (networkState.type) {
      case 'wifi':
        return 'wifi';
      case 'cellular':
        return 'cellular';
      default:
        return 'globe';
    }
  };

  const getStatusColor = () => {
    if (!networkState.isConnected || !networkState.isInternetReachable) {
      return theme.colors.error;
    }
    return theme.colors.success;
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    icon: {
      marginRight: 6,
    },
    text: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      <Ionicons
        name={getNetworkIcon()}
        size={16}
        color={getStatusColor()}
        style={styles.icon}
      />
      <Text style={styles.text}>
        {networkState.isConnected ? networkState.type.toUpperCase() : 'OFFLINE'}
      </Text>
    </View>
  );
};

// 网络详情组件
export const NetworkDetails: React.FC = () => {
  const { theme } = useTheme();
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    type: 'unknown',
    isInternetReachable: true,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        type: state.type,
        isInternetReachable: state.isInternetReachable ?? false,
        strength: state.details?.strength,
        speed: state.details?.downlinkMax,
      });
    });

    return () => unsubscribe();
  }, []);

  const formatSpeed = (speed?: number) => {
    if (!speed) return '未知';
    
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(1)} Gbps`;
    }
    return `${speed.toFixed(1)} Mbps`;
  };

  const getSignalStrength = () => {
    if (!networkState.strength) return '未知';
    
    const strength = networkState.strength;
    if (strength >= 80) return '优秀';
    if (strength >= 60) return '良好';
    if (strength >= 40) return '一般';
    return '较差';
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      margin: 16,
      padding: 16,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
    },
    label: {
      fontSize: 14,
      color: theme.colors.gray,
    },
    value: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>网络详情</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>连接状态</Text>
        <Text style={styles.value}>
          {networkState.isConnected ? '已连接' : '未连接'}
        </Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>网络类型</Text>
        <Text style={styles.value}>{networkState.type.toUpperCase()}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>互联网访问</Text>
        <Text style={styles.value}>
          {networkState.isInternetReachable ? '可用' : '不可用'}
        </Text>
      </View>
      
      {networkState.strength && (
        <View style={styles.row}>
          <Text style={styles.label}>信号强度</Text>
          <Text style={styles.value}>
            {getSignalStrength()} ({networkState.strength}%)
          </Text>
        </View>
      )}
      
      {networkState.speed && (
        <View style={styles.row}>
          <Text style={styles.label}>网络速度</Text>
          <Text style={styles.value}>{formatSpeed(networkState.speed)}</Text>
        </View>
      )}
    </View>
  );
};

// Hook for network state
export const useNetworkState = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    type: 'unknown',
    isInternetReachable: true,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        type: state.type,
        isInternetReachable: state.isInternetReachable ?? false,
        strength: state.details?.strength,
        speed: state.details?.downlinkMax,
      });
    });

    return () => unsubscribe();
  }, []);

  return networkState;
};

export default NetworkMonitor;