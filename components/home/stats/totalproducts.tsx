// src/components/home/TotalProducts.tsx
import { useEffect, useState } from "react";
import StatCardBase from "@/components/home/StatCardBase";
import { supabase } from "@/src/lib/supabaseClient"; // make sure your client is set up

export default function TotalProducts() {
    const [totalItems, setTotalItems] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTotalItems() {
            try {
                // Count all rows in the items table
                const { count, error } = await supabase
                    .from("items")
                    .select("*", { count: "exact", head: true }); // head: true avoids fetching actual rows

                if (error) {
                    console.error("Error fetching items count:", error.message);
                } else {
                    setTotalItems(count ?? 0);
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchTotalItems();
    }, []);

    return (
        <StatCardBase
            label="Total items"
            value={loading ? "..." : totalItems?.toString()}

        />
    );
}
