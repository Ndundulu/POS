// components/home/OrdersCard.tsx
import React, { useState } from "react";
import { TouchableOpacity, View, Text, ActivityIndicator } from "react-native";
import StatCardBase from "@/components/home/StatCardBase";
import OrdersModal from "@/components/orders/OrdersModal";
import { supabase } from "@/src/lib/supabaseClient";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useCallback } from "react"; // ← Add this

export default function OrdersCard() {
    const [modalVisible, setModalVisible] = useState(false);
    const [ongoing, setOngoing] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [loading, setLoading] = useState(true);

    // ← CRITICAL: Wrap in useCallback to make it stable
    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const [
                { count: ongoingCount, error: ongoingError },
                { count: completedCount, error: completedError }
            ] = await Promise.all([
                supabase
                    .from("sales")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "ongoing")
                    .eq("has_custom_items", true), // ✅ ADD

                supabase
                    .from("sales")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "completed")
                    .eq("has_custom_items", true) // ✅ ADD
            ]);

            if (ongoingError) throw ongoingError;
            if (completedError) throw completedError;

            setOngoing(ongoingCount ?? 0);
            setCompleted(completedCount ?? 0);
        } catch (err) {
            console.error("Orders stats error:", err);
            setOngoing(0);
            setCompleted(0);
        } finally {
            setLoading(false);
        }
    }, []);
    useAutoRefresh(fetchStats);


    return (
        <>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <StatCardBase label="Orders" large={true}>
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <View className="items-end justify-end">
                            {/* Ongoing */}
                            <View className="flex-row items-center gap-1.5 mb-1">
                                <View className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                <Text className="text-xl font-bold text-white">{ongoing}</Text>
                            </View>

                            {/* Completed */}
                            <View className="flex-row items-center gap-1.5">
                                <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                <Text className="text-xl font-bold text-white">{completed}</Text>
                            </View>
                        </View>
                    )}
                </StatCardBase>
            </TouchableOpacity>

            <OrdersModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </>
    );
}