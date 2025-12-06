import React, { useState, useEffect } from "react";
import { TouchableOpacity } from "react-native";
import StatCardBase from "@/components/home/StatCardBase";
import { supabase } from "@/src/lib/supabaseClient";
import LowStockList from "./LowStockList"; // modal component

export default function LowStockCard() {
    const [modalVisible, setModalVisible] = useState(false);
    const [count, setCount] = useState<number | null>(null);

    const fetchCount = async () => {
        try {
            const { count, error } = await supabase
                .from("items")
                .select("*", { count: "exact", head: true })
                .lt("quantity", 5);

            if (error) throw error;
            setCount(count ?? 0);
        } catch (err) {
            console.log("Low stock count fetch failed:", err);
            setCount(0);
        }
    };

    useEffect(() => {
        fetchCount();

        // Optional: refresh every 5 seconds
        const interval = setInterval(fetchCount, 5000);

        // Optional: Supabase Realtime for automatic updates
        const channel = supabase
            .channel("low-stock-count")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "items" },
                (payload) => {
                    // Only update if quantity < 5 changed
                    if (payload.new.quantity < 5 || payload.old?.quantity < 5) fetchCount();
                }
            )
            .subscribe();

        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <>
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                {count === null ? (
                    <StatCardBase label="Low Stock Items" value="..." loading />
                ) : (
                    <StatCardBase label="Low Stock" value={count.toString()} />
                )}
            </TouchableOpacity>

            <LowStockList
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </>
    );
}

