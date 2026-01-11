
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base: "./"' ensures assets are loaded via relative paths, 
  // preventing 404 errors on Netlify/GitHub Pages subdirectories.
  base: './',
});
