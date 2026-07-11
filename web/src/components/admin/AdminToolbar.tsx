import React from "react";

export interface AdminToolbarProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({
    title,
    description,
    children,
}) => {
    return (
        <div className="flex flex-col gap-4 rounded-b-xl border border-slate-300 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && <p className="text-sm text-slate-600">{description}</p>}
            </div>
            <div className="w-full sm:w-auto">{children}</div>
        </div>
    );
};

export default AdminToolbar;
