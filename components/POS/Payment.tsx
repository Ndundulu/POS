// app/POSScreen.tsx or wherever you have it
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { supabase } from "@/src/lib/supabaseClient";

export default function POSScreen() {
    const [amount, setAmount] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);

    const validate = () => {
        if (!phone) return "Phone number required.";
        const clean = phone.replace(/[\s-]/g, "");
        if (!/^254[71]\d{8}$/.test(clean)) return "Use 2547... format.";
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return "Valid amount required.";
        return null;
    };

    const initiateMpesaPayment = async () => {
        const error = validate();
        if (error) {
            Alert.alert("Invalid", error);
            return;
        }

        setLoading(true);
        setResponse(null);

        try {
            const cleanPhone = phone.replace(/[\s-]/g, "");

            // CORRECT: Pass object, NOT JSON string
            const { data, error } = await supabase.functions.invoke("mpesa-payment", {
                body: {
                    amount: Number(amount),
                    phoneNumber: cleanPhone,
                    accountReference: `POS_${Date.now()}`,
                },
            });

            if (error) throw error;

            setResponse(data);
            Alert.alert("Success", "Check your phone for M-Pesa prompt!");
        } catch (err: any) {
            console.error("M-Pesa error:", err);
            Alert.alert("Failed", err.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
                M-Pesa Payment
            </Text>

            <TextInput
                placeholder="Phone (254712...)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={inputStyle}
            />

            <TextInput
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={[inputStyle, { marginBottom: 20 }]}
            />

            <TouchableOpacity
                onPress={initiateMpesaPayment}
                disabled={loading}
                style={{
                    backgroundColor: "#28a745",
                    padding: 14,
                    borderRadius: 10,
                    alignItems: "center",
                }}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={{ color: "#fff", fontWeight: "600" }}>Pay with M-Pesa</Text>
                )}
            </TouchableOpacity>

            {response && (
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontWeight: "600" }}>Response:</Text>
                    <Text style={{ fontFamily: "monospace", fontSize: 11 }}>
                        {JSON.stringify(response, null, 2)}
                    </Text>
                </View>
            )}
        </View>
    );
}

const inputStyle = {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
};