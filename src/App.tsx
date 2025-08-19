import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from './api/client';
import { getTg, initTelegramUI } from './lib/telegram';

type Item = { id: string; name: string; price: number; unit: string; packSize: number; minQty: number };

export default function App() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['catalog'],
        queryFn: async () => {
            const res = await api.get<{ items: Item[] }>('/catalog/items');
            return res.data.items;
        },
        retry: 0, // برای دیباگ، فعلاً retry نکن
    });

    useEffect(() => { if (isError) console.error('[catalog] error:', error); }, [isError, error]);

    const [cart, setCart] = useState<Record<string, number>>({});
    const total = useMemo(() => (data ?? []).reduce((s, p) => s + (cart[p.id] ?? 0) * p.price, 0), [data, cart]);

    useEffect(() => { initTelegramUI(); }, []);

    useEffect(() => {
        const tg = getTg();
        if (!tg) return;
        if (total > 0) {
            tg.MainButton.show();
            tg.MainButton.setText(`ثبت سفارش • ${total.toLocaleString()} ریال`);
        } else {
            tg.MainButton.hide();
        }
    }, [total]);

    if (isLoading) return <div style={{ padding: 16 }}>در حال بارگذاری…</div>;
    if (isError) return <div style={{ padding: 16, color: 'crimson' }}>خطا در دریافت کاتالوگ. کنسول را چک کن.</div>;
    if (!data?.length) return <div style={{ padding: 16 }}>کالایی پیدا نشد.</div>;

    return (
        <div style={{ padding: 16 }}>
            <h1 style={{ marginBottom: 12 }}>مینی‌اپ عمده‌فروشی</h1>
            {data.map(p => (
                <div key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                        <strong>{p.name}</strong>
                        <div>حداقل سفارش: {p.minQty} — قیمت: {p.price.toLocaleString()} ریال</div>
                    </div>
                    <button onClick={() =>
                        setCart(c => ({ ...c, [p.id]: Math.max((c[p.id] ?? 0) + p.packSize, p.minQty) }))
                    }>+</button>
                    <span style={{ width: 40, textAlign: 'center' }}>{cart[p.id] ?? 0}</span>
                    <button onClick={() =>
                        setCart(c => ({ ...c, [p.id]: Math.max((c[p.id] ?? 0) - p.packSize, 0) }))
                    }>-</button>
                </div>
            ))}
            <div style={{ marginTop: 12 }}>مجموع: {total.toLocaleString()} ریال</div>
        </div>
    );
}
