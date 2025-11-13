import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

type DiscountType = 'percent' | 'fixed';
type TaxType = 'exclusive' | 'inclusive';

interface Props {
    cart: any[];
}

export default function PriceSummaryWithDiscountAndTax({ cart }: Props) {
    const [discountType, setDiscountType] = useState<DiscountType>('percent');
    const [discountInput, setDiscountInput] = useState<string>('');
    const [taxType, setTaxType] = useState<TaxType>('exclusive');

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const discountValue = parseFloat(discountInput) || 0;
    let discountAmount = 0;
    let discountLabel = '';

    if (discountValue > 0) {
        if (discountType === 'percent') {
            discountAmount = subtotal * (discountValue / 100);
            discountLabel = `${discountValue}%`;
        } else {
            discountAmount = discountValue;
            discountLabel = `$${discountValue.toFixed(2)}`;
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
        setDiscountType(prev => (prev === 'percent' ? 'fixed' : 'percent'));
        setDiscountInput('');
    };

    const toggleTaxType = () => {
        setTaxType(prev => (prev === 'exclusive' ? 'inclusive' : 'exclusive'));
    };

    return (
        <View style={styles.container}>
            {/* === CONTROLS ROW === */}
            <View style={styles.controlsRow}>
                <View style={styles.inputGroup}>
                    <Text style={styles.controlLabel}>Discount:</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder={discountType === 'percent' ? '10' : '5.00'}
                            keyboardType="numeric"
                            value={discountInput}
                            onChangeText={setDiscountInput}
                        />
                        <TouchableOpacity onPress={toggleDiscountType} style={styles.typeButton}>
                            <Text style={styles.typeButtonText}>
                                {discountType === 'percent' ? '%' : '$'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.controlLabel}>Tax (16%):</Text>
                    <TouchableOpacity onPress={toggleTaxType} style={styles.toggleButton}>
                        <Text style={styles.toggleButtonText}>
                            {taxType === 'exclusive' ? 'Excl.' : 'Incl.'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.divider} />

            {/* === PRICE BREAKDOWN === */}
            <View style={styles.row}>
                <Text style={styles.label}>Subtotal:</Text>
                <Text style={styles.value}>${subtotal.toFixed(2)}</Text>
            </View>

            {discountAmount > 0 && (
                <View style={styles.row}>
                    <Text style={styles.label}>Discount ({discountLabel}):</Text>
                    <Text style={[styles.value, styles.discount]}>-${discountAmount.toFixed(2)}</Text>
                </View>
            )}

            <View style={styles.divider} />

            <View style={styles.row}>
                <Text style={styles.label}>After Discount:</Text>
                <Text style={styles.value}>${afterDiscount.toFixed(2)}</Text>
            </View>

            {/* === COMPACT TAX ROW (fits on one line) === */}
            <View style={styles.compactTaxRow}>
                <View style={styles.taxLabelContainer}>
                    <Text style={styles.label}>Tax (16%)</Text>
                    <TouchableOpacity onPress={toggleTaxType} style={styles.inlineToggle}>
                        <Text style={styles.inlineToggleText}>
                            {taxType === 'exclusive' ? 'excl.' : 'incl.'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.value}>
                    {taxType === 'exclusive' ? '+' : ''}${tax.toFixed(2)}
                </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <Text style={styles.totalLabel}>TOTAL:</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>

            {taxType === 'inclusive' && (
                <View style={styles.note}>
                    <Text style={styles.noteText}>
                        * Tax included: ${taxableAmount.toFixed(2)} (base) + ${tax.toFixed(2)} (tax)
                    </Text>
                </View>
            )}
        </View>
    );
}

/* ------------------------------------------------- */
/* Styles                                            */
/* ------------------------------------------------- */
const styles = StyleSheet.create({
    container: { marginVertical: 16, paddingHorizontal: 4 },

    // ── COMPACT CONTROLS ROW (Discount + Tax on ONE line) ─────────────────────
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        marginHorizontal: 16,
        marginTop: 12,
    },
    inputGroup: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    controlLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        minWidth: 44,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 8,
        paddingVertical: 6,
        fontSize: 14,
        color: '#111827',
        textAlign: 'right',
    },
    typeButton: {
        width: 32,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4b5563',
    },
    toggleButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#eff6ff',
        borderRadius: 6,
        minWidth: 56,
        alignItems: 'center',
    },
    toggleButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1d4ed8',
    },

    // ── Rest of your original styles (unchanged) ─────────────────────────────
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    label: { fontSize: 16, color: '#333' },
    value: { fontSize: 16, fontWeight: '600' },
    discount: { color: '#d00' },
    divider: { height: 1, backgroundColor: '#ddd', marginVertical: 10 },

    // Compact Tax Row (kept for compatibility)
    compactTaxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 4,
    },
    taxLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    inlineToggle: {
        backgroundColor: '#e6f2ff',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#0066cc',
    },
    inlineToggleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0066cc',
        textTransform: 'uppercase',
    },

    totalLabel: { fontSize: 18, fontWeight: 'bold' },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: '#0066cc' },
    note: {
        marginTop: 8,
        paddingHorizontal: 4,
    },
    noteText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
});