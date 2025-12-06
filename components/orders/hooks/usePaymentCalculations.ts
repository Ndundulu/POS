// hooks/usePaymentCalculations.ts
import { useMemo } from "react";

export type PaymentCalculations = {
    subtotal: number;
    deliveryFee: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
    depositAmount: number;
    balance: number;
    taxInclusive: boolean;
};

export function usePaymentCalculations({
                                           items,
                                           deliveryFee = 0,
                                           discountAmount = 0,        // always in KES
                                           depositAmount = 0,         // always in KES
                                           taxInclusive = false,
                                       }: {
    items: { qty: number; unitCost: number }[] | { quantity: number; unit_price: number }[];
    deliveryFee?: number;
    discountAmount?: number;
    depositAmount?: number;
    taxInclusive?: boolean;
}): PaymentCalculations {
    return useMemo(() => {
        // Normalize item format
        const normalizedItems = items.map(item => ({
            qty: "qty" in item ? item.qty : item.quantity,
            unitCost: "unitCost" in item ? item.unitCost : item.unit_price,
        }));

        const subtotal = normalizedItems.reduce((sum, i) => sum + i.qty * i.unitCost, 0);
        const delivery = Number(deliveryFee) || 0;
        const afterDiscountAndDelivery = subtotal + delivery - (discountAmount || 0);

        const TAX_RATE = 0.16;
        let taxAmount = 0;

        if (taxInclusive) {
            taxAmount = afterDiscountAndDelivery - afterDiscountAndDelivery / (1 + TAX_RATE);
        } else {
            taxAmount = afterDiscountAndDelivery * TAX_RATE;
        }

        const total = taxInclusive
            ? afterDiscountAndDelivery
            : afterDiscountAndDelivery + taxAmount;

        const finalDeposit = Math.min(depositAmount || 0, total);
        const balance = total - finalDeposit;

        return {
            subtotal,
            deliveryFee: delivery,
            discountAmount: discountAmount || 0,
            taxAmount: Math.round(taxAmount),
            total: Math.round(total),
            depositAmount: finalDeposit,
            balance: Math.round(balance),
            taxInclusive,
        };
    }, [items, deliveryFee, discountAmount, depositAmount, taxInclusive]);
}