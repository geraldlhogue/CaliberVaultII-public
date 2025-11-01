import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://okmekurgdidqnvblnakj.supabase.co';
const supabaseKey = 'sb_publishable_DCv6ykEtF2aG0p_w_1vtmw_aykVYQyI';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };