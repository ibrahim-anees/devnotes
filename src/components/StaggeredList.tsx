import React from 'react';
import { FlatList, FlatListProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

interface StaggeredListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  staggerDelay?: number;
}

const StaggeredListItem: React.FC<{
  children: React.ReactNode;
  index: number;
  staggerDelay: number;
}> = ({ children, index, staggerDelay }) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-50);

  React.useEffect(() => {
    const delay = index * staggerDelay;
    opacity.value = withDelay(delay, withSpring(1, { damping: 15 }));
    translateX.value = withDelay(delay, withSpring(0, { damping: 15 }));
  }, [index, staggerDelay, opacity, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }],
    };
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

function StaggeredList<T>({
  data,
  renderItem,
  staggerDelay = 100,
  ...props
}: StaggeredListProps<T>) {
  const animatedRenderItem = ({ item, index }: { item: T; index: number }) => (
    <StaggeredListItem index={index} staggerDelay={staggerDelay}>
      {renderItem({ item, index })}
    </StaggeredListItem>
  );

  return (
    <FlatList
      {...props}
      data={data}
      renderItem={animatedRenderItem}
    />
  );
}

export default StaggeredList;
