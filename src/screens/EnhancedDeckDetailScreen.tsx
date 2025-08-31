import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Surface, IconButton, Menu, Button, ProgressBar, Chip } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useFlashcards } from '../context/FlashcardsContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { Flashcard, Deck } from '../types';
import EnhancedFlashcardCard from '../components/EnhancedFlashcardCard';
import FullScreenViewer from '../components/FullScreenViewer';
import CreateFlashcardModal from '../components/CreateFlashcardModal';
import EditFlashcardModal from '../components/EditFlashcardModal';
import CircularProgress from '../components/CircularProgress';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';

interface DeckDetailScreenProps {
  deck: Deck;
  onBack: () => void;
}

interface SubTopic {
  name: string;
  cards: Flashcard[];
  isExpanded: boolean;
}

const EnhancedDeckDetailScreen: React.FC<DeckDetailScreenProps> = ({ deck, onBack }) => {
  const { theme } = useTheme();
  const { getFlashcardsByDeck, deleteFlashcard, getDueFlashcards } = useFlashcards();
  const { addQuizSession } = useAnalytics();
  
  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<Flashcard | null>(null);
  const [fullScreenCard, setFullScreenCard] = useState<Flashcard | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<string[]>(['all']);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStartTime] = useState(Date.now());

  // Animation values
  const headerOpacity = useSharedValue(0);
  const confettiScale = useSharedValue(0);

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const flashcards = getFlashcardsByDeck(deck.id);
  const dueCards = getDueFlashcards(deck.id);

  // Group cards by sub-topics (based on tags)
  const subTopics = useMemo(() => {
    const topicMap = new Map<string, Flashcard[]>();
    
    flashcards.forEach(card => {
      if (card.tags.length === 0) {
        if (!topicMap.has('General')) {
          topicMap.set('General', []);
        }
        topicMap.get('General')!.push(card);
      } else {
        card.tags.forEach(tag => {
          if (!topicMap.has(tag)) {
            topicMap.set(tag, []);
          }
          topicMap.get(tag)!.push(card);
        });
      }
    });

    const topics: SubTopic[] = Array.from(topicMap.entries()).map(([name, cards]) => ({
      name,
      cards,
      isExpanded: expandedTopics.includes(name),
    }));

    // Add "All Cards" section
    topics.unshift({
      name: 'All Cards',
      cards: flashcards,
      isExpanded: expandedTopics.includes('all'),
    });

    return topics;
  }, [flashcards, expandedTopics]);

  const progress = deck.totalCards > 0 ? ((deck.totalCards - deck.dueCards) / deck.totalCards) * 100 : 0;

  const handleCardPress = (card: Flashcard) => {
    if (quizMode) {
      // Handle quiz interaction
      return;
    }
    setFullScreenCard(card);
    setShowFullScreen(true);
  };

  const handleCardMenu = (card: Flashcard) => {
    setSelectedFlashcard(card);
    setMenuVisible(true);
  };

  const handleEditFlashcard = () => {
    if (selectedFlashcard) {
      setShowEditModal(true);
      setMenuVisible(false);
    }
  };

  const handleDeleteFlashcard = () => {
    if (selectedFlashcard) {
      Alert.alert(
        'Delete Card',
        'Are you sure you want to delete this flashcard?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteFlashcard(selectedFlashcard.id);
              setMenuVisible(false);
              setSelectedFlashcard(null);
            },
          },
        ]
      );
    }
  };

  const toggleTopic = (topicName: string) => {
    setExpandedTopics(prev =>
      prev.includes(topicName)
        ? prev.filter(name => name !== topicName)
        : [...prev, topicName]
    );
  };

  const startQuiz = () => {
    if (flashcards.length === 0) return;
    
    setQuizMode(true);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    
    // Shuffle cards for quiz
    const shuffledCards = [...flashcards].sort(() => Math.random() - 0.5);
    // TODO: Use shuffled cards for quiz
  };

  const endQuiz = () => {
    const timeSpent = Math.round((Date.now() - quizStartTime) / 60000);
    const scorePercentage = Math.round((quizScore / flashcards.length) * 100);
    
    // Save quiz session
    addQuizSession({
      deckId: deck.id,
      deckName: deck.title,
      date: new Date(),
      totalCards: flashcards.length,
      correctAnswers: quizScore,
      score: scorePercentage,
      timeSpent,
    });

    // Show confetti animation for good scores
    if (scorePercentage >= 80) {
      confettiScale.value = withSpring(1, { damping: 15 }, () => {
        confettiScale.value = withSpring(0, { damping: 15 });
      });
    }

    setQuizMode(false);
    Alert.alert(
      'Quiz Complete!',
      `Score: ${scorePercentage}%\nTime: ${timeSpent} minutes`,
      [{ text: 'OK' }]
    );
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confettiScale.value }],
  }));

  const renderSubTopic = (topic: SubTopic, index: number) => (
    <View key={topic.name} style={styles.topicSection}>
      {/* Topic Header */}
      <Surface 
        style={[styles.topicHeader, { backgroundColor: theme.colors.surfaceVariant }]} 
        elevation={1}
      >
        <Button
          mode="text"
          onPress={() => toggleTopic(topic.name)}
          style={styles.topicButton}
          icon={topic.isExpanded ? 'chevron-down' : 'chevron-right'}
          contentStyle={styles.topicButtonContent}
        >
          <Text variant="titleMedium" style={[styles.topicTitle, { color: theme.colors.onSurface }]}>
            {topic.name === 'all' ? '📚' : '🏷️'} {topic.name} ({topic.cards.length})
          </Text>
        </Button>
        
        {topic.name !== 'All Cards' && (
          <View style={styles.topicProgress}>
            <ProgressBar 
              progress={topic.cards.length > 0 ? 0.7 : 0} // Placeholder progress
              style={styles.topicProgressBar}
              color="#84CC16"
            />
          </View>
        )}
      </Surface>

      {/* Topic Cards */}
      {topic.isExpanded && (
        <View style={styles.topicCards}>
          {topic.cards.map((card, cardIndex) => (
            <EnhancedFlashcardCard
              key={card.id}
              flashcard={card}
              onPress={() => handleCardPress(card)}
              onLongPress={() => handleCardMenu(card)}
              onViewMore={() => {
                setFullScreenCard(card);
                setShowFullScreen(true);
              }}
              delay={cardIndex * 50}
              showProgress={!quizMode}
            />
          ))}
          
          {topic.cards.length === 0 && (
            <View style={styles.emptyTopic}>
              <Text style={[styles.emptyTopicText, { color: theme.colors.onSurfaceVariant }]}>
                No cards in this topic
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Visual Separator */}
      {index < subTopics.length - 1 && (
        <View style={[styles.topicSeparator, { backgroundColor: theme.colors.outline }]} />
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Surface style={[styles.headerSurface, { backgroundColor: theme.colors.secondary }]} elevation={4}>
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.headerTop}>
            <IconButton 
              icon="arrow-left" 
              onPress={onBack}
              iconColor="#FFFFFF"
            />
            <View style={styles.headerContent}>
              <Text variant="headlineMedium" style={styles.headerTitle}>
                {deck.title}
              </Text>
              {deck.description && (
                <Text variant="bodyMedium" style={styles.headerDescription}>
                  {deck.description}
                </Text>
              )}
            </View>
          </View>

          {/* Deck Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <CircularProgress 
                  progress={progress}
                  size={60}
                  strokeWidth={4}
                  title={`${deck.totalCards}`}
                  subtitle="cards"
                />
              </View>
              
              <View style={styles.statDetails}>
                <Text style={styles.statText}>
                  📊 Progress: {Math.round(progress)}%
                </Text>
                <Text style={styles.statText}>
                  ⏰ Due: {dueCards.length} cards
                </Text>
                <Text style={styles.statText}>
                  🎯 Mastered: {deck.totalCards - deck.dueCards}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={startQuiz}
                style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                icon="play"
                disabled={flashcards.length === 0}
              >
                Start Quiz
              </Button>
              <Button
                mode="outlined"
                onPress={() => setShowCreateModal(true)}
                style={styles.actionButton}
                icon="plus"
              >
                Add Card
              </Button>
            </View>
          </View>
        </Animated.View>
      </Surface>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {subTopics.length > 0 ? (
          <View style={styles.topicsContainer}>
            {subTopics.map((topic, index) => renderSubTopic(topic, index))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text variant="displaySmall" style={styles.emptyIcon}>🃏</Text>
            <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
              No flashcards yet
            </Text>
            <Text variant="bodyMedium" style={[styles.emptyDescription, { color: theme.colors.onSurfaceVariant }]}>
              Add your first flashcard to start learning!
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowCreateModal(true)}
              style={[styles.createButton, { backgroundColor: theme.colors.secondary }]}
            >
              Add First Card
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Confetti Animation */}
      <Animated.View style={[styles.confetti, confettiAnimatedStyle]} pointerEvents="none">
        <Text style={styles.confettiText}>🎉</Text>
      </Animated.View>

      {/* Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}
      >
        <Menu.Item
          onPress={handleEditFlashcard}
          title="Edit Card"
          leadingIcon="pencil"
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            // TODO: Implement bury card
          }}
          title="Bury Card"
          leadingIcon="eye-off"
        />
        <Menu.Item
          onPress={handleDeleteFlashcard}
          title="Delete"
          leadingIcon="delete"
        />
      </Menu>

      {/* Modals */}
      <CreateFlashcardModal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
      />

      {selectedFlashcard && (
        <EditFlashcardModal
          visible={showEditModal}
          onDismiss={() => {
            setShowEditModal(false);
            setSelectedFlashcard(null);
          }}
          flashcard={selectedFlashcard}
        />
      )}

      <FullScreenViewer
        visible={showFullScreen}
        onDismiss={() => setShowFullScreen(false)}
        title={fullScreenCard?.front || ''}
        content={fullScreenCard?.back || ''}
        tags={fullScreenCard?.tags || []}
        type="flashcard"
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
    padding: 16,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerDescription: {
    color: '#E3F2FD',
    opacity: 0.9,
  },
  statsContainer: {
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statDetails: {
    flex: 1,
    gap: 4,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  topicsContainer: {
    padding: 16,
  },
  topicSection: {
    marginBottom: 16,
  },
  topicHeader: {
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  topicButton: {
    justifyContent: 'flex-start',
    flex: 1,
  },
  topicButtonContent: {
    flexDirection: 'row-reverse',
  },
  topicTitle: {
    fontWeight: '700',
    marginLeft: 8,
  },
  topicProgress: {
    width: 60,
  },
  topicProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  topicCards: {
    paddingLeft: 16,
    gap: 8,
  },
  emptyTopic: {
    padding: 16,
    alignItems: 'center',
  },
  emptyTopicText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  topicSeparator: {
    height: 1,
    marginVertical: 8,
    opacity: 0.3,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createButton: {
    borderRadius: 20,
  },
  confetti: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
  },
  confettiText: {
    fontSize: 50,
  },
});

export default EnhancedDeckDetailScreen;
