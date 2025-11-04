import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import {supabase} from "@/src/lib/supabaseClient";
import TodaySale from "@/components/TodaySale";

interface Category {
    id: string;
    name: string;
    created_at: string;
}

export default function App() {
    const [categories, setCategories] = React.useState<Category[]>([]);
    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase.from('categories').select('*');

            if (error) {
                console.error('Supabase error:', error);
                alert(`Error: ${error.message}`);
            } else {
                console.log('Fetched categories:', data);
                setCategories(data);
            }
        };

        fetchCategories();
    }, []);


    return (

        <View style={{ padding: 20 }}>
            <TodaySale/>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Categories:</Text>
            {categories.map((cat) => (
                <Text key={cat.id}>• {cat.name}</Text>
            ))}
        </View>
    );
}
