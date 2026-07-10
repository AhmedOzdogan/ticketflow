import type { TicketInput } from '../types/events'
import type { FormField } from "../components/ui/Form";
import type { CreateEvent } from "../types/events";

export const emptyTicket: TicketInput = {
    name: "",
    description: "",
    price: "",
    total_quantity: 1,
};

export const basicInformationFields: FormField<CreateEvent>[] = [
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

export const locationFields: FormField<CreateEvent>[] = [
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

export const dateTimeFields: FormField<CreateEvent>[] = [
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

export const ticketFields: FormField<TicketInput>[] = [
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