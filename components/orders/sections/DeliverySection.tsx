// components/orders/sections/DeliverySection.tsx
import { View, Text, TouchableOpacity, TextInput, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Calendar, Truck, Bike, Store } from "lucide-react-native";
import { format } from "date-fns";
import { useColorScheme } from "react-native";

type DeliveryMethodType = "Pickup truck delivery" | "Rider" | "Collection";

interface DeliverySectionProps {
    deliveryMethod: DeliveryMethodType;
    setDeliveryMethod: (method: DeliveryMethodType) => void;
    expectedDate: Date;
    setExpectedDate: (date: Date) => void;
    deliveryFee: string;
    setDeliveryFee: (fee: string) => void;
}

export default function DeliverySection({
                                            deliveryMethod,
                                            setDeliveryMethod,
                                            expectedDate,
                                            setExpectedDate,
                                            deliveryFee,
                                            setDeliveryFee,
                                        }: DeliverySectionProps) {
    const [showPicker, setShowPicker] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const methods = [
        { label: "Pickup Truck", value: "Pickup truck delivery" as DeliveryMethodType, icon: Truck },
        { label: "Rider", value: "Rider" as DeliveryMethodType, icon: Bike },
        { label: "Collection", value: "Collection" as DeliveryMethodType, icon: Store },
    ];

    const bgCard = isDark ? "bg-slate-800/70" : "bg-white";
    const textPrimary = isDark ? "text-white" : "text-navy";
    const textSecondary = isDark ? "text-slate-400" : "text-gray-600";
    const borderColor = isDark ? "border-slate-700" : "border-gray-300";
    const inputBg = isDark ? "bg-slate-700/60" : "bg-gray-50";

    return (
        <View className={`p-6 rounded-2xl ${bgCard} shadow-lg border ${borderColor} mb-6`}>
            {/* Header */}
            <View className="flex-row items-center gap-3 mb-6">
                <Truck size={26} color="#b89d63" />
                <Text className={`text-2xl font-bold ${textPrimary}`}>Delivery</Text>
            </View>

            {/* Delivery Method */}
            <Text className={`font-bold mb-4 ${textPrimary}`}>Delivery Method</Text>
            <View className="flex-row flex-wrap gap-3 mb-6">
                {methods.map((m) => {
                    const Active = deliveryMethod === m.value;
                    const IconComp = m.icon;

                    return (
                        <TouchableOpacity
                            key={m.value}
                            onPress={() => setDeliveryMethod(m.value)}
                            className={`flex-row items-center px-5 py-3 rounded-xl ${
                                Active
                                    ? "bg-blue-600"
                                    : isDark
                                        ? "bg-slate-700"
                                        : "bg-gray-200"
                            }`}
                        >
                            <IconComp size={22} color={Active ? "white" : "#666"} />
                            <Text className={`ml-3 font-bold text-lg ${Active ? "text-white" : textSecondary}`}>
                                {m.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Expected Delivery Date */}
            <Text className={`font-semibold mb-3 ${textPrimary}`}>Expected Delivery Date</Text>
            <TouchableOpacity
                onPress={() => setShowPicker(true)}
                className={`flex-row items-center border ${borderColor} rounded-lg px-4 py-3 mb-4 ${inputBg}`}
            >
                <Calendar size={20} color="#374151" />
                <Text className={`ml-3 ${textPrimary}`}>{format(expectedDate, "PPP")}</Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={expectedDate}
                    mode="date"
                    minimumDate={new Date()}
                    onChange={(e, date) => {
                        if (Platform.OS !== "ios") setShowPicker(false);
                        if (date) setExpectedDate(date);
                    }}
                />
            )}

            {/* Delivery Fee */}
            <Text className={`font-semibold mb-3 ${textPrimary}`}>Delivery Fee</Text>
            <TextInput
                placeholder="0"
                value={deliveryFee}
                onChangeText={setDeliveryFee}
                keyboardType="numeric"
                className={`border ${borderColor} rounded-lg px-4 py-3 ${inputBg} text-right`}
                placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
            />
        </View>
    );
}


