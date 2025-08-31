import React, { createContext, useContext, useState } from 'react';
import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: MD3Theme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Developer-friendly color palette inspired by VS Code, GitHub, and modern IDEs
const DeveloperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primary colors - Modern vibrant blue
    primary: '#3B82F6', // Bright blue
    onPrimary: '#FFFFFF',
    primaryContainer: '#DBEAFE',
    onPrimaryContainer: '#1E40AF',
    
    // Secondary colors - Modern coral orange
    secondary: '#FF6B35', // Vibrant coral orange
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FFF3E0',
    onSecondaryContainer: '#E65100',
    
    // Tertiary colors - Fresh green for success
    tertiary: '#10B981', // Emerald green
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#D1FAE5',
    onTertiaryContainer: '#065F46',
    
    // Error colors - Modern red
    error: '#EF4444',
    onError: '#FFFFFF',
    errorContainer: '#FEE2E2',
    onErrorContainer: '#B91C1C',
    
    // Background colors - Clean with subtle gradients
    background: '#FAFBFC', // Very light gray background
    onBackground: '#1F2937', // Dark gray text
    surface: '#FFFFFF', // Pure white for cards
    onSurface: '#2D3748', // Darker text for better contrast
    surfaceVariant: '#F7FAFC', // Light blue-gray for card variants
    onSurfaceVariant: '#4A5568', // Medium gray text
    
    // Outline and other colors
    outline: '#CBD5E1',
    outlineVariant: '#E2E8F0',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#1E293B',
    inverseOnSurface: '#F1F5F9',
    inversePrimary: '#60A5FA',
    
    // Note: Custom colors removed to comply with MD3Colors type
  },
};

const DeveloperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary colors - Bright blue for dark mode
    primary: '#60A5FA', // Lighter blue for dark backgrounds
    onPrimary: '#0F172A',
    primaryContainer: '#1E3A8A',
    onPrimaryContainer: '#DBEAFE',
    
    // Secondary colors - Bright coral orange
    secondary: '#FF7849', // Bright coral orange for dark mode
    onSecondary: '#0F172A',
    secondaryContainer: '#D2691E',
    onSecondaryContainer: '#FFE4B5',
    
    // Tertiary colors - Developer green (success/progress)
    tertiary: '#34D399', // Bright green for dark mode
    onTertiary: '#0F172A',
    tertiaryContainer: '#059669',
    onTertiaryContainer: '#D1FAE5',
    
    // Error colors
    error: '#F87171',
    onError: '#0F172A',
    errorContainer: '#DC2626',
    onErrorContainer: '#FEE2E2',
    
    // Background colors - Modern dark theme
    background: '#0F172A', // Very dark blue-gray
    onBackground: '#F1F5F9', // Light text
    surface: '#1E293B', // Dark surface
    onSurface: '#E2E8F0',
    surfaceVariant: '#334155',
    onSurfaceVariant: '#CBD5E1',
    
    // Outline and other colors
    outline: '#475569',
    outlineVariant: '#64748B',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#F1F5F9',
    inverseOnSurface: '#1E293B',
    inversePrimary: '#007ACC',
    
    // Note: Custom colors removed to comply with MD3Colors type
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light mode with white background

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? DeveloperDarkTheme : DeveloperLightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};