// components/orders/sections/ClientSection.tsx
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { User, Building2 } from "lucide-react-native";
import { useColorScheme } from "react-native";

export default function ClientSection(props: any) {
    const {
        customerType,
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

    const containerBg = isDark ? '#0f172a' : '#EDEEDA';        // backgroundDark vs cream
    const toggleActiveBg = '#2563eb';                          // navy (works great in both modes)
    const toggleInactiveBg = isDark ? '#334155' : '#ffffff';   // cardDark vs cardLight
    const textActiveColor = '#ffffff';
    const textInactiveColor = isDark ? '#bbbbbb' : '#555555';   // textDarkSecondary vs textLightSecondary
    const iconInactiveColor = isDark ? '#94a3b8' : '#999999';

    return (
        <View className={`p-6 rounded-2xl ${bgCard} shadow-lg border ${borderColor} mb-8`}>
            {/* Header */}
            <View className="flex-row items-center gap-3 mb-6">
                <User size={26} color="#b89d63" />
                <Text className={`text-2xl font-bold ${textPrimary}`}>Client Details</Text>
            </View>

            {/* Individual / Company Toggle */}
            <View style={{
                flexDirection: 'row',
                borderRadius: 12,
                justifyContent: 'space-between',
                padding: 6,
                gap: 16,
            }} >
                <TouchableOpacity
                    onPress={() => setCustomerType("individual")}
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        paddingVertical: 16,
                        borderRadius: 10,
                        backgroundColor: customerType === "individual" ? toggleActiveBg : toggleInactiveBg,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: customerType === "individual" ? (isDark ? 0.4 : 0.25) : 0,
                        shadowRadius: 8,
                        elevation: customerType === "individual" ? 8 : 0,
                    }}
                >
                    <User size={22} color={customerType === "individual" ? textActiveColor : iconInactiveColor} />
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '700',
                        color: customerType === "individual" ? textActiveColor : textInactiveColor,
                    }}>
                        Individual
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setCustomerType("company")}
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        paddingVertical: 16,
                        borderRadius: 10,
                        backgroundColor: customerType === "company" ? toggleActiveBg : toggleInactiveBg,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: customerType === "company" ? (isDark ? 0.4 : 0.25) : 0,
                        shadowRadius: 8,
                        elevation: customerType === "company" ? 8 : 0,
                    }}
                >
                    <Building2 size={22} color={customerType === "company" ? textActiveColor : iconInactiveColor} />
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '700',
                        color: customerType === "company" ? textActiveColor : textInactiveColor,
                    }}>
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
                        className={`px-5 py-4 rounded-xl text-base font-medium ${inputBg} border ${borderColor} mb-4`}
                        placeholderTextColor={placeholderColor}
                    />
                    <TextInput
                        placeholder="Attention (Contact Person)"
                        value={attentionName}
                        onChangeText={setAttentionName}
                        className={`px-5 py-4 rounded-xl text-base font-medium ${inputBg} border ${borderColor} mb-6`}
                        placeholderTextColor={placeholderColor}
                    />
                </>
            ) : (
                <TextInput
                    placeholder="Full Name"
                    value={clientName}
                    onChangeText={setClientName}
                    className={`px-5 py-4 rounded-xl text-base font-medium ${inputBg} border ${borderColor} mb-6`}
                    placeholderTextColor={placeholderColor}
                />
            )}

            {/* Phone & Email Row */}
            <View className="flex-row gap-4 mb-6">
                <TextInput
                    placeholder="Phone Number"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    className={`flex-1 px-5 py-4 rounded-xl text-base font-medium ${inputBg} border ${borderColor}`}
                    placeholderTextColor={placeholderColor}
                />
                <TextInput
                    placeholder="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    className={`flex-1 px-5 py-4 rounded-xl text-base font-medium ${inputBg} border ${borderColor}`}
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
                className={`px-5 py-4 rounded-xl text-base font-medium ${inputBg} border ${borderColor} text-left align-top`}
                placeholderTextColor={placeholderColor}
                style={{ textAlignVertical: "top" }}
            />
        </View>
    );
}