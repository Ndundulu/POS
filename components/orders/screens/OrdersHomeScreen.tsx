// components/orders/screens/OrdersHomeScreen.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { X, Plus } from "lucide-react-native";
import OrderListItem from "../components/OrderListItem";
import { useOrders } from "../hooks/useOrders";
import { useColorScheme } from "react-native";

// Import screens
import CreateOrderScreen from "./CreateOrderScreen";
import OrderDetailsScreen from "./OrderDetailsScreen";
import EditOrderScreen from "./EditOrderScreen";

export default function OrdersHomeScreen({ onClose }: { onClose: () => void }) {
    const [currentView, setCurrentView] = useState<"home" | "create" | "details" | "edit">("home");
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

    const { orders, loading, refetch } = useOrders();
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const goHome = () => {
        setCurrentView("home");
        setCurrentOrderId(null);
        refetch(); // Refresh list after returning from edit/create
    };

    const goTo = (screen: "home" | "create" | "details" | "edit", orderId?: string) => {
        if (screen === "home") goHome();
        else if (screen === "create") setCurrentView("create");
        else if (screen === "details" || screen === "edit") {
            setCurrentOrderId(orderId || null);
            setCurrentView(screen);
        }
    };

    const ongoing = orders.filter((o) => o.status === "ongoing");
    const completed = orders.filter((o) => o.status === "completed");

    // HOME VIEW
    if (currentView === "home") {
        if (loading) {
            return (
                <View className="flex-1 justify-center items-center bg-cream dark:bg-[#0f172a]">
                    <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#283A55"} />
                    <Text className="mt-4 text-lg text-gray-500">Loading orders...</Text>
                </View>
            );
        }

        return (
            <View className={isDark ? "flex-1 bg-[#0f172a]" : "flex-1 bg-cream"}>
                <View className={`flex-row justify-between items-center px-6 py-5 border-b ${isDark ? "bg-slate-900/95 border-slate-800" : "bg-white border-gray-200"} shadow-sm backdrop-blur-xl`}>
                    <Text className={`text-3xl font-bold ${isDark ? "text-white" : "text-navy"}`}>Orders</Text>
                    <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
                        <X size={28} color={isDark ? "#e2e8f0" : "#283A55"} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32">
                    <View className="px-6 pt-8">
                        <TouchableOpacity
                            onPress={() => goTo("create")}
                            className={`flex-row items-center justify-center gap-3 py-5 rounded-2xl shadow-lg mb-8 active:opacity-80 ${isDark ? "bg-navy/90 shadow-slate-900" : "bg-navy shadow-navy/20"}`}
                        >
                            <Plus size={26} color="white" />
                            <Text className="text-white text-lg font-bold tracking-wide">Create New Order</Text>
                        </TouchableOpacity>

                        {/* Ongoing */}
                        <View className="mb-10">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-navy"}`}>Ongoing</Text>
                                <Text className={`text-lg font-medium ${isDark ? "text-slate-400" : "text-gray-500"}`}>{ongoing.length} active</Text>
                            </View>
                            <View className="space-y-4">
                                {ongoing.length === 0 ? (
                                    <Text className={`text-center py-12 ${isDark ? "text-slate-500" : "text-gray-500"}`}>No ongoing orders</Text>
                                ) : (
                                    ongoing.map((order) => (
                                        <OrderListItem key={order.id} order={order} onPress={() => goTo("details", order.id)} />
                                    ))
                                )}
                            </View>
                        </View>

                        {/* Completed */}
                        <View>
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-navy"}`}>Completed</Text>
                                <Text className={`text-lg font-medium ${isDark ? "text-slate-400" : "text-gray-500"}`}>{completed.length} total</Text>
                            </View>
                            <View className="space-y-4">
                                {completed.length === 0 ? (
                                    <Text className={`text-center py-12 ${isDark ? "text-slate-500" : "text-gray-500"}`}>No completed orders yet</Text>
                                ) : (
                                    completed.map((order) => (
                                        <OrderListItem key={order.id} order={order} onPress={() => goTo("details", order.id)} />
                                    ))
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }

    // OTHER VIEWS
    return (
        <View className="flex-1">
            {currentView === "create" && <CreateOrderScreen goHome={goHome} />}
            {currentView === "details" && currentOrderId && <OrderDetailsScreen orderId={currentOrderId} goHome={goHome} goTo={goTo} />}
            {currentView === "edit" && currentOrderId && <EditOrderScreen orderId={currentOrderId} goHome={goHome} />}
        </View>
    );
}