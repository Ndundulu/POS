// components/orders/screens/OrderDetailsScreen.tsx

import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import {
    X,
    Clock,
    CheckCircle,
    Mail,
    Package,
    Calendar,
    DollarSign,
    User,
    MapPin,
    Plus,
} from "lucide-react-native";
import { format } from "date-fns";
import { supabase } from "@/src/lib/supabaseClient";
import { useColorScheme } from "react-native";
import { shareOrderAsPDF } from "@/components/orders/PDFReceipt";
import { usePaymentCalculations } from "@/components/orders/hooks/usePaymentCalculations";

export default function OrderDetailsScreen({
                                               orderId,
                                               goHome,
                                                goTo,
                                           }: {
    orderId: string;
    goHome: () => void;
    goTo: (screen: string, param?: any) => void;  // ← Add type
}) {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Receive Payment Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "m-pesa" | "card">("cash");
    const [paymentMethodsUsed, setPaymentMethodsUsed] = useState<string[]>([]);
    const [note, setNote] = useState("");
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        const { data, error } = await supabase
            .from("sales")
            .select(`
            *,
            payment_mode,
            discount_amount,
            deposit,
            tax_inclusive,
            delivery_fee,
            delivery_method,
            expected_delivery_date,
            customers(*),
            custom_sale_items(*)
        `)
            .eq("id", orderId)
            .single();

        if (error) {
            Alert.alert("Error", error.message);
            setLoading(false);
            return;
        }

        // 🔹 1. Start with payment_mode from sales
        const methods = new Set<string>();

        if (data.payment_mode) {
            methods.add(data.payment_mode);
        }

        // 🔹 2. Fetch additional payments
        const { data: payments } = await supabase
            .from("payments")
            .select("payment_method")
            .eq("sale_id", orderId);

        payments?.forEach(p => {
            if (p.payment_method) {
                methods.add(p.payment_method);
            }
        });

        setPaymentMethodsUsed(Array.from(methods));
        setOrder(data);
        setLoading(false);
    };

    const calculations = usePaymentCalculations({
        items: order?.custom_sale_items || [],
        deliveryFee: order?.delivery_fee || 0,
        discountAmount: order?.discount_amount || 0,
        depositAmount: order?.deposit || 0,
        taxInclusive: order?.tax_inclusive || false,
    });

    const {
        subtotal,
        deliveryFee,
        discountAmount,
        taxAmount,
        total,
        depositAmount,
        balance,
        taxInclusive,
    } = calculations;

    const markCompleteOrAutoComplete = async () => {
        if (!order) return;

        if (balance <= 0) {
            await updateStatus("completed");
            return;
        }

        Alert.alert(
            "Mark as Complete?",
            "This order still has a balance due. Continue anyway?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Complete",
                    style: "destructive",
                    onPress: () => updateStatus("completed"),
                },
            ]
        );
    };

    const updateStatus = async (newStatus: string) => {
        const { error } = await supabase
            .from("sales")
            .update({ status: newStatus })
            .eq("id", order.id);

        if (!error) {
            Alert.alert("Success", "Order status updated", [{ text: "OK", onPress: loadOrder }]);
        } else {
            Alert.alert("Error", error.message);
        }
    };

    const handleReceivePayment = async () => {
        if (!order) return;

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid payment amount");
            return;
        }

        if (amount > balance) {
            Alert.alert("Amount Too High", `Cannot receive more than balance due (KES ${balance.toLocaleString()})`);
            return;
        }

        try {
            // 1. Get current user (assuming authenticated)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 2. Insert payment record
            const { error: paymentError } = await supabase
                .from("payments")
                .insert({
                    sale_id: order.id,
                    amount,
                    payment_method: paymentMethod,
                    received_by: user.id,
                    note: note.trim() || null,
                });

            if (paymentError) throw paymentError;

            // 3. Update deposit on sales
            const newDeposit = (order.deposit || 0) + amount;
            const { error: updateError } = await supabase
                .from("sales")
                .update({ deposit: newDeposit })
                .eq("id", order.id);

            if (updateError) throw updateError;

            // 4. Auto-complete if fully paid
            if (newDeposit >= total) {
                await supabase
                    .from("sales")
                    .update({ status: "completed" })
                    .eq("id", order.id);
            }

            Alert.alert(
                "Payment Received!",
                `KES ${amount.toLocaleString()} recorded successfully.${newDeposit >= total ? "\nOrder marked as completed." : ""}`,
                [{ text: "OK", onPress: () => {
                        setModalVisible(false);
                        setPaymentAmount("");
                        setNote("");
                        loadOrder();
                    }}]
            );
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to record payment");
        }
    };

    const openReceiveModal = () => {
        setPaymentAmount(balance.toString());
        setPaymentMethod("cash");
        setNote("");
        setModalVisible(true);
    };

    const shareWithClient = async () => {
        if (!order) return;
        try {
            await shareOrderAsPDF(order);
            await supabase.from("order_shares").insert({
                sale_id: order.id,
                shared_via: "pdf_receipt",
                shared_to: order.customers.email || order.customers.p_number || "unknown",
                shared_at: new Date().toISOString(),
            });
        } catch (err: any) {
            Alert.alert("Share Failed", err.message || "Could not share receipt");
        }
    };

    if (loading || !order) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-[#0f172a]" : "bg-cream"}`}>
                <Text className="text-xl text-gray-500">Loading order...</Text>
            </View>
        );
    }

    const bgCard = isDark ? "bg-slate-800/70" : "bg-white";
    const textPrimary = isDark ? "text-white" : "text-navy";
    const textSecondary = isDark ? "text-slate-400" : "text-gray-600";
    const borderColor = isDark ? "border-slate-700" : "border-gray-200";

    const formattedPaymentMethods =
        paymentMethodsUsed.length > 0
            ? paymentMethodsUsed
                .map(m =>
                    m === "m-pesa"
                        ? "M-Pesa"
                        : m.charAt(0).toUpperCase() + m.slice(1)
                )
                .join(" + ")
            : "—";

    return (
        <View className={`flex-1 ${isDark ? "bg-[#0f172a]" : "bg-cream"}`}>
            {/* Header */}
            <View className={`flex-row justify-between items-center px-6 py-5 border-b ${isDark ? "bg-slate-900/95 border-slate-800" : "bg-white border-gray-200"} shadow-sm`}>
                <Text className={`text-3xl font-bold ${textPrimary}`}>Order Details</Text>
                <TouchableOpacity onPress={goHome}>
                    <X size={28} color={isDark ? "#e2e8f0" : "#283A55"} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-6 pt-6 pb-32">
                {/* Status Row */}
                <View className="flex-row justify-between items-center mb-8">
                    <View className={`flex-row items-center gap-3 px-5 py-3 rounded-full ${order.status === "completed" ? "bg-green-500/15" : "bg-orange-500/15"}`}>
                        {order.status === "completed" ? (
                            <CheckCircle size={22} color="#10b981" />
                        ) : (
                            <Clock size={22} color="#f97316" />
                        )}
                        <Text className={`font-bold text-lg ${order.status === "completed" ? "text-green-500" : "text-orange-500"}`}>
                            {order.status === "completed" ? "Completed" : "Ongoing"}
                        </Text>
                    </View>

                    <View className="flex-row gap-3">
                        {/* Existing buttons */}
                        {order.status !== "completed" && balance > 0 && (
                            <TouchableOpacity
                                onPress={openReceiveModal}
                                className="bg-green-600 px-6 py-3.5 rounded-2xl shadow-lg flex-row items-center gap-2"
                            >
                                <Plus size={20} color="white" />
                                <Text className="text-white font-bold">Payment</Text>
                            </TouchableOpacity>
                        )}

                        {order.status !== "completed" && balance <= 0 && (
                            <TouchableOpacity
                                onPress={markCompleteOrAutoComplete}
                                className="bg-green-600 px-7 py-3.5 rounded-2xl shadow-lg"
                            >
                                <Text className="text-white font-bold">Mark as Completed</Text>
                            </TouchableOpacity>
                        )}

                        {/* NEW: Edit Order Button */}
                        {order.status !== "completed" && (
                            <TouchableOpacity
                                onPress={() => goTo("edit", order.id)}
                                className="bg-orange-600 px-6 py-3.5 rounded-2xl shadow-lg"
                            >
                                <Text className="text-white font-bold">Edit</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Client Info */}
                <View className={`p-6 rounded-2xl ${bgCard} shadow-lg mb-6 border ${borderColor}`}>
                    <View className="flex-row items-center gap-3 mb-4">
                        <User size={24} color="#b89d63" />
                        <Text className={`text-xl font-bold ${textPrimary}`}>Client</Text>
                    </View>
                    <Text className={`text-lg font-semibold ${textPrimary}`}>
                        {order.customers.companyname || order.customers.name}
                    </Text>
                    {order.customers.attention_name && (
                        <Text className={textSecondary}>Attn: {order.customers.attention_name}</Text>
                    )}
                    <Text className={`mt-3 ${textSecondary}`}>{order.customers.p_number}</Text>
                    {order.customers.email && <Text className={textSecondary}>{order.customers.email}</Text>}
                    {order.customers.address && (
                        <View className="flex-row items-start gap-2 mt-3">
                            <MapPin size={18} color="#b89d63" />
                            <Text className={textSecondary}>{order.customers.address}</Text>
                        </View>
                    )}
                </View>

                {/* Items */}
                <View className={`p-6 rounded-2xl ${bgCard} shadow-lg mb-6 border ${borderColor}`}>
                    <View className="flex-row items-center gap-3 mb-5">
                        <Package size={24} color="#b89d63" />
                        <Text className={`text-xl font-bold ${textPrimary}`}>Items</Text>
                    </View>
                    {order.custom_sale_items.map((item: any, idx: number) => (
                        <View
                            key={item.id}
                            className={`pb-4 ${idx < order.custom_sale_items.length - 1 ? "border-b border-gray-300/30 dark:border-slate-600/30" : ""}`}
                        >
                            <Text className={`font-medium ${textPrimary}`}>{item.description}</Text>
                            <View className="flex-row justify-between mt-2">
                                <Text className={textSecondary}>
                                    {item.quantity} × KES {Number(item.unit_price).toLocaleString()}
                                </Text>
                                <Text className={`font-semibold ${textPrimary}`}>
                                    KES {(item.quantity * item.unit_price).toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Delivery Details */}
                <View className={`p-6 rounded-2xl ${bgCard} shadow-lg mb-6 border ${borderColor}`}>
                    <View className="flex-row items-center gap-3 mb-5">
                        <Package size={24} color="#b89d63" />
                        <Text className={`text-xl font-bold ${textPrimary}`}>Delivery Details</Text>
                    </View>
                    <View className="space-y-3">
                        <View className="flex-row justify-between">
                            <Text className={textSecondary}>Method</Text>
                            <Text className={`font-semibold ${textPrimary}`}>
                                {order.delivery_method || "Collection"}
                            </Text>
                        </View>
                        {deliveryFee > 0 && (
                            <View className="flex-row justify-between">
                                <Text className={textSecondary}>Delivery Fee</Text>
                                <Text className="font-semibold text-orange-500">+ KES {deliveryFee.toLocaleString()}</Text>
                            </View>
                        )}
                        <View className="flex-row justify-between">
                            <Text className={textSecondary}>Expected Date</Text>
                            <Text className={`font-medium ${textPrimary}`}>
                                {format(new Date(order.expected_delivery_date), "EEEE, MMMM d, yyyy")}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* PAYMENT SUMMARY – SAME LOGIC AS CREATE SCREEN */}
                <View className={`p-6 rounded-2xl ${bgCard} shadow-lg mb-8 border ${borderColor}`}>
                    <View className="flex-row items-center gap-3 mb-5">
                        <DollarSign size={24} color="#b89d63" />
                        <Text className={`text-xl font-bold ${textPrimary}`}>Payment Summary</Text>
                    </View>

                    <View className="space-y-4">
                        <View className="flex-row justify-between">
                            <Text className={textSecondary}>Subtotal</Text>
                            <Text className={`font-medium ${textPrimary}`}>KES {subtotal.toLocaleString()}</Text>
                        </View>

                        {deliveryFee > 0 && (
                            <View className="flex-row justify-between">
                                <Text className={textSecondary}>Delivery Fee</Text>
                                <Text className={`font-medium ${textPrimary}`}>+ KES {deliveryFee.toLocaleString()}</Text>
                            </View>
                        )}

                        {discountAmount > 0 && (
                            <View className="flex-row justify-between">
                                <Text className={textSecondary}>Discount</Text>
                                <Text className="font-medium text-red-500">- KES {discountAmount.toLocaleString()}</Text>
                            </View>
                        )}

                        <View className="flex-row justify-between">
                            <Text className={textSecondary}>
                                VAT 16% ({taxInclusive ? "Inclusive" : "Exclusive"})
                            </Text>
                            <Text className={`font-medium ${taxInclusive ? "text-green-600" : "text-orange-600"}`}>
                                {taxInclusive
                                    ? `KES ${taxAmount.toLocaleString()} (included)`
                                    : `+ KES ${taxAmount.toLocaleString()}`
                                }
                            </Text>
                        </View>

                        <View className="flex-row justify-between pt-4 border-t-2 border-gray-400 dark:border-slate-600">
                            <Text className={`text-xl font-bold ${textPrimary}`}>Total Amount</Text>
                            <Text className={`text-xl font-bold ${textPrimary}`}>KES {total.toLocaleString()}</Text>
                        </View>

                        <View className="flex-row justify-between">
                            <Text className={textSecondary}>
                                {formattedPaymentMethods} • Deposit Paid
                            </Text>
                            <Text className="font-medium text-green-600">
                                - KES {depositAmount.toLocaleString()}
                            </Text>
                        </View>

                        <View className="flex-row justify-between pt-4 border-t-2 border-red-500">
                            <Text className={`text-xl font-bold ${textPrimary}`}>Balance Due</Text>
                            <Text className={`text-2xl font-bold ${balance > 0 ? "text-red-500" : "text-green-500"}`}>
                                KES {balance.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Share Button */}
                <TouchableOpacity
                    onPress={shareWithClient}
                    className="flex-row items-center justify-center gap-3 bg-navy py-5 rounded-2xl shadow-lg active:opacity-80"
                >
                    <Mail size={22} color="white" />
                    <Text className="text-white font-bold text-lg">Share with Client</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Receive Payment Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className={`rounded-t-3xl ${isDark ? "bg-slate-900" : "bg-white"} p-6`}>
                            <View className="items-center mb-4">
                                <View className="w-20 h-1.5 bg-gray-400 rounded-full" />
                            </View>

                            <Text className={`text-2xl font-bold text-center mb-6 ${textPrimary}`}>
                                Receive Payment
                            </Text>

                            <Text className={`text-lg mb-2 ${textSecondary}`}>Amount (KES)</Text>
                            <TextInput
                                value={paymentAmount}
                                onChangeText={setPaymentAmount}
                                keyboardType="numeric"
                                className={`border ${borderColor} rounded-xl px-4 py-4 text-lg mb-4 ${textPrimary}`}
                                placeholder="0"
                            />

                            <Text className={`text-lg mb-2 ${textSecondary}`}>Payment Method</Text>
                            <View className="flex-row justify-around mb-6">
                                {(["cash", "m-pesa", "card"] as const).map((method) => (
                                    <TouchableOpacity
                                        key={method}
                                        onPress={() => setPaymentMethod(method)}
                                        className={`px-6 py-3 rounded-xl ${paymentMethod === method ? "bg-blue-600" : "bg-gray-200 dark:bg-slate-700"}`}
                                    >
                                        <Text className={`font-semibold capitalize ${paymentMethod === method ? "text-white" : textPrimary}`}>
                                            {method === "m-pesa" ? "M-Pesa" : method}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TextInput
                                value={note}
                                onChangeText={setNote}
                                placeholder="Note (optional)"
                                className={`border ${borderColor} rounded-xl px-4 py-3 mb-6 ${textPrimary}`}
                            />

                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    className="flex-1 py-4 rounded-xl border border-gray-400"
                                >
                                    <Text className="text-center font-bold text-gray-600">Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleReceivePayment}
                                    className="flex-1 bg-green-600 py-4 rounded-xl"
                                >
                                    <Text className="text-center font-bold text-white">Receive Payment</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}