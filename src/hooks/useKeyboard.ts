import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export function useKeyboard() {
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const show = () => setKeyboardVisible(true);
        const hide = () => setKeyboardVisible(false);

        if (Platform.OS === 'ios') {
            Keyboard.addListener('keyboardWillShow', show);
            Keyboard.addListener('keyboardWillHide', hide);
        } else {
            Keyboard.addListener('keyboardDidShow', show);
            Keyboard.addListener('keyboardDidHide', hide);
        }

        return () => {
            Keyboard.removeAllListeners('keyboardWillShow' as any);
            Keyboard.removeAllListeners('keyboardWillHide' as any);
            Keyboard.removeAllListeners('keyboardDidShow' as any);
            Keyboard.removeAllListeners('keyboardDidHide' as any);
        };
    }, []);

    return { isKeyboardVisible };
}