// components/orders/screens/CreateOrderScreen.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    useColorScheme
} from "react-native";
import {Plus, X} from "lucide-react-native";
import ClientSection from "../sections/ClientSection";
import OrderItemsSection from "../sections/OrderItemsSection";
import DeliverySection from "../sections/DeliverySection";
import PaymentSummarySection from "../sections/PaymentSummarySection";
import { format } from "date-fns";
import { supabase } from "@/src/lib/supabaseClient";

export default function CreateOrderScreen({ goHome }: { goHome: () => void }) {
    const [isSaving, setIsSaving] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    // Client
    const [customerType, setCustomerType] = useState<"individual" | "company">("individual");
    const [companyName, setCompanyName] = useState("");
    const [attentionName, setAttentionName] = useState("");
    const [clientName, setClientName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    // Order
    const [items, setItems] = useState([
        {id: "1", description: "", qty: 1, unitCost: 0},
    ]);
    const [deliveryMethod, setDeliveryMethod] = useState<"Pickup truck delivery" | "Rider" | "Collection">("Collection");
    const [expectedDate, setExpectedDate] = useState(new Date());

    // Payment
    const [taxInclusive, setTaxInclusive] = useState(true);
    const [deliveryFee, setDeliveryFee] = useState("0");
    const [discount, setDiscount] = useState("0");
    const [deposit, setDeposit] = useState("0");
    const [paymentMode, setPaymentMode] = useState<"cash" | "mpesa" | "card">("cash");

    // Calculations
    const subtotal = items.reduce((sum, i) => sum + i.qty * i.unitCost, 0);
    const tax = taxInclusive ? subtotal * 0.16 / 1.16 : subtotal * 0.16;
    const total = subtotal + Number(deliveryFee) - Number(discount) + (taxInclusive ? 0 : tax);
    const balance = total - Number(deposit);

    const handleSave = async () => {
        if (isSaving) return;

        const finalName = customerType === "company"
            ? companyName.trim() || attentionName.trim() || "Unnamed Company"
            : clientName.trim() || "Walk-in CustomersList";

        if (!phone.trim()) return Alert.alert("Error", "Phone number is required");
        if (!finalName) return Alert.alert("Error", "CustomersList name is required");
        if (items.every(i => !i.description.trim())) return Alert.alert("Error", "Add at least one item");

        setIsSaving(true);

        try {
            const result = await saveOrder({
                customer: {
                    name: finalName,
                    p_number: phone.trim(),
                    email: email.trim() || null,
                    address: address.trim() || null
                },
                items: items.filter(i => i.description.trim()).map((i, idx) => ({
                    description: i.description.trim(),
                    quantity: i.qty,
                    unit_price: i.unitCost,
                    total_price: i.qty * i.unitCost,
                    sort_order: idx,
                })),
                total,
                deposit: Number(deposit) || 0,
                delivery_method: deliveryMethod,
                delivery_fee: parseFloat(deliveryFee) || 0,
                expected_delivery_date: format(expectedDate, "yyyy-MM-dd"),
                customerType,
                companyName: companyName.trim(),
                attentionName: attentionName.trim(),
                paymentMode,
                tax_inclusive: taxInclusive,
                discount_amount:Number(discount) || 0,
            });

            if (result.success) {
                Alert.alert("Success!", "Order created successfully", [{text: "OK", onPress: goHome}]);
            } else {
                Alert.alert("Failed", result.error || "Unknown error");
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Something went wrong");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View className={`flex-1 ${isDark ? "bg-[#0f172a]" : "bg-cream"}`}>
            {/* Header */}
            <View
                className={`flex-row justify-between items-center px-6 py-5 border-b ${
                    isDark
                        ? "bg-slate-900/95 border-slate-800"
                        : "bg-white border-gray-200"
                } shadow-sm backdrop-blur-xl`}
            >
                <Text className={`text-3xl font-bold ${isDark ? "text-white" : "text-navy"}`}>
                    Create Order
                </Text>
                <TouchableOpacity onPress={goHome} className="p-2 -mr-2">
                    <X size={28} color={isDark ? "#e2e8f0" : "#283A55"}/>
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

                <OrderItemsSection items={items} setItems={setItems}/>

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
                    deposit={deposit}
                    setDeposit={setDeposit}
                    paymentMode={paymentMode}
                    setPaymentMode={setPaymentMode}
                />

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving}
                    className={`mt-10 mb-20 flex-row items-center justify-center gap-3 py-5 rounded-2xl shadow-lg active:opacity-80 ${
                        isSaving
                            ? "bg-navy/60"
                            : "bg-navy"
                    }`}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="white"/>
                    ) : (
                        <>
                            <Plus size={24} color="white"/>
                            <Text className="text-white font-bold text-lg tracking-wide">
                                {balance === 0 ? "Create & Complete" : "Save Order"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

export async function saveOrder(order: {
    customer: { name: string; p_number: string; email: string | null; address: string | null };
    items: any[];
    total: number;
    deposit: number;
    delivery_method: string;
    delivery_fee: number;
    expected_delivery_date: string;
    customerType: "individual" | "company";
    companyName: string;
    attentionName: string;
    paymentMode: "cash" | "mpesa" | "card";
    tax_inclusive: boolean;
    discount_amount?: number;
}) {
    try {
        // 1. Get or create customer
        let customerId: string;
        const { data: existing } = await supabase
            .from("customers")
            .select("id")
            .eq("email", order.customer.email)
            .maybeSingle();

        if (existing) {
            customerId = existing.id;
        } else {
            const { data: newCust, error } = await supabase
                .from("customers")
                .insert({
                    name: order.customer.name,
                    companyname: order.customer.name, // ← NEVER NULL
                    p_number: order.customer.p_number,
                    email: order.customer.email!.toLowerCase(),
                    address: order.customer.address,
                    customer_type: order.customerType,
                    attention_name: order.customerType === "company" && order.attentionName ? order.attentionName : null,
                })
                .select("id")
                .single();

            if (error) throw error;
            customerId = newCust.id;
        }

        // 2. Create sale — ALL REQUIRED FIELDS
        const { data: sale, error: saleErr } = await supabase
            .from("sales")
            .insert({
                customer_id: customerId,
                total: order.total,
                deposit: order.deposit,
                status: order.deposit >= order.total ? "completed" : "ongoing",
                delivery_method: order.delivery_method,
                delivery_fee: order.delivery_fee,
                expected_delivery_date: order.expected_delivery_date,
                has_custom_items: true,
                payment_mode: order.paymentMode.toLowerCase(),
                discount_amount: order.discount_amount || 0,
                tax_inclusive: order.tax_inclusive// This one IS required
            })
            .select("id")
            .single();

        if (saleErr) throw saleErr;

        // 3. Save items
        if (order.items.length > 0) {
            const { error: itemsErr } = await supabase
                .from("custom_sale_items")
                .insert(order.items.map(i => ({
                    sale_id: sale.id,
                    description: i.description,
                    quantity: i.quantity,
                    unit_price: i.unit_price,
                    sort_order: i.sort_order,
                })));

            if (itemsErr) throw itemsErr;
        }

        return { success: true, sale_id: sale.id };
    } catch (error: any) {
        console.error("saveOrder error:", error);
        return { success: false, error: error.message };
    }
}