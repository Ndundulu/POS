// src/components/CartList.tsx
import React from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type CartItem = {
    id: string;
    name: string;
    price: number;
    qty: number;
};

type Props = {
    cart: CartItem[];
    onRemoveItem: (id: string) => void;
};

export default function CartList({ cart, onRemoveItem }: Props) {
    if (cart.length === 0) {
        return <Text style={styles.empty}>No items added yet.</Text>;
    }

    return (
        <FlatList
            data={cart}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
                <View style={styles.row}>
                    <Text style={styles.name}>
                        {item.name} × {item.qty}
                    </Text>
                    <Text style={styles.price}>
                        Ksh {(item.price * item.qty).toFixed(2)}
                    </Text>
                    <TouchableOpacity onPress={() => onRemoveItem(item.id)}>
                        <Ionicons name="trash" size={20} color="#d00" />
                    </TouchableOpacity>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    empty: {
        textAlign: "center",
        color: "#888",
        marginVertical: 12,
        fontStyle: "italic",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    name: { fontSize: 16, flex: 1 },
    price: { fontSize: 16, fontWeight: "600", marginRight: 8 },
});