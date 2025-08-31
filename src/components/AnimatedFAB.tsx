import React, { useEffect } from 'react';
import { FAB } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  interpolate,
} from 'react-native-reanimated';

interface AnimatedFABProps {
  icon: string;
  onPress: () => void;
  style?: any;
  label?: string;
  delay?: number;
}

const AnimatedFAB: React.FC<AnimatedFABProps> = ({ 
  icon, 
  onPress, 
  style, 
  label,
  delay = 500 
}) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 15 }));
    rotation.value = withDelay(delay, withSpring(360, { damping: 15 }));
  }, [delay, scale, rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${interpolate(rotation.value, [0, 360], [0, 360])}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      <FAB
        icon={icon}
        onPress={onPress}
        label={label}
        style={style}
      />
    </Animated.View>
  );
};

export default AnimatedFAB;
