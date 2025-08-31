import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, IconButton, Chip, Menu, Button, Portal, Dialog } from 'react-native-paper';
import { useNotes } from '../context/NotesContext';
import { Note } from '../types';
import Markdown from 'react-native-markdown-display';

interface NoteEditorProps {
  note?: Note;
  onSave: () => void;
  onCancel: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onCancel }) => {
  const { addNote, updateNote, folders } = useNotes();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [folder, setFolder] = useState(note?.folder || 'Uncategorized');
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFolder, setNewFolder] = useState('');
  const [formatting, setFormatting] = useState(note?.formatting || {
    fontSize: 16,
    fontFamily: 'System',
    textColor: '#000000',
    backgroundColor: '#ffffff',
  });

  const handleSave = () => {
    const noteData = {
      title,
      content,
      tags,
      folder,
      formatting,
    };

    if (note) {
      updateNote(note.id, noteData);
    } else {
      addNote(noteData);
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

  const handleAddFolder = () => {
    if (newFolder) {
      setFolder(newFolder);
      setNewFolder('');
      setShowFolderDialog(false);
    }
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
        <TextInput
          mode="outlined"
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.titleInput}
        />

        {isPreview ? (
          <View style={styles.preview}>
            <Markdown>{content}</Markdown>
          </View>
        ) : (
          <TextInput
            mode="outlined"
            label="Content"
            value={content}
            onChangeText={setContent}
            multiline
            style={[styles.contentInput, {
              fontSize: formatting.fontSize,
              color: formatting.textColor,
              backgroundColor: formatting.backgroundColor,
            }]}
          />
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
          onPress={() => setShowFolderDialog(true)}
          style={styles.folderButton}
        >
          Folder: {folder}
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={showFolderDialog} onDismiss={() => setShowFolderDialog(false)}>
          <Dialog.Title>Select Folder</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="New Folder"
              value={newFolder}
              onChangeText={setNewFolder}
            />
            <ScrollView style={styles.foldersList}>
              {folders.map(f => (
                <Button
                  key={f}
                  mode="text"
                  onPress={() => {
                    setFolder(f);
                    setShowFolderDialog(false);
                  }}
                >
                  {f}
                </Button>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowFolderDialog(false)}>Cancel</Button>
            <Button onPress={handleAddFolder}>Add Folder</Button>
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
  titleInput: {
    marginBottom: 16,
  },
  contentInput: {
    minHeight: 200,
    textAlignVertical: 'top',
  },
  preview: {
    minHeight: 200,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
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
  folderButton: {
    marginTop: 8,
  },
  foldersList: {
    maxHeight: 200,
    marginTop: 16,
  },
});

export default NoteEditor;
