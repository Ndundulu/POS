// components/orders/PaymentSummarySection.tsx
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useColorScheme } from "react-native";
import { DollarSign } from "lucide-react-native";
import { useState, useEffect } from "react";
import {usePaymentCalculations} from "@/components/orders/hooks/usePaymentCalculations";

type DiscountType = "percent" | "fixed";
type DepositType = "percent" | "fixed";

export default function PaymentSummarySection(props: any) {
    const {
        items,
        deliveryFee,
        taxInclusive,
        setTaxInclusive,
        paymentMode,
        setPaymentMode,
        discount: propDiscountKes = 0,
        deposit: propDepositKes = 0,
        setDiscount,
        setDeposit,
    } = props;

    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const [discountType, setDiscountType] = useState<DiscountType>("percent");
    const [discountInput, setDiscountInput] = useState<string>("");
    const [depositType, setDepositType] = useState<DepositType>("percent");
    const [depositInput, setDepositInput] = useState<string>("");

    const subtotal = items.reduce((s: number, i: any) => s + i.qty * i.unitCost, 0);

    // === DISCOUNT ===
    const rawDiscount = parseFloat(discountInput) || 0;
    const discountAmountKes = discountType === "percent"
        ? subtotal * (rawDiscount / 100)
        : rawDiscount;

    useEffect(() => {
        setDiscount(Math.round(discountAmountKes));
    }, [discountAmountKes, setDiscount]);

    // === DEPOSIT ===
    const rawDeposit = parseFloat(depositInput) || 0;

    // We'll use the hook for final numbers (including deposit cap + tax logic)
    const calculations = usePaymentCalculations({
        items,
        deliveryFee,
        discountAmount: discountAmountKes,
        depositAmount: depositType === "percent"
            ? 0 // temporary — real deposit calculated below using total from hook
            : rawDeposit,
        taxInclusive,
    });

    // Recalculate deposit using the correct total from hook
    const depositFromPercent = depositType === "percent"
        ? calculations.total * (rawDeposit / 100)
        : rawDeposit;

    const finalDepositKes = Math.min(depositFromPercent, calculations.total);

    useEffect(() => {
        setDeposit(Math.round(finalDepositKes));
    }, [finalDepositKes, setDeposit]);

    // Use the shared hook for all final numbers
    const {
        subtotal: finalSubtotal,
        deliveryFee: finalDelivery,
        discountAmount,
        taxAmount,
        total,
        depositAmount: finalDeposit,
        balance,
        taxInclusive: finalTaxInclusive,
    } = usePaymentCalculations({
        items,
        deliveryFee,
        discountAmount: discountAmountKes,
        depositAmount: finalDepositKes,
        taxInclusive,
    });

    // Initialize inputs when editing existing order
    useEffect(() => {
        if (propDiscountKes > 0 && discountInput === "") {
            if (propDiscountKes < subtotal * 0.5) {
                const percent = (propDiscountKes / subtotal) * 100;
                setDiscountType("percent");
                setDiscountInput(percent.toFixed(1));
            } else {
                setDiscountType("fixed");
                setDiscountInput(propDiscountKes.toFixed(0));
            }
        }
    }, [propDiscountKes, subtotal, discountInput]);

    useEffect(() => {
        if (propDepositKes > 0 && depositInput === "") {
            if (propDepositKes < total * 0.8) {
                const percent = (propDepositKes / total) * 100;
                setDepositType("percent");
                setDepositInput(percent.toFixed(1));
            } else {
                setDepositType("fixed");
                setDepositInput(propDepositKes.toFixed(0));
            }
        }
    }, [propDepositKes, total, depositInput]);

    const discountLabel = discountAmount > 0
        ? discountType === "percent"
            ? `${rawDiscount}%`
            : `KES ${rawDiscount.toLocaleString()}`
        : "";

    const depositLabel = finalDeposit > 0
        ? depositType === "percent"
            ? `${rawDeposit}%`
            : `KES ${rawDeposit.toLocaleString()}`
        : "";

    // UI Styles
    const bgCard = isDark ? "bg-slate-800/70" : "bg-white";
    const textPrimary = isDark ? "text-white" : "text-navy";
    const textSecondary = isDark ? "text-slate-400" : "text-gray-600";
    const borderColor = isDark ? "border-slate-700" : "border-gray-200";

    return (
        <View className={`p-6 rounded-2xl ${bgCard} shadow-lg border ${borderColor} mb-8`}>
            <View className="flex-row items-center gap-3 mb-6">
                <DollarSign size={26} color="#b89d63" />
                <Text className={`text-2xl font-bold ${textPrimary}`}>Payment Summary</Text>
            </View>

            <View className="space-y-5 mb-6">
                <View className="flex-row justify-between">
                    <Text className={textSecondary}>Subtotal</Text>
                    <Text className={`font-medium ${textPrimary}`}>KES {finalSubtotal.toLocaleString()}</Text>
                </View>

                {finalDelivery > 0 && (
                    <View className="flex-row justify-between">
                        <Text className={textSecondary}>Delivery Fee</Text>
                        <Text className={`font-medium ${textPrimary}`}>+ KES {finalDelivery.toLocaleString()}</Text>
                    </View>
                )}

                <View className="flex-row justify-between items-center">
                    <Text className={textSecondary}>Discount {discountLabel && `(${discountLabel})`}</Text>
                    <View className={`flex-row border rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700`}>
                        <TextInput
                            value={discountInput}
                            onChangeText={setDiscountInput}
                            keyboardType="numeric"
                            placeholder={discountType === "percent" ? "10" : "5000"}
                            className={`w-28 px-3 py-2 text-right ${textPrimary}`}
                        />
                        <TouchableOpacity onPress={() => {
                            setDiscountType(prev => prev === "percent" ? "fixed" : "percent");
                            setDiscountInput("");
                            setDiscount(0);
                        }} className="w-12 justify-center items-center bg-gray-200 dark:bg-slate-600">
                            <Text className="font-bold text-lg">{discountType === "percent" ? "%" : "KES"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {discountAmount > 0 && (
                    <View className="flex-row justify-between -mt-2">
                        <Text></Text>
                        <Text className="text-red-500 font-medium">- KES {discountAmount.toLocaleString()}</Text>
                    </View>
                )}

                <View className="flex-row justify-between">
                    <Text className={textSecondary}>VAT (16%)</Text>
                    <Text className={`font-medium ${finalTaxInclusive ? "text-green-500" : textPrimary}`}>
                        {finalTaxInclusive ? "Included" : `+ KES ${taxAmount.toLocaleString()}`}
                    </Text>
                </View>

                <View className="flex-row justify-between items-center">
                    <Text className={textSecondary}>Tax Type</Text>
                    <TouchableOpacity onPress={() => setTaxInclusive(!taxInclusive)}>
                        <Text className={`font-bold px-5 py-2 rounded-xl ${finalTaxInclusive ? "text-green-500" : "text-orange-500"}`}>
                            {finalTaxInclusive ? "Inclusive" : "Exclusive"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className={`border-t pt-6 ${borderColor}`}>
                <View className="flex-row justify-between mb-6">
                    <Text className={`text-2xl font-bold ${textPrimary}`}>TOTAL</Text>
                    <Text className="text-3xl font-bold text-navy">KES {total.toLocaleString()}</Text>
                </View>

                <View className="mt-6">
                    <Text className={`font-bold mb-3 ${textPrimary}`}>Deposit Paid {depositLabel}</Text>
                    <View className="flex-row justify-end">
                        <View className={`flex-row border-2 rounded-xl overflow-hidden ${isDark ? "bg-slate-700 border-slate-600" : "bg-gray-50 border-gray-300"}`}>
                            <TextInput
                                value={depositInput}
                                onChangeText={setDepositInput}
                                keyboardType="numeric"
                                placeholder={depositType === "percent" ? "50" : "10000"}
                                className={`w-40 px-4 py-3 text-right text-xl font-bold ${textPrimary}`}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    setDepositType(prev => prev === "percent" ? "fixed" : "percent");
                                    setDepositInput("");
                                    setDeposit(0);
                                }}
                                className={`w-14 justify-center items-center ${isDark ? "bg-slate-600" : "bg-gray-200"}`}
                            >
                                <Text className="font-bold text-xl">{depositType === "percent" ? "%" : "KES"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {finalDeposit > 0 && (
                        <View className="flex-row justify-end mt-2">
                            <Text className="text-green-600 font-bold">- KES {finalDeposit.toLocaleString()}</Text>
                        </View>
                    )}
                </View>

                <View className="flex-row justify-between items-center mt-10 pt-6 border-t border-gray-300 dark:border-slate-700">
                    <Text className={`text-xl font-bold ${textPrimary}`}>Balance Due</Text>
                    <Text className={`text-2xl font-bold ${balance > 0 ? "text-red-500" : "text-green-500"}`}>
                        KES {balance.toLocaleString()}
                    </Text>
                </View>
            </View>

            <View className="mt-8">
                <Text className={`font-bold mb-4 ${textPrimary}`}>Payment Mode</Text>
                <View className="flex-row justify-around">
                    {["M-Pesa", "Cash", "Card"].map((mode) => (
                        <TouchableOpacity
                            key={mode}
                            onPress={() => setPaymentMode(mode)}
                            className={`px-6 py-3 rounded-xl ${paymentMode === mode ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}
                        >
                            <Text className={`font-medium ${paymentMode === mode ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>
                                {mode}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
}