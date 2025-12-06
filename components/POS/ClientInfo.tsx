// src/components/POS/ClientInfo.tsx
import React, { useContext } from 'react';
import {View, TextInput, useColorScheme} from 'react-native';

const PALETTE = {
    gold: '#b89d63',
    cream: '#EDEEDA',
    navy: '#283A55',
};

export default function ClientInfo() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    return (
        <View className="my-4">
            <TextInput
                placeholder="Client Name"
                placeholderTextColor={isDark ? '#888' : '#aaa'}
                className={`
          px-4 py-3.5 mb-3 rounded-xl text-base font-medium
          border border-gray-300 dark:border-gray-600
          bg-[#1e1e1e] dark:bg-[#1e1e1e]
          text-black dark:text-white
        `}
            />

            <TextInput
                placeholder="Phone"
                keyboardType="phone-pad"
                placeholderTextColor={isDark ? '#aaa' : '#888'}
                className={`
          px-4 py-3.5 mb-3 rounded-xl text-base font-medium
          border border-gray-300 dark:border-gray-600
          bg-[#EDEEDA] dark:bg-[#1e1e1e]
          text-black dark:text-white
        `}
            />

            <TextInput
                placeholder="Email (optional)"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={isDark ? '#aaa' : '#888'}
                className={`
          px-4 py-3.5 rounded-xl text-base font-medium
          border border-gray-300 dark:border-gray-600
          bg-[#EDEEDA] dark:bg-[#1e1e1e]
          text-black dark:text-white
        `}
            />
        </View>
    );
}