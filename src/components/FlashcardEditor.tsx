import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, IconButton, Chip, Menu, Button, Portal, Dialog, List } from 'react-native-paper';
import { useFlashcards } from '../context/FlashcardsContext';
import { Flashcard } from '../types';
import Markdown from 'react-native-markdown-display';

interface FlashcardEditorProps {
  flashcard?: Flashcard;
  onSave: () => void;
  onCancel: () => void;
}

const FlashcardEditor: React.FC<FlashcardEditorProps> = ({ flashcard, onSave, onCancel }) => {
  const { addFlashcard, updateFlashcard, decks } = useFlashcards();
  const [front, setFront] = useState(flashcard?.front || '');
  const [back, setBack] = useState(flashcard?.back || '');
  const [deckId, setDeckId] = useState(flashcard?.deckId || (decks[0]?.id || ''));
  const [tags, setTags] = useState<string[]>(flashcard?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');
  const [showDeckDialog, setShowDeckDialog] = useState(false);

  const selectedDeck = decks.find(deck => deck.id === deckId);

  const handleSave = () => {
    const flashcardData = {
      front,
      back,
      deckId,
      tags,
    };

    if (flashcard) {
      updateFlashcard(flashcard.id, flashcardData);
    } else {
      addFlashcard(flashcardData);
    }
    onSave();
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const renderPreview = () => {
    const content = previewSide === 'front' ? front : back;
    return (
      <View style={styles.preview}>
        <View style={styles.previewHeader}>
          <Button
            mode={previewSide === 'front' ? 'contained' : 'outlined'}
            onPress={() => setPreviewSide('front')}
            style={styles.previewButton}>
            Front
          </Button>
          <Button
            mode={previewSide === 'back' ? 'contained' : 'outlined'}
            onPress={() => setPreviewSide('back')}
            style={styles.previewButton}>
            Back
          </Button>
        </View>
        <ScrollView style={styles.previewContent}>
          <Markdown>{content}</Markdown>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="close" onPress={onCancel} />
        <View style={styles.headerButtons}>
          <IconButton 
            icon={isPreview ? "pencil" : "eye"} 
            onPress={() => setIsPreview(!isPreview)} 
          />
          <Button mode="contained" onPress={handleSave}>
            Save
          </Button>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {isPreview ? (
          renderPreview()
        ) : (
          <>
            <TextInput
              mode="outlined"
              label="Front (Question)"
              value={front}
              onChangeText={setFront}
              multiline
              style={styles.cardInput}
            />

            <TextInput
              mode="outlined"
              label="Back (Answer)"
              value={back}
              onChangeText={setBack}
              multiline
              style={styles.cardInput}
            />
          </>
        )}

        <View style={styles.tagsContainer}>
          <TextInput
            mode="outlined"
            label="Add tag"
            value={newTag}
            onChangeText={setNewTag}
            right={<TextInput.Icon icon="plus" onPress={handleAddTag} />}
            style={styles.tagInput}
          />
          <ScrollView horizontal style={styles.tagsList}>
            {tags.map(tag => (
              <Chip
                key={tag}
                onClose={() => handleRemoveTag(tag)}
                style={styles.tag}
              >
                {tag}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <Button
          mode="outlined"
          onPress={() => setShowDeckDialog(true)}
          style={styles.deckButton}
        >
          Deck: {selectedDeck?.title || 'Select Deck'}
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={showDeckDialog} onDismiss={() => setShowDeckDialog(false)}>
          <Dialog.Title>Select Deck</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.decksList}>
              {decks.map(deck => (
                <List.Item
                  key={deck.id}
                  title={deck.title}
                  description={deck.description}
                  onPress={() => {
                    setDeckId(deck.id);
                    setShowDeckDialog(false);
                  }}
                  right={() => deckId === deck.id ? <List.Icon icon="check" /> : null}
                />
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeckDialog(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardInput: {
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  preview: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  previewButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  previewContent: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    minHeight: 200,
  },
  tagsContainer: {
    marginTop: 16,
  },
  tagInput: {
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tag: {
    marginRight: 8,
  },
  deckButton: {
    marginTop: 8,
  },
  decksList: {
    maxHeight: 300,
  },
});

export default FlashcardEditor;
