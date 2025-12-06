// components/orders/screens/OrdersHomeScreen.tsx
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { X, Plus } from "lucide-react-native";
import OrderListItem from "../components/OrderListItem";
import { useOrders } from "../hooks/useOrders";
import { useColorScheme } from "react-native"; // ← Add this

export default function OrdersHomeScreen({ onClose, goTo }: any) {
    const { orders } = useOrders();
    const scheme = useColorScheme(); // "light" | "dark" | null
    const isDark = scheme === "dark";

    const ongoing = orders.filter((o) => o.status === "ongoing");
    const completed = orders.filter((o) => o.status === "completed");

    return (
        <View className={isDark ? "flex-1 bg-[#0f172a]" : "flex-1 bg-cream"}>
            {/* Header */}
            <View
                className={`flex-row justify-between items-center px-6 py-5 border-b ${
                    isDark
                        ? "bg-slate-900/95 border-slate-800"
                        : "bg-white border-gray-200"
                } shadow-sm backdrop-blur-xl`}
            >
                <Text
                    className={`text-3xl font-bold ${
                        isDark ? "text-white" : "text-navy"
                    }`}
                >
                    Orders
                </Text>
                <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
                    <X size={28} color={isDark ? "#e2e8f0" : "#283A55"} />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-32"
            >
                <View className="px-6 pt-8">
                    {/* Create New Order Button */}
                    <TouchableOpacity
                        onPress={() => goTo("create")}
                        className={`flex-row items-center justify-center gap-3 py-5 rounded-2xl shadow-lg mb-8 active:opacity-80 ${
                            isDark
                                ? "bg-navy/90 shadow-slate-900"
                                : "bg-navy shadow-navy/20"
                        }`}
                    >
                        <Plus size={26} color="white" />
                        <Text className="text-white text-lg font-bold tracking-wide">
                            Create New Order
                        </Text>
                    </TouchableOpacity>

                    {/* Ongoing Orders */}
                    <View className="mb-10">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text
                                className={`text-2xl font-bold ${isDark ? "text-white" : "text-navy"}`}
                            >
                                Ongoing
                            </Text>
                            <Text
                                className={`text-lg font-medium ${
                                    isDark ? "text-slate-400" : "text-gray-500"
                                }`}
                            >
                                {ongoing.length} active
                            </Text>
                        </View>

                        <View className="space-y-4">
                            {ongoing.length === 0 ? (
                                <View className="py-12 items-center">
                                    <Text
                                        className={`text-center ${
                                            isDark ? "text-slate-500" : "text-gray-500"
                                        }`}
                                    >
                                        No ongoing orders
                                    </Text>
                                </View>
                            ) : (
                                ongoing.map((order) => (
                                    <OrderListItem
                                        key={order.id}
                                        order={order}
                                        onPress={() => goTo("details", order.id)}
                                    />
                                ))
                            )}
                        </View>
                    </View>

                    {/* Completed Orders */}
                    <View>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text
                                className={`text-2xl font-bold ${isDark ? "text-white" : "text-navy"}`}
                            >
                                Completed
                            </Text>
                            <Text
                                className={`text-lg font-medium ${
                                    isDark ? "text-slate-400" : "text-gray-500"
                                }`}
                            >
                                {completed.length} total
                            </Text>
                        </View>

                        <View className="space-y-4">
                            {completed.length === 0 ? (
                                <View className="py-12 items-center">
                                    <Text
                                        className={`text-center ${
                                            isDark ? "text-slate-500" : "text-gray-500"
                                        }`}
                                    >
                                        No completed orders yet
                                    </Text>
                                </View>
                            ) : (
                                completed.map((order) => (
                                    <OrderListItem
                                        key={order.id}
                                        order={order}
                                        onPress={() => goTo("details", order.id)}
                                    />
                                ))
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}