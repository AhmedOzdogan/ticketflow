import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { editEvent, getManageEventDetails } from "../api/eventApi";
import { getApiErrorMessage } from "../utils/getApiErrorMessages";
import type { CreateEvent } from "../types/events";
import { useEventForm } from "../hooks/useEventForm";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { PageHeader } from "../components/ui/PageHeader";
import { EventForm } from "../components/events/EventForm";
import AuthGate from '../pages/AuthGate';
import { useAuth } from '../context/AuthContext';
import { EventSummary } from "../components/events/EventSummary";
import {
    emptyTicket,
    basicInformationFields,
    locationFields,
    dateTimeFields,
    ticketFields,
} from "../data/eventFormFields";

export default function EditEventsPage() {
    const { user } = useAuth();
    const { slug } = useParams<{ slug: string }>();
    const [isLoading, setIsLoading] = useState(true);

    const {
        form,
        setForm,
        isSubmitting,
        submitError,
        updateField,
        addTicketType,
        removeTicketType,
        updateTicket,
    } = useEventForm({
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

    useEffect(() => {
        async function loadEvent() {
            if (!slug) {
                setIsLoading(false);
                return;
            }

            try {
                const event = await getManageEventDetails(slug);

                setForm({
                    title: event.title,
                    description: event.description,
                    cover_image: null,
                    cover_image_url: event.cover_image ?? undefined,
                    category: event.category,
                    venue_name: event.venue_name,
                    address: event.address,
                    city: event.city,
                    country: event.country,
                    start_date: event.start_date,
                    end_date: event.end_date,
                    ticket_types: event.ticket_types.map((ticket) => ({
                        id: ticket.id,
                        name: ticket.name,
                        description: ticket.description,
                        price: ticket.price,
                        total_quantity: ticket.total_quantity,
                    })),
                } satisfies CreateEvent);
            } catch (error) {
                toast.error(getApiErrorMessage(error));
            } finally {
                setIsLoading(false);
            }
        }

        loadEvent();
    }, [slug, setForm]);

    if (!user) {
        return <AuthGate />;
    }
    if (user.role !== 'admin' && user.role !== 'organizer') {
        return <AuthGate variant="unauthorized" />;
    }

    if (isLoading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-[#F7F7F8] px-4 py-8 text-[#1E1E1E] dark:bg-[#0B0F14] dark:text-[#E6E6E6] sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl space-y-8">
                        <PageHeader
                            title="Organizer Dashboard"
                            description="Loading event details..."
                        />
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const handleUpdateEvent = async () => {
        if (!slug) return;

        try {
            const formData = new FormData();

            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("category", form.category);
            formData.append("venue_name", form.venue_name);
            formData.append("address", form.address);
            formData.append("city", form.city);
            formData.append("country", form.country);
            formData.append("start_date", form.start_date);
            formData.append("end_date", form.end_date);
            formData.append("ticket_types", JSON.stringify(form.ticket_types));

            if (form.cover_image) {
                formData.append("cover_image", form.cover_image);
            }

            await editEvent(slug, formData);
            toast.success("Event updated successfully.");
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#F7F7F8] px-4 py-8 text-[#1E1E1E] dark:bg-[#0B0F14] dark:text-[#E6E6E6] sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-8">
                    <PageHeader
                        title="Organizer Dashboard"
                        description="Edit your event and update details"
                    />

                    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                        <EventForm
                            formId="edit-event-form"
                            form={form}
                            basicInformationFields={basicInformationFields}
                            locationFields={locationFields}
                            dateTimeFields={dateTimeFields}
                            ticketFields={ticketFields}
                            onSubmit={handleUpdateEvent}
                            onFieldChange={updateField}
                            onCoverImageChange={(file) =>
                                setForm((prev) => ({
                                    ...prev,
                                    cover_image: file,
                                }))
                            }
                            onAddTicketType={addTicketType}
                            onRemoveTicketType={removeTicketType}
                            onTicketChange={updateTicket}
                        />

                        <EventSummary

                            form={form}

                            submitError={submitError}

                            isSubmitting={isSubmitting}

                            formId="edit-event-form"

                            submitLabel="Update Event"

                            submittingLabel="Updating..."

                        />
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}