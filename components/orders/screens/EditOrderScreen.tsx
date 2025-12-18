// components/orders/screens/EditOrderScreen.tsx
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { X, Plus } from "lucide-react-native";
import { useColorScheme } from "react-native";
import { format } from "date-fns";

import ClientSection from "../sections/ClientSection";
import OrderItemsSection from "../sections/OrderItemsSection";
import DeliverySection from "../sections/DeliverySection";
import PaymentSummarySection from "../sections/PaymentSummarySection";

import { supabase } from "@/src/lib/supabaseClient";

export default function EditOrderScreen({
                                            orderId,
                                            goHome,
                                        }: {
    orderId: string;
    goHome: () => void;
}) {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    // Form states – these are the editable fields
    const [customerType, setCustomerType] = useState<"individual" | "company">("individual");
    const [companyName, setCompanyName] = useState("");
    const [attentionName, setAttentionName] = useState("");
    const [clientName, setClientName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    const [items, setItems] = useState<any[]>([]);

    const [deliveryMethod, setDeliveryMethod] = useState<"Pickup truck delivery" | "Rider" | "Collection">("Collection");
    const [expectedDate, setExpectedDate] = useState(new Date());
    const [deliveryFee, setDeliveryFee] = useState("0");
    const [discount, setDiscount] = useState("0");
    const [taxInclusive, setTaxInclusive] = useState(true);

    // Deposit is locked – we only display it (read-only)
    const [deposit, setDeposit] = useState("0");

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("sales")
            .select(`
                *,
                customers(*),
                custom_sale_items(*)
            `)
            .eq("id", orderId)
            .single();

        if (error) {
            Alert.alert("Error", error.message);
            goHome();
            return;
        }

        setOrder(data);

        // Pre-fill all editable fields
        const cust = data.customers;
        setCustomerType(
            cust.companyname && !cust.companyname.includes("Walk-in") ? "company" : "individual"
        );
        setCompanyName(cust.companyname || "");
        setAttentionName(cust.attention_name || "");
        setClientName(cust.name || "");
        setPhone(cust.p_number || "");
        setEmail(cust.email || "");
        setAddress(cust.address || "");

        setItems(
            data.custom_sale_items.map((i: any) => ({
                id: i.id,
                description: i.description,
                qty: i.quantity,
                unitCost: i.unit_price,
            }))
        );

        setDeliveryMethod((data.delivery_method as any) || "Collection");
        setExpectedDate(data.expected_delivery_date ? new Date(data.expected_delivery_date) : new Date());
        setDeliveryFee(String(data.delivery_fee || 0));
        setDiscount(String(data.discount_amount || 0));
        setTaxInclusive(data.tax_inclusive ?? true);
        setDeposit(String(data.deposit || 0));

        setLoading(false);
    };

    const handleSave = async () => {
        if (isSaving) return;

        if (!phone.trim()) {
            Alert.alert("Error", "Phone number is required");
            return;
        }
        if (items.every((i) => !i.description.trim())) {
            Alert.alert("Error", "Add at least one item");
            return;
        }

        setIsSaving(true);

        try {
            const result = await updateOrder({
                orderId,
                customer: {
                    name: customerType === "company" ? companyName.trim() || attentionName.trim() : clientName.trim(),
                    companyname: companyName.trim() || clientName.trim(),
                    attention_name: customerType === "company" ? attentionName.trim() : null,
                    p_number: phone.trim(),
                    email: email.trim() || null,
                    address: address.trim() || null,
                },
                items: items
                    .filter((i) => i.description.trim())
                    .map((i, idx) => ({
                        description: i.description.trim(),
                        quantity: i.qty,
                        unit_price: i.unitCost,
                        sort_order: idx,
                    })),
                delivery_method: deliveryMethod,
                delivery_fee: parseFloat(deliveryFee) || 0,
                expected_delivery_date: format(expectedDate, "yyyy-MM-dd"),
                discount_amount: Number(discount) || 0,
                tax_inclusive: taxInclusive,
            });

            if (result.success) {
                Alert.alert("Success!", "Order updated successfully", [
                    { text: "OK", onPress: goHome },
                ]);
            } else {
                Alert.alert("Failed", result.error || "Unknown error");
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Something went wrong");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-[#0f172a]" : "bg-cream"}`}>
                <ActivityIndicator size="large" />
                <Text className="mt-4 text-gray-500">Loading order for editing...</Text>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? "bg-[#0f172a]" : "bg-cream"}`}>
            {/* Header */}
            <View
                className={`flex-row justify-between items-center px-6 py-5 border-b ${
                    isDark
                        ? "bg-slate-900/95 border-slate-800"
                        : "bg-white border-gray-200"
                } shadow-sm`}
            >
                <Text className={`text-3xl font-bold ${isDark ? "text-white" : "text-navy"}`}>
                    Edit Order
                </Text>
                <TouchableOpacity onPress={goHome} className="p-2 -mr-2">
                    <X size={28} color={isDark ? "#e2e8f0" : "#283A55"} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="px-6 pt-6 pb-32"
            >
                <ClientSection
                    customerType={customerType}
                    setCustomerType={setCustomerType}
                    companyName={companyName}
                    setCompanyName={setCompanyName}
                    attentionName={attentionName}
                    setAttentionName={setAttentionName}
                    clientName={clientName}
                    setClientName={setClientName}
                    phone={phone}
                    setPhone={setPhone}
                    email={email}
                    setEmail={setEmail}
                    address={address}
                    setAddress={setAddress}
                />

                <OrderItemsSection items={items} setItems={setItems} />

                <DeliverySection
                    deliveryMethod={deliveryMethod}
                    setDeliveryMethod={setDeliveryMethod}
                    expectedDate={expectedDate}
                    setExpectedDate={setExpectedDate}
                    deliveryFee={deliveryFee}
                    setDeliveryFee={setDeliveryFee}
                />

                <PaymentSummarySection
                    items={items}
                    deliveryFee={deliveryFee}
                    discount={discount}
                    setDiscount={setDiscount}
                    taxInclusive={taxInclusive}
                    setTaxInclusive={setTaxInclusive}
                    deposit={deposit} // read-only – no setter passed
                    paymentMode="cash" // you can pull from order if stored
                    // setDeposit and setPaymentMode intentionally omitted → section should render as read-only
                />

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving}
                    className={`mt-10 mb-20 flex-row items-center justify-center gap-3 py-5 rounded-2xl shadow-lg active:opacity-80 ${
                        isSaving ? "bg-navy/60" : "bg-navy"
                    }`}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Plus size={24} color="white" />
                            <Text className="text-white font-bold text-lg tracking-wide">
                                Save Changes
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

// Shared update function
async function updateOrder(payload: {
    orderId: string;
    customer: any;
    items: any[];
    delivery_method: string;
    delivery_fee: number;
    expected_delivery_date: string;
    discount_amount: number;
    tax_inclusive: boolean;
}) {
    try {
        // 1. Update customer
        const { data: saleData } = await supabase
            .from("sales")
            .select("customer_id")
            .eq("id", payload.orderId)
            .single();

        const { error: custError } = await supabase
            .from("customers")
            .update({
                name: payload.customer.name,
                companyname: payload.customer.companyname,
                attention_name: payload.customer.attention_name,
                p_number: payload.customer.p_number,
                email: payload.customer.email,
                address: payload.customer.address,
            })
            .eq("id", saleData.customer_id);

        if (custError) throw custError;

        // 2. Update sale fields
        const { error: saleError } = await supabase
            .from("sales")
            .update({
                delivery_method: payload.delivery_method,
                delivery_fee: payload.delivery_fee,
                expected_delivery_date: payload.expected_delivery_date,
                discount_amount: payload.discount_amount,
                tax_inclusive: payload.tax_inclusive,
            })
            .eq("id", payload.orderId);

        if (saleError) throw saleError;

        // 3. Replace custom items
        await supabase.from("custom_sale_items").delete().eq("sale_id", payload.orderId);

        if (payload.items.length > 0) {
            const { error: itemsError } = await supabase
                .from("custom_sale_items")
                .insert(
                    payload.items.map((i) => ({
                        sale_id: payload.orderId,
                        description: i.description,
                        quantity: i.quantity,
                        unit_price: i.unit_price,
                        sort_order: i.sort_order,
                    }))
                );

            if (itemsError) throw itemsError;
        }

        return { success: true };
    } catch (error: any) {
        console.error("updateOrder error:", error);
        return { success: false, error: error.message };
    }
}