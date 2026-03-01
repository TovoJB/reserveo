export interface Event {
    id: string | number;
    title: string;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    date: string;      // YYYY-MM-DD (Exact event date)
    reservationStartDate: string; // YYYY-MM-DD (When reservations open)
    participants?: string[];
    meetingLink?: string;
    location?: string;
    description?: string;
    timezone?: string;
    status?: 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
    reservationData?: any;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEventDTO {
    title: string;
    startTime: string;
    endTime: string;
    date: string;
    reservationStartDate: string;
    location?: string;
    description?: string;
    participants?: string[];
}
