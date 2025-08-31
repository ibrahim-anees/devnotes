import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, IconButton, Menu, ProgressBar } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useFlashcards } from '../context/FlashcardsContext';
import CreateFlashcardModal from '../components/CreateFlashcardModal';
import CreateDeckModal from '../components/CreateDeckModal';
import DeckDetailScreen from './DeckDetailScreen';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedFAB from '../components/AnimatedFAB';
import StaggeredList from '../components/StaggeredList';
import StandardCard from '../components/StandardCard';
import FullScreenViewer from '../components/FullScreenViewer';
import { Deck } from '../types';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';

const FlashcardsScreen = () => {
  const { theme } = useTheme();
  const { decks, deleteDeck, getDueFlashcards } = useFlashcards();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateDeckModal, setShowCreateDeckModal] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showDeckDetail, setShowDeckDetail] = useState(false);
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [fullScreenDeck, setFullScreenDeck] = useState<Deck | null>(null);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const statsTranslateY = useSharedValue(-30);

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
    statsTranslateY.value = withSpring(0, { damping: 15 });
  }, []);

  const handleDeleteDeck = (deckId: string) => {
    deleteDeck(deckId);
    setSelectedDeck(null);
    setMenuVisible(false);
  };

  const handleDeckPress = (deck: Deck) => {
    setCurrentDeck(deck);
    setShowDeckDetail(true);
  };

  const calculateProgress = (deck: Deck) => {
    if (deck.totalCards === 0) return 0;
    const reviewedCards = deck.totalCards - deck.dueCards;
    return reviewedCards / deck.totalCards;
  };

  const renderDeckCard = ({ item, index }: { item: Deck; index: number }) => {
    const dueCards = getDueFlashcards(item.id).length;
    const progress = calculateProgress(item);
    
    return (
      <StandardCard
        title={item.title}
        content={item.description || `${item.totalCards} flashcards ready for study`}
        onPress={() => handleDeckPress(item)}
        onMenuPress={() => {
          setSelectedDeck(item);
          setMenuVisible(true);
        }}
        delay={index * 150}
        type="deck"
        progress={progress * 100}
        cardCount={item.totalCards}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No flashcard decks yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyDescription}>
        Create your first deck to start learning!
      </Text>
    </View>
  );

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });

  const statsAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: statsTranslateY.value }],
    };
  });

  if (showDeckDetail && currentDeck) {
    return (
      <DeckDetailScreen 
        deck={currentDeck} 
        onBack={() => {
          setShowDeckDetail(false);
          setCurrentDeck(null);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
          Flashcards
        </Text>
        <Animated.View style={statsAnimatedStyle}>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {decks.length} decks • {getDueFlashcards().length} cards due
          </Text>
        </Animated.View>
      </Animated.View>

      <StaggeredList
        data={decks}
        renderItem={renderDeckCard}
        keyExtractor={(item: Deck) => item.id}
        contentContainerStyle={[
          styles.decksList,
          decks.length === 0 && styles.emptyContainer
        ]}
        ListEmptyComponent={renderEmptyState}
        staggerDelay={150}
      />

      <AnimatedFAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowCreateDeckModal(true)}
        label="Create Deck"
        delay={1000}
      />

      <CreateFlashcardModal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
      />

      <CreateDeckModal
        visible={showCreateDeckModal}
        onDismiss={() => setShowCreateDeckModal(false)}
      />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}>
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            // TODO: Implement edit deck
          }}
          title="Edit Deck"
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            setShowCreateModal(true);
          }}
          title="Add Cards"
        />
        <Menu.Item
          onPress={() => {
            if (selectedDeck) {
              handleDeleteDeck(selectedDeck.id);
            }
          }}
          title="Delete Deck"
        />
      </Menu>
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
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  decksList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
  },
  deckCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  description: {
    marginTop: 4,
    opacity: 0.8,
  },
  deckStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  lastReviewed: {
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default FlashcardsScreen;