import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    useColorScheme,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import { supabase } from '@/src/lib/supabaseClient';
import { ChevronLeft, Plus, Minus } from 'lucide-react-native';

type Props = {
    item: {
        id: string;
        productId: string;
        productName: string;
        sku: string;
        color: string;
        size?: string | null;
        motif?: string | null;
        quantity: number;
        // price and buying_price may be missing/stale from list screen → we refetch them
    };
    onBack: () => void;
    onSaved?: () => void;
};

export default function StockDetailAdjust({ item: initialItem, onBack, onSaved }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [form, setForm] = useState({
        sku: '',
        color: '',
        size: '',
        motif: '',
        quantity: '0',
        price: '0',
        buying_price: '0',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch latest item data from Supabase
    useEffect(() => {
        const fetchLatestItem = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('items')
                    .select('sku, color, size, motif, quantity, price, buying_price')
                    .eq('id', initialItem.id)
                    .single();

                if (error) throw error;
                if (!data) throw new Error('Item not found');

                setForm({
                    sku: data.sku || '',
                    color: data.color || '',
                    size: data.size || '',
                    motif: data.motif || '',
                    quantity: data.quantity?.toString() || '0',
                    price: data.price?.toString() || '0',
                    buying_price: data.buying_price?.toString() || '0',
                });
            } catch (err: any) {
                console.error('Failed to load item details:', err);
                Alert.alert('Error', 'Could not load the latest stock item details.');
            } finally {
                setLoading(false);
            }
        };

        fetchLatestItem();
    }, [initialItem.id]);

    const updateForm = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
    };

    const quickAdjustQuantity = (delta: number) => {
        const current = parseInt(form.quantity) || 0;
        const next = Math.max(0, current + delta);
        updateForm('quantity', next.toString());
    };

    const validateForm = () => {
        const errs: Record<string, string> = {};
        const qty = parseInt(form.quantity) || 0;
        const priceVal = parseFloat(form.price) || 0;
        const buyingVal = parseFloat(form.buying_price) || 0;

        if (qty < 0) errs.quantity = 'Quantity cannot be negative';
        if (priceVal <= 0) errs.price = 'Selling price must be greater than 0';
        if (buyingVal < 0) errs.buying_price = 'Buying price cannot be negative';
        if (!form.color.trim()) errs.color = 'Color is required';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please correct the highlighted fields');
            return;
        }

        setSaving(true);

        try {
            const qtyNum = parseInt(form.quantity);
            const priceNum = parseFloat(form.price);
            const buyingNum = parseFloat(form.buying_price);

            const updateData = {
                sku: form.sku.trim(),
                color: form.color.trim(),
                size: form.size.trim() || null,
                motif: form.motif.trim() || null,
                quantity: qtyNum,
                price: priceNum,
                buying_price: buyingNum,
            };

            const { error: updateError } = await supabase
                .from('items')
                .update(updateData)
                .eq('id', initialItem.id);

            if (updateError) throw updateError;

            // Log quantity change if it was modified
            if (qtyNum !== initialItem.quantity) {
                const { data: { user } } = await supabase.auth.getUser();
                const { error: logError } = await supabase
                    .from('item_quantity_history')
                    .insert({
                        item_id: initialItem.id,
                        old_quantity: initialItem.quantity,
                        new_quantity: qtyNum,
                        change_amount: qtyNum - initialItem.quantity,
                        changed_by: user?.id,
                    });

                if (logError) console.warn('Failed to log quantity history:', logError);
            }

            Alert.alert('Success', 'Stock item updated successfully');
            onSaved?.();
            onBack();
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const qtyNum = parseInt(form.quantity) || 0;

    const getStatus = () => {
        if (qtyNum === 0) return { text: 'On Order', color: 'text-red-600' };
        if (qtyNum < 5) return { text: 'Low Stock', color: 'text-orange-500' };
        if (qtyNum > 6) return { text: 'In Stock', color: 'text-green-600' };
        return { text: 'Low Stock', color: 'text-orange-500' };
    };

    const status = getStatus();

    if (loading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-cream dark:bg-black">
                <ActivityIndicator size="large" color={isDark ? '#60a5fa' : '#2563eb'} />
                <Text className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                    Loading item details...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-cream dark:bg-black">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <View className="flex-row items-center px-5 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <TouchableOpacity onPress={onBack} className="mr-4">
                        <ChevronLeft size={28} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold text-black dark:text-white flex-1">
                        Edit Stock Item
                    </Text>
                </View>

                <ScrollView
                    contentContainerStyle={{ paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                >
                    {/* Product Info Header */}
                    <View className="px-6 pt-6 pb-5 bg-white dark:bg-gray-900">
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                            {initialItem.productName || 'Unnamed Product'}
                        </Text>

                        <View className="mt-3 flex-row flex-wrap items-center gap-x-3">
                            <Text className="text-base text-gray-600 dark:text-gray-400">Variant:</Text>
                            <Text className="text-base font-medium text-gray-800 dark:text-gray-200">
                                {form.color}
                                {form.size ? ` / ${form.size}` : ''}
                                {form.motif ? ` • ${form.motif}` : ''}
                            </Text>
                        </View>

                        <Text className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            SKU: {form.sku || initialItem.sku}
                        </Text>
                    </View>

                    {/* Quantity Adjuster */}
                    <View className="px-6 py-10 bg-white dark:bg-gray-900 items-center">
                        <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">
                            Adjust Quantity
                        </Text>

                        <View className="flex-row items-center justify-center gap-12">
                            <TouchableOpacity
                                onPress={() => quickAdjustQuantity(-1)}
                                disabled={saving}
                                className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/70 items-center justify-center active:opacity-70 shadow-md"
                            >
                                <Minus size={36} color="#dc2626" />
                            </TouchableOpacity>

                            <View className="items-center">
                                <Text className="text-6xl font-extrabold text-gray-900 dark:text-white">
                                    {form.quantity}
                                </Text>
                                <Text className={`text-lg font-medium mt-3 ${status.color}`}>
                                    {status.text}
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => quickAdjustQuantity(1)}
                                disabled={saving}
                                className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/70 items-center justify-center active:opacity-70 shadow-md"
                            >
                                <Plus size={36} color="#16a34a" />
                            </TouchableOpacity>
                        </View>

                        {errors.quantity && (
                            <Text className="text-red-600 mt-5 text-center">{errors.quantity}</Text>
                        )}
                    </View>

                    {/* Form Fields */}
                    <View className="px-6 pt-8 pb-6 space-y-6">
                        <View>
                            <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-200">SKU</Text>
                            <TextInput
                                value={form.sku}
                                editable={false}
                                className="border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                            />
                        </View>

                        <View>
                            <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-200">Color *</Text>
                            <TextInput
                                value={form.color}
                                onChangeText={(v) => updateForm('color', v)}
                                className="border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 bg-white dark:bg-gray-800 text-black dark:text-white"
                            />
                            {errors.color && <Text className="text-red-600 mt-2">{errors.color}</Text>}
                        </View>

                        <View>
                            <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-200">Size</Text>
                            <TextInput
                                value={form.size}
                                onChangeText={(v) => updateForm('size', v)}
                                className="border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 bg-white dark:bg-gray-800 text-black dark:text-white"
                            />
                        </View>

                        <View>
                            <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-200">Motif</Text>
                            <TextInput
                                value={form.motif}
                                onChangeText={(v) => updateForm('motif', v)}
                                className="border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 bg-white dark:bg-gray-800 text-black dark:text-white"
                            />
                        </View>

                        <View>
                            <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-200">
                                Selling Price (KSh)
                            </Text>
                            <TextInput
                                value={form.price}
                                onChangeText={(v) => updateForm('price', v.replace(/[^0-9.]/g, ''))}
                                keyboardType="numeric"
                                className="border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 bg-white dark:bg-gray-800 text-black dark:text-white"
                            />
                            {errors.price && <Text className="text-red-600 mt-2">{errors.price}</Text>}
                        </View>

                        <View>
                            <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-200">
                                Buying Price (KSh)
                            </Text>
                            <TextInput
                                value={form.buying_price}
                                onChangeText={(v) => updateForm('buying_price', v.replace(/[^0-9.]/g, ''))}
                                keyboardType="numeric"
                                className="border border-gray-300 dark:border-gray-600 rounded-xl px-5 py-4 bg-white dark:bg-gray-800 text-black dark:text-white"
                            />
                            {errors.buying_price && (
                                <Text className="text-red-600 mt-2">{errors.buying_price}</Text>
                            )}
                        </View>
                    </View>
                </ScrollView>

                {/* Fixed Save Button */}
                <View className="px-6 pb-8 pt-4 bg-cream dark:bg-black">
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        className={`py-5 rounded-xl items-center shadow-lg mb-10 ${
                            saving ? 'bg-gray-400' : 'bg-blue-600'
                        } active:bg-blue-700`}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" size="large" />
                        ) : (
                            <Text className="text-white text-xl font-bold">Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}