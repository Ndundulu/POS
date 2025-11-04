import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import {supabase} from "@/src/lib/supabaseClient";

export default function StockScreen() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            const { data, error } = await supabase
                .from("items")
                .select("id, sku, name, color, size, motif, quantity, price, status");
            console.log(data);
            if (error) {
                console.error("Error fetching items:", error);
            } else {
                setItems(data);
            }
            setLoading(false);
        };

        fetchItems();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
                <Text>Loading stock...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Inventory</Text>


            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.itemCard}>
                        <Text style={styles.sku}>{item.sku}</Text>
                        <Text>Color: {item.color}</Text>
                        <Text>Size: {item.size || "—"}</Text>
                        <Text>Motif: {item.motif}</Text>
                        <Text>Qty: {item.quantity}</Text>
                        <Text>Price: ${item.price}</Text>
                        <Text>Status: {item.status}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
    itemCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sku: { fontWeight: "bold", fontSize: 16 },
});
