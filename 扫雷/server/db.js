const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabaseAdmin = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  未配置 Supabase，排行榜/记录功能不可用（游戏仍可正常游玩）');
  console.warn('   如需使用完整功能，请复制 .env.example 为 .env 并填入配置');
} else {
  // Supabase 客户端（RLS 策略已设为宽松模式，anon key 即可操作）
  supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);
}

module.exports = { supabaseAdmin };
