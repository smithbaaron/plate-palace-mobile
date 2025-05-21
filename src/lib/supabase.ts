
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ihdtsaihembsbdwvwjyh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZHRzYWloZW1ic2Jkd3Z3anloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MzQ0MDksImV4cCI6MjA2MzExMDQwOX0.LnaeWqkyyyolI7MSO-KF5IpST-_s98USjp492r59TLo';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to check if table exists
export const checkIfTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('count')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};
