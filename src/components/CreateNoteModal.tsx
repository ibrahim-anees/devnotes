import React from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import NoteEditor from './NoteEditor';

interface CreateNoteModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({ visible, onDismiss }) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}>
        <NoteEditor onSave={onDismiss} onCancel={onDismiss} />
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

export default CreateNoteModal;
