import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
    Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import SaleDetailsModal from "./SaleDetailsModal";
import { exportTodaysSalesToPDF } from "@/components/home/stats/Sales/ExportTodaysSalesPdf";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

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

type Props = {
    visible: boolean;
    onClose: () => void;
};

export default function TodaysSalesModal({ visible, onClose }: Props) {
    const [sales, setSales] = useState<Sale[]>([]);
    const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null); // null = today
    const [showPicker, setShowPicker] = useState(false);

    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const fetchSales = async (date: Date | null) => {
        const targetDate = date || new Date();
        const start = new Date(targetDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(targetDate);
        end.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
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
            .eq("status", "completed")
            .eq("has_custom_items", false)
            .gte("created_at", start.toISOString())
            .lte("created_at", end.toISOString())
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching sales:", error);
        } else {
            setSales(data as Sale[]);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchSales(selectedDate);
        }
    }, [visible, selectedDate]);

    const clientName = (customer: Customer | null) => {
        if (!customer) return "WALK-IN";
        if (customer.customer_type === "company" && customer.companyname) {
            const contact = customer.name && customer.name.trim() ? ` (Contact: ${customer.name.trim()})` : "";
            return `${customer.companyname.toUpperCase()}${contact}`;
        }
        return customer.name.toUpperCase();
    };

    const formatTime = (dateString: string) =>
        new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const titleText = selectedDate
        ? `Sales – ${selectedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
        : "Today's Sales";

    const handleDateChange = (event: any, date?: Date) => {
        setShowPicker(false);
        if (date) {
            setSelectedDate(date);
        }
    };

    if (!visible && !selectedSaleId) return null;

    return (
        <>
            {/* Main List Modal */}
            <Modal visible={visible && !selectedSaleId} animationType="slide">
                <View className={`flex-1 ${isDark ? "bg-backgroundDark" : "bg-cream"}`}>
                    <View className="px-6 pt-12 pb-6 border-b border-gray-300 dark:border-gray-700 flex-row justify-between items-center">
                        <Text
                            className="text-3xl font-bold text-navy dark:text-cream"
                            style={{ fontVariant: ["small-caps"] }}
                        >
                            {titleText}
                        </Text>
                        <TouchableOpacity onPress={() => setShowPicker(true)} className="p-2">
                            <Ionicons name="calendar-outline" size={32} color={isDark ? "#cream" : "#navy"} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-4 py-4">
                        {sales.length === 0 ? (
                            <View className="items-center py-10">
                                <Text className="text-lg text-textLightSecondary dark:text-textDarkSecondary">
                                    No sales recorded {selectedDate ? "on this date" : "today"}
                                </Text>
                            </View>
                        ) : (
                            sales.map((sale) => (
                                <TouchableOpacity
                                    key={sale.id}
                                    activeOpacity={0.85}
                                    onPress={() => setSelectedSaleId(sale.id)}
                                >
                                    <View
                                        className={`mb-4 rounded-2xl p-5 border ${
                                            Platform.OS === "android" ? "elevation-2" : "shadow shadow-black/10"
                                        } ${
                                            isDark
                                                ? "bg-cardDark border-gray-700"
                                                : "bg-cardLight border-gray-200"
                                        }`}
                                    >
                                        <Text className="text-lg font-bold text-gold mb-2">
                                            {sale.reference_number ?? "NO-REF"}
                                        </Text>
                                        <Text className="text-base font-semibold text-navy dark:text-cream mb-1">
                                            CLIENT: {clientName(sale.customer)}
                                        </Text>
                                        <Text className="text-xl font-bold text-navy dark:text-cream my-2">
                                            KSH {sale.total.toLocaleString()}
                                        </Text>
                                        <Text className="text-sm font-medium text-tan dark:text-gold mb-1">
                                            Payment: {sale.payment_mode.toUpperCase()}
                                        </Text>
                                        <Text className="text-sm opacity-70 text-textLightSecondary dark:text-textDarkSecondary">
                                            {formatTime(sale.created_at)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>

                    <View className="px-6 pb-4">
                        <TouchableOpacity
                            onPress={() => exportTodaysSalesToPDF(sales)}
                            className="py-4 rounded-2xl bg-navy mb-3"
                        >
                            <Text className="text-center text-lg font-bold text-cream">
                                Export {selectedDate ? "This Day's" : "Today's"} Sales to PDF
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="px-6 pb-8">
                        <TouchableOpacity
                            onPress={onClose}
                            className="py-4 rounded-2xl bg-navy dark:bg-gold"
                        >
                            <Text className="text-center text-lg font-bold text-cream dark:text-navy">
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {showPicker && (
                <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                />
            )}

            <SaleDetailsModal
                visible={!!selectedSaleId}
                saleId={selectedSaleId}
                onClose={() => setSelectedSaleId(null)}
                onSaleVoided={() => {
                    fetchSales(selectedDate); // Refresh current view
                }}
            />
        </>
    );
}