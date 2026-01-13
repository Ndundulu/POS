import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    useColorScheme,
    ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '@/src/lib/supabaseClient';
import {
    format,
    startOfDay,
    startOfMonth,
    endOfDay,
    subDays,
    addDays,
    addMonths,
    isSameMonth,
} from 'date-fns';

const { width } = Dimensions.get('window');
const chartWidth = width - 64;

type Mode = 'daily' | 'monthly';

type Sale = {
    date: string;
    total: number;
};

const REFRESH_INTERVAL = 60_000; // 1 minute

const SalesOverview = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [mode, setMode] = useState<Mode>('daily');
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [periodOffset, setPeriodOffset] = useState(0);

    const refreshRef = useRef<NodeJS.Timeout | null>(null);

    /* ───────────────── Date Window ───────────────── */

    const baseDate = useMemo(() => {
        return mode === 'daily'
            ? addDays(new Date(), periodOffset * 4)
            : addMonths(new Date(), periodOffset);
    }, [mode, periodOffset]);

    const { fromDate, toDate } = useMemo(() => {
        if (mode === 'daily') {
            const end = endOfDay(baseDate);
            return {
                fromDate: startOfDay(subDays(end, 3)),
                toDate: end,
            };
        }

        const start = startOfMonth(baseDate);
        return {
            fromDate: start,
            toDate: addMonths(start, 1),
        };
    }, [baseDate, mode]);

    /* ───────────────── Fetch Sales ───────────────── */

    const fetchSales = useCallback(
        async (silent = false) => {
            if (!silent) setLoading(true);

            let query = supabase
                .from('sales')
                .select('date, total, status')
                .gte('date', fromDate.toISOString())
                .lte('date', toDate.toISOString())
                .order('date', { ascending: true });

            // ✅ Daily: all sales | Monthly: completed only
            if (mode === 'monthly') {
                query = query.eq('status', 'completed');
            }

            const { data, error } = await query;

            if (!error && data) {
                setSales(data);
            }

            if (!silent) setLoading(false);
        },
        [fromDate, toDate, mode]
    );

    /* Initial + navigation fetch */
    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    /* Silent refresh */
    useEffect(() => {
        refreshRef.current = setInterval(() => {
            fetchSales(true);
        }, REFRESH_INTERVAL);

        return () => {
            if (refreshRef.current) clearInterval(refreshRef.current);
        };
    }, [fetchSales]);

    /* ───────────────── Chart Data ───────────────── */

    const chartData = useMemo(() => {
        if (mode === 'daily') {
            const days = [...Array(4)].map((_, i) =>
                format(subDays(baseDate, 3 - i), 'MMM d')
            );

            const map = new Map<string, number>();
            days.forEach((d) => map.set(d, 0));

            sales.forEach((sale) => {
                const key = format(startOfDay(new Date(sale.date)), 'MMM d');
                if (map.has(key)) {
                    map.set(key, map.get(key)! + Number(sale.total));
                }
            });

            return {
                labels: days,
                values: days.map((d) => map.get(d) ?? 0),
            };
        }

        /* ✅ FIXED MONTHLY (NO EMPTY DATASETS) */
        const monthLabel = format(baseDate, 'MMM yyyy');

        const total = sales.reduce(
            (sum, s) => sum + Number(s.total),
            0
        );

        return {
            labels: [monthLabel],        // ← always exists
            values: [total],             // ← defaults to 0
        };
    }, [sales, mode, baseDate]);

    /* ───────────────── Monthly Comparison ───────────────── */

    const comparison = useMemo(() => {
        if (mode !== 'monthly') return null;

        const thisMonth = sales.reduce(
            (sum, s) => sum + Number(s.total),
            0
        );

        const diffLabel =
            periodOffset === 0 ? 'Current month' : 'Selected month';

        return { thisMonth, diffLabel };
    }, [sales, mode, periodOffset]);

    const isEmpty = chartData.values.every((v) => v === 0);
    const emptyDateLabel = format(baseDate, 'MMMM d, yyyy');

    /* ───────────────── UI ───────────────── */

    return (
        <View
            className={`mx-4 mt-2 mb-6 rounded-3xl p-5 shadow-lg ${
                isDark ? 'bg-[#1C1C1E]' : 'bg-[#A6B9A8]'
            }`}
        >
            <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                Overview
            </Text>

            <Text className={`text-xl font-semibold mt-1 mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                Sales
            </Text>

            {/* Mode */}
            <View className="flex-row gap-2 mb-4">
                {(['daily', 'monthly'] as Mode[]).map((m) => (
                    <TouchableOpacity
                        key={m}
                        onPress={() => {
                            setMode(m);
                            setPeriodOffset(0);
                        }}
                        className={`px-4 py-2 rounded-full ${
                            mode === m ? 'bg-blue-500' : ''
                        }`}
                    >
                        <Text className={`${mode === m ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Chart */}
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : (
                <>
                    <LineChart
                        data={{
                            labels: chartData.labels,
                            datasets: [{ data: chartData.values }],
                        }}
                        width={chartWidth}
                        height={240}
                        fromZero
                        bezier
                        chartConfig={{
                            backgroundColor: 'transparent',
                            backgroundGradientFrom: 'transparent',
                            backgroundGradientTo: 'transparent',
                            decimalPlaces: 0,
                            color: () => '#007AFF',
                            labelColor: () =>
                                isDark ? '#8E8E93' : '#666',
                        }}
                        style={{ borderRadius: 16 }}
                    />

                    {isEmpty && (
                        <Text className={`text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            No sales on {emptyDateLabel}
                        </Text>
                    )}
                </>
            )}

            {/* Navigation */}
            <View className="flex-row justify-between mt-5">
                <TouchableOpacity onPress={() => setPeriodOffset((p) => p - 1)}>
                    <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Previous
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setPeriodOffset((p) => p + 1)}>
                    <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Next
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SalesOverview;
