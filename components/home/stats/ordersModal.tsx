// components/orders/OrdersModal.tsx
import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
} from "react-native";
import { X, Plus, Trash2, Mail, ChevronDown } from "lucide-react-native";

interface Item {
    id: string;
    description: string;
    qty: number;
    unitCost: number;
}

interface OrdersModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function OrdersModal({ visible, onClose }: OrdersModalProps) {
    const [customerType, setCustomerType] = useState<"individual" | "company">("individual");

    // Client
    const [companyName, setCompanyName] = useState("");
    const [attentionName, setAttentionName] = useState("");
    const [clientName, setClientName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    // Items
    const [items, setItems] = useState<Item[]>([
        { id: "1", description: "", qty: 1, unitCost: 0 },
    ]);

    // Delivery & Payment
    const [deliveryMethod, setDeliveryMethod] = useState("Pickup");
    const [expectedDate, setExpectedDate] = useState("");
    const [deliveryFee, setDeliveryFee] = useState("0");
    const [discount, setDiscount] = useState("0");
    const [deposit, setDeposit] = useState("0");
    const [paymentMode, setPaymentMode] = useState("M-Pesa");

    // Calculations
    const subtotal = items.reduce((sum, i) => sum + i.qty * i.unitCost, 0);
    const total = subtotal + Number(deliveryFee) - Number(discount);
    const balance = total - Number(deposit);

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), description: "", qty: 1, unitCost: 0 }]);
    };

    const removeItem = (id: string) => {
        if (items.length === 1) return;
        setItems(items.filter((i) => i.id !== id));
    };

    const updateItem = (id: string, field: "description" | "qty" | "unitCost", value: string) => {
        setItems(items.map((item) => {
            if (item.id === id) {
                const num = field === "description" ? 0 : Number(value) || 0;
                return {
                    ...item,
                    [field]: field === "description" ? value : num,
                };
            }
            return item;
        }));
    };

    const saveOrder = () => {
        Alert.alert("Success", "Order saved! (Connect to Supabase later)");
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-gray-50">
                {/* Header */}
                <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
                    <Text className="text-2xl font-bold text-gray-800">Orders</Text>
                    <TouchableOpacity onPress={onClose}>
                        <X size={28} color="#374151" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1">
                    {/* Summary */}
                    <View className="flex-row justify-around my-6 px-4">
                        <View className="bg-orange-100 px-8 py-6 rounded-2xl items-center">
                            <Text className="text-5xl font-bold text-orange-600">87</Text>
                            <Text className="text-gray-700 mt-1">Ongoing</Text>
                        </View>
                        <View className="bg-green-100 px-8 py-6 rounded-2xl items-center">
                            <Text className="text-5xl font-bold text-green-600">38</Text>
                            <Text className="text-gray-700 mt-1">Completed</Text>
                        </View>
                    </View>

                    {/* Create Order Form */}
                    <View className="bg-white mx-4 rounded-2xl shadow-lg p-6 mb-6">
                        <Text className="text-xl font-bold mb-6 text-center text-gray-800">
                            Create New Order
                        </Text>

                        {/* Client Type */}
                        <Text className="font-semibold mb-3">Client Type</Text>
                        <View className="flex-row justify-around mb-6">
                            <TouchableOpacity
                                onPress={() => setCustomerType("individual")}
                                className={`px-6 py-3 rounded-xl ${customerType === "individual" ? "bg-blue-600" : "bg-gray-200"}`}
                            >
                                <Text className={`font-medium ${customerType === "individual" ? "text-white" : "text-gray-700"}`}>
                                    Individual
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setCustomerType("company")}
                                className={`px-6 py-3 rounded-xl ${customerType === "company" ? "bg-blue-600" : "bg-gray-200"}`}
                            >
                                <Text className={`font-medium ${customerType === "company" ? "text-white" : "text-gray-700"}`}>
                                    Company
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Client Details */}
                        <Text className="font-semibold mb-3">Client Details</Text>
                        {customerType === "company" ? (
                            <>
                                <TextInput
                                    placeholder="Company Name"
                                    value={companyName}
                                    onChangeText={setCompanyName}
                                    className="border border-gray-300 rounded-lg px-4 py-3 mb-3"
                                />
                                <TextInput
                                    placeholder="Attention (Contact Person)"
                                    value={attentionName}
                                    onChangeText={setAttentionName}
                                    className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
                                />
                            </>
                        ) : (
                            <TextInput
                                placeholder="Full Name"
                                value={clientName}
                                onChangeText={setClientName}
                                className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
                            />
                        )}

                        <View className="flex-col gap-3 mb-4">
                            <TextInput
                                placeholder="Phone Number"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
                            />
                            <TextInput
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
                            />
                        </View>

                        <TextInput
                            placeholder="Delivery Address"
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
                        />

                        {/* Items */}
                        <Text className="font-semibold mb-3">Items</Text>
                        {items.map((item) => (
                            <View key={item.id} className="mb-4">
                                <TextInput
                                    placeholder="Item description"
                                    value={item.description}
                                    onChangeText={(v) => updateItem(item.id, "description", v)}
                                    className="border border-gray-300 rounded-lg px-4 py-3 mb-2"
                                />
                                <View className="flex-row gap-3">
                                    <TextInput
                                        placeholder="Qty"
                                        value={String(item.qty)}
                                        onChangeText={(v) => updateItem(item.id, "qty", v)}
                                        keyboardType="numeric"
                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
                                    />
                                    <TextInput
                                        placeholder="Unit Cost"
                                        value={String(item.unitCost)}
                                        onChangeText={(v) => updateItem(item.id, "unitCost", v)}
                                        keyboardType="numeric"
                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
                                    />
                                    <TouchableOpacity
                                        onPress={() => removeItem(item.id)}
                                        className="bg-red-500 p-3 rounded-lg justify-center"
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                                <Text className="text-right mt-1 font-medium text-blue-600">
                                    Total: KES {(item.qty * item.unitCost).toLocaleString()}
                                </Text>
                            </View>
                        ))}

                        <TouchableOpacity
                            onPress={addItem}
                            className="flex-row items-center justify-center bg-gray-100 py-3 rounded-lg mb-6"
                        >
                            <Plus size={20} color="#374151" />
                            <Text className="ml-2 text-gray-700 font-medium">Add Item</Text>
                        </TouchableOpacity>

                        {/* Delivery */}
                        <Text className="font-semibold mb-3">Delivery Details</Text>
                        <View className="flex-row gap-3 mb-4">
                            <TextInput
                                placeholder="Expected Delivery (e.g. 2025-12-25)"
                                value={expectedDate}
                                onChangeText={setExpectedDate}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
                            />
                            <TextInput
                                placeholder="Delivery Fee"
                                value={deliveryFee}
                                onChangeText={setDeliveryFee}
                                keyboardType="numeric"
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
                            />


                        </View>

                        {/* Payment Summary */}
                        <View className="bg-gray-50 p-4 rounded-xl mb-6">
                            <View className="flex-row justify-between mb-2">
                                <Text>Subtotal</Text>
                                <Text className="font-medium">KES {subtotal.toLocaleString()}</Text>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text>Delivery Fee</Text>
                                <Text className="font-medium">+ KES {Number(deliveryFee).toLocaleString()}</Text>
                            </View>
                            <View className="flex-row justify-between mb-3">
                                <Text>Discount</Text>
                                <Text className="font-medium">- KES {Number(discount).toLocaleString()}</Text>
                            </View>
                            <View className="border-t border-gray-300 pt-3">
                                <View className="flex-row justify-between text-lg">
                                    <Text className="font-bold">TOTAL</Text>
                                    <Text className="font-bold text-blue-600">KES {total.toLocaleString()}</Text>
                                </View>
                            </View>
                            <View className="flex-row justify-between mt-3">
                                <Text>Deposit Paid</Text>
                                <TextInput
                                    value={deposit}
                                    onChangeText={setDeposit}
                                    keyboardType="numeric"
                                    className="border-b border-gray-400 text-right w-32"
                                />
                            </View>
                            <View className="flex-row justify-between mt-3">
                                <Text className="font-bold">Balance Due</Text>
                                <Text className={`font-bold text-lg ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
                                    KES {balance.toLocaleString()}
                                </Text>
                            </View>
                        </View>

                        {/* Payment Mode */}
                        <Text className="font-semibold mb-3">Payment Mode</Text>
                        <View className="flex-row justify-around mb-8">
                            {["M-Pesa", "Cash", "Card"].map((mode) => (
                                <TouchableOpacity
                                    key={mode}
                                    onPress={() => setPaymentMode(mode)}
                                    className={`px-6 py-3 rounded-xl ${paymentMode === mode ? "bg-blue-600" : "bg-gray-200"}`}
                                >
                                    <Text className={`${paymentMode === mode ? "text-white" : "text-gray-700"} font-medium`}>
                                        {mode}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row justify-between">
                            <TouchableOpacity className="flex-row items-center bg-gray-100 px-6 py-4 rounded-xl">
                                <Mail size={20} color="#374151"  />
                                <Text className="ml-2 font-medium">Share with Client</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={saveOrder}
                                className="bg-blue-600 px-8 py-4 rounded-xl"
                            >
                                <Text className="text-white font-bold text-lg">
                                    {balance === 0 ? "Mark Complete" : "Save Order"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}