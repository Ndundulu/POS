// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/src/lib/supabaseClient';

import TodaysSales from '@/components/home/stats/TodaysSales';
import TotalProducts from '@/components/home/stats/totalproducts';
import LowStock from '@/components/home/stats/lowStock';
import CustomersCard from '@/components/home/stats/CustomersCard';
import Orders from '@/components/home/stats/orders';
import CustomerInteraction from '@/components/home/stats/customerInteraction';
import SalesOverview from '@/components/home/salesOverview';

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) {
                    console.error("Auth error:", error);
                }
                setUser(user);
            } catch (err) {
                console.error("Failed to fetch user:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return (
            <SafeAreaView className={`flex-1 justify-center items-center ${isDark ? 'bg-black' : 'bg-[#EDEEDA]'}`}>
                <Text className="text-lg text-gray-500">Loading...</Text>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView className={`flex-1 justify-center items-center ${isDark ? 'bg-black' : 'bg-[#EDEEDA]'}`}>
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    Not authenticated
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-[#EDEEDA]'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 40,
                }}
            >
                {/* Greeting */}
                <View className="px-4 mb-2 mt-8">
                    <Text
                        className={`text-3xl font-bold tracking-tight ${
                            isDark ? 'text-white' : 'text-black'
                        }`}
                    >
                        Hello, {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}!
                    </Text>
                </View>

                {/* Top Row: Today's Sales + Customer Interaction */}
                <View className="flex-row justify-between px-4 mb-3">
                    <View className="flex-1 mx-1">
                        <TodaysSales />
                    </View>
                    <View className="flex-1 mx-1">
                        <CustomerInteraction />
                    </View>
                </View>

                {/* Middle Row: Orders + Customers */}
                <View className="flex-row justify-between px-4 mb-3">
                    <View className="flex-1 mx-1">
                        <Orders />
                    </View>
                    <View className="flex-1 mx-1">
                        <CustomersCard />
                    </View>
                </View>

                {/* Sales Overview Chart */}
                <View className="my-4">
                    <SalesOverview />
                </View>

                {/* Bottom Row: Low Stock + Total Products */}
                <View className="flex-row justify-between px-4 mb-6">
                    <View className="flex-1 mx-1">
                        <LowStock />
                    </View>
                    <View className="flex-1 mx-1">
                        <TotalProducts />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}