import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Alert } from 'react-native';
import { Text, Surface, Button, Menu, FAB, IconButton, Searchbar } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useFlashcards } from '../context/FlashcardsContext';
import { Deck } from '../types';
import CircularProgress from '../components/CircularProgress';
import CreateDeckModal from '../components/CreateDeckModal';
import DeckDetailScreen from './DeckDetailScreen';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with margins
const CARD_HEIGHT = 200;

type ViewMode = 'grid' | 'list';

interface DeckCardProps {
  deck: Deck;
  onPress: () => void;
  onMenuPress: () => void;
  delay: number;
  viewMode: ViewMode;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, onPress, onMenuPress, delay, viewMode }) => {
  const { theme } = useTheme();
  const { getDueFlashcards } = useFlashcards();
  
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const dueCards = getDueFlashcards(deck.id).length;
  const progress = deck.totalCards > 0 ? ((deck.totalCards - deck.dueCards) / deck.totalCards) * 100 : 0;
  
  // Generate gradient colors based on deck tags or content
  const getGradientColors = () => {
    const colors = [
      ['#667eea', '#764ba2'], // Purple-blue
      ['#f093fb', '#f5576c'], // Pink-red
      ['#4facfe', '#00f2fe'], // Blue-cyan
      ['#43e97b', '#38f9d7'], // Green-teal
      ['#fa709a', '#fee140'], // Pink-yellow
      ['#a8edea', '#fed6e3'], // Mint-pink
    ];
    const hash = deck.title.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const [primaryColor, secondaryColor] = getGradientColors();

  const topTags = deck.tags?.slice(0, 3) || [];

  if (viewMode === 'list') {
    return (
      <Animated.View style={[styles.listCardContainer, animatedStyle]}>
        <Surface 
          style={[styles.listCard, { backgroundColor: theme.colors.surface }]} 
          elevation={3}
        >
          <View style={styles.listCardContent}>
            <View style={styles.listCardHeader}>
              <View style={styles.listCardInfo}>
                <Text variant="titleMedium" style={[styles.listCardTitle, { color: theme.colors.onSurface }]}>
                  {deck.title}
                </Text>
                <Text variant="bodySmall" style={[styles.listCardDescription, { color: theme.colors.onSurfaceVariant }]}>
                  {deck.description || `${deck.totalCards} flashcards`}
                </Text>
              </View>
              <IconButton
                icon="dots-vertical"
                onPress={onMenuPress}
                iconColor={theme.colors.onSurfaceVariant}
              />
            </View>
            
            <View style={styles.listCardStats}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {deck.totalCards} cards • {dueCards} due
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                {Math.round(progress)}% complete
              </Text>
            </View>
          </View>
        </Surface>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.gridCardContainer, animatedStyle]}>
      <Surface 
        style={[
          styles.gridCard, 
          { 
            backgroundColor: theme.colors.surface,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
          }
        ]} 
        elevation={4}
      >
        {/* Cover Image/Gradient */}
        <View 
          style={[
            styles.cardCover,
            { 
              backgroundColor: primaryColor,
              // In a real app, you'd use LinearGradient here
            }
          ]}
        >
          <Text style={styles.coverEmoji}>📚</Text>
          {dueCards > 0 && (
            <View style={[styles.dueBadge, { backgroundColor: '#FF6B6B' }]}>
              <Text style={styles.dueBadgeText}>{dueCards}</Text>
            </View>
          )}
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text 
              variant="titleSmall" 
              style={[styles.cardTitle, { color: theme.colors.onSurface }]}
              numberOfLines={2}
            >
              {deck.title}
            </Text>
            <IconButton
              icon="dots-vertical"
              size={16}
              onPress={onMenuPress}
              iconColor={theme.colors.onSurfaceVariant}
              style={styles.menuButton}
            />
          </View>

          {deck.description && (
            <Text 
              variant="bodySmall" 
              style={[styles.cardDescription, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={2}
            >
              {deck.description}
            </Text>
          )}

          {/* Progress Circle */}
          <View style={styles.progressContainer}>
            <CircularProgress 
              progress={progress}
              size={60}
              strokeWidth={4}
              title={`${deck.totalCards}`}
              subtitle="cards"
            />
          </View>

          {/* Tags */}
          {topTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {topTags.map(tag => (
                <View key={tag} style={[styles.tag, { backgroundColor: primaryColor + '20' }]}>
                  <Text style={[styles.tagText, { color: primaryColor }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Surface>
    </Animated.View>
  );
};

const DeckScreen = () => {
  const { theme } = useTheme();
  const { decks, deleteDeck } = useFlashcards();
  
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeckDetail, setShowDeckDetail] = useState(false);
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);

  // Animation values
  const headerOpacity = useSharedValue(0);

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  // Filter decks based on search
  const filteredDecks = useMemo(() => {
    if (!searchQuery) return decks;
    return decks.filter(deck =>
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [decks, searchQuery]);

  const handleDeckPress = (deck: Deck) => {
    setCurrentDeck(deck);
    setShowDeckDetail(true);
  };

  const handleDeckMenu = (deck: Deck) => {
    setSelectedDeck(deck);
    setMenuVisible(true);
  };

  const handleDeleteDeck = () => {
    if (selectedDeck) {
      Alert.alert(
        'Delete Deck',
        `Are you sure you want to delete "${selectedDeck.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteDeck(selectedDeck.id);
              setMenuVisible(false);
              setSelectedDeck(null);
            },
          },
        ]
      );
    }
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const renderDeck = ({ item, index }: { item: Deck; index: number }) => (
    <DeckCard
      deck={item}
      onPress={() => handleDeckPress(item)}
      onMenuPress={() => handleDeckMenu(item)}
      delay={index * 100}
      viewMode={viewMode}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="displaySmall" style={styles.emptyIcon}>📚</Text>
      <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        No decks yet
      </Text>
      <Text variant="bodyMedium" style={[styles.emptyDescription, { color: theme.colors.onSurfaceVariant }]}>
        Create your first deck to organize your flashcards and start learning!
      </Text>
      <Button
        mode="contained"
        onPress={() => setShowCreateModal(true)}
        style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
      >
        Create First Deck
      </Button>
    </View>
  );

  if (showDeckDetail && currentDeck) {
    return (
      <DeckDetailScreen
        deck={currentDeck}
        onBack={() => setShowDeckDetail(false)}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Surface style={[styles.headerSurface, { backgroundColor: theme.colors.secondary }]} elevation={4}>
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            📚 My Decks
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            {filteredDecks.length} decks available
          </Text>
        </Animated.View>
      </Surface>

      {/* Search and View Toggle */}
      <View style={styles.controlsSection}>
        <Searchbar
          placeholder="Search decks..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          iconColor={theme.colors.secondary}
        />
        
        <View style={styles.viewControls}>
          <Button
            mode={viewMode === 'grid' ? 'contained' : 'outlined'}
            onPress={() => setViewMode('grid')}
            style={styles.viewButton}
            icon="view-grid"
          >
            Grid
          </Button>
          <Button
            mode={viewMode === 'list' ? 'contained' : 'outlined'}
            onPress={() => setViewMode('list')}
            style={styles.viewButton}
            icon="view-list"
          >
            List
          </Button>
        </View>
      </View>

      {/* Decks List */}
      <FlatList
        data={filteredDecks}
        renderItem={renderDeck}
        keyExtractor={item => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={[
          styles.decksList,
          filteredDecks.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
      />

      {/* FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.secondary }]}
        onPress={() => setShowCreateModal(true)}
      />

      {/* Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}
      >
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            // TODO: Implement edit
          }}
          title="Edit Deck"
          leadingIcon="pencil"
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            // TODO: Implement share
          }}
          title="Share Deck"
          leadingIcon="share"
        />
        <Menu.Item
          onPress={handleDeleteDeck}
          title="Delete"
          leadingIcon="delete"
        />
      </Menu>

      {/* Create Modal */}
      <CreateDeckModal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
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
  controlsSection: {
    padding: 16,
  },
  searchBar: {
    marginBottom: 12,
  },
  viewControls: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
  },
  decksList: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  // Grid Card Styles
  gridCardContainer: {
    marginBottom: 16,
  },
  gridCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardCover: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  coverEmoji: {
    fontSize: 32,
  },
  dueBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dueBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 12,
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    fontWeight: '700',
    flex: 1,
  },
  menuButton: {
    margin: 0,
  },
  cardDescription: {
    marginBottom: 8,
    opacity: 0.8,
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // List Card Styles
  listCardContainer: {
    marginBottom: 12,
  },
  listCard: {
    borderRadius: 12,
    padding: 16,
  },
  listCardContent: {
    gap: 8,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  listCardInfo: {
    flex: 1,
  },
  listCardTitle: {
    fontWeight: '700',
    marginBottom: 2,
  },
  listCardDescription: {
    opacity: 0.8,
  },
  listCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default DeckScreen;
