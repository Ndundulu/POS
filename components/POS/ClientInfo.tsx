// src/components/POS/ClientInfo.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { User, Building2 } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { supabase } from '@/src/lib/supabaseClient';
import debounce from 'lodash.debounce';

const PALETTE = {
    gold: '#b89d63',
    cream: '#EDEEDA',
    navy: '#283A55',
};

type CustomerFromDB = {
    id: string;
    name: string;           // For individual: person's name | For company: contact person (attention)
    companyname: string;    // For company: company name | For individual: usually empty
    p_number: string;
    email: string | null;
    customer_type: 'individual' | 'company';
};

type Props = {
    client: {
        customerId?: string;
        customerType?: 'individual' | 'company';
        name?: string;           // individual full name
        companyName?: string;    // company name
        attentionName?: string;  // contact person when company
        phone?: string;
        email?: string;
    };
    setClient: (client: any) => void;
    editable?: boolean;
};

export default function ClientInfo({ client, setClient, editable = true }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<CustomerFromDB[]>([]);
    const [loading, setLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const customerType = client.customerType || 'individual';

    const setCustomerType = (type: 'individual' | 'company') => {
        setClient({ ...client, customerType: type });
    };

    // Debounced search — now searches name (contact/person), companyname, phone, email
    const searchCustomers = useCallback(
        debounce(async (query: string) => {
            if (query.trim().length < 2) {
                setSearchResults([]);
                setDropdownOpen(false);
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from('customers')
                .select('id, name, companyname, p_number, email, customer_type')
                .or(
                    `name.ilike.%${query}%,` +
                    `companyname.ilike.%${query}%,` +
                    `p_number.ilike.%${query}%,` +
                    `email.ilike.%${query}%`
                )
                .limit(10);

            if (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } else {
                setSearchResults(data || []);
                setDropdownOpen(true);
            }
            setLoading(false);
        }, 400),
        []
    );

    useEffect(() => {
        searchCustomers(searchQuery);
    }, [searchQuery]);

    const handleSelectCustomer = (customer: CustomerFromDB) => {
        const displayText =
            customer.customer_type === 'company'
                ? customer.companyname
                : customer.name;

        setSearchQuery(displayText);
        setDropdownOpen(false);

        if (customer.customer_type === 'company') {
            setClient({
                customerId: customer.id,
                customerType: 'company',
                companyName: customer.companyname,
                attentionName: customer.name,  // ← THIS IS THE FIX: contact person comes from `name` column
                name: undefined,
                phone: customer.p_number,
                email: customer.email || undefined,
            });
        } else {
            setClient({
                customerId: customer.id,
                customerType: 'individual',
                name: customer.name,
                companyName: undefined,
                attentionName: undefined,
                phone: customer.p_number,
                email: customer.email || undefined,
            });
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setDropdownOpen(false);
        setClient({
            customerId: undefined,
            customerType: client.customerType || 'individual',
            name: '',
            companyName: '',
            attentionName: '',
            phone: '',
            email: '',
        });
    };

    return (
        <View className="my-4">
            {/* Search Input */}
            <View className="relative mb-4">
                <View className="flex-row items-center">
                    <TextInput
                        placeholder="Search by name, contact, company, phone or email..."
                        placeholderTextColor={isDark ? '#888' : '#aaa'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        editable={editable}
                        className={`flex-1 px-4 py-3.5 rounded-xl text-base font-medium border border-gray-300 dark:border-gray-600
              bg-[#EDEEDA] dark:bg-[#1e1e1e]
              text-black dark:text-white`}
                    />
                    {loading && (
                        <ActivityIndicator className="absolute right-10" color="#b89d63" />
                    )}
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch} className="absolute right-4">
                            <Text className="text-xl text-gray-500">×</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Dropdown Results */}
                {dropdownOpen && (
                    <View className={`absolute top-14 left-0 right-0 z-10 rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden
            bg-[#EDEEDA] dark:bg-[#1e1e1e] max-h-64`}>
                        {searchResults.length > 0 ? (
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item) => item.id}
                                keyboardShouldPersistTaps="always"
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleSelectCustomer(item)}
                                        className="px-4 py-3 border-b border-gray-200 dark:border-gray-700"
                                    >
                                        <Text className="font-semibold text-black dark:text-white">
                                            {item.customer_type === 'company'
                                                ? item.companyname
                                                : item.name}
                                            {item.customer_type === 'company' && item.name && ` (Attn: ${item.name})`}
                                        </Text>
                                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                                            {item.p_number} {item.email ? `• ${item.email}` : ''}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        ) : (
                            <View className="p-4">
                                <Text className="text-center text-gray-500">
                                    No customers found. A new one will be created on checkout.
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </View>

            {/* Toggle */}
            <View className="flex-row bg-gray-200 dark:bg-gray-800 rounded-xl p-1 mb-4">
                <TouchableOpacity
                    onPress={() => setCustomerType('individual')}
                    className={`flex-1 flex-row items-center justify-center gap-3 py-3 rounded-lg ${
                        customerType === 'individual' ? 'bg-[#283A55]' : ''
                    }`}
                >
                    <User size={20} color={customerType === 'individual' ? '#b89d63' : (isDark ? '#94a3b8' : '#999999')} />
                    <Text className={`font-medium ${customerType === 'individual' ? 'text-amber-500 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        Individual
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setCustomerType('company')}
                    className={`flex-1 flex-row items-center justify-center gap-3 py-3 rounded-lg ${
                        customerType === 'company' ? 'bg-[#283A55]' : ''
                    }`}
                >
                    <Building2 size={20} color={customerType === 'company' ? '#b89d63' : (isDark ? '#94a3b8' : '#999999')} />
                    <Text className={`font-medium ${customerType === 'company' ? 'text-amber-500 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        Company
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Name Fields */}
            {customerType === 'company' ? (
                <>
                    <TextInput
                        placeholder="Company Name"
                        placeholderTextColor={isDark ? '#888' : '#aaa'}
                        value={client.companyName || ''}
                        onChangeText={(text) => setClient({ ...client, companyName: text })}
                        editable={editable}
                        className={`px-4 py-3.5 mb-3 rounded-xl text-base font-medium border border-gray-300 dark:border-gray-600
              bg-[#EDEEDA] dark:bg-[#1e1e1e] text-black dark:text-white`}
                    />
                    <TextInput
                        placeholder="Attention (Contact Person)"
                        placeholderTextColor={isDark ? '#888' : '#aaa'}
                        value={client.attentionName || ''}
                        onChangeText={(text) => setClient({ ...client, attentionName: text })}
                        editable={editable}
                        className={`px-4 py-3.5 mb-3 rounded-xl text-base font-medium border border-gray-300 dark:border-gray-600
              bg-[#EDEEDA] dark:bg-[#1e1e1e] text-black dark:text-white`}
                    />
                </>
            ) : (
                <TextInput
                    placeholder="Client Name"
                    placeholderTextColor={isDark ? '#888' : '#aaa'}
                    value={client.name || ''}
                    onChangeText={(text) => setClient({ ...client, name: text })}
                    editable={editable}
                    className={`px-4 py-3.5 mb-3 rounded-xl text-base font-medium border border-gray-300 dark:border-gray-600
            bg-[#EDEEDA] dark:bg-[#1e1e1e] text-black dark:text-white`}
                />
            )}

            <TextInput
                placeholder="Phone"
                keyboardType="phone-pad"
                placeholderTextColor={isDark ? '#aaa' : '#888'}
                value={client.phone || ''}
                onChangeText={(text) => setClient({ ...client, phone: text })}
                editable={editable}
                className={`px-4 py-3.5 mb-3 rounded-xl text-base font-medium border border-gray-300 dark:border-gray-600
          bg-[#EDEEDA] dark:bg-[#1e1e1e] text-black dark:text-white`}
            />
            <TextInput
                placeholder="Email (optional)"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={isDark ? '#aaa' : '#888'}
                value={client.email || ''}
                onChangeText={(text) => setClient({ ...client, email: text })}
                editable={editable}
                className={`px-4 py-3.5 rounded-xl text-base font-medium border border-gray-300 dark:border-gray-600
          bg-[#EDEEDA] dark:bg-[#1e1e1e] text-black dark:text-white`}
            />
        </View>
    );
}
