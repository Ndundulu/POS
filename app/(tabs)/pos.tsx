import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    Text,
    StyleSheet,
    View,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import ItemSearch from '@/components/POS/ItemSearch';
import PriceSummary from '@/components/POS/PriceSummary';
import ClientInfo from '@/components/POS/ClientInfo';
import CheckoutButton from '@/components/POS/Checkout';
import CartList from '@/components/POS/CartList';

export default function PosScreen() {
    const [cart, setCart] = useState<any[]>([]);

    const handleAddItem = (item: Item) => {
        if (item.quantity === 0) return;               // out of stock

        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            const alreadyInCart = existing?.qty ?? 0;
            const canAdd = alreadyInCart + 1 <= item.quantity;

            if (!canAdd) {
                Alert.alert(
                    "Stock limit",
                    `Only ${item.quantity} ${item.name} in stock.`
                );
                return prev;
            }

            if (existing) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, qty: i.qty + 1 } : i
                );
            }

            return [
                ...prev,
                {
                    id: item.id,
                    name: item.name,
                    sku: item.sku,
                    color: item.color,
                    size: item.size,
                    price: item.price,
                    qty: 1,
                    // keep the original stock for reference (optional)
                    maxQty: item.quantity,
                },
            ];
        });
    };

    const handleRemoveItem = (id: string) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === id);
            if (!existing) return prev;
            if (existing.qty > 1) {
                return prev.map((i) =>
                    i.id === id ? { ...i, qty: i.qty - 1 } : i
                );
            }
            return prev.filter((i) => i.id !== id);
        });
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            Alert.alert('Cart is empty', 'Please add items first.');
            return;
        }
        Alert.alert('Processing...', 'Simulating M-Pesa checkout...');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.title}>Point Of Sale</Text>

                    <View style={styles.card}>
                        <ItemSearch onAddItem={handleAddItem} />
                    </View>

                    <View style={styles.card}>
                        <CartList cart={cart} onRemoveItem={handleRemoveItem} />
                    </View>

                    <View style={styles.card}>
                        <PriceSummary cart={cart} />
                    </View>

                    <View style={styles.card}>
                        <ClientInfo />
                    </View>

                    <View style={styles.checkoutContainer}>
                        <CheckoutButton onCheckout={handleCheckout} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scroll: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        textAlign: 'center',
        color: '#222',
        marginTop: 16,
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    checkoutContainer: {
        marginTop: 10,
        marginBottom: 30,
    },
});
