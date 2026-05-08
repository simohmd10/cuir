import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js'],
          motion: ['framer-motion'],
          admin: [
            './src/pages/admin/Dashboard',
            './src/pages/admin/Products',
            './src/pages/admin/Orders',
            './src/pages/admin/Customers',
            './src/pages/admin/Categories',
            './src/pages/admin/Coupons',
            './src/pages/admin/Reviews',
            './src/pages/admin/Settings',
          ],
        },
      },
    },
  },
});
