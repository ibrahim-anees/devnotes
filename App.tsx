import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { NotesProvider } from './src/context/NotesContext';
import { FlashcardsProvider } from './src/context/FlashcardsContext';
import { AnalyticsProvider } from './src/context/AnalyticsContext';
import HomeScreen from './src/screens/HomeScreen';
import NotesScreen from './src/screens/NotesScreen';
import FlashcardsScreen from './src/screens/FlashcardsScreen';
import QuizScreen from './src/screens/QuizScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { theme } = useTheme();
  const colorScheme = useColorScheme();
  const navigationTheme = colorScheme === 'dark' ? NavigationDarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={navigationTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.outline,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: string;

              switch (route.name) {
                case 'Home':
                  iconName = focused ? 'home' : 'home-outline';
                  break;
                case 'Notes':
                  iconName = focused ? 'note-text' : 'note-text-outline';
                  break;
                case 'Flashcards':
                  iconName = focused ? 'cards' : 'cards-outline';
                  break;
                case 'Quiz':
                  iconName = focused ? 'brain' : 'brain';
                  break;
                case 'Settings':
                  iconName = focused ? 'cog' : 'cog-outline';
                  break;
                default:
                  iconName = 'circle';
              }

              const Icon = require('react-native-vector-icons/MaterialCommunityIcons').default;
              return <Icon name={iconName} size={size} color={color} />;
            },
          })}>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Notes" component={NotesScreen} />
          <Tab.Screen name="Flashcards" component={FlashcardsScreen} />
          <Tab.Screen name="Quiz" component={QuizScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NotesProvider>
          <FlashcardsProvider>
            <AnalyticsProvider>
              <AppContent />
            </AnalyticsProvider>
          </FlashcardsProvider>
        </NotesProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
