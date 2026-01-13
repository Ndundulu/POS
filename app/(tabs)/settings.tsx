import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    useColorScheme,
    Alert,
    ScrollView,
    BackHandler,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LogOut, PackageCheck } from "lucide-react-native";
import { supabase } from "@/src/lib/supabaseClient";
import StockDetailAdjust from "@/components/stock/stockAdjustment/StockDetailAdjust";
import StockSearch from "@/components/stock/stockAdjustment/StockSearch";
import { useFocusEffect } from "expo-router";

export default function SettingsScreen() {
    const colorScheme = useColorScheme();

    const [showStockManagement, setShowStockManagement] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    /* 🔙 ANDROID HARDWARE BACK BUTTON LOGIC */
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (showStockManagement && selectedItem) {
                    setSelectedItem(null);
                    return true;
                }
                if (showStockManagement) {
                    setShowStockManagement(false);
                    return true;
                }
                return false;
            };

            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress
            );

            return () => subscription.remove();
        }, [showStockManagement, selectedItem])
    );

    const handleLogout = async () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase.auth.signOut();
                            if (error) throw error;
                        } catch (err: any) {
                            Alert.alert("Error", err?.message || "Failed to log out.");
                        }
                    },
                },
            ]
        );
    };

    if (showStockManagement) {
        if (selectedItem) {
            return (
                <StockDetailAdjust
                    item={selectedItem}
                    onBack={() => setSelectedItem(null)}
                    onSaved={() => {}}
                />
            );
        }

        return (
            <SafeAreaView className="flex-1 bg-cream dark:bg-black">
                <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                <StockSearch onSelectItem={(item) => setSelectedItem(item)} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-cream dark:bg-black">
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

            <View className="flex-1 px-6 pt-8 pb-6">
                <ScrollView
                    className="flex-grow"
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Stock Management Entry */}
                    <TouchableOpacity
                        onPress={() => setShowStockManagement(true)}
                        activeOpacity={0.85}
                        className="flex-row items-center justify-between bg-blue-600 dark:bg-blue-700 py-5 px-6 rounded-2xl mb-8 shadow-md"
                    >
                        <View className="flex-row items-center gap-4">
                            <PackageCheck size={28} color="white" />
                            <View>
                                <Text className="text-white text-lg font-semibold">
                                    Manage Stock
                                </Text>
                                <Text className="text-blue-100 text-sm">
                                    Adjust quantities • View changes
                                </Text>
                            </View>
                        </View>
                        <Text className="text-white text-2xl">→</Text>
                    </TouchableOpacity>

                    {/* Pushes content down so logout stays near bottom */}
                    <View className="flex-grow" />
                </ScrollView>

                {/* Log Out button – pinned near bottom with mb-12 */}
                <TouchableOpacity
                    onPress={handleLogout}
                    activeOpacity={0.8}
                    className="flex-row items-center justify-center gap-3 bg-red-600 py-4 rounded-2xl shadow-lg mt-6 mb-12"
                >
                    <LogOut size={24} color="white" />
                    <Text className="text-white text-lg font-semibold">Log Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}