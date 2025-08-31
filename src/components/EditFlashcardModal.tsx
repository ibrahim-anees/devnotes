import React from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import FlashcardEditor from './FlashcardEditor';
import { Flashcard } from '../types';

interface EditFlashcardModalProps {
  visible: boolean;
  onDismiss: () => void;
  flashcard: Flashcard;
}

const EditFlashcardModal: React.FC<EditFlashcardModalProps> = ({ 
  visible, 
  onDismiss, 
  flashcard 
}) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}>
        <FlashcardEditor 
          flashcard={flashcard}
          onSave={onDismiss} 
          onCancel={onDismiss} 
        />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    height: '90%',
  },
});

export default EditFlashcardModal;
