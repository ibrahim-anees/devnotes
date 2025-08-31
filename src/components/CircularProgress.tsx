import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withDelay,
  interpolate 
} from 'react-native-reanimated';

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  title?: string;
  subtitle?: string;
  delay?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  title,
  subtitle,
  delay = 0,
}) => {
  const { theme } = useTheme();
  const animatedProgress = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { damping: 15 }));
    animatedProgress.value = withDelay(delay + 200, withSpring(progress, { damping: 15 }));
  }, [progress, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const strokeDashoffset = interpolate(
      animatedProgress.value,
      [0, 100],
      [circumference, 0]
    );

    return {
      strokeDashoffset,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.circleContainer, { width: size, height: size }]}>
        {/* Background circle */}
        <View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: theme.colors.outline + '30', // 30% opacity
            },
          ]}
        />
        
        {/* Progress circle - simplified version without SVG */}
        <View
          style={[
            styles.progressCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: theme.colors.primary,
              borderTopColor: 'transparent',
              borderRightColor: progress > 25 ? theme.colors.primary : 'transparent',
              borderBottomColor: progress > 50 ? theme.colors.primary : 'transparent',
              borderLeftColor: progress > 75 ? theme.colors.primary : 'transparent',
              transform: [{ rotate: `${(progress / 100) * 360 - 90}deg` }],
            },
          ]}
        />
        
        {/* Center content */}
        <View style={styles.centerContent}>
          <Text 
            variant="headlineMedium" 
            style={[styles.progressText, { color: theme.colors.primary }]}
          >
            {Math.round(progress)}%
          </Text>
          {title && (
            <Text 
              variant="bodySmall" 
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text 
              variant="bodySmall" 
              style={[styles.subtitle, { color: theme.colors.onSurface }]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
  },
  progressCircle: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontWeight: 'bold',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default CircularProgress;
