import React from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import DeckEditor from './DeckEditor';

interface CreateDeckModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const CreateDeckModal: React.FC<CreateDeckModalProps> = ({ visible, onDismiss }) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}>
        <DeckEditor onSave={onDismiss} onCancel={onDismiss} />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 32,
    borderRadius: 8,
    height: '60%',
  },
});

export default CreateDeckModal;
