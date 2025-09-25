import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: 'https://controle-de-comissao-opal.vercel.app/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
