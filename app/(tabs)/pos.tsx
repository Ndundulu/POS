import React, { useState } from 'react';
import {

    ScrollView,
    View,
    Text,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import ItemSearch from '@/components/POS/ItemSearch';
import PriceSummary from '@/components/POS/PriceSummary';
import ClientInfo from '@/components/POS/ClientInfo';
import CheckoutButton from '@/components/POS/Checkout';
import CartList from '@/components/POS/CartList';

type Item = {
    id: string;
    name: string;
    sku: string;
    color?: string;
    size?: string;
    price: number;
    quantity: number;
};

export default function PosScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [cart, setCart] = useState<any[]>([]);

    // Your custom theme colors (replace with your actual Tailwind values if defined)
    const bg = isDark ? 'bg-black' : 'bg-cream'; // or bg-[#FAF9F6] if not using Tailwind custom color
    const cardBg = isDark ? 'bg-[#1A1A1A]' : 'bg-white'; // replace with your cardlight/carddark
    const textPrimary = isDark ? 'text-white' : 'text-navy';

    const handleAddItem = (item: Item) => {
        if (item.quantity === 0) return;

        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            const alreadyInCart = existing?.qty ?? 0;
            const canAdd = alreadyInCart + 1 <= item.quantity;

            if (!canAdd) {
                Alert.alert(
                    'Stock limit',
                    `Only ${item.quantity} ${item.name}(s) in stock.`,
                    [{ text: 'OK' }],
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
        <SafeAreaView className={`flex-1 ${bg}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Wrap everything in KeyboardAvoidingView */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                // Critical fix for iOS when inside SafeAreaView
            >
                {/* Dismiss keyboard when tapping outside */}
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        className="flex-1"
                        contentContainerClassName="px-4 pb-12" // Extra bottom padding!
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        bounces={true}
                    >
                        <Text className={`text-3xl font-bold text-center mb-6 ${textPrimary}`}>
                            Point Of Sale
                        </Text>

                        <View className={`rounded-2xl p-4 mb-4 ${cardBg} shadow-lg`}>
                            <ItemSearch onAddItem={handleAddItem} />
                        </View>

                        <View className={`rounded-2xl p-4 mb-4 ${cardBg} shadow-lg`}>
                            <CartList cart={cart} onRemoveItem={handleRemoveItem} />
                        </View>

                        <View className={`rounded-2xl p-4 mb-4 ${cardBg} shadow-lg`}>
                            <PriceSummary cart={cart} />
                        </View>

                        {/* Client Info — this is usually where inputs are */}
                        <View className={`rounded-2xl p-4 mb-6 ${cardBg} shadow-lg`}>
                            <ClientInfo />
                        </View>

                        <View className="mt-6 mb-10">
                            <CheckoutButton />
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}