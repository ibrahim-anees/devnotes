import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import NotesScreen from '../screens/NotesScreen';
import { ThemeProvider } from '../context/ThemeContext';
import { NotesProvider } from '../context/NotesContext';

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
    withTiming: jest.fn((value) => value),
    withDelay: jest.fn((delay, value) => value),
    runOnJS: jest.fn((fn) => fn),
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider>
    <ThemeProvider>
      <NotesProvider>
        {children}
      </NotesProvider>
    </ThemeProvider>
  </PaperProvider>
);

describe('NotesScreen Integration', () => {
  it('should render without crashing', () => {
    expect(() => {
      render(
        <TestWrapper>
          <NotesScreen />
        </TestWrapper>
      );
    }).not.toThrow();
  });

  it('should display the main title', () => {
    const { getByText } = render(
      <TestWrapper>
        <NotesScreen />
      </TestWrapper>
    );

    expect(getByText('My Notes')).toBeTruthy();
  });

  it('should display search functionality', () => {
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <NotesScreen />
      </TestWrapper>
    );

    expect(getByPlaceholderText('Search notes')).toBeTruthy();
  });

  it('should handle empty notes gracefully', () => {
    const { queryByText } = render(
      <TestWrapper>
        <NotesScreen />
      </TestWrapper>
    );

    // Should not crash and should render the main screen
    expect(queryByText('My Notes')).toBeTruthy();
  });
});
