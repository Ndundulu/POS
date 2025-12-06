import React, { useEffect, useState } from "react";
import {
    Modal,
    View,
    FlatList,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    StatusBar,
} from "react-native";
import { supabase } from "@/src/lib/supabaseClient";

interface LowStockItem {
    id: string;
    sku: string;
    color: string;
    size: string | null;
    quantity: number;
    product_id: {
        name: string;
    };
}

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function LowStockList({ visible, onClose }: Props) {
    const [items, setItems] = useState<LowStockItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!visible) {
            setItems([]);
            return;
        }

        const fetchLowStock = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("items")
                    .select(`
            id,
            sku,
            color,
            size,
            quantity,
            product_id:products ( name )
          `)
                    .lt("quantity", 6)
                    .gt("quantity", 0)
                    .order("quantity", { ascending: true });

                if (error) throw error;
                setItems(data ?? []);
            } catch (err) {
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLowStock();
    }, [visible]);

    const renderItem = ({ item }: { item: LowStockItem }) => (
        <View className="py-3 border-b border-gray-200 dark:border-zinc-700">
            <View className="flex-row justify-between items-center">
                {/* Left: Product + Variant */}
                <View className="flex-1 pr-4">
                    <Text className="font-semibold text-gray-900 dark:text-white">
                        {item.product_id.name}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                        <Text className="text-xs text-gray-500 dark:text-zinc-400">
                            {item.sku}
                        </Text>
                        {item.color && (
                            <>
                                <Text className="text-xs text-gray-400 dark:text-zinc-500">•</Text>
                                <Text className="text-xs font-medium text-gray-600 dark:text-zinc-300">
                                    {item.color}
                                </Text>
                            </>
                        )}
                        {item.size && (
                            <>
                                <Text className="text-xs text-gray-400 dark:text-zinc-500">•</Text>
                                <Text className="text-xs font-medium text-gray-600 dark:text-zinc-300">
                                    {item.size}
                                </Text>
                            </>
                        )}
                    </View>
                </View>

                {/* Right: Quantity Badge */}
                <View className="items-end">
                    <Text className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {item.quantity}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-zinc-500 -mt-1">
                        in stock
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <StatusBar barStyle="light-content" backgroundColor="#dc2626" />

            <View className="flex-1 bg-gray-50 dark:bg-zinc-900">
                {/* Header */}
                <View className="bg-red-600 px-6 pt-14 pb-6">
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-3xl font-bold text-white">Low Stock</Text>
                            <Text className="text-red-100 text-lg mt-1">
                                {items.length} {items.length === 1 ? "item" : "items"} below 5 units
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="bg-white/20 px-5 py-3 rounded-full"
                        >
                            <Text className="text-white font-semibold">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* List */}
                <View className="flex-1 px-5 -mt-4">
                    {loading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#ffffff" />
                            <Text className="mt-4 text-gray-600 dark:text-zinc-400">
                                Loading...
                            </Text>
                        </View>
                    ) : items.length === 0 ? (
                        <View className="flex-1 justify-center items-center px-8">
                            <Text className="text-2xl font-bold text-gray-800 dark:text-white text-center">
                                All stocked up
                            </Text>
                            <Text className="text-gray-500 dark:text-zinc-400 mt-2 text-center">
                                No items running low right now.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={items}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerClassName="pb-8 pt-4"
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}
