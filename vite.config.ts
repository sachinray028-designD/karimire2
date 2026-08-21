import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react-router'],
          // Supabase client
          'vendor-supabase': ['@supabase/supabase-js'],
          // Markdown renderer (only needed on article pages)
          'vendor-markdown': ['react-markdown', 'rehype-raw', 'remark-gfm'],
        },
      },
    },
  },
});
