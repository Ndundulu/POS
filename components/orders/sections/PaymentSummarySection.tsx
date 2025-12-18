// components/orders/PaymentSummarySection.tsx
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useColorScheme } from "react-native";
import { DollarSign } from "lucide-react-native";
import { useState, useEffect } from "react";
import { usePaymentCalculations } from "@/components/orders/hooks/usePaymentCalculations";

type DiscountType = "percent" | "fixed";
type DepositType = "percent" | "fixed";

interface PaymentSummarySectionProps {
    items: { qty: number; unitCost: number }[];
    deliveryFee: string | number;
    taxInclusive: boolean;
    setTaxInclusive: (value: boolean) => void;
    paymentMode?: string;
    setPaymentMode?: (mode: string) => void;
    discount?: number;
    setDiscount?: (value: number) => void;
    deposit?: number;                    // ← Deposit value (always passed)
    setDeposit?: (value: number) => void; // ← Optional: only for create mode
    // Optional internal states for editable mode
    discountInput?: string;
    setDiscountInput?: (value: string) => void;
    discountType?: DiscountType;
    setDiscountType?: (type: DiscountType) => void;
    depositInput?: string;
    setDepositInput?: (value: string) => void;
    depositType?: DepositType;
    setDepositType?: (type: DepositType) => void;
}

export default function PaymentSummarySection({
                                                  items,
                                                  deliveryFee,
                                                  taxInclusive,
                                                  setTaxInclusive,
                                                  paymentMode = "Cash",
                                                  setPaymentMode,
                                                  discount = 0,
                                                  setDiscount,
                                                  deposit = 0,                        // ← Default to 0
                                                  setDeposit,                         // ← May be undefined (read-only mode)
                                              }: PaymentSummarySectionProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    // Local state for inputs (only used when editable)
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
        if (typeof setDiscount === "function") {
            setDiscount(Math.round(discountAmountKes));
        }
    }, [discountAmountKes, setDiscount]);

    // === DEPOSIT ===
    const rawDeposit = parseFloat(depositInput) || 0;

    // First pass: calculate total without deposit cap
    const tempCalculations = usePaymentCalculations({
        items,
        deliveryFee,
        discountAmount: discountAmountKes,
        depositAmount: 0, // temporary
        taxInclusive,
    });

    // Real deposit based on final total
    const depositFromPercent = depositType === "percent"
        ? tempCalculations.total * (rawDeposit / 100)
        : rawDeposit;

    const finalDepositKes = Math.min(depositFromPercent, tempCalculations.total);

    useEffect(() => {
        if (typeof setDeposit === "function") {
            setDeposit(Math.round(finalDepositKes));
        }
    }, [finalDepositKes, setDeposit]);

    // Final calculations with correct deposit
    const {
        subtotal: finalSubtotal,
        deliveryFee: finalDelivery,
        discountAmount,
        taxAmount,
        total,
        depositAmount: finalDeposit,
        balance,
    } = usePaymentCalculations({
        items,
        deliveryFee,
        discountAmount: discountAmountKes,
        depositAmount: finalDepositKes,
        taxInclusive,
    });

    // Initialize inputs on mount if values exist (for edit/create preload)
    useEffect(() => {
        if (discount > 0 && discountInput === "") {
            if (discount < subtotal * 0.5) {
                const percent = (discount / subtotal) * 100;
                setDiscountType("percent");
                setDiscountInput(percent.toFixed(1));
            } else {
                setDiscountType("fixed");
                setDiscountInput(discount.toFixed(0));
            }
        }
    }, [discount, subtotal, discountInput]);

    useEffect(() => {
        if (deposit > 0 && depositInput === "" && typeof setDeposit === "function") {
            if (deposit < total * 0.8) {
                const percent = (deposit / total) * 100;
                setDepositType("percent");
                setDepositInput(percent.toFixed(1));
            } else {
                setDepositType("fixed");
                setDepositInput(deposit.toFixed(0));
            }
        }
    }, [deposit, total, depositInput, setDeposit]);

    // UI Styles
    const textPrimary = isDark ? "text-white" : "text-navy";
    const textSecondary = isDark ? "text-slate-400" : "text-gray-600";
    const borderColor = isDark ? "border-slate-700" : "border-gray-200";

    const discountLabel = discountAmount > 0
        ? discountType === "percent"
            ? `${rawDiscount}%`
            : `KES ${rawDiscount.toLocaleString()}`
        : "";

    return (
        <View className={`p-6 rounded-2xl ${isDark ? "bg-slate-800/70" : "bg-white"} shadow-lg border ${borderColor} mb-8`}>
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
                    {typeof setDiscount === "function" ? (
                        <View className={`flex-row border rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700`}>
                            <TextInput
                                value={discountInput}
                                onChangeText={setDiscountInput}
                                keyboardType="numeric"
                                placeholder={discountType === "percent" ? "10" : "5000"}
                                className={`w-28 px-3 py-2 text-right ${textPrimary}`}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    setDiscountType(prev => prev === "percent" ? "fixed" : "percent");
                                    setDiscountInput("");
                                    setDiscount?.(0);
                                }}
                                className="w-12 justify-center items-center bg-gray-200 dark:bg-slate-600"
                            >
                                <Text className="font-bold text-lg">{discountType === "percent" ? "%" : "KES"}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Text className="font-medium text-red-500">
                            {discountAmount > 0 ? `- KES ${discountAmount.toLocaleString()}` : "-"}
                        </Text>
                    )}
                </View>

                <View className="flex-row justify-between">
                    <Text className={textSecondary}>VAT (16%)</Text>
                    <Text className={`font-medium ${taxInclusive ? "text-green-500" : textPrimary}`}>
                        {taxInclusive ? "Included" : `+ KES ${taxAmount.toLocaleString()}`}
                    </Text>
                </View>

                <View className="flex-row justify-between items-center">
                    <Text className={textSecondary}>Tax Type</Text>
                    <TouchableOpacity onPress={() => setTaxInclusive(!taxInclusive)}>
                        <Text className={`font-bold px-5 py-2 rounded-xl ${taxInclusive ? "text-green-500" : "text-orange-500"}`}>
                            {taxInclusive ? "Inclusive" : "Exclusive"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className={`border-t pt-6 ${borderColor}`}>
                <View className="flex-row justify-between mb-6">
                    <Text className={`text-2xl font-bold ${textPrimary}`}>TOTAL</Text>
                    <Text className="text-3xl font-bold text-navy">KES {total.toLocaleString()}</Text>
                </View>

                <View className="mt-3">
                    <View className="flex-row items-center justify-between">
                        <Text className={`font-bold ${textPrimary}`}>Deposit Paid</Text>

                        {typeof setDeposit === "function" ? (
                            // Editable mode (Create)
                            <View className={`flex-row items-center border-2 rounded-xl overflow-hidden h-12 w-56 ${isDark ? "bg-slate-700 border-slate-600" : "bg-gray-50 border-gray-300"}`}>
                                <TextInput
                                    value={depositInput}
                                    onChangeText={setDepositInput}
                                    keyboardType="numeric"
                                    placeholder={depositType === "percent" ? "50" : "10000"}
                                    className={`flex-1 px-4 text-right text-xl font-bold ${textPrimary}`}
                                    style={{ height: 48 }}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        setDepositType(prev => prev === "percent" ? "fixed ejaculation" : "percent");
                                        setDepositInput("");
                                        setDeposit?.(0);
                                    }}
                                    className={`w-14 h-full justify-center items-center ${isDark ? "bg-slate-600" : "bg-gray-200"}`}
                                >
                                    <Text className="font-bold text-xl">
                                        {depositType === "percent" ? "%" : "KES"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // Read-only mode (Edit/Details)
                            <Text className="font-bold text-green-600 text-xl">
                                KES {deposit.toLocaleString()}
                            </Text>
                        )}
                    </View>

                    {finalDeposit > 0 && (
                        <View className="flex-row justify-end mt-2">
                            <Text className="text-green-600 font-bold">
                                - KES {finalDeposit.toLocaleString()}
                            </Text>
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

            {typeof setPaymentMode === "function" && (
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
            )}
        </View>
    );
}