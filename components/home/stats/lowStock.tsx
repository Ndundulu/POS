// components/home/stats/lowStock.tsx (or your exact path)
import React, {useEffect, useState} from "react";
import { TouchableOpacity } from "react-native";
import StatCardBase from "@/components/home/StatCardBase";
import { supabase } from "@/src/lib/supabaseClient";
import LowStockList from "./LowStockList";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

import { useCallback } from 'react';  // Add this if not already

export default function LowStockCard() {
    const [modalVisible, setModalVisible] = useState(false);
    const [count, setCount] = useState<number | null>(null);

    const fetchCount = useCallback(async () => {
        try {
            const { count: newCount, error } = await supabase
                .from("items")
                .select("*", { count: "exact", head: true })
                .lte("quantity", 5);

            if (error) throw error;
            setCount(newCount ?? 0);
        } catch (err) {
            console.log("Low / Out of stock count fetch failed:", err);
            setCount(0);
        }
    }, []);  // Empty deps: supabase client is stable, query is static

    // Now pass the stable fetchCount
    useAutoRefresh(fetchCount);

    // Realtime updates when item quantity changes in the critical range
    useEffect(() => {
        const channel = supabase
            .channel("low-out-of-stock-count")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "items" },
                (payload) => {
                    const newQty = payload.new?.quantity;
                    const oldQty = payload.old?.quantity;

                    // Refetch if crossing into or out of ≤5 threshold
                    if (
                        (newQty !== undefined && newQty <= 5) ||
                        (oldQty !== undefined && oldQty <= 5)
                    ) {
                        fetchCount();
                    }
                }
            )
            .subscribe();

        return () => {
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
                    <StatCardBase label="Low / Out of Stock" value="..." loading />
                ) : (
                    <StatCardBase
                        label="Low / Out of Stock"
                        value={count.toString()}
                    />
                )}
            </TouchableOpacity>

            <LowStockList
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </>
    );
}