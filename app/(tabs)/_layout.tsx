// app/(tabs)/layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Platform, ColorSchemeName } from "react-native";
import * as Haptics from "expo-haptics";
import { useKeyboard } from "@/src/hooks/useKeyboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

function HapticTab(props: any) {
    return (
        <TouchableOpacity
            {...props}
            onPress={(e) => {
                Haptics.selectionAsync();
                props?.onPress?.(e);
            }}
        />
    );
}

export default function TabLayout() {
    const colorScheme = useColorScheme(); // 'light' | 'dark' | null
    const isDark = colorScheme === "dark";
    const { isKeyboardVisible } = useKeyboard();
    const insets = useSafeAreaInsets();

    const isCompact = isKeyboardVisible;
    const extraBottomPadding = Platform.OS === "android" ? insets.bottom : 0;

    return (
        <>
            <StatusBar style={isDark ? "light" : "dark"} />

            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarButton: HapticTab,

                    tabBarActiveTintColor: isDark ? "#60a5fa" : "#283A55",
                    tabBarInactiveTintColor: isDark ? "#666666" : "#8E8E93",

                    tabBarStyle: {
                        backgroundColor: isDark ? "#000000" : "#FAF9F6", // cream ≈ #FAF9F6 or adjust to your exact cream
                        borderTopColor: isDark ? "#38383A" : "#D4D4D4",
                        borderTopWidth: 0.5,
                        height: (isCompact ? 50 : 60) + extraBottomPadding,
                        paddingBottom: isCompact
                            ? 6 + extraBottomPadding
                            : Platform.OS === "ios"
                                ? 20
                                : 8 + extraBottomPadding,
                        paddingTop: 8,
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                    },

                    tabBarLabelStyle: {
                        fontSize: 10.5,
                        fontWeight: "600",
                        marginTop: 2,
                        opacity: isCompact ? 0 : 1,
                        height: isCompact ? 0 : "auto",
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="pos"
                    options={{
                        title: "POS",
                        tabBarIcon: ({ color }) => <Ionicons name="card" size={24} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="stock"
                    options={{
                        title: "Stock",
                        tabBarIcon: ({ color }) => <Ionicons name="cube" size={24} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: "Settings",
                        tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
                    }}
                />
            </Tabs>
        </>
    );
}