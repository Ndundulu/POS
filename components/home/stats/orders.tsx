// components/home/OrdersCard.tsx

import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, ActivityIndicator } from "react-native";
import StatCardBase from "@/components/home/StatCardBase";
import OrdersModal from "@/components/orders/OrdersModal";
import { supabase } from "@/src/lib/supabaseClient";

export default function OrdersCard() {
    const [modalVisible, setModalVisible] = useState(false);
    const [ongoing, setOngoing] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data, error } = await supabase
                .from("sales")
                .select("status");

            if (error) throw error;

            const ongoingCount = data.filter(s => s.status === "ongoing").length;
            const completedCount = data.filter(s => s.status === "completed").length;

            setOngoing(ongoingCount);
            setCompleted(completedCount);
        } catch (err) {
            console.error("Orders stats error:", err);
            setOngoing(0);
            setCompleted(0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <StatCardBase label="Orders" large={true}>
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <View className="items-end justify-end">  {/* Add justify-end */}
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