import React from "react";

interface Props {
    children: React.ReactNode;
    loading?: boolean;
    empty?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
}

export default function AdminTable({
    children,
    loading,
    empty,
    emptyTitle,
    emptyDescription,
}: Props) {
    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <svg
                    className="animate-spin h-10 w-10 text-slate-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-label="loading spinner"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                </svg>
            </div>
        );
    }

    if (empty) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                <svg
                    className="mb-4 h-12 w-12"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-label="empty state icon"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17v-2a4 4 0 014-4h1m-5 6h6m-6 0v2a4 4 0 004 4h1m-5-6h6m-6 0v-2a4 4 0 014-4h1m-5 6h6"
                    />
                </svg>
                <h3 className="mb-1 text-lg font-semibold">{emptyTitle || "No data"}</h3>
                <p>{emptyDescription || "There is no data to display."}</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden border border-slate-300 bg-white">
            <div className="overflow-x-auto">{children}</div>
        </div>
    );
}
