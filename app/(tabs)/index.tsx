// app/(tabs)/index.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text} from 'react-native';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import TodaysSales from '@/components/home/stats/TodaysSales';
import TotalProducts from '@/components/home/stats/totalproducts';
import LowStock from '@/components/home/stats/lowStock';
import CustomersCard from '@/components/home/stats/CustomersCard';
import Orders from '@/components/home/stats/orders';
import CustomerInteraction from '@/components/home/stats/customerInteraction';
import SalesOverview from '@/components/home/salesOverview';
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [userName, setUserName] = useState('User');
    const insets = useSafeAreaInsets()

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-black' : 'bg-[#EDEEDA]'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 40,
                }}            >
                {/* Greeting */}
                <View className="px-4 mb-2 mt-8">
                    <Text
                        className={`text-3xl font-bold tracking-tight ${
                            isDark ? 'text-white' : 'text-black'
                        }`}
                    >
                        Hello, {userName}!
                    </Text>
                </View>

                {/* Top Row: Today's Sales + Total Products */}
                <View className="flex-row justify-between px-4 mb-3">
                    <View className="flex-1 mx-1">
                        <TodaysSales />
                    </View>
                    <View className="flex-1 mx-1">
                        <CustomerInteraction />
                    </View>
                </View>

                {/* Middle Row: Low Stock + Customers */}
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

                {/* Bottom Row: Orders + Customer Interaction */}
                <View className="flex-row justify-between px-4 mb-6">
                    <View className="flex-1 mx-1">
                        <LowStock />
                    </View>
                    <View className="flex-1 mx-1">
                        <TotalProducts />
                    </View>
                </View>

                {/* Extra space for tab bar */}
            </ScrollView>
        </SafeAreaView>
    );
}