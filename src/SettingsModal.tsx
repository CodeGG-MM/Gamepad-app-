    import React, { useState } from 'react';
    import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

    interface SettingsModalProps {
      isVisible: boolean;
      onClose: () => void;
      onSave: (address: string) => void;
      initialAddress: string;
    }

    const SettingsModal: React.FC<SettingsModalProps> = ({ isVisible, onClose, onSave, initialAddress }) => {
      const [serverAddress, setServerAddress] = useState(initialAddress);

      const handleSave = () => {
        onSave(serverAddress);
      };

      return (
        <Modal visible={isVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter server address"
                value={serverAddress}
                onChangeText={setServerAddress}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    };

    const styles = StyleSheet.create({
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
      },
      modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#2c3e50',
      },
      input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        color: '#2c3e50',
      },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
      },
      saveButton: {
        backgroundColor: '#2ecc71',
        padding: 10,
        borderRadius: 5,
      },
      closeButton: {
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 5,
      },
      buttonText: {
        color: '#fff',
        fontSize: 16,
      },
    });

    export default SettingsModal;
