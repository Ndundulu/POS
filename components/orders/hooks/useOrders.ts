import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";

export function useOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from("sales")
            .select(`
                *,
                customer:customers(*),
                custom_items:custom_sale_items(*)
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.log("LOAD ORDERS ERROR", error);
            setLoading(false);
            return;
        }

        const formatted = data.map((s) => ({
            id: s.id,
            customer: s.customer,
            items: s.custom_items || [],
            total: s.total || 0,
            deposit: s.deposit || 0,
            balance: (s.total || 0) - (s.deposit || 0),
            delivery_method: s.delivery_method,
            expected_delivery_date: s.expected_delivery_date,
            status: s.status || "ongoing",
            created_at: s.created_at,
        }));

        setOrders(formatted);
        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
    }, []);

    return { orders, loading, refresh: loadOrders };
}
