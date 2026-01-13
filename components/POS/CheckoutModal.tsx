// src/components/POS/CheckoutModal.tsx
import React, { useState, useRef } from 'react';
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
    Animated,
    Image,
    StyleSheet,
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
    customerType?: 'individual' | 'company';
    name?: string;
    companyName?: string;
    attentionName?: string;
    phone?: string;
    email?: string;
};

type Props = {
    visible: boolean;
    cart: Item[];
    client?: Client;
    cashierId: string;
    pricing: {
        subtotal: number;
        discount: number;
        tax: number;
        total: number;
        taxInclusive: boolean;
    };
    onClose: () => void;
};

const icons = {
    cash:          require('../../assets/icons/cash.gif'),
    mpesa:         require('../../assets/icons/mpesaIcon.png'),
    bank:          require('../../assets/icons/bank.gif'),
    link:          require('../../assets/icons/link.gif'),
    'bank transfer': require('../../assets/icons/bankTransfer.gif'),
    card:          require('../../assets/icons/credit-card.gif'),
    cheque:        require('../../assets/icons/cheque.gif'),
    mpesaSub:      require('../../assets/icons/mpesaIcon.png'),
};

export default function CheckoutModal({ visible, cart, client, cashierId, pricing, onClose }: Props) {
    const [loading, setLoading] = useState(false);
    const [mainMethod, setMainMethod] = useState<'cash' | 'm-pesa' | 'bank'>('cash');
    const [subMethod, setSubMethod] = useState<string | null>(null);
    const [paymentReference, setPaymentReference] = useState('');
    const [showReceipt, setShowReceipt] = useState(false);
    const [saleInfo, setSaleInfo] = useState<{
        saleId: string;
        total: number;
        discount: number;
        tax: number;
        taxInclusive: boolean;
        items: Item[];
        client: Client;
        referenceNumber: string;
        paymentMethod: string;
        paymentReference?: string;
    } | null>(null);

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { subtotal, discount, tax, total, taxInclusive } = pricing;

    // Animation refs for main method pop effect
    const animMainCash = useRef(new Animated.Value(1)).current;
    const animMainMpesa = useRef(new Animated.Value(1)).current;
    const animMainBank = useRef(new Animated.Value(1)).current;

    const playPopAnimation = (anim: Animated.Value) => {
        Animated.sequence([
            Animated.timing(anim, { toValue: 1.15, duration: 120, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const requiresReference =
        (mainMethod === 'm-pesa' && subMethod) ||
        (mainMethod === 'bank' && subMethod && !['link', 'bank transfer'].some((s) => subMethod?.toLowerCase().includes(s)));

    const isCompany = client?.customerType === 'company';
    const displayName = isCompany
        ? `${client?.companyName || 'Company'} (${client?.attentionName || 'No contact'})`
        : client?.name || 'Unnamed Client';

    const getMainIcon = () => {
        if (mainMethod === 'cash') return icons.cash;
        if (mainMethod === 'm-pesa') return icons.mpesa;
        if (mainMethod === 'bank') return icons.bank;
        return null;
    };

    const getSubIcon = (method: string) => {
        const key = method.toLowerCase();
        if (mainMethod === 'bank') {
            if (key.includes('link')) return icons.link;
            if (key.includes('transfer')) return icons['bank transfer'];
            if (key.includes('card')) return icons.card;
            if (key.includes('cheque')) return icons.cheque;
        }
        // M-Pesa subs fallback to static PNG
        return icons.mpesaSub;
    };

    const handleCheckout = async () => {
        if (!client?.email) {
            Alert.alert('Client email required', 'Please provide an email for the client.');
            return;
        }

        if (requiresReference && !paymentReference.trim()) {
            Alert.alert('Reference Required', 'Please enter the transaction/reference number.');
            return;
        }

        if (mainMethod !== 'cash' && !subMethod) {
            Alert.alert('Payment detail required', 'Please select a payment option.');
            return;
        }

        setLoading(true);
        let saleId: string | null = null;
        let referenceNumber = '';

        try {
            // 1. Get or create customer
            const { data: existingClients, error: clientError } = await supabase
                .from('customers')
                .select('id')
                .eq('email', client.email)
                .limit(1);

            if (clientError) throw clientError;

            let customerId = existingClients?.[0]?.id;

            if (!customerId) {
                const insertData: any = {
                    email: client.email,
                    p_number: client.phone || '',
                    name: isCompany ? client.attentionName || 'Contact Person' : client.name || 'Unnamed Client',
                    companyname: isCompany ? client.companyName || null : null,
                    customer_type: client.customerType || 'individual',
                };
                const { data: newClient, error: insertError } = await supabase
                    .from('customers')
                    .insert(insertData)
                    .select('id')
                    .single();
                if (insertError) throw insertError;
                customerId = newClient.id;
            } else {
                const updateData: any = {
                    p_number: client.phone || '',
                    name: isCompany ? client.attentionName || client.name : client.name,
                    companyname: isCompany ? client.companyName : null,
                    customer_type: client.customerType || 'individual',
                };
                await supabase.from('customers').update(updateData).eq('id', customerId);
            }

            // 2. Generate reference number
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const { data: todaySales, error: countError } = await supabase
                .from('sales')
                .select('id')
                .gte('created_at', `${today}T00:00:00`)
                .lt('created_at', `${today}T23:59:59`);

            if (countError) throw countError;

            const sequence = (todaySales?.length || 0) + 1;
            referenceNumber = `INV-${today}-${sequence.toString().padStart(3, '0')}`;

            // Final payment method for DB
            const finalPaymentMethod = subMethod
                ? `${mainMethod === 'm-pesa' ? 'M-Pesa' : 'Bank'} - ${subMethod}`
                : mainMethod === 'm-pesa' ? 'M-Pesa' : mainMethod === 'bank' ? 'Bank' : 'Cash';

            // 3. Create sale
            const { data: saleData, error: saleError } = await supabase
                .from('sales')
                .insert({
                    customer_id: customerId,
                    total,
                    discount_amount: discount,
                    tax_inclusive: taxInclusive,
                    payment_mode: finalPaymentMethod,
                    sales_person_id: cashierId,
                    status: 'completed',
                    reference_number: referenceNumber,
                    created_at: new Date().toISOString(),
                })
                .select('id')
                .single();

            if (saleError) throw saleError;
            saleId = saleData.id;

            // 4. Deduct stock
            const saleItemsToInsert = [];
            for (const cartItem of cart) {
                const { error: deductError } = await supabase.rpc('deduct_stock', {
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

            const { error: itemsError } = await supabase.from('sale_items').insert(saleItemsToInsert);
            if (itemsError) throw itemsError;

            // 5. Record payment
            const { error: paymentError } = await supabase.from('payments').insert({
                sale_id: saleId,
                amount: total,
                payment_method: finalPaymentMethod,
                received_by: cashierId,
                reference: requiresReference ? paymentReference.trim() : null,
            });
            if (paymentError) throw paymentError;

            // 6. Success → show receipt
            setSaleInfo({
                saleId,
                total,
                discount,
                tax,
                taxInclusive,
                items: [...cart],
                client: client as Client,
                referenceNumber,
                paymentMethod: finalPaymentMethod,
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
                                    Total: <Text className="font-bold">{total.toFixed(2)} KSh</Text>
                                </Text>

                                <Text className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Client: {displayName} ({client?.email})
                                </Text>

                                <Text className={`mb-3 font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Payment Method:
                                </Text>

                                {/* Main payment methods with icons + animation */}
                                <View className="flex-row justify-between mb-6">
                                    {(['cash', 'm-pesa', 'bank'] as const).map((method) => {
                                        const isSelected = mainMethod === method;
                                        const anim =
                                            method === 'cash' ? animMainCash : method === 'm-pesa' ? animMainMpesa : animMainBank;

                                        return (
                                            <TouchableOpacity
                                                key={method}
                                                onPress={() => {
                                                    playPopAnimation(anim);
                                                    setMainMethod(method);
                                                    setSubMethod(null);
                                                    setPaymentReference('');
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                <Animated.View
                                                    style={[
                                                        styles.iconButton,
                                                        {
                                                            transform: [{ scale: anim }],
                                                            opacity: isSelected ? 1 : 0.65,
                                                            backgroundColor: isSelected
                                                                ? '#2563eb'
                                                                : isDark
                                                                    ? '#FFFAFA'
                                                                    : '#e5e7eb',
                                                        },
                                                    ]}
                                                >
                                                    <Image source={icons[method === 'm-pesa' ? 'mpesa' : method]} style={styles.icon} />
                                                    <Text
                                                        className={`text-xs mt-1 font-medium ${
                                                            isSelected ? 'text-white' : isDark ? 'text-black' : 'text-gray-700'
                                                        }`}
                                                    >
                                                        {method === 'm-pesa' ? 'M-PESA' : method.toUpperCase()}
                                                    </Text>
                                                </Animated.View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* M-Pesa sub-options */}
                                {mainMethod === 'm-pesa' && (
                                    <View className="mb-6">
                                        <Text className={`mb-3 font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                            M-Pesa Type
                                        </Text>
                                        <View className="flex-row justify-around">
                                            {(['Paybill', "Ciiru's Number"] as const).map((opt) => (
                                                <TouchableOpacity
                                                    key={opt}
                                                    onPress={() => setSubMethod(opt)}
                                                    className={`items-center p-3 rounded-xl flex-1 mx-2 ${
                                                        subMethod === opt
                                                            ? 'bg-green-600'
                                                            : isDark
                                                                ? 'bg-gray-800'
                                                                : 'bg-gray-100'
                                                    }`}
                                                >
                                                    <Image source={getSubIcon(opt)} style={styles.subIcon} />
                                                    <Text
                                                        className={`text-xs mt-1 ${
                                                            subMethod === opt ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'
                                                        }`}
                                                    >
                                                        {opt}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Bank sub-options – icons + small labels below, floating style */}
                                {mainMethod === 'bank' && (
                                    <View className="mb-6">
                                        <Text className={`mb-3 font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                            Bank Type
                                        </Text>
                                        <View className="flex-row flex-wrap justify-between gap-4">
                                            {(['Link', 'Bank Transfer', 'Card', 'Cheque'] as const).map((opt) => (
                                                <TouchableOpacity
                                                    key={opt}
                                                    onPress={() => {
                                                        setSubMethod(opt);
                                                        if (['Link', 'Bank Transfer'].includes(opt)) setPaymentReference('');
                                                    }}
                                                    activeOpacity={0.8}
                                                    className="items-center"
                                                    style={{ width: 80 }} // fixed width for consistent grid
                                                >
                                                    <Animated.View
                                                        style={[
                                                            {
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                padding: 12,
                                                                borderRadius: 16,
                                                                borderWidth: subMethod === opt ? 2 : 1,
                                                                borderColor:
                                                                    subMethod === opt
                                                                        ? '#10b981' // green accent for selected
                                                                        : isDark
                                                                            ? 'rgba(156, 163, 175, 0.4)'
                                                                            : 'rgba(107, 114, 128, 0.3)',
                                                                backgroundColor:
                                                                    subMethod === opt
                                                                        ? isDark ? '#16a34a' : 'rgba(16, 185, 129, 0.08)'
                                                                        : '#FFFAFA',
                                                                transform: [{ scale: subMethod === opt ? 1.08 : 1 }],
                                                            },
                                                        ]}
                                                    >
                                                        <Image source={getSubIcon(opt)} style={styles.subIconLarge} />
                                                    </Animated.View>

                                                    <Text
                                                        className={`text-xs mt-2 font-medium text-center ${
                                                            subMethod === opt
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : isDark ? 'text-gray-400' : 'text-gray-600'
                                                        }`}
                                                    >
                                                        {opt}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Reference input */}
                                {requiresReference && (
                                    <View className="mb-6">
                                        <Text className={`mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                            {mainMethod === 'm-pesa'
                                                ? subMethod === "Cirru's Number"
                                                    ? "M-Pesa Transaction Code / Reference"
                                                    : "Paybill Transaction Code"
                                                : subMethod === 'Cheque'
                                                    ? 'Cheque Number'
                                                    : subMethod === 'Card'
                                                        ? 'Card Approval / Transaction Code'
                                                        : 'Transaction / Reference Number'}
                                        </Text>

                                        <TextInput
                                            value={paymentReference}
                                            onChangeText={setPaymentReference}
                                            placeholder={
                                                mainMethod === 'm-pesa'
                                                    ? subMethod === "Cirru's Number"
                                                        ? 'e.g. RZA12ABCDE'
                                                        : 'e.g. QWERTY123456'
                                                    : subMethod === 'Cheque'
                                                        ? 'e.g. 0123456789'
                                                        : subMethod === 'Card'
                                                            ? 'e.g. 123456 or approval code'
                                                            : 'e.g. REF123456789'
                                            }
                                            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                                            className={`px-4 py-3 rounded-xl border text-base ${
                                                isDark
                                                    ? 'bg-gray-800 border-gray-600 text-white'
                                                    : 'bg-gray-100 border-gray-300 text-black'
                                            }`}
                                            autoCapitalize="characters"
                                            autoCorrect={false}
                                            keyboardType={
                                                (subMethod === 'Cheque' || subMethod === 'Card') ? 'numeric' : 'default'
                                            }
                                        />

                                        <Text className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Please enter the exact reference from your transaction receipt or statement.
                                        </Text>
                                    </View>
                                )}

                                {/* Action buttons */}
                                {loading ? (
                                    <View className="items-center mt-6">
                                        <ActivityIndicator size="large" color="#60a5fa" />
                                        <Text className={`mt-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Processing payment...
                                        </Text>
                                    </View>
                                ) : (
                                    <View className="flex-row justify-between mt-8 gap-4">
                                        <TouchableOpacity
                                            onPress={onClose}
                                            className={`flex-1 py-4 rounded-xl items-center ${
                                                isDark ? 'bg-gray-700' : 'bg-gray-200'
                                            }`}
                                        >
                                            <Text className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                Cancel
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={handleCheckout}
                                            disabled={mainMethod !== 'cash' && !subMethod}
                                            className={`flex-1 py-4 rounded-xl items-center bg-blue-600 ${
                                                mainMethod !== 'cash' && !subMethod ? 'opacity-60' : ''
                                            }`}
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
                                    Client: {displayName} ({saleInfo?.client.email})
                                </Text>

                                <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Paid via: {saleInfo?.paymentMethod}
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
                                        setSubMethod(null);
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

const styles = StyleSheet.create({
    iconButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        minWidth: 90,
        // Default state – floating look
        borderWidth: 1.5,
        borderColor: 'rgba(100, 116, 139, 0.3)', // subtle gray border (adjust to your theme)
        backgroundColor: 'transparent',
        // Optional soft shadow for depth (iOS + Android)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2, // Android shadow
    },
    iconButtonSelected: {
        borderColor: '#2563eb',
        borderWidth: 2,
        backgroundColor: '#2563eb', // very light tint of blue
        shadowOpacity: 0.2,
        elevation: 4,
    },
    icon: {
        width: 44,
        height: 44,
        resizeMode: 'contain',
    },
    subIcon: {
        width: 36,
        height: 36,
        resizeMode: 'contain',
    },
    subIconLarge: {
        width: 48,
        height: 48,
        resizeMode: 'contain',
    },
});
