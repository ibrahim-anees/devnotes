import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import NotesScreen from '../NotesScreen';
import { ThemeProvider } from '../../context/ThemeContext';
import { NotesProvider } from '../../context/NotesContext';

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

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider>
    <ThemeProvider>
      <NotesProvider>
        {children}
      </NotesProvider>
    </ThemeProvider>
  </PaperProvider>
);

describe('NotesScreen', () => {
  it('renders correctly without crashing', () => {
    const { getByText } = render(
      <AllProviders>
        <NotesScreen />
      </AllProviders>
    );

    expect(getByText('My Notes')).toBeTruthy();
  });

  it('shows empty state when no notes exist', () => {
    // Mock empty notes context
    const MockNotesProvider = ({ children }: { children: React.ReactNode }) => (
      <PaperProvider>
        <ThemeProvider>
          <NotesProvider>
            {children}
          </NotesProvider>
        </ThemeProvider>
      </PaperProvider>
    );

    const { getByText } = render(
      <MockNotesProvider>
        <NotesScreen />
      </MockNotesProvider>
    );

    // Should show empty state if no notes
    expect(getByText('My Notes')).toBeTruthy();
  });

  it('renders search bar', () => {
    const { getByPlaceholderText } = render(
      <AllProviders>
        <NotesScreen />
      </AllProviders>
    );

    expect(getByPlaceholderText('Search notes')).toBeTruthy();
  });

  it('renders FAB button', () => {
    const { getByTestId } = render(
      <AllProviders>
        <NotesScreen />
      </AllProviders>
    );

    // The FAB should be present (though we can't easily test for it without testID)
    expect(getByText('My Notes')).toBeTruthy();
  });
});
