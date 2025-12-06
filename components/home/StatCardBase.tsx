import {View, Text, Platform} from 'react-native';
import { useContext } from 'react';
import {useColorScheme} from "react-native";

type Props = {
    label: string;
    value: string;
    large?: boolean;
};

export default function StatCardBase({ label, value, large }: Props) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <View
            className={`flex-1 rounded-2xl p-4 justify-between
        ${isDark ? 'bg-[#1C1C1E]' : 'bg-[#A6B9A8]'}
        ${large ? 'shadow-lg' : 'shadow-md'}
        shadow-black/10
        ${Platform.OS === 'android' ? 'elevation-6' : 'shadow-offset-[0_2] shadow-opacity-12 shadow-radius-[10]'}
      `}
        >
            <Text
                className={`text-sm font-medium ${
                    isDark ? 'text-[#8E8E93]' : 'text-[#666666]'
                }`}
            >
                {label}
            </Text>

            <Text
                className={`text-right font-extrabold tracking-tight ${
                    large ? 'text-2xl' : 'text-4xl'
                } ${isDark ? 'text-white' : 'text-black'}`}
            >
                {value}
            </Text>
        </View>
    );
}