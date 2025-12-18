// components/orders/PDFReceipt.tsx
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { moveAsync } from "expo-file-system/legacy"; // ← Fixed: Use legacy import
import { Alert } from "react-native";
import { supabase } from "@/src/lib/supabaseClient";

// ───── Calculation Logic (same as app) ─────
function calculateOrderPayments(order: any) {
    const items = Array.isArray(order.custom_sale_items) ? order.custom_sale_items : [];
    const subtotal = items.reduce((sum: number, i: any) => (Number(i.quantity) || 0) * (Number(i.unit_price) || 0) + sum, 0);

    const delivery = Number(order.delivery_fee) || 0;
    const discount = Number(order.discount_amount) || 0;
    const afterDiscountAndDelivery = subtotal + delivery - discount;

    const TAX_RATE = 0.16;
    let taxAmount = 0;
    const taxInclusive = order.tax_inclusive === true;

    if (taxInclusive && afterDiscountAndDelivery > 0) {
        taxAmount = afterDiscountAndDelivery - afterDiscountAndDelivery / (1 + TAX_RATE);
    } else if (!taxInclusive) {
        taxAmount = afterDiscountAndDelivery * TAX_RATE;
    }

    const total = taxInclusive ? afterDiscountAndDelivery : afterDiscountAndDelivery + taxAmount;
    const safeTotal = Math.max(0, Math.round(total));
    const deposit = Math.min(Math.max(0, Number(order.deposit) || 0), safeTotal);
    const balance = safeTotal - deposit;

    return {
        subtotal: Math.round(subtotal),
        deliveryFee: delivery,
        discountAmount: discount,
        taxAmount: Math.round(taxAmount),
        total: safeTotal,
        depositAmount: Math.round(deposit),
        balance: Math.round(balance),
        taxInclusive,
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

function generateReceiptNumber(orderId: string | number): string {
    return `#FK${String(orderId).padStart(3, "0")}`;
}

// Sanitize filename (remove invalid characters)
function sanitizeFilename(str: string): string {
    return str
        .trim()
        .replace(/[\/\\|:*?"<>]/g, "_")
        .replace(/\s+/g, " ")
        .substring(0, 100);
}

// ───── PDF Generation with Custom Filename ─────
export async function shareOrderAsPDF(order: any) {
    try {
        const logoUrl = getAnjiruLogoUrl();
        const anjiruLogo = getFunkidzLogoUrl();
        const calc = calculateOrderPayments(order);
        const receiptNumberFull = generateReceiptNumber(order.id); // e.g., #FK0012
        const receiptPrefix = receiptNumberFull.replace("#", "").substring(0, 6); // FK0012

        const customer = order.customer || order.customers || {};
        const rawCustomerName = customer.companyname || customer.name || "Walk-in Customer";
        const customerName = sanitizeFilename(rawCustomerName);
        // 🔹 Fetch payment methods used for this order
        // 🔹 Resolve payment methods (sales + payments)
                const paymentMethodsSet = new Set<string>();

        // 1. First deposit payment mode from sales
                if (order.payment_mode) {
                    paymentMethodsSet.add(order.payment_mode);
                }

        // 2. Subsequent payments
                const { data: payments } = await supabase
                    .from("payments")
                    .select("payment_method")
                    .eq("sale_id", order.id);

                payments?.forEach(p => {
                    if (p.payment_method) {
                        paymentMethodsSet.add(p.payment_method);
                    }
                });

                const formattedPaymentMethods =
                    paymentMethodsSet.size > 0
                        ? Array.from(paymentMethodsSet)
                            .map(m =>
                                m === "m-pesa"
                                    ? "M-Pesa"
                                    : m.charAt(0).toUpperCase() + m.slice(1)
                            )
                            .join(" + ")
                        : "—";


        // Custom filename
        const customFilename = `${customerName} - Order Receipt - ${receiptPrefix}.pdf`;

        const itemsHtml = (order.custom_sale_items || [])
            .map(
                (item: any, index: number) => `
          <tr>
            <td style="padding: 9px 0; color:#555;">${index + 1}</td>
            <td style="padding: 9px 0;">${item.description || "Custom Item"}</td>
            <td style="text-align:center;">${item.quantity || 0}</td>
            <td style="text-align:right;">KES ${(Number(item.unit_price) || 0).toLocaleString()}</td>
            <td style="text-align:right; font-weight:500;">KES ${(Number(item.quantity || 0) * Number(item.unit_price || 0)).toLocaleString()}</td>
          </tr>
        `
            )
            .join("");

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
          .title { font-size: 28px; font-weight: bold; color: #b89d63; margin: 0 0 6px 0; letter-spacing: 1px; }
          .receipt-no { font-size: 15px; font-weight: bold; color: #b89d63; margin: 4px 0; }
          .kra { font-size: 13px; color: #555; }

          .company-address {
             font-size: 13px; line-height: 1.6; color: #444;
          }

          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 30px 0; 
          }
          th { 
            background: #283A55; 
            color: white; 
            padding: 13px 10px;
            font-size: 12.8px; 
            text-align: left; 
          }
          th:nth-child(1) { width: 45px; text-align: center; }
          th:nth-child(3) { text-align: center; }
          th:nth-child(4), th:nth-child(5) { text-align: right; }
          
          td { 
            padding: 14px 10px;
            border-bottom: 1px solid #ddd; 
            vertical-align: top;
          }
          td:nth-child(1) { text-align: center; color: #555; font-weight: 500; }
          td:nth-child(2) { width: 100%; }
          td:nth-child(3) { text-align: center; }
          td:nth-child(4), td:nth-child(5) { 
            text-align: right; 
            font-weight: 500; 
            white-space: nowrap;
            letter-spacing: 0.5px;
          }

          .summary {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            float: right;
            width: 420px;
            margin-top: 30px;
            padding: 0;
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          .summary-line { display: flex; justify-content: space-between; margin: 9px 0; font-size: 14.5px; }
          .total { font-size: 19px; font-weight: bold; color: #283A55; border-top: 2px solid #b89d63; padding-top: 11px; margin-top: 11px; }
          .balance-due { color: #9b2c2c; font-size: 21px; font-weight: bold; margin-top: 15px; border-top: 2px solid #9b2c2c; padding-top: 11px; }

          .payment-details { clear: both; margin-top: 50px; padding: 20px; background: #f5f5f5; border-radius: 8px; font-size: 12.8px; line-height: 1.7; }
          .payment-details h3 { margin: 0 0 12px 0; color: #283A55; font-size: 15px; }

          .terms { margin-top: 40px; font-size: 11.8px; color: #666; line-height: 1.6; font-style: italic; }
          .footer { margin-top: 50px; text-align: center; color: #888; font-size: 11.5px; }
          .anjiru-logo { height: 80px; margin-top: 8px; }
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
              <div class="title">ORDER RECEIPT</div>
              <div class="receipt-no">${receiptNumberFull}</div>
              <div class="kra">KRA PIN: P051332961B</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: 30px 0; gap: 40px; font-size: 13.8px; color: #444;">
            <div style="flex: 2;">
              <strong style="color:#283A55; font-size:15px;">Bill To:</strong><br/>
              ${customerName}<br/>
              ${customer.attention_name ? `${customer.attention_name}<br/>` : ""}
              ${customer.p_number || customer.phone ? `${customer.p_number || customer.phone}<br/>` : ""}
              ${customer.address ? `${customer.address.replace(/\n/g, '<br/>')}` : `<br/><em style="color:#888;">Delivery address not set</em>`}
            </div>

            <div style="flex: 1; text-align: right;">
              <div style="margin-bottom: 12px;">
                <strong style="color:#283A55; font-size:15px;">Order Date</strong><br/>
                ${new Date(order.created_at || Date.now()).toLocaleDateString("en-KE")}
              </div>
              <div>
                <strong style="color:#b89d63; font-size:15px;">Due Delivery</strong><br/>
                ${order.expected_delivery_date
            ? new Date(order.expected_delivery_date).toLocaleDateString("en-KE")
            : "To be confirmed"}
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th style="text-align:center;">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || `<tr><td colspan="5" style="text-align:center; color:#888; padding:20px;">No items</td></tr>`}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-line"><span>Subtotal</span><span>KES ${calc.subtotal.toLocaleString()}</span></div>
            ${calc.deliveryFee > 0 ? `<div class="summary-line"><span>Delivery Fee</span><span>+ KES ${calc.deliveryFee.toLocaleString()}</span></div>` : ""}
            ${calc.discountAmount > 0 ? `<div class="summary-line" style="color:#9b2c2c;"><span>Discount</span><span>− KES ${calc.discountAmount.toLocaleString()}</span></div>` : ""}
            <div class="summary-line"><span>VAT 16% (${calc.taxInclusive ? "Inclusive" : "Exclusive"})</span>
              <span>${calc.taxInclusive ? "KES" : "+ KES"} ${calc.taxAmount.toLocaleString()}</span>
            </div>
            <div class="total"><span>Total Amount: </span><span>KES ${calc.total.toLocaleString()}</span></div>
            <div class="summary-line">
              <span style="color:#166534;">
                ${formattedPaymentMethods} • Deposit Paid
              </span>
              <span style="color:#166534;">
                − KES ${calc.depositAmount.toLocaleString()}
              </span>
            </div>
            ${calc.balance > 0 ? `<div class="balance-due"><span>Balance Due</span><span>KES ${calc.balance.toLocaleString()}</span></div>` : ""}
          </div>
          <div style="clear:both;"></div><br/>

          <div class="payment-details">
            <h3>Payment Details</h3>
            <strong>Bank Transfer:</strong><br/>
            Bank Name: CFC STANBIC BANK • Branch: CHIROMO • Account Name: FUNKIDZ LIMITED<br/>
            Branch Code: 007 • Swift Code: SBICKENX • Account Number: 0100003791108<br/><br/>
            <strong>M-Pesa:</strong><br/>
            Pay Bill Number: 600100 • Account Number: 0100003791108
          </div>

          <div class="terms">
            <strong>Terms & Conditions:</strong><br/>
            • 70% deposit required prior to production.<br/>
            • No claims regarding price, quantity, quality, measurement or weight will be accepted once services have been rendered.<br/>
            • Services once rendered are non-refundable.
          </div>

          <div class="footer">
            Thank you for your business! This is a computer-generated receipt.<br/>
            <img src="${anjiruLogo}" class="anjiru-logo" alt="Powered by Anjiru" />
          </div>
        </div>
      </body>
      </html>
    `;

        // Generate the PDF
        const { uri } = await Print.printToFileAsync({ html });

        // Build new path with custom filename (same directory)
        const directory = uri.substring(0, uri.lastIndexOf("/") + 1);
        const newUri = `${directory}${customFilename}`;

        // Rename using legacy moveAsync
        await moveAsync({
            from: uri,
            to: newUri,
        });

        // Share the renamed PDF
        await Sharing.shareAsync(newUri, {
            mimeType: "application/pdf",
            dialogTitle: `Receipt ${receiptNumberFull}`,
        });
    } catch (error: any) {
        console.error("PDF Error:", error);
        Alert.alert("Error", "Failed to generate receipt: " + error.message);
    }
}