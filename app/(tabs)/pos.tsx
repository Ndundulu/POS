import React, { useState } from 'react';
import {
    ScrollView,
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import ItemSearch from '@/components/POS/ItemSearch';
import PriceSummary from '@/components/POS/PriceSummary';
import ClientInfo from '@/components/POS/ClientInfo';
import CartList from '@/components/POS/CartList';
import CheckoutModal from '@/components/POS/CheckoutModal';
import CheckoutButton from '@/components/POS/Checkout';
import {supabase} from "@/src/lib/supabaseClient"; // This now just opens modal

type Item = {
    id: string;
    name: string;
    sku: string;
    color?: string;
    size?: string;
    price: number;
    quantity: number;
    qty: number; // cart qty
    maxQty: number;
};

export default function PosScreen({ cashierId }: { cashierId: string }) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [cart, setCart] = useState<Item[]>([]);
    const [client, setClient] = useState<{ name?: string; phone?: string; email?: string } | undefined>();
    const [checkoutVisible, setCheckoutVisible] = useState(false);

    const bg = isDark ? 'bg-black' : 'bg-cream';
    const cardBg = isDark ? 'bg-[#1A1A1A]' : 'bg-white';
    const textPrimary = isDark ? 'text-white' : 'text-navy';

    // Cart operations
    const handleAddItem = (item: Item) => {
        if (item.quantity === 0) return;

        setCart((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            const alreadyInCart = existing?.qty ?? 0;
            const canAdd = alreadyInCart + 1 <= item.quantity;

            if (!canAdd) {
                Alert.alert('Stock limit', `Only ${item.quantity} ${item.name}(s) in stock.`);
                return prev;
            }

            if (existing) {
                return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
            }

            return [
                ...prev,
                {
                    ...item,
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
                return prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i));
            }

            return prev.filter((i) => i.id !== id);
        });
    };

// State to store cashierId
    const [checkoutCashierId, setCheckoutCashierId] = useState<string | null>(null);

// Open Checkout Modal
    const openCheckout = async () => {
        if (!cart.length) {
            Alert.alert('Cart is empty', 'Add items before checkout.');
            return;
        }

        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            if (!data.user) {
                Alert.alert('Error', 'You must be logged in to checkout.');
                return;
            }

            const cashierId = data.user.id; // ✅ this is the correct user id
            setCheckoutCashierId(cashierId);
            setCheckoutVisible(true);
        } catch (err) {
            console.error('Failed to fetch user:', err);
            Alert.alert('Error', 'Unable to fetch user information.');
        }
    };

    console.log(checkoutCashierId)
    // Close modal & clear cart if checkout completed
    const handleCheckoutClose = () => {
        setCheckoutVisible(false);
        setCart([]); // clear cart on success
    };

    return (
        <SafeAreaView className={`flex-1 ${bg}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        className="flex-1"
                        contentContainerClassName="px-4 pb-12"
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text className={`text-3xl font-bold text-center mb-6 ${textPrimary}`}>Point Of Sale</Text>

                        <View className={`rounded-2xl p-4 mb-4 ${cardBg} shadow-lg`}>
                            <ItemSearch onAddItem={handleAddItem} />
                        </View>

                        <View className={`rounded-2xl p-4 mb-4 ${cardBg} shadow-lg`}>
                            <CartList cart={cart} onRemoveItem={handleRemoveItem} />
                        </View>

                        <View className={`rounded-2xl p-4 mb-4 ${cardBg} shadow-lg`}>
                            <PriceSummary cart={cart} />
                        </View>

                        <View className={`rounded-2xl p-4 mb-6 ${cardBg} shadow-lg`}>
                            <ClientInfo client={client} setClient={setClient} />
                        </View>

                        <View className="mt-6 mb-10">
                            <CheckoutButton onPress={openCheckout} disabled={!cart.length} />
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* Checkout Modal */}
            <CheckoutModal
                visible={checkoutVisible}
                cart={cart}
                client={client}
                onClose={handleCheckoutClose}
                cashierId={checkoutCashierId!} // Make sure this is not null
            />
        </SafeAreaView>
    );
}
