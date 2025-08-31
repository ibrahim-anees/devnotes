import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withDelay 
} from 'react-native-reanimated';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color,
  delay = 0 
}) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { damping: 15 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 15 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const cardColor = color || theme.colors.primary;

  return (
    <Animated.View style={[animatedStyle, styles.container]}>
      <Surface 
        style={[
          styles.card, 
          { backgroundColor: theme.colors.surfaceVariant }
        ]} 
        elevation={4}
      >
        <View style={styles.content}>
          {icon && (
            <Text style={[styles.icon, { color: cardColor }]}>
              {icon}
            </Text>
          )}
          <View style={styles.textContainer}>
            <Text variant="bodySmall" style={[styles.title, { color: theme.colors.onSurface }]}>
              {title}
            </Text>
            <Text 
              variant="headlineMedium" 
              style={[styles.value, { color: cardColor }]}
            >
              {value}
            </Text>
            {subtitle && (
              <Text variant="bodySmall" style={[styles.subtitle, { color: theme.colors.onSurface }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      </Surface>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.7,
    marginBottom: 4,
  },
  value: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    opacity: 0.6,
  },
});

export default StatsCard;
