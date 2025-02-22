import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: '/',  // Add this line
  plugins: [react()],
  outDir: 'dist', // Ensure this is set correctly
  assetsDir: 'assets', // Ensure this is set
  rollupOptions: {
    output: {
      // Ensure proper JavaScript file handling
      entryFileNames: 'assets/[name].[hash].js',
      chunkFileNames: 'assets/[name].[hash].js',
      assetFileNames: 'assets/[name].[hash].[ext]'
    }
  }
})
