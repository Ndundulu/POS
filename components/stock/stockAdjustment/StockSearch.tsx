// src/components/stock/StockSearch.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    TextInput,
    ActivityIndicator,
    Text,
    useColorScheme,
    SectionList,
    TouchableOpacity, SafeAreaView,
} from 'react-native';
import { supabase } from '@/src/lib/supabaseClient';

type StockItem = {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    color: string;
    size?: string;
    quantity: number;
};

type GroupedItem = {
    productName: string;
    data: StockItem[];
};

type Props = {
    onSelectItem: (item: StockItem) => void;
};

export default function StockSearch({ onSelectItem }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [search, setSearch] = useState('');
    const [items, setItems] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(false);
    const textPrimary = isDark ? 'text-white' : 'text-navy';

    useEffect(() => {
        const timer = setTimeout(async () => {
            const term = search.trim();
            if (!term) {
                setItems([]);
                return;
            }

            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('items')
                    .select(`
            id,
            product_id,
            sku,
            color,
            size,
            quantity,
            product:product_id (
              id,
              name
            )
          `)
                    .ilike('product.name', `%${term}%`)
                    .order('sku');

                if (error) throw error;

                const formatted: StockItem[] = (data || [])
                    .filter((row: any) => row.product?.name)
                    .map((row: any) => ({
                        id: row.id,
                        productId: row.product.id,
                        productName: row.product.name,
                        sku: row.sku,
                        color: row.color,
                        size: row.size || undefined,
                        quantity: row.quantity,
                    }));

                setItems(formatted);
            } catch (e) {
                console.error('Stock search error:', e);
                setItems([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    // 🔹 Group by product name (same idea as POS ItemList)
    const grouped: GroupedItem[] = items.reduce((acc: GroupedItem[], item) => {
        let group = acc.find(g => g.productName === item.productName);
        if (!group) {
            group = { productName: item.productName, data: [] };
            acc.push(group);
        }
        group.data.push(item);
        return acc;
    }, []);

    return (


        <SafeAreaView className="flex-1 mt-10">
            <Text className={`text-3xl font-bold text-center mb-6 ${textPrimary}`}>Stock Management</Text>
            {/* Search Input */}
            <TextInput
                placeholder="Search product name..."
                placeholderTextColor={isDark ? '#777' : '#555'}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
                clearButtonMode="while-editing"
                className={`
          px-4 py-3.5 rounded-xl text-base font-medium
          border border-gray-300 dark:border-gray-600
          bg-[#EDEEDA] dark:bg-[#2a2a2a]
          text-black dark:text-white
        `}
            />

            {/* Loading */}
            {loading && (
                <View className="mt-6 items-center">
                    <ActivityIndicator
                        size="large"
                        color={isDark ? '#60a5fa' : '#2563eb'}
                    />
                </View>
            )}

            {/* Results */}
            {!loading && grouped.length > 0 && (
                <SectionList
                    sections={grouped}
                    keyExtractor={item => item.id}
                    stickySectionHeadersEnabled={false}
                    showsVerticalScrollIndicator={false}
                    renderSectionHeader={({ section }) => (
                        <View
                            className={`
                px-4 py-2 border-b border-gray-200 dark:border-gray-700
                ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100'}
              `}
                        >
                            <Text className="text-base font-semibold text-gray-800 dark:text-gray-200">
                                {section.productName}
                            </Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => onSelectItem(item)}
                            activeOpacity={0.7}
                            className="
                flex-row items-center px-4 py-4
                border-b border-gray-100 dark:border-gray-800
              "
                        >
                            {/* Variant info */}
                            <View className="flex-1 mr-3">
                                <Text className="text-base font-medium text-gray-800 dark:text-gray-200">
                                    {item.color}
                                    {item.size && ` • ${item.size}`}
                                </Text>
                                <Text className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">
                                    {item.sku}
                                </Text>
                            </View>

                            {/* Quantity badge */}
                            <View
                                className={`
                  px-3 py-1 rounded-full
                  ${
                                    item.quantity === 0
                                        ? 'bg-red-100'
                                        : item.quantity < 5
                                            ? 'bg-orange-100'
                                            : 'bg-green-100'
                                }
                `}
                            >
                                <Text
                                    className={`
                    text-sm font-semibold
                    ${
                                        item.quantity === 0
                                            ? 'text-red-600'
                                            : item.quantity < 5
                                                ? 'text-orange-600'
                                                : 'text-green-700'
                                    }
                  `}
                                >
                                    {item.quantity}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}

            {/* No Results */}
            {!loading && search.trim() && grouped.length === 0 && (
                <Text className="text-center mt-8 text-base italic text-gray-500 dark:text-gray-400">
                    No variants found for "{search}"
                </Text>
            )}

            {/* Empty Hint */}
            {!loading && !search.trim() && (
                <Text className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                    Start typing to search stock…
                </Text>
            )}
        </SafeAreaView>
    );
}

