// components/orders/sections/ClientSection.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Keyboard,
} from "react-native";
import { User, Building2 } from "lucide-react-native";
import { useColorScheme } from "react-native";
import { supabase } from "@/src/lib/supabaseClient"; // Adjust path if needed
import debounce from "lodash.debounce";

type CustomerFromDB = {
    id: string;
    name: string;
    companyname: string;
    p_number: string;
    email: string | null;
    customer_type: "individual" | "company";
};

export default function ClientSection(props: any) {
    const {
        customerType: initialCustomerType = "individual",
        setCustomerType,
        companyName,
        setCompanyName,
        attentionName,
        setAttentionName,
        clientName,
        setClientName,
        phone,
        setPhone,
        email,
        setEmail,
        address,
        setAddress,
    } = props;

    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const bgCard = isDark ? "bg-slate-800/70" : "bg-white";
    const textPrimary = isDark ? "text-white" : "text-navy";
    const textSecondary = isDark ? "text-slate-400" : "text-gray-600";
    const borderColor = isDark ? "border-slate-700" : "border-gray-200";
    const inputBg = isDark ? "bg-slate-700/60" : "bg-gray-50";
    const placeholderColor = isDark ? "text-slate-500" : "text-gray-500";

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<CustomerFromDB[]>([]);
    const [loading, setLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const customerType = initialCustomerType;

    // Debounced search
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
    }, [searchQuery, searchCustomers]);

    const handleCustomerSelect = (customer: CustomerFromDB | null) => {
        if (!customer) {
            // Clear all
            setCustomerType("individual");
            setClientName("");
            setCompanyName("");
            setAttentionName("");
            setPhone("");
            setEmail("");
            setSearchQuery("");
            setDropdownOpen(false);
            return;
        }

        // Update display in search input
        const displayText =
            customer.customer_type === "company"
                ? customer.companyname
                : customer.name;
        setSearchQuery(displayText || "");

        // Fill fields
        setCustomerType(customer.customer_type);

        if (customer.customer_type === "company") {
            setCompanyName(customer.companyname || "");
            setAttentionName(customer.name || ""); // contact person
            setClientName("");
        } else {
            setClientName(customer.name || "");
            setCompanyName("");
            setAttentionName("");
        }

        setPhone(customer.p_number || "");
        setEmail(customer.email || "");

        setDropdownOpen(false);
        Keyboard.dismiss();
    };

    return (
        <View className={`p-4 rounded-2xl ${bgCard} shadow-lg border ${borderColor} mb-6`}>
            {/* Header */}
            <View className="flex-row items-center gap-2 mb-4">
                <User size={22} color="#b89d63" />
                <Text className={`text-xl font-bold ${textPrimary}`}>Client Details</Text>
            </View>

            {/* Search Input with Dropdown */}
            <View className="relative mb-4">
                <View className="flex-row items-center">
                    <TextInput
                        placeholder="Search customer by name, company, contact, phone or email..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className={`flex-1 px-4 py-3 rounded-lg text-base ${inputBg} border ${borderColor}`}
                        placeholderTextColor={placeholderColor}
                    />
                    {loading && (
                        <ActivityIndicator className="absolute right-10" color="#b89d63" />
                    )}
                    {searchQuery.length > 0 && !loading && (
                        <TouchableOpacity
                            onPress={() => handleCustomerSelect(null)}
                            className="absolute right-4"
                        >
                            <Text className="text-2xl text-gray-500">×</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Dropdown */}
                {dropdownOpen && (
                    <View
                        className={`absolute top-14 left-0 right-0 z-10 rounded-lg border ${borderColor} overflow-hidden shadow-lg max-h-64 ${
                            isDark ? 'bg-slate-800' : 'bg-white'
                        }`}
                    >
                        {searchResults.length > 0 ? (
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item) => item.id}
                                keyboardShouldPersistTaps="always"
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleCustomerSelect(item)}
                                        className="px-4 py-3 border-b border-gray-300 dark:border-slate-600"
                                    >
                                        <Text className={`font-semibold ${textPrimary}`}>
                                            {item.customer_type === "company" ? item.companyname : item.name}
                                            {item.customer_type === "company" && item.name && ` (Attn: ${item.name})`}
                                        </Text>
                                        <Text className={`text-sm ${textSecondary}`}>
                                            {item.p_number} {item.email ? `• ${item.email}` : ""}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        ) : (
                            <View className="p-4">
                                <Text className={`text-center ${textSecondary}`}>
                                    No customers found.
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </View>

            {/* Toggle */}
            <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-4">
                <TouchableOpacity
                    onPress={() => setCustomerType("individual")}
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        paddingVertical: 11,
                        borderRadius: 12,
                        backgroundColor: customerType === "individual" ? "#2563eb" : (isDark ? "#334155" : "#ffffff"),
                        shadowOpacity: customerType === "individual" ? 0.15 : 0,
                        elevation: customerType === "individual" ? 3 : 0,
                    }}
                >
                    <User size={18} color={customerType === "individual" ? "#b89d63" : (isDark ? "#94a3b8" : "#999999")} />
                    <Text className={`font-semibold text-sm ${customerType === "individual" ? "text-amber-600 dark:text-amber-400" : "text-gray-600 dark:text-gray-400"}`}>
                        Individual
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setCustomerType("company")}
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        paddingVertical: 11,
                        borderRadius: 12,
                        backgroundColor: customerType === "company" ? "#2563eb" : (isDark ? "#334155" : "#ffffff"),
                        shadowOpacity: customerType === "company" ? 0.15 : 0,
                        elevation: customerType === "company" ? 3 : 0,
                    }}
                >
                    <Building2 size={18} color={customerType === "company" ? "#b89d63" : (isDark ? "#94a3b8" : "#999999")} />
                    <Text className={`font-semibold text-sm ${customerType === "company" ? "text-amber-600 dark:text-amber-400" : "text-gray-600 dark:text-gray-400"}`}>
                        Company
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Name Fields */}
            {customerType === "company" ? (
                <>
                    <TextInput
                        placeholder="Company Name"
                        value={companyName}
                        onChangeText={setCompanyName}
                        className={`px-4 py-3 rounded-lg text-base ${inputBg} border ${borderColor} mb-3`}
                        placeholderTextColor={placeholderColor}
                    />
                    <TextInput
                        placeholder="Attention (Contact Person)"
                        value={attentionName}
                        onChangeText={setAttentionName}
                        className={`px-4 py-3 rounded-lg text-base ${inputBg} border ${borderColor} mb-4`}
                        placeholderTextColor={placeholderColor}
                    />
                </>
            ) : (
                <TextInput
                    placeholder="Full Name"
                    value={clientName}
                    onChangeText={setClientName}
                    className={`px-4 py-3 rounded-lg text-base ${inputBg} border ${borderColor} mb-4`}
                    placeholderTextColor={placeholderColor}
                />
            )}

            {/* Phone & Email */}
            <View className="flex-row gap-3 mb-4">
                <TextInput
                    placeholder="Phone Number"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    className={`flex-1 px-4 py-3 rounded-lg text-base ${inputBg} border ${borderColor}`}
                    placeholderTextColor={placeholderColor}
                />
                <TextInput
                    placeholder="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    className={`flex-1 px-4 py-3 rounded-lg text-base ${inputBg} border ${borderColor}`}
                    placeholderTextColor={placeholderColor}
                />
            </View>

            {/* Delivery Address */}
            <TextInput
                placeholder="Delivery Address"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                className={`px-4 py-3 rounded-lg text-base ${inputBg} border ${borderColor} text-left align-top`}
                placeholderTextColor={placeholderColor}
                style={{ textAlignVertical: "top" }}
            />
        </View>
    );
}