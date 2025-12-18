// hooks/useOrders.ts
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";

export type Order = {
    id: string;
    customer: { id: string; name: string } | null;
    items: { quantity: number; unit_price: number }[];
    delivery_method: string | null;
    expected_delivery_date: string | null;
    status: string;
    created_at: string;
    calculations?: {
        subtotal: number;
        total: number;
        depositAmount: number;
        balance: number;
        taxAmount: number;
        deliveryFee: number;
        discountAmount: number;
        taxInclusive: boolean;
    };
};

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const calculatePayments = (
        rawItems: any[] = [],
        deliveryFee = 0,
        discountAmount = 0,
        depositAmount = 0,
        taxInclusive = false
    ) => {
        const items = Array.isArray(rawItems) ? rawItems : [];

        const subtotal = items.reduce((sum, item) => {
            const qty = Number(item?.quantity) || 0;
            const price = Number(item?.unit_price) || 0;
            return sum + qty * price;
        }, 0);

        const delivery = Number(deliveryFee) || 0;
        const discount = Number(discountAmount) || 0;
        const afterDiscountAndDelivery = subtotal + delivery - discount;

        const TAX_RATE = 0.16;
        let taxAmount = 0;

        if (taxInclusive && afterDiscountAndDelivery > 0) {
            taxAmount = afterDiscountAndDelivery - afterDiscountAndDelivery / (1 + TAX_RATE);
        } else if (!taxInclusive) {
            taxAmount = afterDiscountAndDelivery * TAX_RATE;
        }

        const total = taxInclusive
            ? afterDiscountAndDelivery
            : afterDiscountAndDelivery + taxAmount;

        const safeTotal = Math.max(0, Math.round(total || 0));
        const safeDeposit = Math.min(Math.max(0, Number(depositAmount) || 0), safeTotal);
        const balance = safeTotal - safeDeposit;

        return {
            subtotal: Math.round(subtotal),
            deliveryFee: delivery,
            discountAmount: discount,
            taxAmount: Math.round(taxAmount),
            total: safeTotal,
            depositAmount: Math.round(safeDeposit),
            balance: Math.round(balance),
            taxInclusive,
        };
    };

    const loadOrders = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from("sales")
            .select(`
                id,
                created_at,
                status,
                delivery_method,
                expected_delivery_date,
                deposit,
                total,
                delivery_fee,
                discount_amount,
                tax_inclusive,
                customer:customers(id, name),
                custom_sale_items(quantity, unit_price)
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("LOAD ORDERS ERROR", error);
            setLoading(false);
            return;
        }

        const sales = (data || []) as any[];

        const formatted: Order[] = sales.map((s) => {
            const items = Array.isArray(s.custom_sale_items) ? s.custom_sale_items : [];

            const calculations = calculatePayments(
                items,
                s.delivery_fee,
                s.discount_amount,
                s.deposit,
                s.tax_inclusive ?? false
            );

            return {
                id: s.id,
                customer: s.customer || null,
                items,
                delivery_method: s.delivery_method || null,
                expected_delivery_date: s.expected_delivery_date,
                status: s.status || "ongoing",
                created_at: s.created_at,
                calculations,
            };
        });

        setOrders(formatted);
        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
    }, []);

    return { orders, loading, refetch: loadOrders };  // ← refetch for refreshing after edit/create
}