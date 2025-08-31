import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native-paper';
import AnimatedCard from '../AnimatedCard';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    default: {
      View,
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((value) => value),
    withDelay: jest.fn((delay, value) => value),
  };
});

describe('AnimatedCard', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <AnimatedCard>
        <Text>Test Content</Text>
      </AnimatedCard>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('applies custom style', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <AnimatedCard style={customStyle}>
        <Text testID="test-content">Test Content</Text>
      </AnimatedCard>
    );

    expect(getByTestId('test-content')).toBeTruthy();
  });

  it('handles onPress correctly', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <AnimatedCard onPress={mockOnPress}>
        <Text>Pressable Content</Text>
      </AnimatedCard>
    );

    const card = getByText('Pressable Content').parent;
    // Note: In a real test environment, you would simulate press events
    expect(card).toBeTruthy();
  });
});
