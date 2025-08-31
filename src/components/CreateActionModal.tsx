import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Modal, Card, Text, IconButton } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

interface CreateActionModalProps {
  visible: boolean;
  onDismiss: () => void;
  onCreateNote: () => void;
  onCreateFlashcard: () => void;
  onCreateDeck: () => void;
}

const CreateActionModal: React.FC<CreateActionModalProps> = ({
  visible,
  onDismiss,
  onCreateNote,
  onCreateFlashcard,
  onCreateDeck,
}) => {
  const { theme } = useTheme();

  const handleAction = (action: () => void) => {
    onDismiss();
    action();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>
            What would you like to create?
          </Text>

          <Card 
            style={[styles.actionCard, { borderColor: theme.colors.primary }]} 
            onPress={() => handleAction(onCreateNote)}
          >
            <Card.Content style={styles.cardContent}>
              <IconButton 
                icon="note-text" 
                size={32} 
                iconColor={theme.colors.primary}
              />
              <View style={styles.cardText}>
                <Text variant="titleMedium">Create Note</Text>
                <Text variant="bodyMedium" style={styles.description}>
                  Write and organize your development notes with markdown support
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card 
            style={[styles.actionCard, { borderColor: theme.colors.secondary }]} 
            onPress={() => handleAction(onCreateFlashcard)}
          >
            <Card.Content style={styles.cardContent}>
              <IconButton 
                icon="cards" 
                size={32} 
                iconColor={theme.colors.secondary}
              />
              <View style={styles.cardText}>
                <Text variant="titleMedium">Create Flashcard</Text>
                <Text variant="bodyMedium" style={styles.description}>
                  Add a new flashcard to practice and memorize concepts
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card 
            style={[styles.actionCard, { borderColor: theme.colors.tertiary }]} 
            onPress={() => handleAction(onCreateDeck)}
          >
            <Card.Content style={styles.cardContent}>
              <IconButton 
                icon="folder-multiple" 
                size={32} 
                iconColor={theme.colors.tertiary}
              />
              <View style={styles.cardText}>
                <Text variant="titleMedium">Create Deck</Text>
                <Text variant="bodyMedium" style={styles.description}>
                  Organize flashcards into themed collections
                </Text>
              </View>
            </Card.Content>
          </Card>

          <IconButton 
            icon="close" 
            size={24} 
            onPress={onDismiss}
            style={styles.closeButton}
          />
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 32,
    width: '90%',
    maxWidth: 400,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  actionCard: {
    marginBottom: 16,
    borderWidth: 2,
    elevation: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cardText: {
    flex: 1,
    marginLeft: 8,
  },
  description: {
    marginTop: 4,
    opacity: 0.7,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default CreateActionModal;
