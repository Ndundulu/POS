import { createClient } from '@supabase/supabase-js'



// Replace with your own Supabase credentials from your dashboard
const SUPABASE_URL = 'https://kduufecrutpgimahozaa.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdXVmZWNydXRwZ2ltYWhvemFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjAzNTksImV4cCI6MjA3Nzc5NjM1OX0.6g0KrF79p_gd3TFTBXPdpb7jhAbScTvnQtlKh5JMWXc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
