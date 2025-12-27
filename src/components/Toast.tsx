import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const typeStyles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-yellow-900',
    };

    const icons = {
        success: '✓',
        error: '✗',
        info: 'ℹ',
        warning: '⚠',
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-slideInFromRight">
            <div
                className={`
                    ${typeStyles[type]}
                    px-6 py-4 rounded-lg shadow-2xl
                    flex items-center gap-3
                    max-w-md
                `}
            >
                <span className="text-2xl font-bold">{icons[type]}</span>
                <p className="font-semibold">{message}</p>
                <button
                    onClick={onClose}
                    className="ml-2 text-xl hover:opacity-70 transition-opacity"
                    aria-label="Close"
                >
                    ×
                </button>
            </div>
        </div>
    );
}

// Toast container hook for managing multiple toasts
export interface ToastData {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContainerProps {
    toasts: ToastData[];
    onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
}
