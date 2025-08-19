// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    const useHttpsHmr = process.env.VITE_HMR_CLIENT_PORT === '443';
    return {
        plugins: [react()],
        server: {
            host: true,
            port: 5173,
            strictPort: true,
            // فقط وقتی روی سرور پشت HTTPS هستی این را ست کن
            hmr: useHttpsHmr ? { clientPort: 443 } : undefined,
            // origin را هم فقط روی سرور تنظیم کن:
            origin: process.env.VITE_ORIGIN || undefined,
        },
    };
});
