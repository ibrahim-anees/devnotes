import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, Menu, Button } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useFlashcards } from '../context/FlashcardsContext';
import { Flashcard, Deck } from '../types';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedFAB from '../components/AnimatedFAB';
import StaggeredList from '../components/StaggeredList';
import CreateFlashcardModal from '../components/CreateFlashcardModal';
import EditFlashcardModal from '../components/EditFlashcardModal';
import Markdown from 'react-native-markdown-display';

interface DeckDetailScreenProps {
  deck: Deck;
  onBack: () => void;
}

const DeckDetailScreen: React.FC<DeckDetailScreenProps> = ({ deck, onBack }) => {
  const { theme } = useTheme();
  const { getFlashcardsByDeck, deleteFlashcard } = useFlashcards();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFlashcard, setSelectedFlashcard] = useState<Flashcard | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const flashcards = getFlashcardsByDeck(deck.id);

  const handleEditFlashcard = (flashcard: Flashcard) => {
    setSelectedFlashcard(flashcard);
    setShowEditModal(true);
    setMenuVisible(false);
  };

  const handleDeleteFlashcard = (flashcardId: string) => {
    deleteFlashcard(flashcardId);
    setMenuVisible(false);
  };

  const renderFlashcardItem = ({ item, index }: { item: Flashcard; index: number }) => (
    <AnimatedCard 
      delay={index * 100} 
      style={[styles.flashcardCard, { backgroundColor: '#FFFFFF' }]}
    >
      <View style={styles.cardHeader}>
        <Text variant="titleSmall" style={[styles.cardLabel, { color: theme.colors.primary }]}>FRONT</Text>
        <IconButton
          icon="dots-vertical"
          onPress={() => {
            setSelectedFlashcard(item);
            setMenuVisible(true);
          }}
          iconColor={theme.colors.onSurface}
        />
      </View>
      <View style={styles.cardContent}>
        <Markdown>{item.front}</Markdown>
      </View>
      <View style={[styles.cardDivider, { backgroundColor: theme.colors.outline }]} />
      <Text variant="titleSmall" style={[styles.cardLabel, { color: theme.colors.primary }]}>BACK</Text>
      <View style={styles.cardContent}>
        <Markdown>{item.back}</Markdown>
      </View>
    </AnimatedCard>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="displaySmall" style={styles.emptyIcon}>
        🃏
      </Text>
      <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        No flashcards yet
      </Text>
      <Text variant="bodyMedium" style={[styles.emptyDescription, { color: theme.colors.onSurfaceVariant }]}>
        Add your first flashcard to start learning!
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton icon="arrow-left" onPress={onBack} />
          <View style={styles.headerContent}>
            <Text variant="headlineMedium" style={[styles.deckTitle, { color: theme.colors.primary }]}>
              {deck.title}
            </Text>
            {deck.description && (
              <Text variant="bodyMedium" style={styles.description}>
                {deck.description}
              </Text>
            )}
          </View>
        </View>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {flashcards.length} cards in this deck
        </Text>
      </View>

      <StaggeredList
        data={flashcards}
        renderItem={renderFlashcardItem}
        keyExtractor={(item: Flashcard) => item.id}
        contentContainerStyle={[
          styles.flashcardsList,
          flashcards.length === 0 && styles.emptyContainer
        ]}
        ListEmptyComponent={renderEmptyState}
        staggerDelay={100}
      />

      <AnimatedFAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowCreateModal(true)}
        label="Add Card"
        delay={500}
      />

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

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}>
        <Menu.Item
          onPress={() => {
            if (selectedFlashcard) {
              handleEditFlashcard(selectedFlashcard);
            }
          }}
          title="Edit Card"
        />
        <Menu.Item
          onPress={() => {
            if (selectedFlashcard) {
              handleDeleteFlashcard(selectedFlashcard.id);
            }
          }}
          title="Delete Card"
        />
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  deckTitle: {
    fontWeight: 'bold',
  },
  description: {
    marginTop: 4,
    opacity: 0.8,
  },
  subtitle: {
    opacity: 0.7,
    fontWeight: '600',
  },
  flashcardsList: {
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
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  flashcardCard: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  cardContent: {
    marginBottom: 16,
  },
  cardDivider: {
    height: 2,
    marginVertical: 16,
    borderRadius: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default DeckDetailScreen;
