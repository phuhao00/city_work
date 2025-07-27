import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Text,
  ImageStyle,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { cacheManager } from '../../utils/CacheManager';

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  placeholder?: React.ReactNode;
  errorComponent?: React.ReactNode;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  quality?: 'low' | 'medium' | 'high';
  lazy?: boolean;
  cache?: boolean;
  fadeInDuration?: number;
  onLoad?: () => void;
  onError?: (error: any) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  blurRadius?: number;
  progressive?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  containerStyle,
  placeholder,
  errorComponent,
  resizeMode = 'cover',
  quality = 'medium',
  lazy = false,
  cache = true,
  fadeInDuration = 300,
  onLoad,
  onError,
  onLoadStart,
  onLoadEnd,
  blurRadius,
  progressive = true,
  ...props
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [inView, setInView] = useState(!lazy);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const viewRef = useRef<View>(null);

  // 图片质量参数
  const getQualityParams = (quality: string) => {
    switch (quality) {
      case 'low':
        return { q: 30, w: 400 };
      case 'medium':
        return { q: 60, w: 800 };
      case 'high':
        return { q: 90, w: 1200 };
      default:
        return { q: 60, w: 800 };
    }
  };

  // 优化图片URL
  const optimizeImageUrl = (url: string) => {
    if (typeof source === 'number') return source;
    
    const { q, w } = getQualityParams(quality);
    
    // 如果是网络图片，添加优化参数
    if (url.startsWith('http')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}q=${q}&w=${w}&auto=format`;
    }
    
    return url;
  };

  // 懒加载检测
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = viewRef.current;
    if (currentRef) {
      // React Native 中需要使用其他方式实现懒加载
      // 这里简化处理，实际项目中可以使用 react-native-super-grid 等库
      setInView(true);
    }

    return () => {
      if (currentRef) {
        // observer.unobserve(currentRef);
      }
    };
  }, [lazy]);

  // 缓存处理
  const getCachedImage = async (url: string) => {
    if (!cache) return url;
    
    const cacheKey = `image_${url}`;
    const cached = await cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // 在实际项目中，这里可以下载图片并缓存到本地
    await cacheManager.set(cacheKey, url, { ttl: 24 * 60 * 60 * 1000 }); // 24小时
    return url;
  };

  // 图片加载处理
  const handleImageLoad = () => {
    setLoading(false);
    setImageLoaded(true);
    setError(false);
    
    // 淡入动画
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: fadeInDuration,
      useNativeDriver: true,
    }).start();
    
    onLoad?.();
  };

  const handleImageError = (err: any) => {
    setLoading(false);
    setError(true);
    setImageLoaded(false);
    onError?.(err);
  };

  const handleLoadStart = () => {
    setLoading(true);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    onLoadEnd?.();
  };

  // 获取图片源
  const getImageSource = () => {
    if (typeof source === 'number') {
      return source;
    }
    
    const optimizedUrl = optimizeImageUrl(source.uri);
    return { uri: optimizedUrl };
  };

  const styles = StyleSheet.create({
    container: {
      overflow: 'hidden',
      backgroundColor: theme.colors.gray + '10',
      ...containerStyle,
    },
    image: {
      width: '100%',
      height: '100%',
      ...style,
    },
    placeholder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.gray + '10',
    },
    placeholderText: {
      marginTop: 8,
      fontSize: 12,
      color: theme.colors.gray,
      textAlign: 'center',
    },
    errorContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.gray + '10',
    },
    errorText: {
      marginTop: 8,
      fontSize: 12,
      color: theme.colors.error,
      textAlign: 'center',
    },
    progressiveContainer: {
      position: 'relative',
    },
    progressiveBlur: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  });

  // 如果启用懒加载且不在视图中，显示占位符
  if (lazy && !inView) {
    return (
      <View ref={viewRef} style={[styles.container, containerStyle]}>
        {placeholder || (
          <View style={styles.placeholder}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.placeholderText}>加载中...</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {/* 渐进式加载 */}
      {progressive && loading && (
        <View style={styles.progressiveContainer}>
          <Image
            source={getImageSource()}
            style={[styles.image, styles.progressiveBlur]}
            blurRadius={20}
            resizeMode={resizeMode}
          />
        </View>
      )}

      {/* 主图片 */}
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <Image
          source={getImageSource()}
          style={styles.image}
          resizeMode={resizeMode}
          blurRadius={blurRadius}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          {...props}
        />
      </Animated.View>

      {/* 加载状态 */}
      {loading && !progressive && (
        <View style={styles.placeholder}>
          {placeholder || (
            <>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.placeholderText}>加载中...</Text>
            </>
          )}
        </View>
      )}

      {/* 错误状态 */}
      {error && (
        <View style={styles.errorContainer}>
          {errorComponent || (
            <>
              <Text style={styles.errorText}>图片加载失败</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
};

// 图片预加载工具
export const preloadImages = async (urls: string[]) => {
  const promises = urls.map(url => {
    return new Promise((resolve, reject) => {
      Image.prefetch(url)
        .then(() => resolve(url))
        .catch(reject);
    });
  });

  try {
    await Promise.all(promises);
    console.log('Images preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload some images:', error);
  }
};

// 图片缓存清理工具
export const clearImageCache = async () => {
  try {
    const keys = await cacheManager.keys();
    const imageKeys = keys.filter(key => key.startsWith('image_'));
    
    for (const key of imageKeys) {
      await cacheManager.delete(key.replace('image_', ''));
    }
    
    console.log('Image cache cleared');
  } catch (error) {
    console.warn('Failed to clear image cache:', error);
  }
};

// 获取图片缓存大小
export const getImageCacheSize = async () => {
  try {
    const keys = await cacheManager.keys();
    const imageKeys = keys.filter(key => key.startsWith('image_'));
    return imageKeys.length;
  } catch (error) {
    console.warn('Failed to get image cache size:', error);
    return 0;
  }
};

export default OptimizedImage;