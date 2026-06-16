const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 缺少 Supabase 配置，请检查 .env 文件');
  process.exit(1);
}

// Supabase 客户端（RLS 策略已设为宽松模式，anon key 即可操作）
const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);

module.exports = { supabaseAdmin };
