import { http, HttpResponse } from 'msw';

const catalog = [
    { id: 'sku1', name: 'شکر ۱۰ کیلویی', price: 580000, unit: 'کیسه', packSize: 1, minQty: 5 },
    { id: 'sku2', name: 'روغن 5L',      price: 720000, unit: 'دبه',  packSize: 1, minQty: 6 },
];

export const handlers = [
    http.get('/api/auth/me', () =>
        HttpResponse.json({ id: 1, name: 'فروشگاه نمونه', tier: 'wholesale' })
    ),
    http.get('/api/catalog/items', () =>
        HttpResponse.json({ items: catalog })
    ),
    http.post('/api/order/preview', async ({ request }) => {
        const { items = [] } = await request.json() as { items: {id:string; qty:number}[] };
        const subtotal = items.reduce((sum, it) => {
            const p = catalog.find(x => x.id === it.id);
            return sum + (p ? p.price * it.qty : 0);
        }, 0);
        return HttpResponse.json({ subtotal, shipping: 0, discount: 0, total: subtotal });
    }),
    http.post('/api/order/submit', async ({ request }) => {
        await request.json();
        return HttpResponse.json({ ok: true, orderId: 'ORD-' + Math.floor(Math.random()*100000) });
    }),
];
