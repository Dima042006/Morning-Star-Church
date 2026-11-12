import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Збірка кладеться в public/bible сайту церкви → https://dima042006.github.io/Morning-Star-Church/bible/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: '../../public/bible', emptyOutDir: true },
});
