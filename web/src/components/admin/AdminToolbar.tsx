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
        <div className="flex items-center justify-between border border-slate-300 bg-white p-4">
            <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && <p className="text-sm text-slate-600">{description}</p>}
            </div>
            <div>{children}</div>
        </div>
    );
};

export default AdminToolbar;
