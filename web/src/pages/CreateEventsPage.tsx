import { useEventForm } from "../hooks/useEventForm";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { PageHeader } from "../components/ui/PageHeader";
import { EventForm } from "../components/events/EventForm";
import AuthGate from '../pages/AuthGate';
import { useAuth } from '../context/AuthContext';
import { EventSummary } from "../components/events/EventSummary";
import {
    basicInformationFields,
    locationFields,
    dateTimeFields,
    ticketFields,
} from "../data/eventFormFields";

export default function CreateEventsPage() {
    const { user } = useAuth();

    const {
        form,
        setForm,
        isSubmitting,
        submitError,
        updateField,
        updateTicket,
        handleCreateEvent,
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
        ticket_types: [
            {
                name: 'Regular',
                description: '',
                price: '',
                total_quantity: 1,
            },
            {
                name: 'VIP',
                description: '',
                price: '',
                total_quantity: 1,
            },
            {
                name: 'Early Bird',
                description: '',
                price: '',
                total_quantity: 1,
            },
        ],
    });

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
                    <PageHeader
                        title="Organizer Dashboard"
                        description="Create your event and start selling tickets"
                    />

                    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                        <EventForm
                            formId="create-event-form"
                            form={form}
                            basicInformationFields={basicInformationFields}
                            locationFields={locationFields}
                            dateTimeFields={dateTimeFields}
                            ticketFields={ticketFields}
                            onSubmit={handleCreateEvent}
                            onFieldChange={updateField}
                            onCoverImageChange={(file) =>
                                setForm((prev) => ({
                                    ...prev,
                                    cover_image: file,
                                }))
                            }
                            onTicketChange={updateTicket}
                        />

                        <EventSummary

                            form={form}

                            submitError={submitError}

                            isSubmitting={isSubmitting}

                            formId="create-event-form"

                            submitLabel="Publish Event"

                            submittingLabel="Publishing..."

                        />
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}