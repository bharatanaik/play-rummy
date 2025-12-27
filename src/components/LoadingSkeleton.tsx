interface LoadingSkeletonProps {
    className?: string;
    count?: number;
    variant?: 'text' | 'card' | 'avatar' | 'button';
}

export default function LoadingSkeleton({ 
    className = '', 
    count = 1, 
    variant = 'text' 
}: LoadingSkeletonProps) {
    const getVariantClasses = () => {
        switch (variant) {
            case 'text':
                return 'h-4 bg-gray-200 rounded';
            case 'card':
                return 'h-32 bg-gray-200 rounded-lg';
            case 'avatar':
                return 'w-16 h-16 bg-gray-200 rounded-full';
            case 'button':
                return 'h-10 bg-gray-200 rounded-lg';
            default:
                return 'h-4 bg-gray-200 rounded';
        }
    };

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`animate-pulse ${getVariantClasses()} ${className}`}
                />
            ))}
        </>
    );
}

// Specific loading components for common use cases
export function CardSkeleton() {
    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
            </div>
            <div className="h-3 bg-gray-200 rounded mb-2" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <tr className="border-b border-gray-100">
            <td className="py-3 px-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            </td>
            <td className="py-3 px-3">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
            </td>
            <td className="py-3 px-3">
                <div className="h-4 bg-gray-200 rounded w-12 mx-auto animate-pulse" />
            </td>
            <td className="py-3 px-3">
                <div className="h-4 bg-gray-200 rounded w-12 mx-auto animate-pulse" />
            </td>
            <td className="py-3 px-3">
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse" />
            </td>
            <td className="py-3 px-3">
                <div className="h-4 bg-gray-200 rounded w-12 mx-auto animate-pulse" />
            </td>
        </tr>
    );
}

export function PlayerCardSkeleton() {
    return (
        <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 animate-pulse">
            <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-gray-200 rounded-full" />
                <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
        </div>
    );
}
