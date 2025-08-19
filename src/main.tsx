// src/main.tsx
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient();
const rootEl = document.getElementById('root')!;

function renderApp() {
    ReactDOM.createRoot(rootEl).render(
        <StrictMode>
            <QueryClientProvider client={qc}>
                <App />
            </QueryClientProvider>
        </StrictMode>
    );
}

const enableMock = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === '1';
console.log('[MSW] enableMock =', enableMock);

(async () => {
    if (enableMock) {
        try {
            console.log('[MSW] starting worker…');
            const { worker } = await import('./mocks/browser');
            await worker.start({ serviceWorker: { url: '/mockServiceWorker.js' } });
            console.log('[MSW] worker started');
        } catch (e) {
            console.warn('[MSW] failed to start:', e);
            // حتی اگر MSW بالا نیامد، اپ را رندر کن تا خطاها را ببینی
        }
    }
    renderApp();
})();
