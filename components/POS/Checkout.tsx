// src/components/POS/CheckoutButton.tsx
import React, { useContext } from 'react';
import {TouchableOpacity, Text, View, useColorScheme} from 'react-native';

type Props = {
    onPress: () => void;
    disabled?: boolean;
};

export default function CheckoutButton({ onPress, disabled }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const accentColor = isDark ? '#60a5fa' : '#1d4ed8';

    return (
        <View className="items-center">
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.8}
                className={`w-full py-3 rounded-2xl items-center justify-center
          border-4 bg-[#EDEEDA] dark:bg-black
          ${isDark ? 'border-[#60a5fa] shadow-[#60a5fa]/50' : 'border-[#1d4ed8] shadow-[#1d4ed8]/50'}
          shadow-2xl ${disabled ? 'opacity-50' : ''}`}
                style={{
                    shadowColor: accentColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 16,
                    elevation: 16,
                }}
            >
                <Text className="text-xl font-bold tracking-wider" style={{ color: accentColor }}>
                    CHECKOUT
                </Text>
            </TouchableOpacity>
        </View>
    );
}

