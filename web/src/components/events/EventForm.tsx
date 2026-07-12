

import {
    FiCalendar,
    FiImage,
    FiMapPin,
    FiUpload,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { MdConfirmationNumber } from "react-icons/md";
import { FormFields, type FormField } from "../ui/Form";
import type { CreateEvent, TicketType } from "../../types/events";

type TicketInput = Omit<TicketType, "id" | "remaining_quantity">;


type EventFormProps = {
    formId: string;
    form: CreateEvent;
    basicInformationFields: FormField<CreateEvent>[];
    locationFields: FormField<CreateEvent>[];
    dateTimeFields: FormField<CreateEvent>[];
    ticketFields: FormField<TicketInput>[];
    onSubmit: () => void;
    onFieldChange: (
        name: Extract<keyof CreateEvent, string>,
        value: string | number | boolean,
    ) => void;
    onCoverImageChange: (file: File | null) => void;
    onTicketChange: (
        index: number,
        field: keyof TicketInput,
        value: string | number,
    ) => void;
};

export function EventForm({
    formId,
    form,
    basicInformationFields,
    locationFields,
    dateTimeFields,
    ticketFields,
    onSubmit,
    onFieldChange,
    onCoverImageChange,
    onTicketChange,
}: EventFormProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (form.cover_image) {
            const url = URL.createObjectURL(form.cover_image);
            setPreviewUrl(url);

            return () => URL.revokeObjectURL(url);
        }

        setPreviewUrl(form.cover_image_url ?? null);
    }, [form.cover_image, form.cover_image_url]);

    return (
        <form
            id={formId}
            className="space-y-6"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <section className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[#121820] sm:p-6">
                <h2 className="mb-5 text-xl font-bold text-[#0D2B5D] dark:text-white">
                    Basic Information
                </h2>
                <FormFields
                    fields={basicInformationFields}
                    values={form}
                    onChange={onFieldChange}
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
                    onChange={onFieldChange}
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
                    onChange={onFieldChange}
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
                    {previewUrl ? (
                        <>
                            <img
                                src={previewUrl}
                                alt="Event cover preview"
                                className="mb-4 h-56 w-full rounded-2xl object-cover"
                            />

                            <span className="font-semibold">
                                {form.cover_image?.name ?? "Current cover image"}
                            </span>

                            <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Click to change image
                            </span>
                        </>
                    ) : (
                        <>
                            <FiUpload className="mb-3 text-3xl text-[#FC7D0A]" />

                            <span className="font-semibold">
                                Upload event image
                            </span>

                            <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                PNG, JPG or WEBP
                            </span>
                        </>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                            onCoverImageChange(event.target.files?.[0] ?? null)
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
                                    {index === 0
                                        ? "Regular Ticket"
                                        : index === 1
                                            ? "VIP Ticket"
                                            : "Early Bird Ticket"}
                                </h3>

                            </div>

                            <FormFields
                                fields={ticketFields}
                                values={ticket}
                                onChange={(name, value) =>
                                    onTicketChange(index, name, value as string | number)
                                }
                                className="grid gap-4 md:grid-cols-2"
                            />
                        </div>
                    ))}
                </div>
            </section>
        </form>
    );
}