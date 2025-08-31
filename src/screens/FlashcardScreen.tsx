import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Searchbar, Surface, Chip, Button, Menu, FAB } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useFlashcards } from '../context/FlashcardsContext';
import { Flashcard } from '../types';
import EnhancedFlashcardCard from '../components/EnhancedFlashcardCard';
import FullScreenViewer from '../components/FullScreenViewer';
import CreateFlashcardModal from '../components/CreateFlashcardModal';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';

type SortOption = 'recent' | 'difficulty' | 'mastery' | 'alphabetical';
type FilterOption = 'all' | 'due' | 'mastered' | 'learning';

const FlashcardScreen = () => {
  const { theme } = useTheme();
  const { flashcards, decks, deleteFlashcard } = useFlashcards();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [fullScreenCard, setFullScreenCard] = useState<Flashcard | null>(null);
  const [studyMode, setStudyMode] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const searchBarTranslateY = useSharedValue(-50);

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
    searchBarTranslateY.value = withSpring(0, { damping: 15 });
  }, []);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    flashcards.forEach(card => {
      card.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [flashcards]);

  // Filter and sort flashcards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = flashcards;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(card =>
        card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(card =>
        selectedTags.every(tag => card.tags.includes(tag))
      );
    }

    // Status filter
    switch (filterBy) {
      case 'due':
        filtered = filtered.filter(card => {
          if (!card.lastReviewed || !card.interval) return true;
          const daysSince = Math.floor((Date.now() - card.lastReviewed.getTime()) / (1000 * 60 * 60 * 24));
          return daysSince >= card.interval;
        });
        break;
      case 'mastered':
        filtered = filtered.filter(card => card.interval && card.interval > 7);
        break;
      case 'learning':
        filtered = filtered.filter(card => !card.interval || card.interval <= 7);
        break;
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => {
          const aDate = a.lastReviewed?.getTime() || 0;
          const bDate = b.lastReviewed?.getTime() || 0;
          return bDate - aDate;
        });
        break;
      case 'difficulty':
        filtered.sort((a, b) => {
          const difficultyOrder: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
          const aDiff = a.difficulty || 'medium';
          const bDiff = b.difficulty || 'medium';
          return (difficultyOrder[bDiff] || 1) - (difficultyOrder[aDiff] || 1);
        });
        break;
      case 'mastery':
        filtered.sort((a, b) => (b.interval || 0) - (a.interval || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.front.localeCompare(b.front));
        break;
    }

    return filtered;
  }, [flashcards, searchQuery, selectedTags, sortBy, filterBy]);

  const handleCardPress = (card: Flashcard) => {
    if (selectedCards.length > 0) {
      toggleCardSelection(card.id);
    } else {
      setFullScreenCard(card);
      setShowFullScreen(true);
    }
  };

  const handleCardLongPress = (card: Flashcard) => {
    toggleCardSelection(card.id);
  };

  const toggleCardSelection = (cardId: string) => {
    setSelectedCards(prev => {
      const newSelection = prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId];
      
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  };

  const handleBulkDelete = () => {
    Alert.alert(
      'Delete Cards',
      `Are you sure you want to delete ${selectedCards.length} flashcards?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            selectedCards.forEach(cardId => deleteFlashcard(cardId));
            setSelectedCards([]);
            setShowBulkActions(false);
          },
        },
      ]
    );
  };

  const handleRandomCard = () => {
    if (filteredAndSortedCards.length > 0) {
      const randomCard = filteredAndSortedCards[Math.floor(Math.random() * filteredAndSortedCards.length)];
      setFullScreenCard(randomCard);
      setShowFullScreen(true);
    }
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setFilterBy('all');
    setSortBy('recent');
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: searchBarTranslateY.value }],
  }));

  const renderFlashcard = ({ item, index }: { item: Flashcard; index: number }) => (
    <EnhancedFlashcardCard
      flashcard={item}
      onPress={() => handleCardPress(item)}
      onLongPress={() => handleCardLongPress(item)}
      onViewMore={() => {
        setFullScreenCard(item);
        setShowFullScreen(true);
      }}
      delay={index * 50}
      isSelected={selectedCards.includes(item.id)}
      showProgress={!studyMode}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        No flashcards found
      </Text>
      <Text variant="bodyMedium" style={[styles.emptyDescription, { color: theme.colors.onSurfaceVariant }]}>
        {searchQuery || selectedTags.length > 0 || filterBy !== 'all'
          ? 'Try adjusting your filters or search terms'
          : 'Create your first flashcard to start learning!'}
      </Text>
      {(searchQuery || selectedTags.length > 0 || filterBy !== 'all') && (
        <Button mode="outlined" onPress={clearAllFilters} style={styles.clearButton}>
          Clear Filters
        </Button>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Surface style={[styles.headerSurface, { backgroundColor: theme.colors.primary }]} elevation={4}>
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            🃏 All Flashcards
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            {filteredAndSortedCards.length} cards • {selectedCards.length} selected
          </Text>
        </Animated.View>
      </Surface>

      {/* Search and Filters */}
      <Animated.View style={[styles.searchSection, searchAnimatedStyle]}>
        <Searchbar
          placeholder="Search flashcards..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          iconColor="#14B8A6"
          inputStyle={{ color: theme.colors.onSurface }}
        />

        {/* Filter Chips */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              { key: 'all', label: 'All', active: filterBy === 'all' },
              { key: 'due', label: 'Due', active: filterBy === 'due' },
              { key: 'learning', label: 'Learning', active: filterBy === 'learning' },
              { key: 'mastered', label: 'Mastered', active: filterBy === 'mastered' },
            ]}
            renderItem={({ item }) => (
              <Chip
                selected={item.active}
                onPress={() => setFilterBy(item.key as FilterOption)}
                style={[
                  styles.filterChip,
                  item.active && { backgroundColor: theme.colors.primary }
                ]}
                textStyle={[
                  styles.filterChipText,
                  item.active && { color: '#FFFFFF' }
                ]}
              >
                {item.label}
              </Chip>
            )}
            keyExtractor={item => item.key}
            contentContainerStyle={styles.filtersList}
          />

          <Menu
            visible={showSortMenu}
            onDismiss={() => setShowSortMenu(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setShowSortMenu(true)}
                style={styles.sortButton}
                icon="sort"
              >
                Sort
              </Button>
            }
          >
            <Menu.Item onPress={() => { setSortBy('recent'); setShowSortMenu(false); }} title="Recent" />
            <Menu.Item onPress={() => { setSortBy('difficulty'); setShowSortMenu(false); }} title="Difficulty" />
            <Menu.Item onPress={() => { setSortBy('mastery'); setShowSortMenu(false); }} title="Mastery" />
            <Menu.Item onPress={() => { setSortBy('alphabetical'); setShowSortMenu(false); }} title="A-Z" />
          </Menu>
        </View>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <View style={styles.tagsContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={allTags}
              renderItem={({ item: tag }) => (
                <Chip
                  selected={selectedTags.includes(tag)}
                  onPress={() => toggleTagFilter(tag)}
                  style={[
                    styles.tagChip,
                    selectedTags.includes(tag) && { backgroundColor: '#3B82F6' }
                  ]}
                  textStyle={[
                    styles.tagChipText,
                    selectedTags.includes(tag) && { color: '#FFFFFF' }
                  ]}
                >
                  #{tag}
                </Chip>
              )}
              keyExtractor={item => item}
              contentContainerStyle={styles.tagsList}
            />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            mode="outlined"
            onPress={() => setStudyMode(!studyMode)}
            style={[styles.actionButton, studyMode && { backgroundColor: theme.colors.secondary }]}
            icon="school"
          >
            Study Mode
          </Button>
          <Button
            mode="outlined"
            onPress={handleRandomCard}
            style={styles.actionButton}
            icon="shuffle"
            disabled={filteredAndSortedCards.length === 0}
          >
            Random
          </Button>
        </View>
      </Animated.View>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <Surface style={[styles.bulkActionsBar, { backgroundColor: theme.colors.secondaryContainer }]} elevation={4}>
          <Text style={[styles.bulkActionsText, { color: theme.colors.onSecondaryContainer }]}>
            {selectedCards.length} selected
          </Text>
          <View style={styles.bulkActions}>
            <Button
              mode="text"
              onPress={() => {
                setSelectedCards([]);
                setShowBulkActions(false);
              }}
              textColor={theme.colors.onSecondaryContainer}
            >
              Cancel
            </Button>
            <Button
              mode="text"
              onPress={handleBulkDelete}
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          </View>
        </Surface>
      )}

      {/* Flashcards List */}
      <FlatList
        data={filteredAndSortedCards}
        renderItem={renderFlashcard}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.cardsList,
          filteredAndSortedCards.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowCreateModal(true)}
      />

      {/* Modals */}
      <CreateFlashcardModal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
      />

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
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#E3F2FD',
    opacity: 0.9,
  },
  searchSection: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#14B8A6',
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filtersList: {
    paddingRight: 12,
  },
  filterChip: {
    marginRight: 8,
    height: 32,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortButton: {
    borderRadius: 16,
  },
  tagsContainer: {
    marginBottom: 8,
  },
  tagsList: {
    paddingVertical: 4,
  },
  tagChip: {
    marginRight: 8,
    height: 28,
    backgroundColor: '#3B82F6' + '20',
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 20,
  },
  bulkActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bulkActionsText: {
    fontWeight: '600',
  },
  bulkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardsList: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  clearButton: {
    borderRadius: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default FlashcardScreen;
