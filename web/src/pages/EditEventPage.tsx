import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { editEvent, getManageEventDetails } from "../api/eventApi";
import { getApiErrorMessage } from "../utils/getApiErrorMessages";
import type { UpdateEvent } from "../types/events";
import { useEventForm } from "../hooks/useEventForm";
import { EventForm } from "../components/events/EventForm";
import { EventSummary } from "../components/events/EventSummary";
import PageContainer from "../components/layout/PageContainer";
import { useNavigate } from "react-router-dom";
import {
    emptyTicket,
    basicInformationFields,
    locationFields,
    dateTimeFields,
    ticketFields,
} from "../data/eventFormFields";
import { Loading } from "../components/ui/Loading";

export default function EditEventsPage() {
    const { slug } = useParams<{ slug: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate()

    const {
        form,
        setForm,
        isSubmitting,
        submitError,
        updateField,
        updateTicket,
    } = useEventForm({
        title: "",
        description: "",
        cover_image: null,
        cover_image_url: null,
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

                    start_date: event.start_date
                        ? new Date(event.start_date).toISOString().slice(0, 16)
                        : "",

                    end_date: event.end_date
                        ? new Date(event.end_date).toISOString().slice(0, 16)
                        : "",

                    ticket_types: event.ticket_types.map((ticket) => ({
                        id: ticket.id,
                        name: ticket.name,
                        description: ticket.description,
                        price: ticket.price,
                        total_quantity: ticket.total_quantity,
                    })),
                } satisfies UpdateEvent);
                await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (error) {
                toast.error(getApiErrorMessage(error));
            } finally {
                setIsLoading(false);
            }
        }

        loadEvent();
    }, [slug, setForm]);

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
            navigate('/organizer/my-events')
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        }
    };

    return (
        <>

            <PageContainer
                title="Organizer Dashboard"
                description="Edit your event and update details"
            >
                {isLoading &&
                    <Loading message='Event Details are Loading' overlay />}

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
            </PageContainer>
        </>
    );
}