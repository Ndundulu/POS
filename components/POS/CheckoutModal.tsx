// src/components/POS/CheckoutModal.tsx
import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    useColorScheme,
    TextInput,
} from 'react-native';
import { supabase } from '@/src/lib/supabaseClient';

type Item = {
    id: string;
    name: string;
    sku: string;
    price: number;
    qty: number;
    maxQty: number;
};

type Client = {
    name?: string;
    phone?: string;
    email?: string;
};

type Props = {
    visible: boolean;
    cart: Item[];
    client?: Client;
    cashierId: string;
    onClose: () => void;
};

export default function CheckoutModal({ visible, cart, client, cashierId, onClose }: Props) {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'm-pesa' | 'card'>('cash');
    const [paymentReference, setPaymentReference] = useState('');
    const [showReceipt, setShowReceipt] = useState(false);
    const [saleInfo, setSaleInfo] = useState<{
        saleId: string;
        total: number;
        items: Item[];
        client: Client;
        referenceNumber: string;
        paymentReference?: string;
    } | null>(null);

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const totalAmount = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

    const requiresReference = paymentMethod === 'm-pesa' || paymentMethod === 'card';

    const handleCheckout = async () => {
        if (!client?.email) {
            Alert.alert('Client email required', 'Please provide an email for the client.');
            return;
        }

        if (requiresReference && !paymentReference.trim()) {
            Alert.alert('Reference Required', `Please enter the ${paymentMethod.toUpperCase()} transaction/reference number.`);
            return;
        }

        setLoading(true);
        let saleId: string | null = null;
        let referenceNumber = '';

        try {
            // 1️⃣ Get or create customer
            const { data: existingClients, error: clientError } = await supabase
                .from('customers')
                .select('id')
                .eq('email', client.email)
                .limit(1);

            if (clientError) throw clientError;

            let customerId = existingClients?.[0]?.id;

            if (!customerId) {
                const { data: newClient, error: insertError } = await supabase
                    .from('customers')
                    .insert({
                        name: client.name || 'Unnamed Client',
                        email: client.email,
                        p_number: client.phone || '',
                        companyname: client.name || 'Individual',
                    })
                    .select('id')
                    .single();

                if (insertError) throw insertError;
                customerId = newClient.id;
            }

            // 2️⃣ Generate Invoice Reference Number
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const { data: todaySales, error: countError } = await supabase
                .from('sales')
                .select('id')
                .gte('created_at', `${today}T00:00:00`)
                .lt('created_at', `${today}T23:59:59`);

            if (countError) throw countError;

            const sequence = (todaySales?.length || 0) + 1;
            referenceNumber = `INV-${today}-${sequence.toString().padStart(3, '0')}`;

            // 3️⃣ Create sale record
            const { data: saleData, error: saleError } = await supabase
                .from('sales')
                .insert({
                    customer_id: customerId,
                    total: totalAmount,
                    payment_mode: paymentMethod,
                    sales_person_id: cashierId,
                    status: 'completed',
                    reference_number: referenceNumber,
                    created_at: new Date().toISOString(),
                })
                .select('id')
                .single();

            if (saleError) throw saleError;
            saleId = saleData.id;

            // 4️⃣ Deduct stock atomically
            const saleItemsToInsert = [];
            for (const cartItem of cart) {
                const { error: deductError } = await supabase
                    .rpc('deduct_stock', {
                        p_item_id: cartItem.id,
                        p_qty: cartItem.qty,
                    });

                if (deductError) {
                    throw new Error(`Insufficient stock for "${cartItem.name}". Required: ${cartItem.qty}.`);
                }

                saleItemsToInsert.push({
                    sale_id: saleId,
                    item_id: cartItem.id,
                    quantity: cartItem.qty,
                    cost: cartItem.price,
                });
            }

            // 5️⃣ Bulk insert sale_items
            const { error: itemsError } = await supabase.from('sale_items').insert(saleItemsToInsert);
            if (itemsError) throw itemsError;

            // 6️⃣ Record payment WITH reference
            const { error: paymentError } = await supabase.from('payments').insert({
                sale_id: saleId,
                amount: totalAmount,
                payment_method: paymentMethod,
                received_by: cashierId,
                reference: requiresReference ? paymentReference.trim() : null, // Save reference
            });

            if (paymentError) throw paymentError;

            // 7️⃣ Success — show receipt
            setSaleInfo({
                saleId,
                total: totalAmount,
                items: [...cart],
                client: client as Client,
                referenceNumber,
                paymentReference: requiresReference ? paymentReference.trim() : undefined,
            });
            setShowReceipt(true);
        } catch (error: any) {
            console.error('Checkout error:', error);

            if (saleId) {
                await supabase.from('sales').update({ status: 'failed' }).eq('id', saleId);
            }

            Alert.alert('Checkout Failed', error.message || 'An error occurred during checkout.');
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 justify-center items-center bg-black/50" style={{ padding: 20 }}>
                <View className={`w-full max-w-lg rounded-2xl p-6 ${isDark ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {!showReceipt ? (
                            <>
                                <Text className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-navy'}`}>
                                    Confirm Checkout
                                </Text>

                                <Text className={`text-lg mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Total: <Text className="font-bold">{totalAmount.toFixed(2)} KSh</Text>
                                </Text>
                                <Text className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Client: {client?.name || 'Unnamed'} ({client?.email})
                                </Text>

                                <Text className={`mb-3 font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Payment Method:
                                </Text>
                                <View className="flex-row justify-around mb-6">
                                    {(['cash', 'm-pesa', 'card'] as const).map((method) => (
                                        <TouchableOpacity
                                            key={method}
                                            onPress={() => {
                                                setPaymentMethod(method);
                                                if (method === 'cash') setPaymentReference(''); // Clear if switching to cash
                                            }}
                                            className={`px-6 py-3 rounded-xl ${
                                                paymentMethod === method
                                                    ? 'bg-blue-600'
                                                    : isDark
                                                        ? 'bg-gray-700'
                                                        : 'bg-gray-200'
                                            }`}
                                        >
                                            <Text className={paymentMethod === method ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}>
                                                {method.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {requiresReference && (
                                    <View className="mb-6">
                                        <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                            {paymentMethod === 'm-pesa' ? 'M-Pesa Transaction Code' : 'Card Reference / Approval Code'}
                                        </Text>
                                        <TextInput
                                            value={paymentReference}
                                            onChangeText={setPaymentReference}
                                            placeholder={paymentMethod === 'm-pesa' ? 'e.g. RZA12ABCDE' : 'e.g. 123456'}
                                            className={`px-4 py-3 rounded-xl border ${
                                                isDark
                                                    ? 'bg-gray-800 border-gray-600 text-white'
                                                    : 'bg-gray-100 border-gray-300 text-black'
                                            }`}
                                            autoCapitalize="characters"
                                        />
                                    </View>
                                )}

                                {loading ? (
                                    <ActivityIndicator size="large" color="#60a5fa" />
                                ) : (
                                    <View className="flex-row justify-between mt-6">
                                        <TouchableOpacity
                                            onPress={onClose}
                                            className={`px-8 py-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
                                        >
                                            <Text className={isDark ? 'text-white' : 'text-black'}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={handleCheckout}
                                            className="px-8 py-4 rounded-xl bg-blue-600"
                                        >
                                            <Text className="text-white font-bold">Pay in Full</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        ) : (
                            <>
                                <Text className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-navy'}`}>
                                    Payment Successful!
                                </Text>
                                <Text className={`text-lg mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                    Invoice: {saleInfo?.referenceNumber}
                                </Text>
                                <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Sale ID: {saleInfo?.saleId}
                                </Text>
                                <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Client: {saleInfo?.client.name || 'Unnamed'} ({saleInfo?.client.email})
                                </Text>
                                <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Paid via: {paymentMethod.toUpperCase()}
                                </Text>
                                {saleInfo?.paymentReference && (
                                    <Text className={`mb-4 ${isDark ? 'text-yellow-400' : 'text-blue-600'} font-medium`}>
                                        Reference: {saleInfo.paymentReference}
                                    </Text>
                                )}

                                <View className="my-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                                    {saleInfo?.items.map((item) => (
                                        <View
                                            key={item.id}
                                            className="flex-row justify-between py-2 border-b border-gray-300 dark:border-gray-600 last:border-0"
                                        >
                                            <Text className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                                                {item.name} × {item.qty}
                                            </Text>
                                            <Text className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                                                {(item.price * item.qty).toFixed(2)} KSh
                                            </Text>
                                        </View>
                                    ))}
                                    <View className="flex-row justify-between mt-4 pt-4 border-t-2 border-gray-400">
                                        <Text className="text-lg font-bold">Total</Text>
                                        <Text className="text-lg font-bold">{saleInfo?.total.toFixed(2)} KSh</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => {
                                        onClose();
                                        setShowReceipt(false);
                                        setSaleInfo(null);
                                        setPaymentReference('');
                                    }}
                                    className="mt-6 px-8 py-4 rounded-xl bg-blue-600"
                                >
                                    <Text className="text-white font-bold text-center">Close</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}