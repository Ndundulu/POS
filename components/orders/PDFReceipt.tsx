// components/orders/PDFReceipt.tsx
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { supabase } from "@/src/lib/supabaseClient";

function getLogoUrlForOrder(): string {
    const { data } = supabase.storage
        .from("receipt-assets")
        .getPublicUrl("funkidz.png");
    return data.publicUrl;
}

// Helper: Calculate correct VAT amount based on tax_inclusive
function calculateVAT(order: any): number {
    const TAX_RATE = 0.16;
    const itemsTotal = order.custom_sale_items.reduce(
        (sum: number, i: any) => sum + i.quantity * i.unit_price,
        0
    );
    const baseAmount = itemsTotal + (order.delivery_fee || 0);

    if (order.tax_inclusive) {
        // VAT was included → extract it
        return Math.round(baseAmount - baseAmount / (1 + TAX_RATE));
    } else {
        // VAT was added on top
        return Math.round(baseAmount * TAX_RATE);
    }
}

function calculateSubtotalExclVAT(order: any): number {
    const itemsTotal = order.custom_sale_items.reduce(
        (sum: number, i: any) => sum + i.quantity * i.unit_price,
        0
    );
    return itemsTotal + (order.delivery_fee || 0);
}

export async function shareOrderAsPDF(order: any) {
    try {
        const logoUrl = getLogoUrlForOrder();

        const vatAmount = calculateVAT(order);
        const subtotalExclVAT = calculateSubtotalExclVAT(order);
        const isInclusive = order.tax_inclusive === true;

        const itemsHtml = order.custom_sale_items
            ?.map(
                (item: any) => `
          <tr>
            <td style="padding: 10px 0;">${item.description || "Item"}</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">KES ${(item.unit_price ?? 0).toLocaleString()}</td>
            <td style="text-align:right;">KES ${(item.quantity * item.unit_price).toLocaleString()}</td>
          </tr>
        `
            )
            .join("") || "";

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px 20px; color: #333; margin: 0; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { width: 280px; height: auto; max-height: 100px; object-fit: contain; margin-bottom: 15px; }
            .title { font-size: 28px; font-weight: bold; color: #1e40af; margin: 10px 0; }
            .info { margin: 25px 0; line-height: 1.8; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            th { background: #1e40af; color: white; padding: 14px 8px; font-size: 15px; }
            td { padding: 12px 8px; border-bottom: 1px solid #eee; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total-section { margin-top: 30px; font-size: 18px; text-align: right; width: 100%; }
            .total-line { margin: 10px 0; display: flex; justify-content: space-between; max-width: 400px; margin-left: auto; }
            .total-line strong { font-size: 19px; }
            .balance { font-size: 23px; font-weight: bold; color: #dc2626; }
            .footer { margin-top: 50px; text-align: center; color: #666; font-size: 14px; }
            .vat-line { color: ${isInclusive ? "#16a34a" : "#ea580c"}; font-weight: 600; }
          </style>
        </head>
        <body>

          <div class="header">
            <img src="${logoUrl}" class="logo" alt="Logo" />
            <div class="title">ORDER RECEIPT</div>
          </div>

          <div class="info">
            <strong>Client:</strong> ${order.customers.companyname || order.customers.name}<br/>
            ${order.customers.attention_name ? `Attn: ${order.customers.attention_name}<br/>` : ""}
            <strong>Phone:</strong> ${order.customers.p_number || "N/A"}<br/>
            <strong>Date:</strong> ${new Date().toLocaleDateString("en-KE")}<br/>
            <strong>Delivery:</strong> ${order.delivery_method} on 
            ${new Date(order.expected_delivery_date).toLocaleDateString("en-KE")}
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Payment Summary with VAT -->
            <div class="total-section">
              <div class="total-line">
                <span>Subtotal (Items)</span>
                <span>KES ${subtotalExclVAT.toLocaleString()}</span>
              </div>
            
              ${order.delivery_fee > 0 ? `
              <div class="total-line">
                <span>Delivery Fee</span>
                <span>+ KES ${Number(order.delivery_fee).toLocaleString()}</span>
              </div>` : ""}
            
              ${order.discount_amount > 0 ? `
              <div class="total-line" style="color: #dc2626;">
                <span>Discount</span>
                <span>− KES ${Number(order.discount_amount).toLocaleString()}</span>
              </div>` : ""}
            
              <div class="total-line vat-line">
                <span>VAT 16% (${isInclusive ? "Inclusive" : "Exclusive"})</span>
                <strong>
                  ${isInclusive
                        ? `KES ${vatAmount.toLocaleString()} (included)`
                        : `+ KES ${vatAmount.toLocaleString()}`
                    }
                </strong>
              </div>
            
              <div class="total-line" style="border-top: 2px solid #333; padding-top: 15px; margin-top: 15px; font-size: 21px;">
                <strong>Total Amount</strong>
                <strong>KES ${order.total.toLocaleString()}</strong>
              </div>
            
              <div class="total-line">
                <span>Deposit Paid</span>
                <span style="color: #16a34a;">− KES ${order.deposit.toLocaleString()}</span>
              </div>
            
              <div class="total-line balance" style="border-top: 2px solid #dc2626; padding-top: 15px; margin-top: 15px;">
                <strong>Balance Due</strong>
                <strong>KES ${Math.max(0, order.balance).toLocaleString()}</strong>
              </div>
            </div>

          <div class="footer">
            Thank you for your business!<br/>
            Powered by <strong>Anjiru</strong>
          </div>
        </body>
      </html>
    `;

        const { uri } = await Print.printToFileAsync({ html });

        await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: "Share Order Receipt",
            UTI: "com.adobe.pdf",
        });

    } catch (error: any) {
        console.error("PDF Error:", error);
        Alert.alert("Error", "Could not generate receipt: " + error.message);
    }
}


