// src/components/ItemList.tsx
import { View, Text, TouchableOpacity, SectionList, StyleSheet } from "react-native";
import { Item } from "./ItemSearch";

type GroupedItem = {
    productName: string;
    data: Item[];
};

type Props = {
    items: Item[];
    onAdd: (item: Item) => void;
};

export default function ItemList({ items, onAdd }: Props) {
    // Group by product name
    const grouped = items.reduce((acc: GroupedItem[], item) => {
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
            renderSectionHeader={({ section }) => (
                <View style={styles.header}>
                    <Text style={styles.productName}>{section.productName}</Text>
                </View>
            )}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.row}
                    disabled={item.quantity === 0}
                    onPress={() => onAdd(item)}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={styles.variant}>
                            {item.sku} • {item.color}
                            {item.size && ` • ${item.size}`}
                        </Text>
                    </View>
                    <Text style={styles.price}>Ksh {item.price.toFixed(2)}</Text>
                    {item.quantity > 0 ? (
                        <Text style={styles.plus}>+</Text>
                    ) : (
                        <Text style={styles.outOfStock}>(Out)</Text>
                    )}
                </TouchableOpacity>
            )}
        />
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: "#f0f0f0",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    productName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    variant: { fontSize: 15, color: "#444" },
    price: { fontSize: 14, fontWeight: "600", marginRight: 8 },
    plus: { color: "#0066cc", fontWeight: "bold", fontSize: 18 },
    outOfStock: { color: "#999", fontStyle: "italic", fontSize: 14 },
});
