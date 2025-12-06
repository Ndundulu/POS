// src/components/POS/ItemList.tsx
import React, { useContext } from 'react';
import {View, Text, TouchableOpacity, SectionList, useColorScheme} from 'react-native';
import { Item } from './ItemSearch';

type GroupedItem = {
    productName: string;
    data: Item[];
};

type Props = {
    items: Item[];
    onAdd: (item: Item) => void;
};

export default function ItemList({ items, onAdd }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    // Group items by product name
    const grouped: GroupedItem[] = items.reduce((acc: GroupedItem[], item) => {
        let group = acc.find((g) => g.productName === item.name);
        if (!group) {
            group = { productName: item.name, data: [] };
            acc.push(group);
        }
        group.data.push(item);
        return acc;
    }, []);

    if (grouped.length === 0) {
        return null;
    }

    return (
        <SectionList
            sections={grouped}
            keyExtractor={(item) => item.id}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            renderSectionHeader={({ section }) => (
                <View
                    className={`
            px-4 py-2 border-b border-gray-200 dark:border-gray-700
            ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-500'}
          `}
                >
                    <Text className="text-base font-semibold text-gray-800 dark:text-gray-200">
                        {section.productName}
                    </Text>
                </View>
            )}
            renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() => onAdd(item)}
                    disabled={item.quantity === 0}
                    activeOpacity={0.7}
                    className={`
            flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800
            ${item.quantity === 0 ? 'opacity-50' : ''}
          `}
                >
                    {/* Variant Details */}
                    <View className="flex-1 mr-3">
                        <Text className="text-sm text-gray-600 dark:text-gray-600 font-medium">
                            {item.color}
                            {item.size && ` • ${item.size}`}
                        </Text>
                    </View>

                    {/* Price */}
                    <Text className="text-sm font-bold text-gray-900 dark:text-gray-100 mr-4">
                        KSh {item.price.toLocaleString()}
                    </Text>

                    {/* Add / Out of Stock Indicator */}
                    {item.quantity > 0 ? (
                        <Text className="text-xl font-bold text-blue-600">+</Text>
                    ) : (
                        <Text className="text-sm italic text-gray-500 dark:text-gray-500">
                            (Out)
                        </Text>
                    )}
                </TouchableOpacity>
            )}
        />
    );
}
