import React, { useEffect, useState } from "react";
import { getCurrentOrganizers, updateOrganizerStatus } from "../api/authApi";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import Authgate from "../pages/AuthGate";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";

// OrganizerProfile type
interface OrganizerProfile {
    company_name: string;
    website_url: string;
    organizer_details: string;
    rejection_reason: string | null;
}

// Organizer type
interface Organizer {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    organizer_approval_status: "approved" | "pending" | "rejected";
    organizer_profile: OrganizerProfile | null;
}

interface OrganizerStatusState {
    status: "approved" | "rejected" | "pending";
    rejectionReason: string;
}

const AdminDashboard: React.FC = () => {
    const { user, accessToken } = useAuth();
    const [organizers, setOrganizers] = useState<Organizer[]>([]);
    const [loading, setLoading] = useState(true);
    // To track status and rejection reason for each organizer
    const [statusState, setStatusState] = useState<Record<string, OrganizerStatusState>>({});
    const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");


    useEffect(() => {
        const fetchOrganizers = async () => {
            setLoading(true);
            try {
                const data = await getCurrentOrganizers(accessToken!);
                console.log("Fetched organizers:", data);
                setOrganizers(data);
                // Initialize status state for each organizer
                const initialStatus: Record<string, OrganizerStatusState> = {};
                data.forEach((org: Organizer) => {
                    initialStatus[org.id] = {
                        status: org.organizer_approval_status,
                        rejectionReason: org.organizer_profile?.rejection_reason || "", // Initialize with existing rejection reason or empty string
                    };
                });
                setStatusState(initialStatus);
                console.log("Fetched organizers:", data);
            } catch (e) {
                // Handle error as needed
            }
            setLoading(false);
        };
        fetchOrganizers();
        // eslint-disable-next-line
    }, []);

    const handleStatusChange = (
        id: string,
        value: "approved" | "pending" | "rejected",
    ) => {
        setStatusState((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                status: value,
                rejectionReason: value !== "rejected" ? "" : prev[id]?.rejectionReason || "",
            },
        }));
    };

    const handleRejectionReasonChange = (id: string, value: string) => {
        setStatusState((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                rejectionReason: value,
            },
        }));
    };

    const handleUpdateStatus = (
        id: string,
        status: "approved" | "pending" | "rejected",
        rejectionReason: string,
    ) => {
        if (status === "pending") {
            return;
        }
        updateOrganizerStatus(id, status, rejectionReason, accessToken!)
            .then(() => {
                // Update the local state to reflect the change
                setOrganizers((prev) =>
                    prev.map((org) =>
                        org.id === id ? { ...org, organizer_approval_status: status } : org
                    )
                );
            })
            .catch((error) => {
                console.log("Error updating status:", error);
            });
    };

    const filteredOrganizers = organizers.filter((org) =>
        filter === "all" ? true : org.organizer_approval_status === filter,
    );

    if (!user) {
        return (
            <Authgate />
        );
    }

    if (user.role !== "admin") {
        return (
            <Authgate variant="unauthorized" />
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />
            <main className="relative flex-1 overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-12">
                    <section className="flex flex-col gap-6 rounded-[2rem] border border-border bg-surface p-6 shadow-xl shadow-brand-black/5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Admin Dashboard</p>
                            <h1 className="mt-2 text-3xl font-black tracking-tight">Organizer Management</h1>
                            <p className="mt-2 text-sm text-muted">Review, approve and reject organizer applications.</p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <Button variant={filter === "all" ? "primary" : "outline"} onClick={() => setFilter("all")}>All ({organizers.length})</Button>
                            <Button variant={filter === "pending" ? "primary" : "outline"} onClick={() => setFilter("pending")}>Pending ({organizers.filter(o => o.organizer_approval_status === "pending").length})</Button>
                            <Button variant={filter === "approved" ? "primary" : "outline"} onClick={() => setFilter("approved")}>Approved ({organizers.filter(o => o.organizer_approval_status === "approved").length})</Button>
                            <Button variant={filter === "rejected" ? "primary" : "outline"} onClick={() => setFilter("rejected")}>Rejected ({organizers.filter(o => o.organizer_approval_status === "rejected").length})</Button>
                        </div>
                    </section>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {filteredOrganizers.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                                    <h3 className="text-xl font-bold">No organizers found</h3>
                                    <p className="mt-2 text-muted">There are no organizers matching the selected filter.</p>
                                </div>
                            )}
                            {filteredOrganizers.map((org) => (
                                <div
                                    key={org.id}
                                    className="rounded-[2rem] bg-surface p-8 shadow-xl shadow-brand-black/5"
                                >
                                    <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tight">{org.first_name} {org.last_name}</h2>
                                            <p className="text-sm uppercase tracking-widest text-muted mt-1">{org.organizer_profile?.company_name || "N/A"}</p>
                                        </div>
                                        <div>
                                            {org.organizer_approval_status === "approved" && (
                                                <span className="inline-block rounded-full bg-success/15 text-success border border-success/30 px-4 py-1 text-sm font-semibold">
                                                    Approved
                                                </span>
                                            )}
                                            {org.organizer_approval_status === "pending" && (
                                                <span className="inline-block rounded-full bg-secondary/25 text-foreground border border-secondary px-4 py-1 text-sm font-semibold">
                                                    Pending
                                                </span>
                                            )}
                                            {org.organizer_approval_status === "rejected" && (
                                                <span className="inline-block rounded-full bg-danger/15 text-danger border border-danger/30 px-4 py-1 text-sm font-semibold">
                                                    Rejected
                                                </span>
                                            )}
                                        </div>
                                    </header>
                                    <div className="grid gap-6 lg:grid-cols-3">
                                        <div className="rounded-xl bg-surface-muted border border-border p-4 flex flex-col">
                                            <span className="text-xs uppercase tracking-widest text-muted mb-1">Email</span>
                                            <span className="font-semibold text-foreground break-all">{org.email}</span>
                                        </div>
                                        <div className="rounded-xl bg-surface-muted border border-border p-4 flex flex-col">
                                            <span className="text-xs uppercase tracking-widest text-muted mb-1">Phone</span>
                                            <span className="font-semibold text-foreground">{org.phone_number}</span>
                                        </div>
                                        <div className="rounded-xl bg-surface-muted border border-border p-4 flex flex-col">
                                            <span className="text-xs uppercase tracking-widest text-muted mb-1">Website</span>
                                            {org.organizer_profile?.website_url ? (
                                                <a
                                                    href={org.organizer_profile.website_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-semibold text-foreground hover:underline break-all"
                                                >
                                                    {org.organizer_profile.website_url}
                                                </a>
                                            ) : (
                                                <span className="font-semibold text-muted">N/A</span>
                                            )}
                                        </div>
                                        <div className="rounded-xl bg-surface-muted border border-border p-4 flex flex-col lg:col-span-3">
                                            <span className="text-xs uppercase tracking-widest text-muted mb-1">Description</span>
                                            <span className="font-semibold text-foreground">{org.organizer_profile?.organizer_details || "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="mt-8 border-t border-border pt-8">
                                        {statusState[org.id]?.status === "rejected" && (
                                            <div className="mb-6 rounded-[1.5rem] border border-danger/20 bg-danger/5 p-5">
                                                <label className="mb-3 block text-sm font-black text-danger">
                                                    Rejection reason
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Explain why this organizer was rejected..."
                                                    className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-base font-medium text-foreground focus:border-primary focus:outline-none"
                                                    value={statusState[org.id]?.rejectionReason || ""}
                                                    onChange={(e) => handleRejectionReasonChange(org.id, e.target.value)}
                                                />
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                            <div className="min-w-[280px]">
                                                <label
                                                    htmlFor={`status-select-${org.id}`}
                                                    className="mb-3 block text-sm font-black text-foreground"
                                                >
                                                    Approval decision
                                                </label>

                                                <div className="relative group">
                                                    <select
                                                        id={`status-select-${org.id}`}
                                                        className="h-14 w-full appearance-none rounded-2xl border-2 border-border bg-surface px-5 pr-14 text-base font-semibold text-foreground shadow-sm transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none"
                                                        value={statusState[org.id]?.status || org.organizer_approval_status}
                                                        onChange={(e) =>
                                                            handleStatusChange(
                                                                org.id,
                                                                e.target.value as "approved" | "pending" | "rejected",
                                                            )
                                                        }
                                                    >
                                                        <option value="pending">Select a decision</option>
                                                        <option value="approved">Approve organizer</option>
                                                        <option value="rejected">Reject organizer</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-muted transition-colors group-hover:text-primary">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2.5}
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                className="min-w-[260px] py-4 text-base"
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        org.id,
                                                        statusState[org.id]?.status || org.organizer_approval_status,
                                                        statusState[org.id]?.rejectionReason || "",
                                                    )
                                                }
                                            >
                                                Update Organizer Status
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminDashboard;