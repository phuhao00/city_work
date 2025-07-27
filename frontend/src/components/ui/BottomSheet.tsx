import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
  Dimensions,
  PanResponder,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnapPoint?: number;
  enablePanDown?: boolean;
  showHandle?: boolean;
  style?: ViewStyle;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  snapPoints = [0.3, 0.6, 0.9],
  initialSnapPoint = 0,
  enablePanDown = true,
  showHandle = true,
  style,
}) => {
  const { theme } = useTheme();
  const [currentSnapPoint, setCurrentSnapPoint] = useState(initialSnapPoint);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const snapPointsInPixels = snapPoints.map(point => SCREEN_HEIGHT * (1 - point));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: snapPointsInPixels[currentSnapPoint],
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, currentSnapPoint]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10 && enablePanDown;
      },
      onPanResponderMove: (_, gestureState) => {
        const newValue = snapPointsInPixels[currentSnapPoint] + gestureState.dy;
        if (newValue >= snapPointsInPixels[snapPointsInPixels.length - 1] && newValue <= SCREEN_HEIGHT) {
          translateY.setValue(newValue);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentPosition = snapPointsInPixels[currentSnapPoint] + gestureState.dy;
        const velocity = gestureState.vy;

        // If dragged down significantly or with high velocity, close
        if (gestureState.dy > 100 || velocity > 0.5) {
          if (currentSnapPoint === 0) {
            onClose();
            return;
          } else {
            // Move to lower snap point
            const newSnapPoint = Math.max(0, currentSnapPoint - 1);
            setCurrentSnapPoint(newSnapPoint);
            return;
          }
        }

        // If dragged up significantly or with high velocity, expand
        if (gestureState.dy < -100 || velocity < -0.5) {
          const newSnapPoint = Math.min(snapPointsInPixels.length - 1, currentSnapPoint + 1);
          setCurrentSnapPoint(newSnapPoint);
          return;
        }

        // Find closest snap point
        let closestSnapPoint = 0;
        let minDistance = Math.abs(currentPosition - snapPointsInPixels[0]);

        snapPointsInPixels.forEach((point, index) => {
          const distance = Math.abs(currentPosition - point);
          if (distance < minDistance) {
            minDistance = distance;
            closestSnapPoint = index;
          }
        });

        setCurrentSnapPoint(closestSnapPoint);
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                opacity,
              },
            ]}
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: theme.colors.card,
              transform: [{ translateY }],
            },
            style,
          ]}
          {...panResponder.panHandlers}
        >
          {showHandle && (
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
            </View>
          )}

          {title && (
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {title}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.gray} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area bottom
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});