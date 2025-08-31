import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Surface, Searchbar, Button, Menu, FAB, Chip, IconButton } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useNotes } from '../context/NotesContext';
import { Note, Folder } from '../types';
import StandardCard from '../components/StandardCard';
import FullScreenViewer from '../components/FullScreenViewer';
import CreateNoteModal from '../components/CreateNoteModal';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';

interface FolderSection {
  folder: Folder;
  notes: Note[];
  isExpanded: boolean;
}

const EnhancedNotesScreen = () => {
  const { theme } = useTheme();
  const { notes, folders, deleteNote, searchNotes, addNote } = useNotes();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['default']);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [fullScreenNote, setFullScreenNote] = useState<Note | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

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
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  // Organize notes by folders
  const folderSections = useMemo(() => {
    const sections: FolderSection[] = [];
    
    // Group notes by folder
    const notesByFolder = new Map<string, Note[]>();
    notes.forEach(note => {
      const folderId = note.folder || 'default';
      if (!notesByFolder.has(folderId)) {
        notesByFolder.set(folderId, []);
      }
      notesByFolder.get(folderId)!.push(note);
    });

    // Create sections for each folder
    folders.forEach(folder => {
      const folderNotes = notesByFolder.get(folder.id) || [];
      
      // Apply tag filter
      let filteredNotes = folderNotes;
      if (selectedTags.length > 0) {
        filteredNotes = folderNotes.filter(note =>
          selectedTags.every(tag => note.tags.includes(tag))
        );
      }

      if (filteredNotes.length > 0 || expandedFolders.includes(folder.id)) {
        sections.push({
          folder,
          notes: filteredNotes,
          isExpanded: expandedFolders.includes(folder.id),
        });
      }
    });

    return sections;
  }, [notes, folders, expandedFolders, selectedTags]);

  // Handle search
  React.useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchNotes(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  }, [searchQuery, searchNotes]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleNotePress = (note: Note) => {
    setFullScreenNote(note);
    setShowFullScreen(true);
  };

  const handleNoteMenu = (note: Note) => {
    setSelectedNote(note);
    setMenuVisible(true);
  };

  const handleDeleteNote = () => {
    if (selectedNote) {
      Alert.alert(
        'Delete Note',
        'Are you sure you want to delete this note?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteNote(selectedNote.id);
              setMenuVisible(false);
              setSelectedNote(null);
            },
          },
        ]
      );
    }
  };

  const handleConvertToFlashcard = () => {
    if (selectedNote) {
      // TODO: Implement conversion logic
      Alert.alert('Feature Coming Soon', 'Convert to flashcard functionality will be available soon!');
      setMenuVisible(false);
    }
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
  };

  const getNoteThumbnail = (note: Note) => {
    // Extract first image or code block for thumbnail
    const content = note.content;
    if (content.includes('```')) return '💻';
    if (content.includes('![')) return '🖼️';
    if (content.includes('# ')) return '📄';
    return '📝';
  };

  const highlightSearchText = (text: string, query: string) => {
    if (!query) return text;
    // Simple highlighting - in a real app, you'd use a proper highlighting library
    return text;
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: searchBarTranslateY.value }],
  }));

  const renderNote = (note: Note, index: number, isSearchResult = false) => (
    <StandardCard
      key={note.id}
      title={note.title}
      content={note.content}
      tags={note.tags}
      onPress={() => handleNotePress(note)}
      onMenuPress={() => handleNoteMenu(note)}
      delay={isSearchResult ? index * 50 : index * 100}
      type="note"
    />
  );

  const renderFolderSection = (section: FolderSection, sectionIndex: number) => (
    <View key={section.folder.id} style={styles.folderSection}>
      {/* Folder Header */}
      <Surface 
        style={[styles.folderHeader, { backgroundColor: theme.colors.surfaceVariant }]} 
        elevation={1}
      >
        <Button
          mode="text"
          onPress={() => toggleFolder(section.folder.id)}
          style={styles.folderButton}
          icon={section.isExpanded ? 'chevron-down' : 'chevron-right'}
          contentStyle={styles.folderButtonContent}
        >
          <Text variant="titleMedium" style={[styles.folderTitle, { color: theme.colors.onSurface }]}>
            📁 {section.folder.name} ({section.notes.length})
          </Text>
        </Button>
      </Surface>

      {/* Folder Notes */}
      {section.isExpanded && (
        <View style={styles.folderNotes}>
          {section.notes.length > 0 ? (
            section.notes.map((note, index) => renderNote(note, index))
          ) : (
            <View style={styles.emptyFolder}>
              <Text style={[styles.emptyFolderText, { color: theme.colors.onSurfaceVariant }]}>
                No notes in this folder
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderSearchResults = () => (
    <View style={styles.searchResults}>
      <Surface style={[styles.searchHeader, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
        <Text variant="titleMedium" style={[styles.searchTitle, { color: theme.colors.onSurface }]}>
          🔍 Search Results ({searchResults.length})
        </Text>
        <IconButton
          icon="close"
          onPress={() => {
            setSearchQuery('');
            setShowSearchResults(false);
          }}
          iconColor={theme.colors.onSurface}
        />
      </Surface>
      
      <View style={styles.searchResultsList}>
        {searchResults.length > 0 ? (
          searchResults.map((note, index) => renderNote(note, index, true))
        ) : (
          <View style={styles.emptySearch}>
            <Text style={[styles.emptySearchText, { color: theme.colors.onSurfaceVariant }]}>
              No notes found for "{searchQuery}"
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Surface style={[styles.headerSurface, { backgroundColor: theme.colors.primary }]} elevation={4}>
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            📚 My Notes
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            {notes.length} notes • {folders.length} folders
          </Text>
        </Animated.View>
      </Surface>

      {/* Search and Filters */}
      <Animated.View style={[styles.searchSection, searchAnimatedStyle]}>
        <Searchbar
          placeholder="Search notes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          iconColor={theme.colors.primary}
        />

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <View style={styles.tagsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {allTags.map(tag => (
                <Chip
                  key={tag}
                  selected={selectedTags.includes(tag)}
                  onPress={() => toggleTagFilter(tag)}
                  style={[
                    styles.tagChip,
                    selectedTags.includes(tag) && { backgroundColor: theme.colors.primary }
                  ]}
                  textStyle={[
                    styles.tagChipText,
                    selectedTags.includes(tag) && { color: '#FFFFFF' }
                  ]}
                >
                  #{tag}
                </Chip>
              ))}
            </ScrollView>
            
            {(selectedTags.length > 0 || searchQuery) && (
              <Button
                mode="text"
                onPress={clearFilters}
                style={styles.clearButton}
              >
                Clear
              </Button>
            )}
          </View>
        )}
      </Animated.View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showSearchResults ? (
          renderSearchResults()
        ) : (
          <View style={styles.foldersContainer}>
            {folderSections.map((section, index) => renderFolderSection(section, index))}
            
            {folderSections.length === 0 && (
              <View style={styles.emptyState}>
                <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                  No notes yet
                </Text>
                <Text variant="bodyMedium" style={[styles.emptyDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Create your first note to start organizing your knowledge!
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
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
          title="Edit Note"
          leadingIcon="pencil"
        />
        <Menu.Item
          onPress={handleConvertToFlashcard}
          title="Convert to Flashcard"
          leadingIcon="card-text"
        />
        <Menu.Item
          onPress={handleDeleteNote}
          title="Delete"
          leadingIcon="delete"
        />
      </Menu>

      {/* Modals */}
      <CreateNoteModal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
      />

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
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagChip: {
    marginRight: 8,
    height: 28,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  clearButton: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  foldersContainer: {
    padding: 16,
  },
  folderSection: {
    marginBottom: 16,
  },
  folderHeader: {
    borderRadius: 12,
    marginBottom: 8,
  },
  folderButton: {
    justifyContent: 'flex-start',
  },
  folderButtonContent: {
    flexDirection: 'row-reverse',
  },
  folderTitle: {
    fontWeight: '700',
    marginLeft: 8,
  },
  folderNotes: {
    paddingLeft: 16,
  },
  emptyFolder: {
    padding: 16,
    alignItems: 'center',
  },
  emptyFolderText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  searchResults: {
    padding: 16,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchTitle: {
    fontWeight: '700',
  },
  searchResultsList: {
    gap: 8,
  },
  emptySearch: {
    padding: 32,
    alignItems: 'center',
  },
  emptySearchText: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default EnhancedNotesScreen;
