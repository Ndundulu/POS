import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import {shareSaleAsPDF} from "@/components/home/stats/Sales/PDFSaleReceipt";

type Customer = {
    name: string;
    companyname?: string | null;
    email?: string | null;
    customer_type?: "individual" | "company";
};

type Sale = {
    id: string;
    reference_number: string | null;
    total: number;
    payment_mode: string;
    created_at: string;
    discount_amount: number;
    tax_inclusive: boolean;
    customer: Customer | null;
};

type SaleItem = {
    quantity: number;
    cost: number;
    item: {
        sku: string;
        color: string;
        size?: string | null;
        motif?: string | null;
        product: {
            name: string;
        } | null;
    } | null;
};

type Props = {
    visible: boolean;
    saleId: string | null;
    onClose: () => void;
};

export default function SaleDetailsModal({ visible, saleId, onClose }: Props) {
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [saleItems, setSaleItems] = useState<SaleItem[]>([]);

    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    useEffect(() => {
        if (!saleId || !visible) {
            setSelectedSale(null);
            setSaleItems([]);
            return;
        }

        const fetchSaleDetails = async () => {
            const { data: saleData, error: saleError } = await supabase
                .from("sales")
                .select(`
                    id,
                    reference_number,
                    total,
                    payment_mode,
                    created_at,
                    discount_amount,
                    tax_inclusive,
                    customer:customer_id (
                        name,
                        companyname,
                        email,
                        customer_type
                    )
                `)
                .eq("id", saleId)
                .single();

            if (saleError) {
                console.error("Error fetching sale:", saleError);
                return;
            }

            const { data: itemsData, error: itemsError } = await supabase
                .from("sale_items")
                .select(`
                    quantity,
                    cost,
                    item:item_id (
                        sku,
                        color,
                        size,
                        motif,
                        product:product_id (
                            name
                        )
                    )
                `)
                .eq("sale_id", saleId);

            if (itemsError) {
                console.error("Error fetching sale items:", itemsError);
            }

            setSelectedSale(saleData as Sale);
            setSaleItems(itemsData || []);
        };

        fetchSaleDetails();
    }, [saleId, visible]);

    const clientName = (customer: Customer | null) => {
        if (!customer) return "WALK-IN";

        if (customer.customer_type === "company" && customer.companyname) {
            const contact = customer.name && customer.name.trim() ? ` (Contact: ${customer.name.trim()})` : "";
            return `${customer.companyname.toUpperCase()}${contact}`;
        }

        return customer.name.toUpperCase();
    };

    const formatTime = (dateString: string) =>
        new Date(dateString).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

    const formatVariantDetails = (item: SaleItem["item"]) => {
        if (!item) return "—";
        const parts = [];
        if (item.sku) parts.push(item.sku);
        if (item.color) parts.push(item.color);
        if (item.size) parts.push(item.size);
        if (item.motif) parts.push(item.motif);
        return parts.join(" • ") || "—";
    };

    const calculations =
        selectedSale && saleItems.length > 0
            ? (() => {
                const subtotal = saleItems.reduce(
                    (sum, i) => sum + i.quantity * i.cost,
                    0
                );
                const discount = selectedSale.discount_amount || 0;
                const afterDiscount = subtotal - discount;

                const TAX_RATE = 0.16;
                let taxAmount = 0;

                if (selectedSale.tax_inclusive) {
                    taxAmount = afterDiscount - afterDiscount / (1 + TAX_RATE);
                } else {
                    taxAmount = afterDiscount * TAX_RATE;
                }

                const total = selectedSale.tax_inclusive
                    ? afterDiscount
                    : afterDiscount + taxAmount;

                return {
                    subtotal,
                    discount,
                    taxAmount: Math.round(taxAmount),
                    total: Math.round(total),
                    taxInclusive: selectedSale.tax_inclusive,
                };
            })()
            : null;

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="slide">
            <View className={`flex-1 ${isDark ? "bg-backgroundDark" : "bg-cream"}`}>
                <View className="px-6 pt-12 pb-6 border-b border-gray-300 dark:border-gray-700 flex-row justify-between items-center">
                    <Text
                        className="text-3xl font-bold text-navy dark:text-cream"
                        style={{ fontVariant: ["small-caps"] }}
                    >
                        Sale Details
                    </Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text className="text-gold text-lg font-bold">Back</Text>
                    </TouchableOpacity>
                </View>

                {selectedSale && (
                    <ScrollView className="flex-1 px-6 py-4">
                        <Text className="text-lg font-bold text-gold mb-4">
                            Ref: {selectedSale.reference_number ?? "NO-REF"}
                        </Text>

                        <Text className="text-base font-semibold text-navy dark:text-cream mb-1">
                            CLIENT: {clientName(selectedSale.customer)}
                        </Text>

                        {selectedSale.customer?.email && (
                            <Text className="text-sm text-textLightSecondary dark:text-textDarkSecondary mb-4">
                                Email: {selectedSale.customer.email}
                            </Text>
                        )}

                        <Text className="text-sm font-medium text-tan dark:text-gold mb-6">
                            Payment: {selectedSale.payment_mode.toUpperCase()} • {formatTime(selectedSale.created_at)}
                        </Text>

                        <Text className="text-xl font-bold text-navy dark:text-cream mb-4">
                            Items Sold
                        </Text>

                        {saleItems.length > 0 ? (
                            saleItems.map((item, idx) => (
                                <View
                                    key={idx}
                                    className="mb-6 pb-6 border-b border-gray-300 dark:border-gray-700 last:border-0"
                                >
                                    <Text className="text-lg font-semibold text-navy dark:text-cream">
                                        {item.item?.product?.name || "Unknown Product"}
                                    </Text>

                                    <Text className="text-sm text-textLightSecondary dark:text-textDarkSecondary mt-1 mb-3">
                                        {formatVariantDetails(item.item)}
                                    </Text>

                                    <View className="flex-row justify-between">
                                        <Text className="text-base text-navy dark:text-cream">
                                            Quantity: {item.quantity}
                                        </Text>
                                        <Text className="text-base font-bold text-navy dark:text-cream">
                                            KSH {(item.cost * item.quantity).toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text className="text-textLightSecondary dark:text-textDarkSecondary italic py-4">
                                No items found for this sale
                            </Text>
                        )}

                        {calculations && (
                            <View className="mt-8 bg-cardLight dark:bg-cardDark rounded-2xl p-5">
                                <Text className="text-xl font-bold text-navy dark:text-cream mb-4">
                                    Payment Summary
                                </Text>

                                <View className="space-y-3 mb-4">
                                    <View className="flex-row justify-between">
                                        <Text className="text-base text-navy dark:text-cream">Subtotal</Text>
                                        <Text className="text-base font-medium">KSH {calculations.subtotal.toLocaleString()}</Text>
                                    </View>

                                    {calculations.discount > 0 && (
                                        <View className="flex-row justify-between">
                                            <Text className="text-base text-navy dark:text-cream">Discount</Text>
                                            <Text className="text-base font-medium text-red-600 dark:text-red-400">
                                                - KSH {calculations.discount.toLocaleString()}
                                            </Text>
                                        </View>
                                    )}

                                    <View className="flex-row justify-between">
                                        <Text className="text-base text-navy dark:text-cream">
                                            VAT (16%) {calculations.taxInclusive ? "Inclusive" : "Exclusive"}
                                        </Text>
                                        <Text className="text-base font-medium">
                                            KSH {calculations.taxAmount.toLocaleString()}
                                        </Text>
                                    </View>

                                    <View className="pt-4 border-t-2 border-navy dark:border-gold">
                                        <View className="flex-row justify-between">
                                            <Text className="text-2xl font-bold text-navy dark:text-cream">Total</Text>
                                            <Text className="text-2xl font-bold text-gold">
                                                KSH {selectedSale.total.toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                )}
                <View className="px-6 pb-4">
                    <TouchableOpacity
                        onPress={() => {
                            if (selectedSale && saleItems) {
                                shareSaleAsPDF(selectedSale, saleItems);
                            }
                        }}
                        className="py-4 rounded-2xl bg-gold mb-3"
                    >
                        <Text className="text-center text-lg font-bold text-navy">
                            Download Receipt (PDF)
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="px-6 pb-8 pt-4">
                    <TouchableOpacity
                        onPress={onClose}
                        className="py-4 rounded-2xl bg-navy dark:bg-gold"
                    >
                        <Text className="text-center text-lg font-bold text-cream dark:text-navy">
                            Close Details
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

