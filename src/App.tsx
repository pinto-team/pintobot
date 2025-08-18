import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from './api/client';
import { getTg, initTelegramUI } from './lib/telegram';

type Item = { id: string; name: string; price: number; unit: string; packSize: number; minQty: number };

export default function App() {
    const { data } = useQuery({
        queryKey: ['catalog'],
        queryFn: async () => (await api.get<{ items: Item[] }>('/catalog/items')).data.items,
    });

    const [cart, setCart] = useState<Record<string, number>>({});
    const total = useMemo(
        () => (data ?? []).reduce((s, p) => s + (cart[p.id] ?? 0) * p.price, 0),
        [data, cart]
    );

    // آماده‌سازی UI تلگرام (نمایش MainButton و ... )
    useEffect(() => { initTelegramUI(); }, []);

    // کلیک روی MainButton
    useEffect(() => {
        const webApp = getTg();
        if (!webApp) return;

        const onClick = async () => {
            const items = Object.entries(cart)
                .filter(([, q]) => q > 0)
                .map(([id, qty]) => ({ id, qty }));

            const { data: preview } = await api.post('/order/preview', { items });

            webApp.HapticFeedback?.notificationOccurred('success');
            webApp.sendData?.(JSON.stringify({ action: 'order_submit', items, preview }));

            const { data: res } = await api.post('/order/submit', { items });
            alert(`ثبت شد: ${res.orderId} | مجموع: ${Number(preview.total).toLocaleString()} ریال`);
        };

        webApp.MainButton.onClick(onClick);
        return () => {
            webApp.MainButton.offClick(onClick);
        };
    }, [cart]);

    if (!data) return <div style={{ padding: 16 }}>در حال بارگذاری…</div>;

    return (
        <div style={{ padding: 16 }}>
            <h1 style={{ marginBottom: 12 }}>مینی‌اپ عمده‌فروشی</h1>

            {data.map((p) => (
                <div key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                        <strong>{p.name}</strong>
                        <div>حداقل سفارش: {p.minQty} — قیمت: {p.price.toLocaleString()} ریال</div>
                    </div>

                    <button
                        onClick={() =>
                            setCart((c) => ({
                                ...c,
                                [p.id]: Math.max((c[p.id] ?? 0) + p.packSize, p.minQty),
                            }))
                        }
                    >
                        +
                    </button>

                    <span style={{ width: 40, textAlign: 'center' }}>{cart[p.id] ?? 0}</span>

                    <button
                        onClick={() =>
                            setCart((c) => ({
                                ...c,
                                [p.id]: Math.max((c[p.id] ?? 0) - p.packSize, 0),
                            }))
                        }
                    >
                        -
                    </button>
                </div>
            ))}

            <div style={{ marginTop: 12 }}>مجموع: {total.toLocaleString()} ریال</div>
        </div>
    );
}
