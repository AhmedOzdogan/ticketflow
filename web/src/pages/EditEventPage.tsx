import { useEventForm } from "../hooks/useEventForm";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import type { CreateEvent } from "../types/events";
import { EventForm } from "../components/events/EventForm";
import { PageHeader } from "../components/ui/PageHeader";
import { EventSummary } from "../components/events/EventSummary";
import {
    basicInformationFields,
    locationFields,
    dateTimeFields,
    ticketFields,
} from "../data/eventFormFields";

const mockEvent: CreateEvent = {
    title: "React Summit 2025",
    description: "Europe's biggest React conference.",
    cover_image: null,
    category: "technology",
    venue_name: "RAI Amsterdam",
    address: "Europaplein 24",
    city: "Amsterdam",
    country: "Netherlands",
    start_date: "2025-10-15T09:00",
    end_date: "2025-10-15T18:00",
    ticket_types: [
        {
            name: "General Admission",
            description: "Standard ticket",
            price: "49.99",
            total_quantity: 250,
        },
    ],
};

export default function EditEventPage() {
    const {
        form,
        setForm,
        isSubmitting,
        submitError,
        updateField,
        addTicketType,
        removeTicketType,
        updateTicket,
    } = useEventForm(mockEvent);

    const handleUpdateEvent = async () => {
        console.log(form);
        // TODO:
        // await updateEvent(eventId, formData);
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#F7F7F8] px-4 py-8 text-[#1E1E1E] dark:bg-[#0B0F14] dark:text-[#E6E6E6] sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-8">
                    <PageHeader
                        title="Edit Event"
                        description="Update your event information."
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

                            submitLabel="Save Changes"

                            submittingLabel="Saving..."

                        />
                    </div>
                </div>
            </main >
            <Footer />
        </>
    );
}