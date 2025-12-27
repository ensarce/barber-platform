export interface Appointment {
    id: number;
    customerId: number;
    customerName: string;
    barberProfileId: number;
    barberShopName: string;
    serviceId: number;
    serviceName: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    totalPrice: number;
    notes?: string;
    createdAt: string;
    canReview: boolean;
}

export interface CreateAppointmentRequest {
    barberProfileId: number;
    serviceId: number;
    appointmentDate: string;
    startTime: string;
    notes?: string;
}

export interface TimeSlot {
    startTime: string;
    endTime: string;
    available: boolean;
}

export interface AvailableSlotsResponse {
    date: string;
    slots: TimeSlot[];
}

export interface Review {
    id: number;
    customerId: number;
    customerName: string;
    barberProfileId: number;
    appointmentId: number;
    rating: number;
    comment?: string;
    isVisible: boolean;
    createdAt: string;
}

export interface CreateReviewRequest {
    appointmentId: number;
    rating: number;
    comment?: string;
}
