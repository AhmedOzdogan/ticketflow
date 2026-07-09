import React from "react";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const statusStyles: Record<string, string> = {
    pending: "border-yellow-400 bg-yellow-100 text-yellow-800",
    approved: "border-green-400 bg-green-100 text-green-800",
    rejected: "border-red-400 bg-red-100 text-red-800",
    default: "border-gray-400 bg-gray-100 text-gray-800",
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
    const normalizedStatus = status.toLowerCase();
    const styles = statusStyles[normalizedStatus] || statusStyles.default;

    return (
        <span
            className={`inline-block rounded border px-2 py-1 text-xs font-semibold uppercase ${styles} ${className}`}
        >
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

export default StatusBadge;
