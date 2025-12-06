// src/components/POS/ItemSearch.tsx
import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    TextInput,
    ActivityIndicator,
    Text, useColorScheme,
} from 'react-native';
import { supabase } from '@/src/lib/supabaseClient';
import ItemList from './ItemList';
export type Item = {
    id: string;
    productId: string;
    name: string;
    sku: string;
    color: string;
    size?: string;
    price: number;
    quantity: number;
};

type Props = {
    onAddItem: (item: Item) => void;
};

export default function ItemSearch({ onAddItem }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [search, setSearch] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchVariants = async () => {
            const term = search.trim();
            if (!term) {
                setItems([]);
                setLoading(false);
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
            price,
            quantity,
            product:product_id (
              id,
              name
            )
          `)
                    .ilike('product.name', `%${term}%`)
                    .order('sku', { ascending: true });

                if (error) throw error;

                const formatted: Item[] = (data || [])
                    .filter((row: any) => row.product?.name)
                    .map((row: any) => ({
                        id: row.id,
                        productId: row.product.id,
                        name: row.product.name,
                        sku: row.sku,
                        color: row.color,
                        size: row.size || undefined,
                        price: Number(row.price),
                        quantity: row.quantity,
                    }));

                setItems(formatted);
            } catch (e) {
                console.error('Search error:', e);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchVariants, 300);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <View className="mb-6">
            {/* Search Input */}
            <TextInput
                placeholder="Search product name (e.g. Poncho)"
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

            {/* Loading State */}
            {loading && (
                <View className="mt-4 items-center">
                    <ActivityIndicator
                        size="large"
                        color={isDark ? '#60a5fa' : '#1d4ed8'}
                    />
                </View>
            )}

            {/* Results */}
            {!loading && items.length > 0 && (
                <ItemList items={items} onAdd={onAddItem} />
            )}

            {/* No Results */}
            {!loading && search.trim() && items.length === 0 && (
                <Text className={`
          text-center mt-6 text-base italic
          ${isDark ? 'text-gray-400' : 'text-gray-600'}
        `}>
                    No variants found for "<Text className="font-medium">{search}</Text>"
                </Text>
            )}

            {/* Empty Hint */}
            {!loading && !search.trim() && (
                <Text className={`
          text-center mt-6 text-sm
          ${isDark ? 'text-gray-500' : 'text-gray-600'}
        `}>
                    Start typing to search products...
                </Text>
            )}
        </View>
    );
}