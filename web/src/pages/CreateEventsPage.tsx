import { useState } from "react";
import type { CreateEvent, TicketType } from "../types/events";
import {
    FiCalendar,
    FiImage,
    FiMapPin,
    FiPlus,
    FiTrash2,
    FiUpload,
} from "react-icons/fi";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { FormFields, type FormField } from "../components/ui/Form";
import { MdConfirmationNumber } from "react-icons/md";
import { createEvent } from "../api/eventApi";
import AuthGate from '../pages/AuthGate';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { getApiErrorMessage } from "../utils/getApiErrorMessages";
import { useNavigate } from 'react-router-dom';


type TicketInput = Omit<TicketType, "id" | "remaining_quantity">;

const emptyTicket: TicketInput = {
    name: "",
    description: "",
    price: "",
    total_quantity: 1,
};

const basicInformationFields: FormField<CreateEvent>[] = [
    {
        name: "title",
        label: "Event Title",
        required: true,
        placeholder: "Summer Music Festival",
    },
    {
        name: "description",
        label: "Description",
        required: true,
        type: "textarea",
        rows: 5,
        placeholder: "Tell people what makes your event special...",
    },
    {
        name: "category",
        label: "Category",
        required: true,
        type: "select",
        placeholder: "Select a category",
        options: [
            { label: "Music", value: "music" },
            { label: "Business", value: "business" },
            { label: "Technology", value: "technology" },
            { label: "Sports", value: "sports" },
            { label: "Education", value: "education" },
            { label: "Food", value: "food" },
            { label: "Nightlife", value: "nightlife" },
        ],
    },
];

const locationFields: FormField<CreateEvent>[] = [
    {
        name: "venue_name",
        label: "Venue Name",
        required: true,
        placeholder: "Venue Name",
    },
    {
        name: "address",
        label: "Address",
        required: true,
        placeholder: "Address",
    },
    {
        name: "city",
        label: "City",
        required: true,
        placeholder: "City",
    },
    {
        name: "country",
        label: "Country",
        required: true,
        placeholder: "Country",
    },
];

const dateTimeFields: FormField<CreateEvent>[] = [
    {
        name: "start_date",
        label: "Start Date",
        required: true,
        type: "datetime-local",
    },
    {
        name: "end_date",
        label: "End Date",
        required: true,
        type: "datetime-local",
    },
];

const ticketFields: FormField<TicketInput>[] = [
    {
        name: "name",
        label: "Ticket Name",
        required: true,
        placeholder: "Ticket Name",
    },
    {
        name: "price",
        label: "Price (Euro)",
        required: true,
        type: "number",
        placeholder: "Price",
    },
    {
        name: "total_quantity",
        label: "Total Quantity",
        required: true,
        type: "number",
        placeholder: "Total Quantity",
    },
    {
        name: "description",
        label: "Ticket Description",
        required: true,
        placeholder: "Ticket Description",
    },
];

export default function CreateEventsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState<CreateEvent>({
        title: "",
        description: "",
        cover_image: null,
        category: "",
        venue_name: "",
        address: "",
        city: "",
        country: "",
        start_date: "",
        end_date: "",
        ticket_types: [{ ...emptyTicket }],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const updateField = (
        name: Extract<keyof CreateEvent, string>,
        value: string | number | boolean,
    ) => {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const addTicketType = () => {
        setForm((prev) => ({
            ...prev,
            ticket_types: [...prev.ticket_types, { ...emptyTicket }],
        }));
    };

    const removeTicketType = (index: number) => {
        setForm((prev) => {
            if (prev.ticket_types.length === 1) return prev;
            return {
                ...prev,
                ticket_types: prev.ticket_types.filter((_, i) => i !== index),
            };
        });
    };

    const updateTicket = (
        index: number,
        field: keyof TicketInput,
        value: string | number,
    ) => {
        setForm((prev) => ({
            ...prev,
            ticket_types: prev.ticket_types.map((ticket, i) =>
                i === index ? { ...ticket, [field]: value } : ticket
            ),
        }));
    };

    const handleCreateEvent = async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("category", form.category);
            formData.append("venue_name", form.venue_name);
            formData.append("address", form.address);
            formData.append("city", form.city);
            formData.append("country", form.country);
            const startDate = form.start_date
                ? new Date(form.start_date).toISOString()
                : "";

            const endDate = form.end_date
                ? new Date(form.end_date).toISOString()
                : "";
            formData.append("start_date", startDate);
            formData.append("end_date", endDate);
            if (form.cover_image) {
                formData.append("cover_image", form.cover_image);
            }
            formData.append("ticket_types", JSON.stringify(form.ticket_types));

            await createEvent(formData);

            // Keep the loading animation visible briefly
            await new Promise((resolve) => setTimeout(resolve, 1000));

            toast.success("Event created successfully!");
            navigate('/')
        } catch (error) {
            const message = getApiErrorMessage(error);
            setSubmitError(message);
            toast.error(message);

        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return <AuthGate />;
    }
    if (user.role !== 'admin' && user.role !== 'organizer') {
        return <AuthGate variant="unauthorized" />;
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#F7F7F8] px-4 py-8 text-[#1E1E1E] dark:bg-[#0B0F14] dark:text-[#E6E6E6] sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-8">
                    <section className="rounded-[2rem] border border-border bg-surface p-6 shadow-2xl shadow-brand-black/10 sm:p-8">
                        <p className="text-sm font-black uppercase tracking-wide text-primary">
                            Organizer Dashboard
                        </p>
                        <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground">Create Event</h1>
                        <p className="mt-2 text-sm font-semibold text-muted">
                            Create your event and start selling tickets.
                        </p>
                    </section>

                    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                        <form
                            id="create-event-form"
                            className="space-y-6"
                            onSubmit={(event) => {
                                event.preventDefault();
                                handleCreateEvent();
                            }}
                        >
                            <section className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[#121820] sm:p-6">
                                <h2 className="mb-5 text-xl font-bold text-[#0D2B5D] dark:text-white">
                                    Basic Information
                                </h2>
                                <FormFields
                                    fields={basicInformationFields}
                                    values={form}
                                    onChange={updateField}
                                />
                            </section>

                            <section className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[#121820] sm:p-6">
                                <div className="mb-5 flex items-center gap-3">
                                    <FiMapPin className="text-xl text-[#FC7D0A]" />
                                    <h2 className="text-xl font-bold text-[#0D2B5D] dark:text-white">
                                        Location
                                    </h2>
                                </div>
                                <FormFields
                                    fields={locationFields}
                                    values={form}
                                    onChange={updateField}
                                    className="grid gap-4 md:grid-cols-2"
                                />
                            </section>

                            <section className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[#121820] sm:p-6">
                                <div className="mb-5 flex items-center gap-3">
                                    <FiCalendar className="text-xl text-[#FC7D0A]" />
                                    <h2 className="text-xl font-bold text-[#0D2B5D] dark:text-white">
                                        Date & Time
                                    </h2>
                                </div>
                                <FormFields
                                    fields={dateTimeFields}
                                    values={form}
                                    onChange={updateField}
                                    className="grid gap-4 md:grid-cols-2"
                                />
                            </section>

                            <section className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[#121820] sm:p-6">
                                <div className="mb-5 flex items-center gap-3">
                                    <FiImage className="text-xl text-[#FC7D0A]" />
                                    <h2 className="text-xl font-bold text-[#0D2B5D] dark:text-white">
                                        Cover Image
                                    </h2>
                                </div>

                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-[#FC7D0A] dark:border-white/10 dark:bg-[#0B0F14]">
                                    <FiUpload className="mb-3 text-3xl text-[#FC7D0A]" />
                                    <span className="font-semibold">
                                        {form.cover_image ? form.cover_image.name : "Upload event image"}
                                    </span>
                                    <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        PNG, JPG or WEBP
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                cover_image: event.target.files?.[0] ?? null,
                                            }))
                                        }
                                        className="hidden"
                                    />
                                </label>
                            </section>

                            <section className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[#121820] sm:p-6">
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <MdConfirmationNumber className="text-2xl text-[#FC7D0A]" />
                                        <h2 className="text-xl font-bold text-[#0D2B5D] dark:text-white">
                                            Ticket Types
                                        </h2>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {form.ticket_types.map((ticket, index) => (
                                        <div
                                            key={index}
                                            className="rounded-3xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-[#0B0F14]"
                                        >
                                            <div className="mb-4 flex items-center justify-between gap-3">
                                                <h3 className="font-bold text-[#0D2B5D] dark:text-white">
                                                    Ticket #{index + 1}
                                                </h3>

                                                {form.ticket_types.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTicketType(index)}
                                                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                                                    >
                                                        <FiTrash2 />
                                                        Remove
                                                    </button>
                                                )}
                                            </div>

                                            <FormFields
                                                fields={ticketFields}
                                                values={ticket}
                                                onChange={(name, value) => updateTicket(index, name, value as string | number)}
                                                className="grid gap-4 md:grid-cols-2"
                                            />
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addTicketType}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0D2B5D] px-4 py-3 font-semibold text-[#0D2B5D] transition hover:bg-[#0D2B5D] hover:text-white dark:border-white/20 dark:text-white"
                                    >
                                        <FiPlus />
                                        Add Ticket Type
                                    </button>
                                </div>
                            </section>
                        </form>

                        <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm dark:bg-[#121820] lg:sticky lg:top-24">
                            <h2 className="mb-4 text-xl font-bold text-[#0D2B5D] dark:text-white">
                                Event Summary
                            </h2>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Title</p>
                                    <p className="font-semibold">{form.title || "Event title"}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Category</p>
                                    <p className="font-semibold">{form.category || "Category"}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Location</p>
                                    <p className="font-semibold">
                                        {[form.venue_name, form.city, form.country].filter(Boolean).join(", ") ||
                                            "Venue, City, Country"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Tickets</p>
                                    <p className="font-semibold">{form.ticket_types.length} ticket type(s)</p>
                                </div>
                            </div>

                            {submitError && (
                                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-300">
                                    {submitError}
                                </p>
                            )}
                            <div className="mt-6 flex flex-col gap-3">
                                <button
                                    type="button"
                                    className="rounded-2xl bg-gray-100 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-200 dark:bg-white/10 dark:text-white"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    form="create-event-form"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FC7D0A] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#e86f00] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <MdConfirmationNumber />
                                    {isSubmitting ? "Publishing..." : "Publish Event"}
                                </button>
                            </div>
                        </aside>
                    </div>
                </div>

            </main>
            <Footer />
        </>
    );
}