/**
 * lib/supabase.ts - Supabase 客户端单例
 * English Fun Zone
 *
 * 当 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 未配置时（如 GitHub Pages 纯静态部署），
 * 自动降级为游客模式——所有 localStorage 功能正常，仅同步/登录功能不可用。
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** 是否已配置 Supabase */
export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);

let supabaseInstance: SupabaseClient | null = null;

if (hasSupabase) {
  supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
} else {
  console.info('🔒 Supabase 未配置，运行在纯游客模式（GitHub Pages 静态部署）');
}

/**
 * Supabase 客户端单例
 * 未配置时返回 null，调用方需判断
 */
export const supabase = supabaseInstance;

export default supabase;
