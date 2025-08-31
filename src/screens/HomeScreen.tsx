import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Surface, Button, Card, Chip } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useNotes } from '../context/NotesContext';
import { useFlashcards } from '../context/FlashcardsContext';
import { useAnalytics } from '../context/AnalyticsContext';
import CreateActionModal from '../components/CreateActionModal';
import CreateNoteModal from '../components/CreateNoteModal';
import CreateFlashcardModal from '../components/CreateFlashcardModal';
import CreateDeckModal from '../components/CreateDeckModal';
import StatsCard from '../components/StatsCard';
import CircularProgress from '../components/CircularProgress';
import ProgressChart from '../components/ProgressChart';
import StandardCard from '../components/StandardCard';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  withDelay 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { theme } = useTheme();
  const { notes } = useNotes();
  const { getDueFlashcards } = useFlashcards();
  const { 
    overallMasteryPercentage, 
    averageScore, 
    bestScore, 
    dailyStreak,
    getLastQuizInfo,
    getWeeklyProgress,
    topicStats,
    totalReviews 
  } = useAnalytics();
  
  const [showActionModal, setShowActionModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 1000 });
    contentTranslateY.value = withSpring(0, { damping: 15 });
  }, []);

  const dueCards = getDueFlashcards();
  const lastQuiz = getLastQuizInfo();
  const weeklyProgress = getWeeklyProgress();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleCreateNew = () => {
    setShowActionModal(true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "Debug your knowledge today! 🐛",
      "Code your way to mastery! 💻",
      "Every bug fixed is wisdom gained! 🔧",
      "Compile your thoughts, execute your learning! ⚡",
      "Refactor your mind, optimize your skills! 🚀",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const renderRecentItems = () => {
    const recentNotes = notes.slice(0, 3);
    
    return (
      <View style={styles.recentSection}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          📝 Recent Notes
        </Text>
        {recentNotes.length > 0 ? (
          <View style={styles.recentNotesContainer}>
            {recentNotes.map((note, index) => (
              <StandardCard
                key={note.id}
                title={note.title}
                content={note.content}
                tags={note.tags}
                onPress={() => console.log('Open note:', note.title)}
                delay={index * 100}
                type="note"
              />
            ))}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
            No recent notes
          </Text>
        )}
      </View>
    );
  };

  const renderTopicBreakdown = () => {
    return (
      <View style={styles.topicsSection}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          🎯 Topic Mastery
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {topicStats.slice(0, 5).map((topic, index) => (
            <Surface key={topic.topic} style={styles.topicCard} elevation={2}>
              <Text variant="titleSmall" style={[styles.topicTitle, { color: theme.colors.onSurface }]}>
                {topic.topic}
              </Text>
              <CircularProgress 
                progress={topic.masteryPercentage} 
                size={60} 
                strokeWidth={4}
                delay={index * 100}
              />
              <Text variant="bodySmall" style={[styles.topicStats, { color: theme.colors.onSurface }]}>
                {topic.masteredCards}/{topic.totalCards} cards
              </Text>
              {topic.averageScore > 0 && (
                <Text variant="bodySmall" style={[styles.topicScore, { color: theme.colors.primary }]}>
                  Avg: {topic.averageScore}%
                </Text>
              )}
            </Surface>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Surface style={[styles.headerSurface, { backgroundColor: theme.colors.primary }]} elevation={4}>
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <Text variant="headlineMedium" style={styles.greeting}>
              {getGreeting()}! 👋
            </Text>
            <Text variant="bodyLarge" style={styles.motivationalQuote}>
              {getMotivationalQuote()}
            </Text>
          </Animated.View>
        </Surface>

        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          {/* Main Progress Circle */}
          <View style={styles.progressSection}>
            <CircularProgress 
              progress={overallMasteryPercentage}
              size={140}
              strokeWidth={10}
              title="Overall Mastery"
              subtitle={`${totalReviews} reviews completed`}
              delay={300}
            />
          </View>

          {/* Stats Cards Row */}
          <View style={styles.statsRow}>
            <StatsCard
              title="Daily Streak"
              value={dailyStreak}
              subtitle="days in a row"
              icon="🔥"
              color={theme.colors.secondary}
              delay={400}
            />
            <StatsCard
              title="Average Score"
              value={`${averageScore}%`}
              subtitle="across all quizzes"
              icon="📊"
              color={theme.colors.primary}
              delay={500}
            />
            <StatsCard
              title="Best Score"
              value={`${bestScore}%`}
              subtitle="personal record"
              icon="🏆"
              color={theme.colors.tertiary}
              delay={600}
            />
          </View>

          {/* Last Quiz Info */}
          {lastQuiz && (
            <Surface style={[styles.lastQuizCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={3}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                🎯 Last Quiz Performance
              </Text>
              <View style={styles.lastQuizContent}>
                <View style={styles.lastQuizInfo}>
                  <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                    {lastQuiz.deckName}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
                    {lastQuiz.date.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.lastQuizStats}>
                  <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                    {lastQuiz.score}%
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                    {lastQuiz.correctAnswers}/{lastQuiz.totalCards} correct
                  </Text>
                </View>
              </View>
            </Surface>
          )}

          {/* Progress Chart */}
          <ProgressChart 
            data={weeklyProgress}
            title="📈 Weekly Progress"
            type="line"
          />

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              ⚡ Quick Actions
            </Text>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={() => console.log('Start Daily Quiz')}
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                disabled={dueCards.length === 0}
              >
                Start Quiz ({dueCards.length})
              </Button>
              <Button
                mode="outlined"
                onPress={handleCreateNew}
                style={styles.actionButton}
              >
                Create New
              </Button>
            </View>
          </View>

          {/* Recent Notes */}
          {renderRecentItems()}

          {/* Topic Breakdown */}
          {renderTopicBreakdown()}
        </Animated.View>
      </ScrollView>

      {/* Modals */}
      <CreateActionModal
        visible={showActionModal}
        onDismiss={() => setShowActionModal(false)}
        onCreateNote={() => setShowNoteModal(true)}
        onCreateFlashcard={() => setShowFlashcardModal(true)}
        onCreateDeck={() => setShowDeckModal(true)}
      />

      <CreateNoteModal
        visible={showNoteModal}
        onDismiss={() => setShowNoteModal(false)}
      />

      <CreateFlashcardModal
        visible={showFlashcardModal}
        onDismiss={() => setShowFlashcardModal(false)}
      />

      <CreateDeckModal
        visible={showDeckModal}
        onDismiss={() => setShowDeckModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSurface: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  greeting: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  motivationalQuote: {
    color: '#E3F2FD',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    padding: 16,
  },
  progressSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  lastQuizCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  lastQuizContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastQuizInfo: {
    flex: 1,
  },
  lastQuizStats: {
    alignItems: 'flex-end',
  },
  quickActions: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  recentSection: {
    marginVertical: 16,
  },
  recentNotesContainer: {
    gap: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    fontStyle: 'italic',
  },
  topicsSection: {
    marginVertical: 16,
  },
  topicCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  topicTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  topicStats: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  topicScore: {
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default HomeScreen;