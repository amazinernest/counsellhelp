// Paystack payment configuration and utilities

// Paystack public key from environment
export const PAYSTACK_PUBLIC_KEY = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// Session pricing configuration (in kobo - 100 kobo = ₦1)
export const SESSION_PRICE_KOBO = 500000; // ₦5,000
export const SESSION_PRICE_NAIRA = 5000;
export const COMMISSION_PERCENTAGE = 20; // 20% platform commission
export const COMMISSION_KOBO = SESSION_PRICE_KOBO * (COMMISSION_PERCENTAGE / 100); // ₦1,000
export const COUNSELOR_PAYOUT_KOBO = SESSION_PRICE_KOBO - COMMISSION_KOBO; // ₦4,000

// Format amount in Naira
export function formatNaira(amountKobo: number): string {
    const naira = amountKobo / 100;
    return `₦${naira.toLocaleString('en-NG')}`;
}

// Format amount from Naira number
export function formatNairaFromNumber(naira: number): string {
    return `₦${naira.toLocaleString('en-NG')}`;
}

// Generate unique payment reference
export function generatePaymentReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CH-${timestamp}-${random}`;
}

// Paystack channels available for payment
export const PAYSTACK_CHANNELS: ('card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer')[] = [
    'card',
    'bank',
    'ussd',
    'bank_transfer',
];

// Session status types
export type SessionStatus = 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded';

// Session interface
export interface Session {
    id: string;
    client_id: string;
    counselor_id: string;
    conversation_id: string | null;
    scheduled_at: string | null;
    status: SessionStatus;
    amount: number;
    commission: number;
    counselor_payout: number;
    payment_reference: string;
    paystack_reference: string | null;
    paid_at: string | null;
    completed_at: string | null;
    created_at: string;
}
