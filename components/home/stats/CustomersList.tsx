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
    Alert, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/src/lib/supabaseClient';
import AddCustomerSheet from './AddCustomerSheet';

type Props = {
    visible: boolean;
    onClose: () => void;
};

type CustomersList = {
    id: string;
    name: string;
    p_number: string;
    companyname: string | null;
    email: string | null;
    totalpurchases: string;
};

export default function CustomersList({ visible, onClose }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [customers, setCustomers] = useState<CustomersList[]>([]);
    const [search, setSearch] = useState('');
    const [addSheet, setAddSheet] = useState(false);

    useEffect(() => {
        if (visible) fetchCustomers();
    }, [visible]);

    const fetchCustomers = async () => {
        const { data } = await supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });
        setCustomers(data || []);
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.p_number.includes(search) ||
        c.companyname?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    const callCustomer = (phone: string) => {
        const cleaned = phone.replace(/[^0-9+]/g, '');
        const url = `tel:${cleaned}`;
        Linking.canOpenURL(url)
            .then(supported => {
                if (supported) Linking.openURL(url);
                else Alert.alert('Error', 'Cannot open phone dialer');
            })
            .catch(() => Alert.alert('Error', 'Invalid phone number'));
    };

    const emailCustomer = (email: string) => {
        const url = `mailto:${email}`;
        Linking.canOpenURL(url)
            .then(supported => {
                if (supported) Linking.openURL(url);
                else Alert.alert('Error', 'No email app found');
            })
            .catch(() => Alert.alert('Error', 'Invalid email'));
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
                        placeholder="Search name, phone, company..."
                        placeholderTextColor="#888"
                        value={search}
                        onChangeText={setSearch}
                        className={`flex-1 ml-3 text-base ${isDark ? 'text-white' : 'text-black'}`}
                    />
                </View>

                {/* CustomersList List */}
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    contentContainerClassName="pt-4 pb-8"
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
                                        .map(n => n[0])
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
                                {item.companyname && (
                                    <Text className="text-sm text-gray-500 mt-0.5">{item.companyname}</Text>
                                )}

                                {/* Phone */}
                                <TouchableOpacity
                                    onPress={() => callCustomer(item.p_number)}
                                    className="flex-row items-center mt-2"
                                >
                                    <Ionicons name="call-outline" size={16} color="#007AFF" />
                                    <Text className="text-blue-500 text-sm ml-2">{item.p_number}</Text>
                                </TouchableOpacity>

                                {/* Email */}
                                {item.email && (
                                    <TouchableOpacity
                                        onPress={() => emailCustomer(item.email!)}
                                        className="flex-row items-center mt-2"
                                    >
                                        <Ionicons name="mail-outline" size={16} color="#007AFF" />
                                        <Text className="text-blue-500 text-sm ml-2">{item.email}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Total Purchases */}
                            <Text className="text-blue-500 font-bold text-base">
                                KSh {parseInt(item.totalpurchases || '0').toLocaleString()}
                            </Text>
                        </View>
                    )}
                />

                {/* Add CustomersList Bottom Sheet */}
                <AddCustomerSheet
                    visible={addSheet}
                    onClose={() => setAddSheet(false)}
                    onSuccess={fetchCustomers}
                />
            </SafeAreaView>
        </Modal>
    );
}