// components/orders/sections/OrderItemsSection.tsx
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Plus, Trash2, Package } from "lucide-react-native";
import { useColorScheme } from "react-native";

export default function OrderItemsSection({ items, setItems }: any) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const addItem = () => setItems([...items, { id: Date.now().toString(), description: "", qty: 1, unitCost: 0 }]);
    const removeItem = (id: string) => setItems(items.filter((i: any) => i.id !== id));
    const updateItem = (id: string, field: string, value: string) => {
        setItems(items.map((i: any) => i.id === id ? { ...i, [field]: field === "description" ? value : Number(value) || 0 } : i));
    };

    const bgCard = isDark ? "bg-slate-800/70" : "bg-white";
    const textPrimary = isDark ? "text-white" : "text-navy";
    const textSecondary = isDark ? "text-slate-400" : "text-gray-600";
    const borderColor = isDark ? "border-slate-700" : "border-gray-200";
    const inputBg = isDark ? "bg-slate-700/60" : "bg-gray-50";
    const inputBorder = isDark ? "border-slate-600" : "border-gray-300";

    return (
        <View className={`p-6 rounded-2xl ${bgCard} shadow-lg border ${borderColor} mb-8`}>
            <View className="flex-row items-center gap-3 mb-6">
                <Package size={26} color="#b89d63" />
                <Text className={`text-2xl font-bold ${textPrimary}`}>Items</Text>
            </View>

            {items.map((item: any, index: number) => (
                <View key={item.id} className="mb-6 pb-6 border-b border-gray-600/20 last:border-0 last:pb-0 last:mb-0">
                    <TextInput
                        placeholder="Item description"
                        placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
                        value={item.description}
                        onChangeText={(v) => updateItem(item.id, "description", v)}
                        className={`px-5 py-4 rounded-2xl text-lg font-medium ${inputBg} border ${inputBorder} ${textPrimary}`}
                    />

                    <View className="flex-row gap-3 mt-4">
                        <TextInput
                            placeholder="Qty"
                            placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
                            value={String(item.qty)}
                            onChangeText={(v) => updateItem(item.id, "qty", v)}
                            keyboardType="numeric"
                            className={`flex-1 px-5 py-4 rounded-2xl text-lg font-bold text-center ${inputBg} border ${inputBorder} ${textPrimary}`}
                        />
                        <TextInput
                            placeholder="Unit Cost"
                            placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
                            value={String(item.unitCost)}
                            onChangeText={(v) => updateItem(item.id, "unitCost", v)}
                            keyboardType="numeric"
                            className={`flex-1 px-5 py-4 rounded-2xl text-lg font-bold text-right ${inputBg} border ${inputBorder} ${textPrimary}`}
                        />
                        {items.length > 1 && (
                            <TouchableOpacity
                                onPress={() => removeItem(item.id)}
                                className="bg-red-600/90 p-4 rounded-2xl justify-center shadow-lg active:opacity-80"
                            >
                                <Trash2 size={22} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text className="text-right mt-3 text-xl font-bold text-navy">
                        KES {(item.qty * item.unitCost).toLocaleString()}
                    </Text>
                </View>
            ))}

            <TouchableOpacity
                onPress={addItem}
                className="flex-row items-center justify-center gap-3 py-5 rounded-2xl bg-navy/10 border-2 border-dashed border-navy mt-4 active:opacity-80"
            >
                <Plus size={24} color="#283A55" />
                <Text className="text-navy font-bold text-lg">Add Another Item</Text>
            </TouchableOpacity>
        </View>
    );
}