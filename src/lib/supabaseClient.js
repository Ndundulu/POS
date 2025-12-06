import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your existing credentials
const SUPABASE_URL = 'https://kduufecrutpgimahozaa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdXVmZWNydXRwZ2ltYWhvemFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjAzNTksImV4cCI6MjA3Nzc5NjM1OX0.6g0KrF79p_gd3TFTBXPdpb7jhAbScTvnQtlKh5JMWXc';

// Create client with persistent auth storage
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // React Native doesn't use URLs
    },
});
