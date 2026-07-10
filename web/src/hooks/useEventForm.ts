import { useState } from "react";
import { toast } from 'sonner';
import { createEvent } from "../api/eventApi";
import type { TicketInput } from '../types/events'
import type { CreateEvent } from "../types/events";
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from "../utils/getApiErrorMessages";
import { emptyTicket } from "../data/eventFormFields";

export function useEventForm(initialForm: CreateEvent) {

    const navigate = useNavigate();

    const [form, setForm] = useState<CreateEvent>(initialForm);

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

            toast.success("Event created successfully! Please wait while our admins review it and it will be published.");
            navigate('/')
        } catch (error) {
            const message = getApiErrorMessage(error);
            setSubmitError(message);
            toast.error(message);

        } finally {
            setIsSubmitting(false);
        }
    };

    return {

        form,

        setForm,

        isSubmitting,

        submitError,

        updateField,

        addTicketType,

        removeTicketType,

        updateTicket,

        handleCreateEvent,

    };

}
