import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { moveAsync } from "expo-file-system/legacy";
import { Alert } from "react-native";
import { supabase } from "@/src/lib/supabaseClient";

type Customer = {
    name: string;
    companyname?: string | null;
    email?: string | null;
    customer_type?: "individual" | "company";
    phone?: string | null;
    p_number?: string | null;
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

type Sale = {
    id: string;
    reference_number: string | null;
    total: number;
    payment_mode: string;
    created_at: string;
    discount_amount: number;
    tax_inclusive: boolean;
    customer: Customer | null;
};

// ───── Calculation Logic (same as in modal) ─────
function calculateSalePayments(sale: Sale, items: SaleItem[]) {
    const subtotal = items.reduce(
        (sum, i) => sum + i.quantity * i.cost,
        0
    );

    const discount = sale.discount_amount || 0;
    const afterDiscount = subtotal - discount;

    const TAX_RATE = 0.16;
    let taxAmount = 0;

    if (sale.tax_inclusive) {
        taxAmount = afterDiscount - afterDiscount / (1 + TAX_RATE);
    } else {
        taxAmount = afterDiscount * TAX_RATE;
    }

    const total = sale.tax_inclusive ? afterDiscount : afterDiscount + taxAmount;

    return {
        subtotal: Math.round(subtotal),
        discountAmount: discount,
        taxAmount: Math.round(taxAmount),
        total: Math.round(total),
        taxInclusive: sale.tax_inclusive,
    };
}

// ───── URLs ─────
function getFunkidzLogoUrl(): string {
    const { data } = supabase.storage.from("receipt-assets").getPublicUrl("funkidz.png");
    return data.publicUrl;
}

function getAnjiruLogoUrl(): string {
    const { data } = supabase.storage.from("receipt-assets").getPublicUrl("AnjiruLogo.png");
    return data.publicUrl;
}

function generateReceiptNumber(saleId: string | number): string {
    return `#FK${String(saleId).padStart(4, "0")}`;
}

function sanitizeFilename(str: string): string {
    return str
        .trim()
        .replace(/[\/\\|:*?"<>]/g, "_")
        .replace(/\s+/g, " ")
        .substring(0, 100);
}

function formatPaymentMode(mode: string): string {
    return mode === "m-pesa" ? "M-Pesa" : mode.charAt(0).toUpperCase() + mode.slice(1);
}

// ───── Main Function: Generate & Share PDF Receipt for a Sale ─────
export async function shareSaleAsPDF(sale: Sale, items: SaleItem[]) {
    try {
        const logoUrl = getFunkidzLogoUrl();
        const anjiruLogo = getAnjiruLogoUrl();
        const calc = calculateSalePayments(sale, items);

        const receiptNumberFull = sale.reference_number ?? generateReceiptNumber(sale.id);
        const receiptPrefix = receiptNumberFull.replace("#", "").substring(0, 8);

        const customer = sale.customer;
        const rawCustomerName =
            customer?.customer_type === "company" && customer.companyname
                ? customer.companyname
                : customer?.name || "Walk-in Customer";

        const customerName = sanitizeFilename(rawCustomerName.toUpperCase());
        const contactLine = customer?.customer_type === "company" && customer.name
            ? `Contact: ${customer.name}`
            : "";

        const phone = customer?.p_number || customer?.phone || "";

        // Custom filename
        const customFilename = `${customerName} - Receipt - ${receiptPrefix}.pdf`;

        // Items HTML
        const itemsHtml = items.length > 0
            ? items.map((item, index) => {
                const productName = item.item?.product?.name || "Unknown Item";
                const variant = [
                    item.item?.sku,
                    item.item?.color,
                    item.item?.size,
                    item.item?.motif,
                ]
                    .filter(Boolean)
                    .join(" • ") || "";

                const description = variant ? `${productName}<br/><span style="color:#666; font-size:12px;">${variant}</span>` : productName;

                return `
              <tr>
                <td style="padding: 9px 0; color:#555;">${index + 1}</td>
                <td style="padding: 9px 0;">${description}</td>
                <td style="text-align:center;">${item.quantity}</td>
                <td style="text-align:right;">KES ${item.cost.toLocaleString()}</td>
                <td style="text-align:right; font-weight:500;">KES ${(item.quantity * item.cost).toLocaleString()}</td>
              </tr>
            `;
            }).join("")
            : `<tr><td colspan="5" style="text-align:center; color:#888; padding:20px;">No items recorded</td></tr>`;

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Georgia, 'Times New Roman', serif; margin: 0; padding: 40px 30px; background: #EDEEDA; color: #283A55; font-size: 13.5px; line-height: 1.5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }

          .header {
            display: flex; justify-content: space-between; align-items: flex-start;
            margin-bottom: 30px; padding-bottom: 18px; border-bottom: 2px solid #b89d63;
          }
          .logo { width: 240px; height: auto; }
          .title-block { text-align: right; }
          .title { font-size: 32px; font-weight: bold; color: #b89d63; margin: 0 0 8px 0; letter-spacing: 1.5px; }
          .receipt-no { font-size: 18px; font-weight: bold; color: #b89d63; margin: 6px 0; }
          .kra { font-size: 13px; color: #555; }

          .company-address {
             font-size: 13px; line-height: 1.6; color: #444;
          }

          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          th { background: #283A55; color: white; padding: 13px 10px; font-size: 12.8px; text-align: left; }
          th:nth-child(1) { width: 45px; text-align: center; }
          th:nth-child(3) { text-align: center; }
          th:nth-child(4), th:nth-child(5) { text-align: right; }
          
          td { padding: 14px 10px; border-bottom: 1px solid #ddd; vertical-align: top; }
          td:nth-child(1) { text-align: center; color: #555; font-weight: 500; }
          td:nth-child(3) { text-align: center; }
          td:nth-child(4), td:nth-child(5) { text-align: right; font-weight: 500; white-space: nowrap; letter-spacing: 0.5px; }

          .summary {
            float: right; width: 420px; margin-top: 30px; font-size: 14.5px;
          }
          .summary-line { display: flex; justify-content: space-between; margin: 9px 0; }
          .total { font-size: 21px; font-weight: bold; color: #283A55; border-top: 2px solid #b89d63; padding-top: 12px; margin-top: 12px; }

          .payment-info { clear: both; margin-top: 50px; padding: 20px; background: #f5f5f5; border-radius: 8px; font-size: 13px; line-height: 1.7; }
          .payment-info h3 { margin: 0 0 12px 0; color: #283A55; font-size: 15px; }

          .footer { margin-top: 60px; text-align: center; color: #888; font-size: 11.5px; }
          .anjiru-logo { height: 200px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <img src="${logoUrl}" class="logo" alt="Funkidz Logo" />
              <div class="company-address">
                <strong>Funkidz Limited</strong><br/>
                Along Isaac Gathanju Road, Lavington<br/>
                P.O Box 43642 - 00100<br/>
                Nairobi, Kenya<br/>
                c.waweru@icloud.com
              </div>
            </div>

            <div class="title-block">
              <div class="title">RECEIPT</div>
              <div class="receipt-no">${receiptNumberFull}</div>
              <div class="kra">KRA PIN: P051332961B</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: 30px 0; gap: 40px; font-size: 13.8px; color: #444;">
            <div style="flex: 2;">
              <strong style="color:#283A55; font-size:15px;">Sold To:</strong><br/>
              ${rawCustomerName.toUpperCase()}<br/>
              ${contactLine ? `${contactLine}<br/>` : ""}
              ${phone ? `${phone}<br/>` : ""}
              ${customer?.email ? `${customer.email}` : ""}
            </div>

            <div style="flex: 1; text-align: right;">
              <div style="margin-bottom: 12px;">
                <strong style="color:#283A55; font-size:15px;">Date</strong><br/>
                ${new Date(sale.created_at).toLocaleDateString("en-KE")}
              </div>
              <div>
                <strong style="color:#283A55; font-size:15px;">Time</strong><br/>
                ${new Date(sale.created_at).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th style="text-align:center;">Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-line"><span>Subtotal</span><span>KES ${calc.subtotal.toLocaleString()}</span></div>
            ${calc.discountAmount > 0 ? `<div class="summary-line" style="color:#9b2c2c;"><span>Discount</span><span>− KES ${calc.discountAmount.toLocaleString()}</span></div>` : ""}
            <div class="summary-line"><span>VAT 16% (${calc.taxInclusive ? "Inclusive" : "Exclusive"})</span>
              <span>${calc.taxInclusive ? "KES" : "+ KES"} ${calc.taxAmount.toLocaleString()}</span>
            </div>
            <div class="total"><span>Total Paid</span><span>KES ${calc.total.toLocaleString()}</span></div>
            <div class="summary-line" style="margin-top: 12px; color:#166534; font-weight:600;">
              <span>Paid via ${formatPaymentMode(sale.payment_mode)}</span>
              <span>KES ${calc.total.toLocaleString()}</span>
            </div>
          </div>

          <div style="clear:both;"></div>

          <div class="payment-info">
            <h3>Payment Received With Thanks</h3>
            Thank you for shopping with us!<br/>
            For inquiries: c.waweru@icloud.com
          </div>

          <div class="footer">
            This is a computer-generated receipt. No signature required.<br/>
            <img src="${anjiruLogo}" class="anjiru-logo" alt="Powered by Anjiru" />
          </div>
        </div>
      </body>
      </html>
    `;

        const { uri } = await Print.printToFileAsync({ html });

        const directory = uri.substring(0, uri.lastIndexOf("/") + 1);
        const newUri = `${directory}${customFilename}`;

        await moveAsync({ from: uri, to: newUri });

        await Sharing.shareAsync(newUri, {
            mimeType: "application/pdf",
            dialogTitle: `Receipt ${receiptNumberFull}`,
        });
    } catch (error: any) {
        console.error("PDF Receipt Error:", error);
        Alert.alert("Error", "Failed to generate receipt: " + (error.message || "Unknown error"));
    }
}