// components/home/stats/CustomersList.tsx
import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Linking,
    Alert,
    useColorScheme,
    ToastAndroid,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/src/lib/supabaseClient';
import AddCustomerSheet from './AddCustomerSheet';

type Props = {
    visible: boolean;
    onClose: () => void;
};

type CustomerWithTotal = {
    id: string;
    name: string;
    p_number: string;
    companyname: string | null;
    email: string | null;
    kra_pin: string | null;
    total_spent: number;
};

export default function CustomersList({ visible, onClose }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [customers, setCustomers] = useState<CustomerWithTotal[]>([]);
    const [search, setSearch] = useState('');
    const [addSheet, setAddSheet] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchCustomers();
        }
    }, [visible]);

    const fetchCustomers = async () => {
        try {
            const { data: customerData, error: customerError } = await supabase
                .from('customers')
                .select('id, name, p_number, companyname, email, kra_pin')
                .order('name', { ascending: true });

            if (customerError) throw customerError;
            if (!customerData || customerData.length === 0) {
                setCustomers([]);
                return;
            }

            const { data: salesData, error: salesError } = await supabase
                .from('sales')
                .select('customer_id, total')
                .eq('status', 'completed');

            if (salesError) throw salesError;

            const totalSpentMap = new Map<string, number>();
            if (salesData) {
                salesData.forEach((sale: { customer_id: string; total: number | string | null }) => {
                    const amount = Number(sale.total) || 0;
                    const current = totalSpentMap.get(sale.customer_id) || 0;
                    totalSpentMap.set(sale.customer_id, current + amount);
                });
            }

            const enrichedCustomers: CustomerWithTotal[] = customerData.map((customer) => ({
                id: customer.id,
                name: customer.name,
                p_number: customer.p_number,
                companyname: customer.companyname,
                email: customer.email,
                kra_pin: customer.kra_pin,
                total_spent: totalSpentMap.get(customer.id) || 0,
            }));

            enrichedCustomers.sort((a, b) => {
                if (b.total_spent !== a.total_spent) {
                    return b.total_spent - a.total_spent;
                }
                return a.name.localeCompare(b.name);
            });

            setCustomers(enrichedCustomers);
        } catch (error: any) {
            console.error('Error fetching customers:', error);
            Alert.alert('Error', 'Failed to load customers. Please try again.');
        }
    };

    const filtered = customers.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.p_number.includes(search) ||
        c.companyname?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.kra_pin?.toLowerCase().includes(search.toLowerCase())
    );

    const callCustomer = (phone: string) => {
        const cleaned = phone.replace(/[^0-9+]/g, '');
        const url = `tel:${cleaned}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) Linking.openURL(url);
                else Alert.alert('Error', 'Phone dialer not available');
            })
            .catch(() => Alert.alert('Error', 'Invalid phone number'));
    };

    const emailCustomer = (email: string) => {
        const url = `mailto:${email}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) Linking.openURL(url);
                else Alert.alert('Error', 'No email app found');
            })
            .catch(() => Alert.alert('Error', 'Invalid email address'));
    };

    const copyToClipboard = async (text: string, label: string) => {
        await Clipboard.setStringAsync(text);
        if (Platform.OS === 'android') {
            ToastAndroid.show(`${label} copied!`, ToastAndroid.SHORT);
        } else {
            Alert.alert('Copied', `${label} copied to clipboard`);
        }
    };

    const formatAmount = (amount: number): string => {
        return amount.toLocaleString('en-KE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    return (
        <Modal visible={visible} animationType="slide">
            <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-[#F2F2F7]'}`}>
                {/* Header */}
                <View className="flex-row justify-between items-center px-4 pt-4 pb-2">
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={32} color={isDark ? '#FFF' : '#000'} />
                    </TouchableOpacity>
                    <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        Customers
                    </Text>
                    <TouchableOpacity onPress={() => setAddSheet(true)}>
                        <Ionicons name="add" size={32} color="#007AFF" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center mx-4 mt-2 bg-[#1C1C1E] dark:bg-[#2C2C2E] rounded-xl px-3 h-12">
                    <Ionicons name="search" size={20} color="#888" />
                    <TextInput
                        placeholder="Search name, phone, company, email, KRA PIN..."
                        placeholderTextColor="#888"
                        value={search}
                        onChangeText={setSearch}
                        className={`flex-1 ml-3 text-base ${isDark ? 'text-white' : 'text-black'}`}
                    />
                </View>

                {/* Customer List */}
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    contentContainerClassName="pt-4 pb-8"
                    ListEmptyComponent={
                        <Text className={`text-center mt-10 text-gray-500`}>
                            {search ? 'No customers found' : 'No customers yet'}
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <View
                            className={`flex-row items-start px-4 py-4 mx-4 my-2 rounded-2xl ${
                                isDark ? 'bg-[#1C1C1E]' : 'bg-white'
                            } shadow-md elevation-3`}
                        >
                            {/* Avatar */}
                            <View className="w-12 h-12 rounded-full bg-blue-500 justify-center items-center mr-4">
                                <Text className="text-white font-bold text-lg">
                                    {item.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .substring(0, 2)
                                        .toUpperCase()}
                                </Text>
                            </View>

                            {/* Details */}
                            <View className="flex-1">
                                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                                    {item.name}
                                </Text>

                                {/* Company Name with Copy */}
                                {item.companyname && (
                                    <View className="flex-row items-center mt-0.5">
                                        <Text className="text-sm text-gray-500">{item.companyname}</Text>
                                        <TouchableOpacity
                                            onPress={() => copyToClipboard(item.companyname!, 'Company name')}
                                            className="ml-2"
                                        >
                                            <Ionicons name="copy-outline" size={14} color="#007AFF" />
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Phone */}
                                <View className="flex-row items-center mt-2">
                                    <TouchableOpacity
                                        onPress={() => callCustomer(item.p_number)}
                                        className="flex-row items-center"
                                    >
                                        <Ionicons name="call-outline" size={16} color="#007AFF" />
                                        <Text className="text-blue-500 text-sm ml-2">{item.p_number}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => copyToClipboard(item.p_number, 'Phone number')}
                                        className="ml-3"
                                    >
                                        <Ionicons name="copy-outline" size={16} color="#007AFF" />
                                    </TouchableOpacity>
                                </View>

                                {/* Email */}
                                {item.email && (
                                    <View className="flex-row items-center mt-2">
                                        <TouchableOpacity
                                            onPress={() => emailCustomer(item.email!)}
                                            className="flex-row items-center"
                                        >
                                            <Ionicons name="mail-outline" size={16} color="#007AFF" />
                                            <Text className="text-blue-500 text-sm ml-2">{item.email}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => copyToClipboard(item.email!, 'Email')}
                                            className="ml-3"
                                        >
                                            <Ionicons name="copy-outline" size={16} color="#007AFF" />
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* KRA PIN */}
                                {item.kra_pin && (
                                    <View className="flex-row items-center mt-2">
                                        <Ionicons name="document-text-outline" size={16} color="#007AFF" />
                                        <Text className="text-blue-500 text-sm ml-2">
                                            KRA PIN: {item.kra_pin}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => copyToClipboard(item.kra_pin!, 'KRA PIN')}
                                            className="ml-3"
                                        >
                                            <Ionicons name="copy-outline" size={16} color="#007AFF" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            {/* Total Spent */}
                            <View className="items-end">
                                <Text className="text-blue-600 font-bold text-base">
                                    KSh {formatAmount(item.total_spent)}
                                </Text>
                                {item.total_spent > 0 && (
                                    <Text className="text-xs text-gray-500 mt-1">Total spent</Text>
                                )}
                            </View>
                        </View>
                    )}
                />

                {/* Add Customer Sheet */}
                <AddCustomerSheet
                    visible={addSheet}
                    onClose={() => setAddSheet(false)}
                    onSuccess={fetchCustomers}
                />
            </SafeAreaView>
        </Modal>
    );
}
