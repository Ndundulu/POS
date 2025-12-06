// components/customers/AddCustomerSheet.tsx
import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert, useColorScheme,
} from 'react-native';
import { supabase } from '@/src/lib/supabaseClient';

type Props = {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

export default function AddCustomerSheet({ visible, onClose, onSuccess }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [form, setForm] = useState({
        name: '',
        p_number: '',
        companyname: '',
        email: '',
    });

    const save = async () => {
        if (!form.name.trim() || !form.p_number.trim()) {
            return Alert.alert('Error', 'Name and phone number are required');
        }

        const { error } = await supabase.from('customers').insert({
            name: form.name.trim(),
            p_number: form.p_number.trim(),
            companyname: form.companyname.trim() || null,
            email: form.email.trim() || null,
            totalpurchases: '0',
        });

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            setForm({ name: '', p_number: '', companyname: '', email: '' });
            onClose();
            onSuccess?.();
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            {/* Backdrop */}
            <View className="flex-1 bg-black/80 justify-end">
                {/* Sheet */}
                <View className={`p-6 pt-8 pb-10 rounded-t-3xl ${isDark ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
                    <Text className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
                        Add New Customer
                    </Text>

                    <TextInput
                        placeholder="Full Name *"
                        value={form.name}
                        onChangeText={(t) => setForm({ ...form, name: t })}
                        placeholderTextColor="#888"
                        className={`px-4 py-4 rounded-xl mb-3 text-base ${
                            isDark
                                ? 'bg-[#2C2C2E] text-white'
                                : 'bg-gray-100 text-black'
                        }`}
                    />

                    <TextInput
                        placeholder="Phone Number *"
                        value={form.p_number}
                        onChangeText={(t) => setForm({ ...form, p_number: t })}
                        keyboardType="phone-pad"
                        placeholderTextColor="#888"
                        className={`px-4 py-4 rounded-xl mb-3 text-base ${
                            isDark
                                ? 'bg-[#2C2C2E] text-white'
                                : 'bg-gray-100 text-black'
                        }`}
                    />

                    <TextInput
                        placeholder="Company (optional)"
                        value={form.companyname}
                        onChangeText={(t) => setForm({ ...form, companyname: t })}
                        placeholderTextColor="#888"
                        className={`px-4 py-4 rounded-xl mb-3 text-base ${
                            isDark
                                ? 'bg-[#2C2C2E] text-white'
                                : 'bg-gray-100 text-black'
                        }`}
                    />

                    <TextInput
                        placeholder="Email (optional)"
                        value={form.email}
                        onChangeText={(t) => setForm({ ...form, email: t })}
                        keyboardType="email-address"
                        placeholderTextColor="#888"
                        className={`px-4 py-4 rounded-xl mb-8 text-base ${
                            isDark
                                ? 'bg-[#2C2C2E] text-white'
                                : 'bg-gray-100 text-black'
                        }`}
                    />

                    {/* Action Buttons */}
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={onClose}
                            className="flex-1 py-4 items-center rounded-xl"
                        >
                            <Text className="text-blue-500 font-semibold text-base">Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={save}
                            className="flex-1 bg-blue-500 py-4 items-center rounded-xl"
                        >
                            <Text className="text-white font-semibold text-base">Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}