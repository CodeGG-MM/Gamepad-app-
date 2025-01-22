    import React, { useState, useRef, useEffect } from 'react';
    import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
    import Joystick from './Joystick';
    import Button from './Button';
    import SettingsModal from './SettingsModal';
    import { GestureHandlerRootView } from 'react-native-gesture-handler';
    import AsyncStorage from '@react-native-async-storage/async-storage';

    const GamepadScreen = () => {
      const [isConnected, setIsConnected] = useState(false);
      const [serverAddress, setServerAddress] = useState('');
      const [isSettingsVisible, setIsSettingsVisible] = useState(false);
      const socketRef = useRef<WebSocket | null>(null);

      useEffect(() => {
        const loadServerAddress = async () => {
          try {
            const storedAddress = await AsyncStorage.getItem('serverAddress');
            if (storedAddress) {
              setServerAddress(storedAddress);
            }
          } catch (error) {
            console.error('Error loading server address:', error);
          }
        };
        loadServerAddress();
      }, []);

      const connect = () => {
        try {
          if (socketRef.current) {
            socketRef.current.close();
          }

          socketRef.current = new WebSocket(`ws://${serverAddress}:8000`);

          socketRef.current.onopen = () => {
            setIsConnected(true);
          };

          socketRef.current.onclose = () => {
            setIsConnected(false);
          };

          socketRef.current.onerror = () => {
            setIsConnected(false);
          };
        } catch (error) {
          console.error('Connection error:', error);
          setIsConnected(false);
        }
      };

      const sendCommand = (command: string) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ command }));
        }
      };

      const handleJoystickMove = (type: string, x: number, y: number) => {
        sendCommand(`${type.toUpperCase()}_JOYSTICK_${x.toFixed(2)}_${y.toFixed(2)}`);
      };

      const toggleSettingsModal = () => {
        setIsSettingsVisible(!isSettingsVisible);
      };

      const saveSettings = async (newAddress: string) => {
        setServerAddress(newAddress);
        try {
          await AsyncStorage.setItem('serverAddress', newAddress);
        } catch (error) {
          console.error('Error saving server address:', error);
        }
        toggleSettingsModal();
        connect();
      };

      return (
        <GestureHandlerRootView style={styles.container}>
          <View style={styles.statusBar}>
            <Text style={styles.statusText}>{isConnected ? 'Connected' : 'Disconnected'}</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={toggleSettingsModal}>
              <Text style={styles.settingsButtonText}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gamepad}>
            <View style={styles.leftSide}>
              <View style={styles.shoulderButtonsLeft}>
                <Button title="L1" onPress={() => sendCommand('L1')} />
                <Button title="L2" onPress={() => sendCommand('L2')} />
              </View>
              <View style={styles.dpad}>
                <Button title="↑" onPress={() => sendCommand('DPAD_UP')} style={styles.dpadButtonUp} />
                <Button title="←" onPress={() => sendCommand('DPAD_LEFT')} style={styles.dpadButtonLeft} />
                <Button title="→" onPress={() => sendCommand('DPAD_RIGHT')} style={styles.dpadButtonRight} />
                <Button title="↓" onPress={() => sendCommand('DPAD_DOWN')} style={styles.dpadButtonDown} />
              </View>
              <View style={styles.joystickContainer}>
                <Joystick onMove={(x, y) => handleJoystickMove('movement', x, y)} />
              </View>
            </View>

            <View style={styles.rightSide}>
              <View style={styles.shoulderButtonsRight}>
                <Button title="R1" onPress={() => sendCommand('R1')} />
                <Button title="R2" onPress={() => sendCommand('R2')} />
              </View>
              <View style={styles.actionButtons}>
                <Button title="Y" onPress={() => sendCommand('BUTTON_Y')} style={styles.actionButtonY} />
                <Button title="X" onPress={() => sendCommand('BUTTON_X')} style={styles.actionButtonX} />
                <Button title="B" onPress={() => sendCommand('BUTTON_B')} style={styles.actionButtonB} />
                <Button title="A" onPress={() => sendCommand('BUTTON_A')} style={styles.actionButtonA} />
              </View>
              <View style={styles.joystickContainer}>
                <Joystick onMove={(x, y) => handleJoystickMove('camera', x, y)} />
              </View>
            </View>
          </View>

          <View style={styles.menuButtons}>
            <Button title="SELECT" onPress={() => sendCommand('SELECT')} />
            <Button title="START" onPress={() => sendCommand('START')} />
          </View>

          <SettingsModal
            isVisible={isSettingsVisible}
            onClose={toggleSettingsModal}
            onSave={saveSettings}
            initialAddress={serverAddress}
          />
        </GestureHandlerRootView>
      );
    };

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#2c3e50',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      },
      statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
      },
      statusText: {
        color: '#ecf0f1',
        fontSize: 16,
      },
      settingsButton: {
        backgroundColor: 'transparent',
        padding: 5,
      },
      settingsButtonText: {
        color: '#ecf0f1',
        fontSize: 24,
      },
      gamepad: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        width: '100%',
      },
      leftSide: {
        flexDirection: 'column',
        alignItems: 'center',
      },
      rightSide: {
        flexDirection: 'column',
        alignItems: 'center',
      },
      shoulderButtonsLeft: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 10,
      },
      shoulderButtonsRight: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 10,
      },
      dpad: {
        position: 'relative',
        width: 150,
        height: 150,
        marginBottom: 10,
      },
      dpadButtonUp: {
        position: 'absolute',
        top: 0,
        left: 50,
      },
      dpadButtonLeft: {
        position: 'absolute',
        top: 50,
        left: 0,
      },
      dpadButtonRight: {
        position: 'absolute',
        top: 50,
        right: 0,
      },
      dpadButtonDown: {
        position: 'absolute',
        bottom: 0,
        left: 50,
      },
      actionButtons: {
        position: 'relative',
        width: 130,
        height: 130,
        marginBottom: 10,
      },
      actionButtonY: {
        position: 'absolute',
        top: 0,
        left: 40,
      },
      actionButtonX: {
        position: 'absolute',
        top: 40,
        left: 0,
      },
      actionButtonB: {
        position: 'absolute',
        top: 40,
        right: 0,
      },
      actionButtonA: {
        position: 'absolute',
        bottom: 0,
        left: 40,
      },
      joystickContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
      },
      menuButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
      },
    });

    export default GamepadScreen;
