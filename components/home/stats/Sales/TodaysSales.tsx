// components/home/stats/Sales/TodaysSales.tsx
import React, { useState, useCallback } from "react";
import { TouchableOpacity, View, Text, ActivityIndicator } from "react-native";
import StatCardBase from "@/components/home/StatCardBase";
import { supabase } from "@/src/lib/supabaseClient";
import TodaysSalesModal from "@/components/home/stats/Sales/TodaysSalesModal";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

export default function TodaysSales() {
    const [modalVisible, setModalVisible] = useState(false);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchTodaySales = useCallback(async () => {
        setLoading(true);

        try {
            // Today's date range in UTC (Supabase uses UTC timestamps)
            const now = new Date();
            const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
            const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

            const { data, error } = await supabase
                .from("sales")
                .select("total")
                .eq("status", "completed")
                .eq("has_custom_items", false)
                .gte("created_at", start.toISOString())
                .lte("created_at", end.toISOString());

            if (error) throw error;

            const sum = data?.reduce((acc, sale) => acc + Number(sale.total), 0) ?? 0;

            setTotal(sum);
        } catch (err) {
            console.error("Today's sales error:", err);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, []); // Stable function thanks to useCallback

    useAutoRefresh(fetchTodaySales);

    return (
        <>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <StatCardBase label="Today's Sales" large>
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <View className="items-end justify-end">
                            <Text className="text-2xl font-bold text-white">
                                KSH {total.toLocaleString()}
                            </Text>
                        </View>
                    )}
                </StatCardBase>
            </TouchableOpacity>

            <TodaysSalesModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </>
    );
}