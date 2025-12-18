// src/components/POS/PriceSummaryWithDiscountAndTax.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, useColorScheme } from 'react-native';

type DiscountType = 'percent' | 'fixed';
type TaxType = 'exclusive' | 'inclusive';

interface Props {
    cart: any[];
}

export default function PriceSummaryWithDiscountAndTax({ cart }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [discountType, setDiscountType] = useState<DiscountType>('percent');
    const [discountInput, setDiscountInput] = useState<string>('');
    const [taxType, setTaxType] = useState<TaxType>('exclusive');

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const discountValue = parseFloat(discountInput) || 0;

    let discountAmount = 0;
    let discountLabel = '';

    if (discountValue > 0) {
        if (discountType === 'percent') {
            discountAmount = subtotal * (discountValue / 100);
            discountLabel = `${discountValue}%`;
        } else {
            discountAmount = discountValue;
            discountLabel = `Ksh${discountValue.toFixed(2)}`;
        }
    }

    const afterDiscount = subtotal - discountAmount;
    const TAX_RATE = 0.16;
    let tax = 0;
    let taxableAmount = 0;

    if (taxType === 'exclusive') {
        taxableAmount = afterDiscount;
        tax = taxableAmount * TAX_RATE;
    } else {
        taxableAmount = afterDiscount / (1 + TAX_RATE);
        tax = afterDiscount - taxableAmount;
    }

    const total = afterDiscount + (taxType === 'exclusive' ? tax : 0);

    const toggleDiscountType = () => {
        setDiscountType(p => (p === 'percent' ? 'fixed' : 'percent'));
        setDiscountInput('');
    };
    const toggleTaxType = () =>
        setTaxType(p => (p === 'exclusive' ? 'inclusive' : 'exclusive'));

    return (
        <View className="my-4 px-1">
            {/* DISCOUNT */}
            <View className="flex-row items-center justify-between mb-2">
                <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    Discount:
                </Text>
                <View className="flex-1 max-w-[120px] ml-2">
                    <View
                        className={`flex-row border rounded-lg overflow-hidden ${
                            isDark ? 'bg-[#2a2a2a] border-gray-600' : 'bg-[#EDEEDA] border-gray-300'
                        }`}
                    >
                        <TextInput
                            className={`flex-1 px-2 py-1 text-right text-base ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}
                            placeholder={discountType === 'percent' ? '10' : '5.00'}
                            placeholderTextColor={isDark ? '#777' : '#9ca3af'}
                            keyboardType="numeric"
                            value={discountInput}
                            onChangeText={setDiscountInput}
                        />
                        <TouchableOpacity
                            onPress={toggleDiscountType}
                            className={`w-9 justify-center items-center ${
                                isDark ? 'bg-gray-800' : 'bg-gray-100'
                            }`}
                        >
                            <Text
                                className={`text-xs font-bold ${
                                    isDark ? 'text-gray-300' : 'text-gray-600'
                                }`}
                            >
                                {discountType === 'percent' ? '%' : 'Ksh'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* DIVIDER */}
            <View className={`${isDark ? 'bg-gray-600' : 'bg-gray-300'} h-[1px] my-2`} />

            {/* BREAKDOWN */}
            <View className="flex-row justify-between my-1">
                <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    Subtotal:
                </Text>
                <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Ksh {subtotal.toFixed(2)}
                </Text>
            </View>

            {discountAmount > 0 && (
                <View className="flex-row justify-between my-1">
                    <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                        Discount ({discountLabel}):
                    </Text>
                    <Text className={`text-base italic ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        -Ksh {discountAmount.toFixed(2)}
                    </Text>
                </View>
            )}

            <View className={`${isDark ? 'bg-gray-600' : 'bg-gray-300'} h-[1px] my-2`} />

            <View className="flex-row justify-between my-1">
                <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    After Discount:
                </Text>
                <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Ksh {afterDiscount.toFixed(2)}
                </Text>
            </View>

            {/* TAX */}
            <View className="flex-row justify-between items-center my-1">
                <View className="flex-row items-center space-x-1">
                    <Text className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                        Tax (16%)
                    </Text>
                    <TouchableOpacity
                        onPress={toggleTaxType}
                        className={`px-1 py-0.5 border rounded ${
                            isDark ? 'bg-[#1e3a8a] border-blue-500' : 'bg-[#e6f2ff] border-blue-700'
                        }`}
                    >
                        <Text className={`text-[10px] font-semibold uppercase text-blue-600`}>
                            {taxType === 'exclusive' ? 'excl.' : 'incl.'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {taxType === 'exclusive' ? '+' : ''}Ksh {tax.toFixed(2)}
                </Text>
            </View>

            <View className={`${isDark ? 'bg-gray-600' : 'bg-gray-300'} h-[1px] my-2`} />

            {/* TOTAL */}
            <View className="flex-row justify-between my-1">
                <Text className="text-lg font-bold text-blue-600">TOTAL: </Text>
                <Text className="text-lg font-bold text-blue-600">Ksh {total.toFixed(2)}</Text>
            </View>

            {/* INCLUSIVE NOTE */}
            {taxType === 'inclusive' && (
                <View className="mt-2 px-1">
                    <Text className={`text-xs italic ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                        * Tax included: Ksh{taxableAmount.toFixed(2)} (base) + Ksh{tax.toFixed(2)} (tax)
                    </Text>
                </View>
            )}
        </View>
    );
}
