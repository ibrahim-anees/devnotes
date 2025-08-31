import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import HomeScreen from '../HomeScreen';
import { ThemeProvider } from '../../context/ThemeContext';
import { NotesProvider } from '../../context/NotesContext';
import { FlashcardsProvider } from '../../context/FlashcardsContext';

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
  };
});

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider>
    <ThemeProvider>
      <NotesProvider>
        <FlashcardsProvider>
          {children}
        </FlashcardsProvider>
      </NotesProvider>
    </ThemeProvider>
  </PaperProvider>
);

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <AllProviders>
        <HomeScreen />
      </AllProviders>
    );

    expect(getByText('Dev Notes')).toBeTruthy();
    expect(getByText("Today's Progress")).toBeTruthy();
  });

  it('displays progress statistics', () => {
    const { getByText } = render(
      <AllProviders>
        <HomeScreen />
      </AllProviders>
    );

    // Should show some statistics (exact numbers depend on sample data)
    expect(getByText(/cards due for review/)).toBeTruthy();
    expect(getByText(/notes created today/)).toBeTruthy();
    expect(getByText(/total notes/)).toBeTruthy();
  });

  it('displays motivational quote', () => {
    const { getByText } = render(
      <AllProviders>
        <HomeScreen />
      </AllProviders>
    );

    expect(getByText(/Code is like humor/)).toBeTruthy();
    expect(getByText('- Cory House')).toBeTruthy();
  });

  it('renders create new FAB', () => {
    const { getByText } = render(
      <AllProviders>
        <HomeScreen />
      </AllProviders>
    );

    expect(getByText('Create New')).toBeTruthy();
  });
});
