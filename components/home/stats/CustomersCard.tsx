// components/home/stats/CustomersCard.tsx
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ActivityIndicator, View } from 'react-native';
import StatCardBase from '@/components/home/StatCardBase';
import { supabase } from '@/src/lib/supabaseClient';
import CustomersList from '@/components/home/stats/customer';

export default function CustomersCard() {
    const [modalVisible, setModalVisible] = useState(false);
    const [count, setCount] = useState<number | null>(null);

    const fetchCount = async () => {
        try {
            const { count, error } = await supabase
                .from('customers')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;
            setCount(count ?? 0);
        } catch (err) {
            console.log('Customers count fetch failed:', err);
            setCount(0);
        }
    };

    useEffect(() => {
        fetchCount();

        const interval = setInterval(fetchCount, 5000);

        const channel = supabase
            .channel('customers-count')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'customers' },
                () => fetchCount()
            )
            .subscribe();

        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <>
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
                className="w-full"
            >
                {count === null ? (
                    <StatCardBase label="Customers" value="..." loading />
                ) : (
                    <StatCardBase label="Customers" value={count.toString()} />
                )}
            </TouchableOpacity>

            <CustomersList
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </>
    );
}
