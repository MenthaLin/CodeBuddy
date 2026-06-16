import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Vite 构建配置 - English Fun Zone
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // 代码分割：按路由拆分 chunk
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'animation': ['framer-motion'],
          'charts': ['recharts'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
