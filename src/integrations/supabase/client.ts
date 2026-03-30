import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ybragvmvirddqfotqxig.supabase.co';

// 将刚才 Copy 的内容贴在下面的单引号之间
const supabaseAnonKey = 'sb_publishable_Kf3_0KgYnDX62_Tk6QbrBA_3zeEIjm9'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
