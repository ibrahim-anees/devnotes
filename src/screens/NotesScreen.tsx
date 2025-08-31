import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Searchbar, IconButton, Menu, Chip, Surface } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useNotes } from '../context/NotesContext';
import CreateNoteModal from '../components/CreateNoteModal';
import AnimatedFAB from '../components/AnimatedFAB';
import StaggeredList from '../components/StaggeredList';
import StandardCard from '../components/StandardCard';
import FullScreenViewer from '../components/FullScreenViewer';
import { Note } from '../types';
import Markdown from 'react-native-markdown-display';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  withDelay
} from 'react-native-reanimated';

const NotesScreen = () => {
  const { theme } = useTheme();
  const { notes, folders, deleteNote, searchNotes } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [fullScreenNote, setFullScreenNote] = useState<Note | null>(null);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const searchBarTranslateY = useSharedValue(-50);

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
    searchBarTranslateY.value = withSpring(0, { damping: 15 });
  }, []);

  const filteredNotes = useCallback(() => {
    let filtered = notes || [];
    if (searchQuery) {
      filtered = searchNotes(searchQuery);
    }
    if (selectedFolder) {
      filtered = filtered.filter(note => note.folder === selectedFolder);
    }
    return filtered;
  }, [notes, searchQuery, selectedFolder, searchNotes]);

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    setSelectedNote(null);
  };

  const handleNotePress = (note: Note) => {
    setFullScreenNote(note);
    setShowFullScreen(true);
  };

  const handleMenuPress = (note: Note) => {
    setSelectedNote(note);
    setMenuVisible(true);
  };

  const renderNoteCard = ({ item, index }: { item: Note; index: number }) => {
    return (
      <StandardCard
        title={item.title}
        content={item.content || ''}
        tags={item.tags || []}
        onPress={() => handleNotePress(item)}
        onMenuPress={() => handleMenuPress(item)}
        delay={index * 100}
        type="note"
      />
    );
  };

  const renderEmptyState = () => (
    <Surface style={[styles.emptyState, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
      <Text variant="displaySmall" style={styles.emptyIcon}>
        📝
      </Text>
      <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurfaceVariant }]}>
        No notes yet
      </Text>
      <Text variant="bodyMedium" style={[styles.emptyDescription, { color: theme.colors.onSurfaceVariant }]}>
        Create your first note to start organizing your development knowledge!
      </Text>
      <Text variant="bodySmall" style={[styles.emptyHint, { color: theme.colors.primary }]}>
        Tap the + button to get started 🚀
      </Text>
    </Surface>
  );

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });

  const searchAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: searchBarTranslateY.value }],
    };
  });

  const currentNotes = filteredNotes();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.headerSurface, { backgroundColor: theme.colors.primary }]} elevation={4}>
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            📚 My Notes
          </Text>
          <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
            <Searchbar
              placeholder="Search notes..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              iconColor={theme.colors.primary}
            />
            <Surface style={styles.filterButtonSurface} elevation={2}>
              <IconButton
                icon="filter-variant"
                onPress={() => setSelectedFolder(selectedFolder ? null : folders[0])}
                style={[
                  styles.filterButton,
                  selectedFolder && { backgroundColor: theme.colors.secondary },
                ]}
                iconColor={selectedFolder ? 'white' : theme.colors.primary}
              />
            </Surface>
          </Animated.View>
        </Animated.View>
      </Surface>

      {currentNotes.length > 0 ? (
        <StaggeredList
          data={currentNotes}
          renderItem={renderNoteCard}
          keyExtractor={(item: Note) => item.id}
          contentContainerStyle={styles.notesList}
          staggerDelay={100}
        />
      ) : (
        <View style={[styles.notesList, styles.emptyContainer]}>
          {renderEmptyState()}
        </View>
      )}

      <AnimatedFAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowCreateModal(true)}
        delay={800}
      />

      <CreateNoteModal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
      />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}>
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            // TODO: Implement edit note
          }}
          title="Edit"
        />
        <Menu.Item
          onPress={() => {
            if (selectedNote) {
              handleDeleteNote(selectedNote.id);
            }
            setMenuVisible(false);
          }}
          title="Delete"
        />
      </Menu>

      <FullScreenViewer
        visible={showFullScreen}
        onDismiss={() => setShowFullScreen(false)}
        title={fullScreenNote?.title || ''}
        content={fullScreenNote?.content || ''}
        tags={fullScreenNote?.tags || []}
        type="note"
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
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  searchBar: {
    flex: 1,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  filterButtonSurface: {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  filterButton: {
    margin: 0,
    borderRadius: 12,
  },
  notesList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    width: '100%',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  emptyHint: {
    textAlign: 'center',
    fontWeight: '600',
  },
  noteCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markdownContainer: {
    marginVertical: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default NotesScreen;