import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import {initiateIFrame} from "@/src/services/pesapal";

export default function PaymentScreen() {
    const [amount, setAmount] = useState('100');
    const [reference] = useState('INV-' + Date.now());
    const [iframeUrl, setIframeUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

// In PaymentScreen, replace startPayment:
    const startPayment = async () => {
        try {
            const url = await initiateIFrame({
                terminal_sn: 'NAA600739300',
                reference_no: 'TEST-' + Date.now(),
                amount: 100,
                payment_method: 'card',
                currency: 'KES',
            });
            setIframeUrl(url);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.status === 'APPROVED') {
                Alert.alert('Success', `Paid KES ${data.amount} | Ref: ${data.reference}`);
                setIframeUrl(null); // Close WebView
            } else if (data.status === 'DECLINED') {
                Alert.alert('Failed', data.message || 'Payment declined');
            }
        } catch (e) {
            console.log('Invalid postMessage', event.nativeEvent.data);
        }
    };

    if (iframeUrl) {
        return (
            <View style={styles.container}>
                <WebView
                    source={{ uri: iframeUrl }}
                    onMessage={handleMessage}
                    style={{ flex: 1 }}
                    javaScriptEnabled
                    domStorageEnabled
                />
                <Button title="Cancel" onPress={() => setIframeUrl(null)} />

            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>PesaPal POS</Text>
            <TextInput
                placeholder="Amount (KES)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.input}
            />
            <Text>Reference: {reference}</Text>
            <Button
                title={loading ? "Contacting PesaPal..." : "Pay with PesaPal"}
                onPress={startPayment}
                disabled={loading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
});