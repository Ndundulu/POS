// app/(tabs)/_layout.tsx
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useContext } from 'react';
import { ThemeContext } from '@/src/lib/ThemeProvider';

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
    const { isDark } = useContext(ThemeContext);
    const tint = isDark ? '#0A84FF' : '#007AFF';
    const bg = isDark ? '#1c1c1e' : '#ffffff';

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: tint,
                tabBarInactiveTintColor: isDark ? '#888' : '#666',
                tabBarButton: HapticTab,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 25,
                    left: 20,
                    right: 20,
                    height: 70,
                    borderRadius: 35,
                    backgroundColor: bg,
                    borderTopWidth: 0,
                    elevation: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.15,
                    shadowRadius: 16,
                    paddingBottom: 0,
                    paddingTop: 8,
                },
                tabBarItemStyle: { padding: 5 },
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
                tabBarBackground: () => (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: bg, borderRadius: 35 }]} />
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={26} color={color} />,
                }}
            />
            <Tabs.Screen
                name="pos"
                options={{
                    title: 'POS',
                    tabBarIcon: ({ color }) => <Ionicons name="card" size={26} color={color} />,
                }}
            />
            <Tabs.Screen
                name="stock"
                options={{
                    title: 'stock',
                    tabBarIcon: ({ color }) => <Ionicons name="cube" size={26} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <Ionicons name="settings" size={26} color={color} />,
                }}
            />
        </Tabs>
    );
}