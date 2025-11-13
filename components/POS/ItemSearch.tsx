// src/components/ItemSearch.tsx
import { useEffect, useState } from "react";
import {
    View,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Text,
} from "react-native";
import { supabase } from "@/src/lib/supabaseClient";
import ItemList from "./ItemList";

export type Item = {
    id: string;           // items.id
    productId: string;    // products.id
    name: string;         // products.name
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
    const [search, setSearch] = useState("");
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
                    .from("items")
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
                    .ilike("product.name", `%${term}%`)
                    .order("sku", { ascending: true });

                if (error) {
                    console.error("Supabase error:", error);
                    setItems([]);
                } else {
                    const formatted: Item[] = (data || [])
                        .filter((row: any) => row.product && row.product.name)
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
                }
            } catch (e) {
                console.error("Fetch error:", e);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchVariants, 300);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Search product name (e.g. T-Shirt)"
                style={styles.input}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
                clearButtonMode="while-editing"
            />
            {loading ? (
                <ActivityIndicator style={{ marginTop: 12 }} />
            ) : items.length > 0 ? (
                <ItemList items={items} onAdd={onAddItem} />
            ) : search.trim() ? (
                <Text style={styles.noResults}>No variants found for "{search}"</Text>
            ) : (
                <Text style={styles.hint}>Start typing to search products...</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: "#fff",
    },
    noResults: {
        textAlign: "center",
        marginTop: 12,
        color: "#888",
        fontStyle: "italic",
    },
    hint: {
        textAlign: "center",
        marginTop: 12,
        color: "#aaa",
        fontSize: 14,
    },
});