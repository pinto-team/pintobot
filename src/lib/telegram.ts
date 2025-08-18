// src/lib/telegram.ts
import type { Telegram } from '@twa-dev/types';

declare global {
    interface Window { // @ts-ignore
        Telegram?: Telegram }
}

export function getTg() {
    if (typeof window === 'undefined') return undefined;
    return window.Telegram?.WebApp;
}

export function initTelegramUI() {
    const tg = getTg();
    if (!tg) return;
    tg.ready();
    tg.expand?.();
    tg.MainButton.setText('ثبت سفارش');
    tg.MainButton.show();
}
