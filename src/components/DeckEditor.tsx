import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, IconButton, Button } from 'react-native-paper';
import { useFlashcards } from '../context/FlashcardsContext';
import { Deck } from '../types';

interface DeckEditorProps {
  deck?: Deck;
  onSave: () => void;
  onCancel: () => void;
}

const DeckEditor: React.FC<DeckEditorProps> = ({ deck, onSave, onCancel }) => {
  const { addDeck, updateDeck } = useFlashcards();
  const [title, setTitle] = useState(deck?.title || '');
  const [description, setDescription] = useState(deck?.description || '');

  const handleSave = () => {
    if (!title.trim()) return;

    const deckData = {
      title: title.trim(),
      description: description.trim(),
    };

    if (deck) {
      updateDeck(deck.id, deckData);
    } else {
      addDeck(deckData);
    }
    onSave();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="close" onPress={onCancel} />
        <Button mode="contained" onPress={handleSave} disabled={!title.trim()}>
          Save
        </Button>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          mode="outlined"
          label="Deck Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="e.g., JavaScript Fundamentals"
        />

        <TextInput
          mode="outlined"
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.input}
          placeholder="Brief description of what this deck covers..."
        />
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
});

export default DeckEditor;
