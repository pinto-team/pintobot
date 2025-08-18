import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient();

async function prepare() {
    if (import.meta.env.DEV) {
        const { worker } = await import('./mocks/browser');
        await worker.start({ serviceWorker: { url: '/mockServiceWorker.js' } });
    }
}
prepare().then(() => {
    ReactDOM.createRoot(document.getElementById('root')!)
        .render(
            <StrictMode>
                <QueryClientProvider client={qc}>
                    <App />
                </QueryClientProvider>
            </StrictMode>
        );
});
