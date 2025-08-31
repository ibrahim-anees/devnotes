// Update AnimatedCard.tsx
import React, { useEffect } from 'react';
import { Card } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  style?: any;
  onPress?: () => void;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  delay = 0, 
  style,
  onPress 
}) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { damping: 15 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 15 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 15 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Card 
        onPress={onPress}
        style={{ backgroundColor: theme.colors.surface }} // Use theme surface color
      >
        {children}
      </Card>
    </Animated.View>
  );
};

export default AnimatedCard;