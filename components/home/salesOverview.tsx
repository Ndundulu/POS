// components/home/salesOverview.tsx
import React from 'react';
import {View, Text, TouchableOpacity, Dimensions, useColorScheme} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');
const chartWidth = width - 64; // 32px padding total (16px each side → px-8)

const SalesOverview = () => {
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark';
    return (
        <View
            className={`mx-4 mt-2 mb-6 rounded-3xl p-5 shadow-lg ${
                isDark
                    ? 'bg-[#1C1C1E] shadow-black/50'
                    : 'bg-[#A6B9A8] shadow-black/20'
            }`}
            style={{ elevation: 8 }}
        >
            {/* Header */}
            <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                Overview
            </Text>
            <Text className={`text-xl font-semibold mt-1 mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
                Sales
            </Text>

            {/* Segment Control + Date */}
            <View className="flex-row items-center mb-6 gap-2">
                <TouchableOpacity className="bg-blue-500 px-4 py-2.5 rounded-full">
                    <Text className="text-white text-sm font-semibold">Daily</Text>
                </TouchableOpacity>

                <TouchableOpacity className="px-4 py-2.5">
                    <Text className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Monthly
                    </Text>
                </TouchableOpacity>

                <Text className={`ml-auto text-base font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    April 23
                </Text>
            </View>

            {/* Line Chart */}
            <LineChart
                data={{
                    labels: ['Apr 1', '2', '3', '4', '5', '6', '7'],
                    datasets: [{ data: [2200, 2800, 3200, 1800, 3500, 2400, 1700] }],
                }}
                width={chartWidth}
                height={240}
                yAxisInterval={1000}
                chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    decimalPlaces: 0,
                    color: () => '#007AFF',
                    labelColor: () => (isDark ? '#8E8E93' : '#666666'),
                    propsForDots: {
                        r: '6',
                        strokeWidth: '3',
                        stroke: '#007AFF',
                    },
                    propsForBackgroundLines: {
                        stroke: isDark ? '#2C2C2E' : '#E5E5EA',
                    },
                    propsForLabels: {
                        fontSize: 11,
                    },
                }}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
                formatYLabel={(value) =>
                    value === '0' ? '0' : `${(parseInt(value) / 1000).toFixed(0)}k`
                }
                fromZero
            />

            {/* Navigation */}
            <View className="flex-row justify-between mt-4">
                <Text className={`text-base font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Previous
                </Text>
                <Text className={`text-base font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Next
                </Text>
            </View>
        </View>
    );
};

export default SalesOverview;
