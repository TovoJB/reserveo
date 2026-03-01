export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD' | 'ORANGE_MONEY' | 'MVOLA' | 'AIRTEL_MONEY' | 'OTHER';

export interface Payment {
    id: string | number;
    amount: number;
    currency: string;
    status: PaymentStatus;
    method: PaymentMethod;
    reference?: string; // External transaction ID

    // Relationships
    reservationId?: string | number;
    customerId?: string | number;

    // Date
    createdAt: string;
    updatedAt: string;
}

export interface CreatePaymentDTO {
    amount: number;
    currency: string;
    method: PaymentMethod;
    reservationId?: string | number;
    customerId?: string | number;
    reference?: string;
    status?: PaymentStatus;
}
