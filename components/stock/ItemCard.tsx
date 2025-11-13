// components/stock/ItemCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Tag, Box, Pencil, Trash2 } from "lucide-react-native";

const PALETTE = { gold: "#b89d63" };

export default function ItemCard({
                                     item,
                                     textPrimary,
                                     textSecondary,
                                     cardBg,
                                     onEdit,
                                     onDelete,
                                 }: any) {
    const handleDelete = () => {
        Alert.alert("Delete Item", `Delete "${item.color} – ${item.motif}"?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: onDelete },
        ]);
    };

    return (
        <Animated.View entering={FadeIn} style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.icon}>
                <Tag size={22} color={PALETTE.gold} />
            </View>

            <View style={{ flex: 1}}>
                <Text style={[styles.title, { color: textPrimary }]}>
                    {item.color} – {item.motif}
                </Text>
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={[styles.meta, { color: textSecondary }]}>Ksh</Text>
                        <Text style={[styles.meta, { color: textSecondary }]}>{item.price}</Text>
                    </View>

                    <View style={styles.column}>
                        <Text style={[styles.meta, { color: textSecondary }]}>Buy:</Text>
                        <Text style={[styles.meta, { color: textSecondary }]}>{item.buying_price}</Text>
                    </View>

                    <View style={styles.column}>
                        <Text style={[styles.meta, { color: textSecondary }]}>Size</Text>
                        <Text style={[styles.meta, { color: textSecondary }]}>
                            <Box size={14} /> {item.size}
                        </Text>
                    </View>
                </View>

            </View>

            <View style={styles.rightCol}>
                <Text style={{
                    fontWeight: "bold",
                    color: item.status === 'On Order' ? '#ef4444' :
                        item.status === 'Low Stock' ? '#f59e0b' : '#10b981',
                    textAlign: "right"
                }}>
                    {item.quantity} {item.status}
                </Text>
                <Text style={[styles.sku, { color: textSecondary }]}>SKU: {item.sku}</Text>
            </View>

        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#b8a48c30",
        position: "relative",
        minHeight: 90,
    },
    icon: { width: 48, height: 48, backgroundColor: "#b89d6315", borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
    title: { fontSize: 16, fontWeight: "600", marginBottom: 10},
    meta: { fontSize: 13, marginLeft: 5 },
    rightCol: { alignItems: "flex-end", marginLeft: 8 },
    sku: { fontSize: 11, marginTop: 2 },
    btn: { padding: 2 },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 20
    },

    column: {
        flexDirection: "column",
        alignItems: "flex-start",
    },

});