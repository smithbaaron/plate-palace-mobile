
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ihdtsaihembsbdwvwjyh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZHRzYWloZW1ic2Jkd3Z3anloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MzQ0MDksImV4cCI6MjA2MzExMDQwOX0.LnaeWqkyyyolI7MSO-KF5IpST-_s98USjp492r59TLo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
