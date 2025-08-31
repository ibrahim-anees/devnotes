import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext', () => {
  it('should provide initial light theme state', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    expect(result.current.isDarkMode).toBe(false);
    expect(result.current.theme).toEqual(MD3LightTheme);
  });

  it('should toggle to dark theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDarkMode).toBe(true);
    expect(result.current.theme).toEqual(MD3DarkTheme);
  });

  it('should toggle back to light theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    // Toggle to dark
    act(() => {
      result.current.toggleTheme();
    });

    // Toggle back to light
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDarkMode).toBe(false);
    expect(result.current.theme).toEqual(MD3LightTheme);
  });

  it('should throw error when used outside provider', () => {
    const { result } = renderHook(() => useTheme());
    
    expect(result.error).toEqual(
      Error('useTheme must be used within a ThemeProvider')
    );
  });
});
