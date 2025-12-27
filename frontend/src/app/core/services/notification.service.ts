import { Injectable, signal } from '@angular/core';

export interface Notification {
    id: number;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

export interface Toast {
    id: number;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private toastId = 0;
    private notificationId = 0;

    // Toast notifications (temporary, shown at bottom-right)
    toasts = signal<Toast[]>([]);

    // Persistent notifications (shown in notification panel)
    notifications = signal<Notification[]>([]);
    unreadCount = signal(0);

    // Toast methods
    showSuccess(message: string, duration = 3000): void {
        this.addToast('success', message, duration);
    }

    showError(message: string, duration = 5000): void {
        this.addToast('error', message, duration);
    }

    showWarning(message: string, duration = 4000): void {
        this.addToast('warning', message, duration);
    }

    showInfo(message: string, duration = 3000): void {
        this.addToast('info', message, duration);
    }

    private addToast(type: Toast['type'], message: string, duration: number): void {
        const toast: Toast = {
            id: ++this.toastId,
            type,
            message,
            duration
        };

        this.toasts.update(toasts => [...toasts, toast]);

        // Auto-remove after duration
        setTimeout(() => {
            this.removeToast(toast.id);
        }, duration);
    }

    removeToast(id: number): void {
        this.toasts.update(toasts => toasts.filter(t => t.id !== id));
    }

    // Notification methods
    addNotification(type: Notification['type'], title: string, message: string): void {
        const notification: Notification = {
            id: ++this.notificationId,
            type,
            title,
            message,
            timestamp: new Date(),
            read: false
        };

        this.notifications.update(n => [notification, ...n]);
        this.updateUnreadCount();

        // Also show a toast for immediate feedback
        this.addToast(type, message, 4000);
    }

    // Appointment-specific notifications
    notifyAppointmentCreated(shopName: string, date: string, time: string): void {
        this.addNotification(
            'success',
            'Randevu Oluşturuldu',
            `${shopName} için ${date} tarihinde saat ${time} randevunuz oluşturuldu.`
        );
    }

    notifyAppointmentConfirmed(shopName: string, date: string): void {
        this.addNotification(
            'success',
            'Randevu Onaylandı',
            `${shopName} randevunuz onaylandı! ${date}`
        );
    }

    notifyAppointmentCancelled(shopName: string): void {
        this.addNotification(
            'warning',
            'Randevu İptal Edildi',
            `${shopName} randevunuz iptal edildi.`
        );
    }

    notifyAppointmentReminder(shopName: string, date: string, time: string): void {
        this.addNotification(
            'info',
            'Randevu Hatırlatması',
            `Yarın ${time} saatinde ${shopName} randevunuz var!`
        );
    }

    notifyNewAppointmentForBarber(customerName: string, date: string, time: string): void {
        this.addNotification(
            'info',
            'Yeni Randevu Talebi',
            `${customerName} ${date} tarihinde saat ${time} için randevu almak istiyor.`
        );
    }

    markAsRead(id: number): void {
        this.notifications.update(notifications =>
            notifications.map(n => n.id === id ? { ...n, read: true } : n)
        );
        this.updateUnreadCount();
    }

    markAllAsRead(): void {
        this.notifications.update(notifications =>
            notifications.map(n => ({ ...n, read: true }))
        );
        this.unreadCount.set(0);
    }

    clearAll(): void {
        this.notifications.set([]);
        this.unreadCount.set(0);
    }

    private updateUnreadCount(): void {
        const count = this.notifications().filter(n => !n.read).length;
        this.unreadCount.set(count);
    }
}
