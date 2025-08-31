import React from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import FlashcardEditor from './FlashcardEditor';

interface CreateFlashcardModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const CreateFlashcardModal: React.FC<CreateFlashcardModalProps> = ({ visible, onDismiss }) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}>
        <FlashcardEditor onSave={onDismiss} onCancel={onDismiss} />
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

export default CreateFlashcardModal;
