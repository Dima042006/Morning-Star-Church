import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` — звичайна збірка для хостингу.
// `npm run build:single` — один HTML-файл (для швидкого перегляду).
// BASE_PATH задає GitHub Actions (див. .github/workflows/deploy.yml),
// щоб сайт коректно працював за адресою https://<логін>.github.io/<репозиторій>/
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), ...(process.env.SINGLE ? [viteSingleFile()] : [])],
});
