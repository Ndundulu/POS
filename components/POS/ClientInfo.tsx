// src/components/POS/ClientInfo.tsx
import React, { useContext } from 'react';
import {View, TextInput, useColorScheme} from 'react-native';

const PALETTE = {
    gold: '#b89d63',
    cream: '#EDEEDA',
    navy: '#283A55',
};
type Props = {
    client?: { name?: string; phone?: string; email?: string };
    setClient: (client: { name?: string; phone?: string; email?: string }) => void;
    editable?: boolean;
};

export default function ClientInfo({ client, setClient, editable = true }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View className="my-4">
            <TextInput
                placeholder="Client Name"
                placeholderTextColor={isDark ? '#888' : '#aaa'}
                value={client?.name || ''}
                onChangeText={(text) => setClient({ ...client, name: text })}
                editable={editable}
                className={`px-4 py-3.5 mb-3 rounded-xl text-base font-medium border border-gray-300 dark:border-gray-600
          bg-[#1e1e1e] dark:bg-[#1e1e1e]
          text-black dark:text-white`}
            />
            <TextInput
                placeholder="Phone"
                keyboardType="phone-pad"
                placeholderTextColor={isDark ? '#aaa' : '#888'}
                value={client?.phone || ''}
                onChangeText={(text) => setClient({ ...client, phone: text })}
                editable={editable}
                className={`px-4 py-3.5 mb-3 rounded-xl text-base font-medium border border-gray-300 dark:border-gray-600
          bg-[#EDEEDA] dark:bg-[#1e1e1e]
          text-black dark:text-white`}
            />
            <TextInput
                placeholder="Email (optional)"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={isDark ? '#aaa' : '#888'}
                value={client?.email || ''}
                onChangeText={(text) => setClient({ ...client, email: text })}
                editable={editable}
                className={`px-4 py-3.5 rounded-xl text-base font-medium border border-gray-300 dark:border-gray-600
          bg-[#EDEEDA] dark:bg-[#1e1e1e]
          text-black dark:text-white`}
            />
        </View>
    );
}
