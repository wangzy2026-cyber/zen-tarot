import { createClient } from '@supabase/supabase-js';

// 这是你的 Supabase 项目地址
const supabaseUrl = 'https://ybragvmvirddqfotqxig.supabase.co'; 

// 把下面引号里的内容替换为你刚才复制的那串 sb_publishable_... 字符串
const supabaseAnonKey = '这里填入你刚才复制的长字符串'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
