// For BBIDemo Direct Request
const CLIENT_ID = '13efe0a32c8d4ff9';
const CLIENT_SECRET = 'd9ba75294dc62d32';
const API_URL = 'http://bbidemo.pesapal.com:5060/api';

export const initiateDirect = async (data) => {
    const res = await fetch(`${API_URL}/sale`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}` // Basic Auth
        },
        body: JSON.stringify({
            txntype: "sale",
            timestamp: new Date().toISOString(),
            reference: data.reference,
            Method: "card",
            customerdetails: { phone: "0712345678" },
            paymentdetails: { currency: "KES", amount: data.amount.toString(), taxamount: "0" },
            terminal_sn: data.terminal_sn
        }),
    });

    const result = await res.json();
    if (result.status !== 'PENDING') throw new Error(result.message);
    return result.transaction_id; // Poll /status later
};