// Vite config — removed @base44/vite-plugin because it hijacks auth
// and redirects users to Base44's login page instead of ours
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [
    // Only using the standard React plugin, no Base44 plugin
    react(),
  ],
  resolve: {
    alias: {
      // Allows us to use @/ as a shortcut for the src/ folder
      '@': path.resolve(__dirname, './src'),
    },
  },
});
