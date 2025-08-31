import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, Card, ProgressBar, IconButton } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useFlashcards } from '../context/FlashcardsContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { Flashcard } from '../types';
import Markdown from 'react-native-markdown-display';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  runOnJS 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const QuizScreen = () => {
  const { theme } = useTheme();
  const { getDueFlashcards, updateFlashcardReview, decks } = useFlashcards();
  const { addQuizSession } = useAnalytics();
  const [currentCards, setCurrentCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    remaining: 0,
  });
  const [sessionStartTime] = useState(Date.now());
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(null);

  const flipRotation = useSharedValue(0);

  useEffect(() => {
    const dueCards = getDueFlashcards();
    setCurrentCards(dueCards);
    setSessionStats(prev => ({ ...prev, remaining: dueCards.length }));
    
    // Set current deck ID from first card
    if (dueCards.length > 0) {
      setCurrentDeckId(dueCards[0].deckId);
    }
  }, [getDueFlashcards]);

  const currentCard = currentCards[currentCardIndex];

  const flipCard = () => {
    flipRotation.value = withSpring(isFlipped ? 0 : 180, {}, () => {
      runOnJS(setIsFlipped)(!isFlipped);
    });
  };

  const handleResponse = (difficulty: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;

    // Update the flashcard with spaced repetition
    updateFlashcardReview(currentCard.id, difficulty);

    // Update session stats
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: difficulty === 'good' || difficulty === 'easy' ? prev.correct + 1 : prev.correct,
      remaining: prev.remaining - 1,
    }));

    // Move to next card or end session
    if (currentCardIndex < currentCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
      flipRotation.value = 0;
    } else {
      // Session complete - save analytics
      if (currentDeckId && sessionStats.reviewed > 0) {
        const deck = decks.find(d => d.id === currentDeckId);
        const timeSpent = Math.round((Date.now() - sessionStartTime) / 60000); // minutes
        const score = Math.round((sessionStats.correct / sessionStats.reviewed) * 100);
        
        addQuizSession({
          deckId: currentDeckId,
          deckName: deck?.title || 'Unknown Deck',
          date: new Date(),
          totalCards: sessionStats.reviewed,
          correctAnswers: sessionStats.correct,
          score,
          timeSpent,
        });
      }
      
      setCurrentCardIndex(0);
      setIsFlipped(false);
      flipRotation.value = 0;
      // Refresh due cards
      const newDueCards = getDueFlashcards();
      setCurrentCards(newDueCards);
      setSessionStats({
        reviewed: 0,
        correct: 0,
        remaining: newDueCards.length,
      });
    }
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateY: `${flipRotation.value}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateY: `${flipRotation.value + 180}deg` }],
      backfaceVisibility: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
  });

  const progress = currentCards.length > 0 ? currentCardIndex / currentCards.length : 0;

  if (!currentCard) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
            Quiz Complete! 🎉
          </Text>
          <Text variant="bodyLarge" style={styles.completionText}>
            No more cards due for review right now.
          </Text>
          <Text variant="bodyMedium" style={styles.statsText}>
            Session Stats: {sessionStats.reviewed} reviewed, {sessionStats.correct} correct
          </Text>
        </View>
        
        <View style={styles.emptyState}>
          <Text variant="titleLarge" style={styles.emptyTitle}>
            Great job! 
          </Text>
          <Text variant="bodyMedium" style={styles.emptyDescription}>
            Come back later for more reviews, or create new flashcards to study.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
            Daily Review
          </Text>
          <IconButton 
            icon="refresh" 
            onPress={() => {
              const newDueCards = getDueFlashcards();
              setCurrentCards(newDueCards);
              setCurrentCardIndex(0);
              setIsFlipped(false);
              flipRotation.value = 0;
            }}
          />
        </View>
        
        <View style={styles.statsRow}>
          <Text variant="bodyMedium">
            Card {currentCardIndex + 1} of {currentCards.length}
          </Text>
          <Text variant="bodyMedium">
            {sessionStats.reviewed} reviewed • {sessionStats.correct} correct
          </Text>
        </View>
        
        <ProgressBar 
          progress={progress} 
          style={styles.progressBar}
          color={theme.colors.primary}
        />
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.cardWrapper}>
          <Animated.View style={[styles.card, frontAnimatedStyle]}>
            <Card style={styles.flashcard} onPress={flipCard}>
              <Card.Content style={styles.cardContent}>
                <Text variant="labelMedium" style={styles.cardLabel}>
                  QUESTION
                </Text>
                <View style={styles.markdownContainer}>
                  <Markdown>{currentCard.front}</Markdown>
                </View>
                <Text variant="bodySmall" style={styles.tapHint}>
                  Tap to reveal answer
                </Text>
              </Card.Content>
            </Card>
          </Animated.View>

          <Animated.View style={[styles.card, backAnimatedStyle]}>
            <Card style={styles.flashcard} onPress={flipCard}>
              <Card.Content style={styles.cardContent}>
                <Text variant="labelMedium" style={styles.cardLabel}>
                  ANSWER
                </Text>
                <View style={styles.markdownContainer}>
                  <Markdown>{currentCard.back}</Markdown>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        </View>
      </View>

      {isFlipped && (
        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={() => handleResponse('again')}
            style={[styles.button, { backgroundColor: '#f44336' }]}
            labelStyle={styles.buttonLabel}>
            Again
          </Button>
          <Button
            mode="contained"
            onPress={() => handleResponse('hard')}
            style={[styles.button, { backgroundColor: '#ff9800' }]}
            labelStyle={styles.buttonLabel}>
            Hard
          </Button>
          <Button
            mode="contained"
            onPress={() => handleResponse('good')}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            labelStyle={styles.buttonLabel}>
            Good
          </Button>
          <Button
            mode="contained"
            onPress={() => handleResponse('easy')}
            style={[styles.button, { backgroundColor: '#4caf50' }]}
            labelStyle={styles.buttonLabel}>
            Easy
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressBar: {
    marginTop: 12,
    height: 8,
    borderRadius: 4,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  cardWrapper: {
    width: width - 32,
    height: 300,
    position: 'relative',
  },
  card: {
    width: '100%',
    height: '100%',
  },
  flashcard: {
    width: '100%',
    height: '100%',
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cardLabel: {
    position: 'absolute',
    top: 16,
    left: 16,
    opacity: 0.6,
  },
  markdownContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  tapHint: {
    position: 'absolute',
    bottom: 16,
    opacity: 0.6,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    paddingBottom: 32,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  buttonLabel: {
    color: 'white',
    fontSize: 12,
  },
  completionText: {
    marginTop: 16,
    textAlign: 'center',
  },
  statsText: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default QuizScreen;