import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,           // برای دسترسی از بیرون
        strictPort: true,
        port: 5173,
        hmr: {
            clientPort: 443,    // چون از پشت https میای
        },
        origin: 'https://pintosupport.ir',
    },
});
