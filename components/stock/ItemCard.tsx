// components/stock/ItemCard.tsx
import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Tag, Box } from "lucide-react-native";
import { Alert } from "react-native";

interface ItemCardProps {
    item: any;
    textPrimary: string;
    textSecondary: string;
    cardBg: string;
    onDelete?: () => void;
}

export default function ItemCard({
                                     item,
                                     textPrimary,
                                     textSecondary,
                                     cardBg,
                                     onDelete,
                                 }: ItemCardProps) {
    const handleDelete = () => {
        Alert.alert("Delete Item", `Delete "${item.color} – ${item.motif}"?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: onDelete },
        ]);
    };

    return (
        <Animated.View
            entering={FadeIn}
            className="p-3.5 rounded-xl mb-2.5 flex-row items-start min-h-[90] border border-[#b8a48c30]"
            style={{
                backgroundColor: cardBg,   // This fixes the Reanimated error
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 3,
            }}
        >
            {/* Icon */}
            <View className="w-12 h-12 bg-[#b89d6315] rounded-lg justify-center items-center mr-3">
                <Tag size={22} color="#b89d63" />
            </View>

            {/* Main Content */}
            <View className="flex-1">
                <Text className="text-base font-semibold mb-2.5" style={{ color: textPrimary }}>
                    {item.color} – {item.motif}
                </Text>

                <View className="flex-row justify-between gap-5">
                    <View className="flex-col">
                        <Text className="text-sm" style={{ color: textSecondary }}>Ksh</Text>
                        <Text className="text-sm" style={{ color: textSecondary }}>{item.price}</Text>
                    </View>
                    <View className="flex-col">
                        <Text className="text-sm" style={{ color: textSecondary }}>Buy:</Text>
                        <Text className="text-sm" style={{ color: textSecondary }}>{item.buying_price}</Text>
                    </View>
                    <View className="flex-col">
                        <Text className="text-sm" style={{ color: textSecondary }}>Size</Text>
                        <View className="flex-row items-center">
                            <Box size={14} color={textSecondary} />
                            <Text className="text-sm ml-1" style={{ color: textSecondary }}>{item.size}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Right Column */}
            <View className="items-end ml-2">
                <Text
                    className="font-bold text-right"
                    style={{
                        color:
                            item.status === "On Order"
                                ? "#A43131"
                                : item.status === "Low Stock"
                                    ? "#C58721"
                                    : "#1F7A55",
                    }}
                >
                    {item.quantity} - {item.status}
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: textSecondary }}>
                    SKU: {item.sku}
                </Text>
            </View>
        </Animated.View>
    );
}