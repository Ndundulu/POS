// components/home/StatCardBase.tsx

import { View, Text, Platform } from 'react-native';
import { useColorScheme } from "react-native";
import React from "react"; // Add this

type Props = {
    label: string;
    value?: string;            // Make optional
    children?: React.ReactNode; // Add support for custom content
    large?: boolean;
};

export default function StatCardBase({ label, value, children, large }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <View
            className={`rounded-2xl p-4 min-h-28 justify-between
        ${isDark ? 'bg-[#1C1C1E]' : 'bg-[#A6B9A8]'}
        ${large ? 'shadow-lg' : 'shadow-md'}
        shadow-black/10
        ${Platform.OS === 'android' ? 'elevation-6' : ''}
    `}
        >
            <Text className={`text-sm font-medium ${isDark ? 'text-[#8E8E93]' : 'text-[#666666]'}`}>
                {label}
            </Text>

            {children ? (
                <View className="justify-end">  {/* This ensures content aligns to bottom */}
                    {children}
                </View>
            ) : (
                <Text className={`text-right font-extrabold tracking-tight ${
                    large ? 'text-2xl' : 'text-4xl'
                } ${isDark ? 'text-white' : 'text-black'}`}>
                    {value || "0"}
                </Text>
            )}
        </View>
    );
}