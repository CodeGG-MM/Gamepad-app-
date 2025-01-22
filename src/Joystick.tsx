    import React, { useState, useRef, useEffect } from 'react';
    import { View, StyleSheet, PanResponder } from 'react-native';
    import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

    interface JoystickProps {
      onMove: (x: number, y: number) => void;
    }

    const Joystick: React.FC<JoystickProps> = ({ onMove }) => {
      const handleX = useSharedValue(0);
      const handleY = useSharedValue(0);
      const joystickSize = 100;
      const handleSize = joystickSize / 3;
      const joystickRef = useRef<View>(null);

      const panResponder = useRef(
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderGrant: (event) => {
            const { locationX, locationY } = event.nativeEvent;
            const centerX = joystickSize / 2;
            const centerY = joystickSize / 2;
            const deltaX = locationX - centerX;
            const deltaY = locationY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDistance = joystickSize / 2;

            const normalizedX = Math.min(1, Math.max(-1, deltaX / maxDistance));
            const normalizedY = Math.min(1, Math.max(-1, deltaY / maxDistance));

            handleX.value = normalizedX * maxDistance * 0.8;
            handleY.value = normalizedY * maxDistance * 0.8;
            onMove(normalizedX, normalizedY);
          },
          onPanResponderMove: (event) => {
            const { locationX, locationY } = event.nativeEvent;
            const centerX = joystickSize / 2;
            const centerY = joystickSize / 2;
            const deltaX = locationX - centerX;
            const deltaY = locationY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDistance = joystickSize / 2;

            const normalizedX = Math.min(1, Math.max(-1, deltaX / maxDistance));
            const normalizedY = Math.min(1, Math.max(-1, deltaY / maxDistance));

            handleX.value = normalizedX * maxDistance * 0.8;
            handleY.value = normalizedY * maxDistance * 0.8;
            onMove(normalizedX, normalizedY);
          },
          onPanResponderRelease: () => {
            handleX.value = withSpring(0);
            handleY.value = withSpring(0);
            onMove(0, 0);
          },
          onPanResponderTerminate: () => {
            handleX.value = withSpring(0);
            handleY.value = withSpring(0);
            onMove(0, 0);
          },
        })
      ).current;

      const animatedHandleStyle = useAnimatedStyle(() => {
        return {
          transform: [
            { translateX: handleX.value },
            { translateY: handleY.value },
          ],
        };
      });

      return (
        <View style={styles.joystickContainer} ref={joystickRef} {...panResponder.panHandlers}>
          <View style={styles.joystick}>
            <Animated.View style={[styles.joystickHandle, animatedHandleStyle]} />
          </View>
        </View>
      );
    };

    const styles = StyleSheet.create({
      joystickContainer: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      joystick: {
        position: 'relative',
        width: 100,
        height: 100,
        backgroundColor: '#555',
        borderRadius: 50,
      },
      joystickHandle: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 33,
        height: 33,
        backgroundColor: '#e74c3c',
        borderRadius: 50,
        transform: [{ translateX: -16.5 }, { translateY: -16.5 }],
      },
    });

    export default Joystick;
