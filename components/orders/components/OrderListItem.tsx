// components/orders/components/OrderListItem.tsx
import { TouchableOpacity, View, Text } from "react-native";
import { Clock, CheckCircle } from "lucide-react-native";
import { useColorScheme } from "react-native";

export default function OrderListItem({ order, onPress }: any) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const isOngoing = order.status === "ongoing";

    const bgCard = isDark ? "bg-slate-800/70" : "bg-white";
    const textPrimary = isDark ? "text-white" : "text-navy";
    const textSecondary = isDark ? "text-slate-400" : "text-gray-600";
    const borderColor = isDark ? "border-slate-700" : "border-gray-200";

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`${bgCard} p-5 rounded-2xl mb-4 shadow-lg border ${borderColor} active:scale-98 transition-all`}
        >
            <View className="flex-row justify-between items-center">
                <View className="flex-1">
                    <Text className={`font-bold text-xl ${textPrimary}`}>
                        {order.customers?.companyname || order.customers?.name || order.customer?.companyname || order.customer?.name}
                    </Text>

                    <View className="flex-row items-center gap-4 mt-2">
                        <Text className={`text-lg font-semibold ${textPrimary}`}>
                            KES {order.total.toLocaleString()}
                        </Text>

                        {isOngoing && (
                            <Text className="text-orange-500 font-medium">
                                Balance: KES {order.balance.toLocaleString()}
                            </Text>
                        )}
                    </View>
                </View>

                <View className="ml-4">
                    {isOngoing ? (
                        <View className="bg-orange-500/15 p-3 rounded-full">
                            <Clock size={28} color="#f97316" />
                        </View>
                    ) : (
                        <View className="bg-green-500/15 p-3 rounded-full">
                            <CheckCircle size={28} color="#10b981" />
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}