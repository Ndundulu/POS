// src/components/POS/CartList.tsx
import React, { useContext } from 'react';
import {View, Text, FlatList, TouchableOpacity, useColorScheme} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LogBox } from 'react-native';

// Ignore the nested VirtualizedLists warning
LogBox.ignoreLogs([
    'VirtualizedLists should never be nested inside plain ScrollViews'
]);
export type CartItem = {
    id: string;
    name: string;
    price: number;
    qty: number;
    sku?: string;
    color?: string;
    size?: string;
    maxQty?: number;
};

type Props = {
    cart: CartItem[];
    onRemoveItem: (id: string) => void;
};

const PALETTE = {
    gold: '#b89d63',
    cream: '#EDEEDA',
    navy: '#283A55',
};

export default function CartList({ cart, onRemoveItem }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    // Dynamic colors using Tailwind + conditional classes
    const textPrimary = isDark ? 'text-white' : 'text-[#283A55]';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
    const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
    const trashColor = isDark ? '#ff4444' : '#d00';

    if (cart.length === 0) {
        return (
            <Text className={`text-center my-8 italic text-base ${textSecondary}`}>
                No items added yet.
            </Text>
        );
    }

    return (
        <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="h-px" />} // optional subtle separator
            renderItem={({ item }) => (
                <View
                    className={`flex-row items-center justify-between py-3 border-b ${borderColor}`}
                >
                    {/* Item Name + Quantity */}
                    <Text className={`flex-1 text-base ${textPrimary} mr-3`}>
                        {item.name} × {item.qty}
                    </Text>

                    {/* Total Price */}
                    <Text className={`text-base font-semibold ${textPrimary} mr-4`}>
                        KSh {(item.price * item.qty).toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    })}
                    </Text>

                    {/* Remove Button */}
                    <TouchableOpacity
                        onPress={() => onRemoveItem(item.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="trash" size={22} color={trashColor} />
                    </TouchableOpacity>
                </View>
            )}
        />
    );
}