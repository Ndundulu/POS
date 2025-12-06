// app/(settings)/theme.tsx
import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    useColorScheme,
} from "react-native";
import {StatusBar} from "expo-status-bar"
import { LogOut } from "lucide-react-native";
import { supabase } from "@/src/lib/supabaseClient";
import { useRouter } from "expo-router";

export default function ThemeSettingsScreen() {
    const colorScheme = useColorScheme();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace("/(auth)/login");
    };
    // @ts-ignore
    return (
        <SafeAreaView className="flex-1 bg-cream dark:bg-black">
            <StatusBar style={ colorScheme === "dark"? "light" : "dark"} />
            <View className="flex-1 px-6 pt-8 mb-20">
                <TouchableOpacity
                    onPress={handleLogout}
                    activeOpacity={0.8}
                    className="mt-auto mb-10 flex-row items-center justify-center gap-3 bg-red-600 py-4 px-8 rounded-2xl"
                >
                    <LogOut size={22} color="white" />
                    <Text className="text-white text-lg font-semibold">Log Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
