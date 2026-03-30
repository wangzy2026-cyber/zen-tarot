import { createClient } from '@supabase/supabase-js';

// 这里的 URL 必须非常干净，不能有末尾的斜杠
const supabaseUrl = 'https://ybragvmvirddqfotqxig.supabase.co'; 

// 重点：请务必确保引号里只有那一串 sb_publishable... 开头的字母和数字，没有任何空格！
const supabaseAnonKey = '这里填入你复制的那串Key'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
