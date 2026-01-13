import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import { Alert } from "react-native";
import { supabase } from "@/src/lib/supabaseClient";

type Customer = {
    name: string;
    companyname?: string | null;
    customer_type?: "individual" | "company";
};

type Sale = {
    id: string;
    reference_number: string | null;
    total: number;
    payment_mode: string;
    created_at: string;
    customer: Customer | null;
};

type SaleItem = {
    quantity: number;
    cost: number;
    item: {
        sku?: string | null;
        color?: string | null;
        size?: string | null;
        motif?: string | null;
        product: {
            name: string;
        } | null;
    } | null;
};

function clientName(customer: Customer | null) {
    if (!customer) return "WALK-IN";
    if (customer.customer_type === "company" && customer.companyname) {
        const contact = customer.name && customer.name.trim() ? ` (Contact: ${customer.name.trim()})` : "";
        return `${customer.companyname.toUpperCase()}${contact}`;
    }
    return customer.name.toUpperCase();
}

function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatVariant(item: SaleItem["item"]) {
    if (!item) return "—";
    const parts = [];
    if (item.sku) parts.push(item.sku);
    if (item.color) parts.push(item.color);
    if (item.size) parts.push(item.size);
    if (item.motif) parts.push(item.motif);
    return parts.join(" • ") || "—";
}

function getFunkidzLogoUrl(): string {
    const { data } = supabase.storage.from("receipt-assets").getPublicUrl("funkidz.png");
    return data.publicUrl;
}

export async function exportTodaysSalesToPDF(sales: Sale[]) {
    if (sales.length === 0) {
        Alert.alert("No Data", "There are no sales to export today.");
        return;
    }

    try {
        // Fetch all sale items in parallel
        const saleIds = sales.map(s => s.id);
        const { data: allItems, error } = await supabase
            .from("sale_items")
            .select(`
                sale_id,
                quantity,
                cost,
                item:item_id (
                    sku,
                    color,
                    size,
                    motif,
                    product:product_id (name)
                )
            `)
            .in("sale_id", saleIds);

        if (error) throw error;

        // Group items by sale_id
        const itemsBySale: Record<string, SaleItem[]> = {};
        allItems?.forEach((i: any) => {
            if (!itemsBySale[i.sale_id]) itemsBySale[i.sale_id] = [];
            itemsBySale[i.sale_id].push(i as SaleItem);
        });

        // Calculate grand total
        const grandTotal = sales.reduce((sum, sale) => sum + sale.total, 0);

        const today = new Date().toLocaleDateString("en-KE");
        const logoUrl = getFunkidzLogoUrl();

        // Build sales sections with items
        const salesHtml = sales.map((sale, saleIndex) => {
            const items = itemsBySale[sale.id] || [];
            const itemsRows = items.length > 0
                ? items.map((item, idx) => `
                    <tr>
                        <td style="padding: 8px 6px; font-size: 12.5px;">${idx + 1}</td>
                        <td style="padding: 8px 6px; font-size: 12.5px;">${item.item?.product?.name || "Unknown Item"}</td>
                        <td style="padding: 8px 6px; font-size: 12.5px;">${formatVariant(item.item)}</td>
                        <td style="padding: 8px 6px; text-align: center; font-size: 12.5px;">${item.quantity}</td>
                        <td style="padding: 8px 6px; text-align: right; font-size: 12.5px;">KES ${(item.cost * item.quantity).toLocaleString()}</td>
                    </tr>
                `).join("")
                : `<tr><td colspan="5" style="text-align:center; padding:20px; color:#888;">No items recorded</td></tr>`;

            return `
                <div style="margin-bottom: 40px; page-break-inside: avoid;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #b89d63; margin-bottom: 16px;">
                        <div>
                            <strong style="font-size: 16px; color: #b89d63;">${sale.reference_number ?? "NO-REF"}</strong>
                            <div style="margin-top: 4px; font-size: 14px;">${clientName(sale.customer)} • ${sale.payment_mode.toUpperCase()} • ${formatTime(sale.created_at)}</div>
                        </div>
                        <div style="text-align: right; font-size: 18px; font-weight: bold; color: #283A55;">
                            KES ${sale.total.toLocaleString()}
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f0f0f0;">
                                <th style="text-align: left; padding: 10px 6px; font-size: 13px;">#</th>
                                <th style="text-align: left; padding: 10px 6px; font-size: 13px;">Product</th>
                                <th style="text-align: left; padding: 10px 6px; font-size: 13px;">Variant</th>
                                <th style="text-align: center; padding: 10px 6px; font-size: 13px;">Qty</th>
                                <th style="text-align: right; padding: 10px 6px; font-size: 13px;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRows}
                        </tbody>
                    </table>
                </div>
            `;
        }).join("");

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Georgia, 'Times New Roman', serif; margin: 0; padding: 40px 30px; background: #EDEEDA; color: #283A55; font-size: 14px; line-height: 1.5; }
                    .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #b89d63; }
                    .logo { width: 240px; height: auto; }
                    .title-block { text-align: right; }
                    .title { font-size: 36px; font-weight: bold; color: #b89d63; margin: 0; letter-spacing: 1.5px; }
                    .subtitle { font-size: 20px; color: #283A55; margin: 8px 0 0; }
                    .summary { margin: 30px 0; text-align: right; font-size: 20px; font-weight: bold; color: #283A55; }
                    .footer { margin-top: 60px; text-align: center; color: #888; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div>
                            <img src="${logoUrl}" class="logo" alt="Funkidz Logo" />
                            <div style="margin-top: 16px; font-size: 13px; color: #444; line-height: 1.6;">
                                <strong>Funkidz Limited</strong><br/>
                                Along Isaac Gathanju Road, Lavington<br/>
                                P.O Box 43642 - 00100, Nairobi, Kenya<br/>
                                c.waweru@icloud.com
                            </div>
                        </div>
                        <div class="title-block">
                            <div class="title">TODAY'S SALES REPORT</div>
                            <div class="subtitle">${today} • ${sales.length} Sale${sales.length === 1 ? '' : 's'}</div>
                        </div>
                    </div>

                    ${salesHtml}

                    <div class="summary">
                        GRAND TOTAL: KES ${grandTotal.toLocaleString()}
                    </div>

                    <div class="footer">
                        This is a computer-generated report • Thank you for your business!
                    </div>
                </div>
            </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });

        await shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: `Today's Sales Report - ${today}`,
        });
    } catch (error: any) {
        console.error("PDF Export Error:", error);
        Alert.alert("Export Failed", "Could not generate PDF: " + (error.message || "Unknown error"));
    }
}