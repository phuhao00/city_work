import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { debounce, throttle } from '../../utils/PerformanceUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface GestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onRotate?: (rotation: number) => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  style?: any;
}

export function GestureHandler({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onRotate,
  onLongPress,
  onDoubleTap,
  swipeThreshold = 50,
  longPressDelay = 500,
  doubleTapDelay = 300,
  style,
}: GestureHandlerProps) {
  const [gestureState, setGestureState] = useState({
    isPressed: false,
    startTime: 0,
    lastTapTime: 0,
    tapCount: 0,
  });

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const doubleTapTimer = useRef<NodeJS.Timeout | null>(null);

  // 手势开始
  const handleGestureBegin = useCallback(() => {
    const now = Date.now();
    setGestureState(prev => ({
      ...prev,
      isPressed: true,
      startTime: now,
    }));

    // 长按检测
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay]);

  // 手势结束
  const handleGestureEnd = useCallback((event: any) => {
    const { translationX, translationY, velocityX, velocityY } = event.nativeEvent;
    const now = Date.now();

    // 清除长按定时器
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    setGestureState(prev => {
      const duration = now - prev.startTime;
      
      // 检测滑动手势
      if (Math.abs(translationX) > swipeThreshold || Math.abs(translationY) > swipeThreshold) {
        if (Math.abs(translationX) > Math.abs(translationY)) {
          // 水平滑动
          if (translationX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (translationX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // 垂直滑动
          if (translationY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (translationY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }
      // 检测点击手势
      else if (duration < 200 && Math.abs(translationX) < 10 && Math.abs(translationY) < 10) {
        const timeSinceLastTap = now - prev.lastTapTime;
        
        if (timeSinceLastTap < doubleTapDelay) {
          // 双击
          if (doubleTapTimer.current) {
            clearTimeout(doubleTapTimer.current);
            doubleTapTimer.current = null;
          }
          
          if (onDoubleTap) {
            onDoubleTap();
          }
          
          return {
            ...prev,
            isPressed: false,
            tapCount: 0,
            lastTapTime: 0,
          };
        } else {
          // 单击（延迟执行以检测双击）
          if (doubleTapTimer.current) {
            clearTimeout(doubleTapTimer.current);
          }
          
          doubleTapTimer.current = setTimeout(() => {
            // 单击处理（如果需要）
          }, doubleTapDelay);
          
          return {
            ...prev,
            isPressed: false,
            tapCount: 1,
            lastTapTime: now,
          };
        }
      }

      return {
        ...prev,
        isPressed: false,
      };
    });

    // 重置动画值
    Animated.parallel([
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(rotation, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, [
    swipeThreshold,
    doubleTapDelay,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onDoubleTap,
    translateX,
    translateY,
    scale,
    rotation,
  ]);

  // 手势更新
  const handleGestureUpdate = useCallback(
    throttle((event: any) => {
      const { translationX, translationY } = event.nativeEvent;
      
      translateX.setValue(translationX);
      translateY.setValue(translationY);
    }, 16), // 60fps
    [translateX, translateY]
  );

  return (
    <PanGestureHandler
      onGestureEvent={handleGestureUpdate}
      onHandlerStateChange={(event) => {
        if (event.nativeEvent.state === State.BEGAN) {
          handleGestureBegin();
        } else if (event.nativeEvent.state === State.END) {
          handleGestureEnd(event);
        }
      }}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [
              { translateX },
              { translateY },
              { scale },
              { rotate: rotation.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              }) },
            ],
          },
        ]}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}

// 可拖拽组件
interface DraggableProps {
  children: React.ReactNode;
  onDragEnd?: (x: number, y: number) => void;
  bounds?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  snapToGrid?: {
    x: number;
    y: number;
  };
  disabled?: boolean;
  style?: any;
}

export function Draggable({
  children,
  onDragEnd,
  bounds,
  snapToGrid,
  disabled = false,
  style,
}: DraggableProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [isDragging, setIsDragging] = useState(false);

  const handleGestureEvent = useCallback(
    throttle((event: any) => {
      if (disabled) return;

      const { translationX, translationY } = event.nativeEvent;
      
      let newX = translationX;
      let newY = translationY;

      // 应用边界限制
      if (bounds) {
        if (bounds.left !== undefined) newX = Math.max(newX, bounds.left);
        if (bounds.right !== undefined) newX = Math.min(newX, bounds.right);
        if (bounds.top !== undefined) newY = Math.max(newY, bounds.top);
        if (bounds.bottom !== undefined) newY = Math.min(newY, bounds.bottom);
      }

      translateX.setValue(newX);
      translateY.setValue(newY);
    }, 16),
    [disabled, bounds, translateX, translateY]
  );

  const handleStateChange = useCallback((event: any) => {
    if (disabled) return;

    const { state, translationX, translationY } = event.nativeEvent;

    if (state === State.BEGAN) {
      setIsDragging(true);
    } else if (state === State.END) {
      setIsDragging(false);

      let finalX = translationX;
      let finalY = translationY;

      // 网格对齐
      if (snapToGrid) {
        finalX = Math.round(finalX / snapToGrid.x) * snapToGrid.x;
        finalY = Math.round(finalY / snapToGrid.y) * snapToGrid.y;
      }

      // 应用边界限制
      if (bounds) {
        if (bounds.left !== undefined) finalX = Math.max(finalX, bounds.left);
        if (bounds.right !== undefined) finalX = Math.min(finalX, bounds.right);
        if (bounds.top !== undefined) finalY = Math.max(finalY, bounds.top);
        if (bounds.bottom !== undefined) finalY = Math.min(finalY, bounds.bottom);
      }

      // 动画到最终位置
      Animated.parallel([
        Animated.spring(translateX, { toValue: finalX, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: finalY, useNativeDriver: true }),
      ]).start();

      if (onDragEnd) {
        onDragEnd(finalX, finalY);
      }
    }
  }, [disabled, snapToGrid, bounds, onDragEnd, translateX, translateY]);

  return (
    <PanGestureHandler
      onGestureEvent={handleGestureEvent}
      onHandlerStateChange={handleStateChange}
      enabled={!disabled}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ translateX }, { translateY }],
            opacity: isDragging ? 0.8 : 1,
          },
        ]}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}

// 可缩放组件
interface ScalableProps {
  children: React.ReactNode;
  onScaleChange?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
  disabled?: boolean;
  style?: any;
}

export function Scalable({
  children,
  onScaleChange,
  minScale = 0.5,
  maxScale = 3,
  disabled = false,
  style,
}: ScalableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const [isScaling, setIsScaling] = useState(false);

  const handlePinchGestureEvent = useCallback(
    throttle((event: any) => {
      if (disabled) return;

      const { scale: gestureScale } = event.nativeEvent;
      const newScale = Math.max(minScale, Math.min(maxScale, gestureScale));
      
      scale.setValue(newScale);
      
      if (onScaleChange) {
        onScaleChange(newScale);
      }
    }, 16),
    [disabled, minScale, maxScale, onScaleChange, scale]
  );

  const handlePinchStateChange = useCallback((event: any) => {
    if (disabled) return;

    const { state } = event.nativeEvent;

    if (state === State.BEGAN) {
      setIsScaling(true);
    } else if (state === State.END) {
      setIsScaling(false);
    }
  }, [disabled]);

  return (
    <PinchGestureHandler
      onGestureEvent={handlePinchGestureEvent}
      onHandlerStateChange={handlePinchStateChange}
      enabled={!disabled}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </PinchGestureHandler>
  );
}

// 滑动删除组件
interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete?: () => void;
  deleteThreshold?: number;
  deleteText?: string;
  deleteColor?: string;
  style?: any;
}

export function SwipeToDelete({
  children,
  onDelete,
  deleteThreshold = 100,
  deleteText = '删除',
  deleteColor = '#FF3B30',
  style,
}: SwipeToDeleteProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleGestureEvent = useCallback(
    throttle((event: any) => {
      const { translationX } = event.nativeEvent;
      
      // 只允许向左滑动
      const newTranslateX = Math.min(0, translationX);
      translateX.setValue(newTranslateX);
    }, 16),
    [translateX]
  );

  const handleStateChange = useCallback((event: any) => {
    const { state, translationX } = event.nativeEvent;

    if (state === State.END) {
      if (Math.abs(translationX) > deleteThreshold) {
        // 触发删除
        setIsDeleting(true);
        Animated.timing(translateX, {
          toValue: -screenWidth,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (onDelete) {
            onDelete();
          }
        });
      } else {
        // 回弹
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [deleteThreshold, onDelete, translateX]);

  const deleteOpacity = translateX.interpolate({
    inputRange: [-deleteThreshold, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.swipeContainer, style]}>
      {/* 删除背景 */}
      <Animated.View
        style={[
          styles.deleteBackground,
          { backgroundColor: deleteColor, opacity: deleteOpacity },
        ]}
      >
        <Text style={styles.deleteText}>{deleteText}</Text>
      </Animated.View>

      {/* 主内容 */}
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View
          style={[
            styles.swipeContent,
            { transform: [{ translateX }] },
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  swipeContent: {
    backgroundColor: '#FFFFFF',
  },
});

export default {
  GestureHandler,
  Draggable,
  Scalable,
  SwipeToDelete,
};