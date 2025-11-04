// TabLayout.tsx
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'react-native';

// ──────  Haptic tab button  ──────
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

// ──────  Colors (add tabBackground)  ──────
const Colors = {
    light: {
        tint: '#007AFF',
        tabBackground: '#ffffff',   // ← added
    },
    dark: {
        tint: '#0A84FF',
        tabBackground: '#1c1c1e',   // ← added
    },
};

export default function TabLayout() {
    const colorScheme = useColorScheme();

    const theme = Colors[colorScheme ?? 'light'];

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.tint,
                tabBarButton: HapticTab,

                // ──────  Elevated tab bar  ──────
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    height: 60,
                    borderRadius: 25,
                    backgroundColor: theme.tabBackground,
                    borderTopWidth: 0,
                    // Android
                    elevation: 8,
                    // iOS
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                },

                tabBarItemStyle: { padding: 5 },
                tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },

                // Transparent background so the shadow is visible
                tabBarBackground: () => (
                    <View style={StyleSheet.absoluteFillObject} />
                ),

            }}
        >
            {/* ──────  Screens  ────── */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="home" size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pos"
                options={{
                    title: 'POS',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="card" size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stock"
                options={{
                    title: 'Stock',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="cube" size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="settings" size={28} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}