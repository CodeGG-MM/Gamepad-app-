    import React from 'react';
    import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

    interface ButtonProps {
      title: string;
      onPress: () => void;
      style?: StyleProp<ViewStyle>;
    }

    const Button: React.FC<ButtonProps> = ({ title, onPress, style }) => {
      return (
        <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
          <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
      );
    };

    const styles = StyleSheet.create({
      button: {
        padding: 10,
        backgroundColor: '#e74c3c',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
      },
      buttonText: {
        color: '#ecf0f1',
        fontSize: 16,
      },
    });

    export default Button;
