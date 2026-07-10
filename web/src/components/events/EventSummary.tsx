import { MdConfirmationNumber } from "react-icons/md";
import type { CreateEvent } from "../../types/events";

interface EventSummaryProps {
    form: CreateEvent;
    submitError: string | null;
    isSubmitting: boolean;
    formId: string;
    submitLabel: string;
    submittingLabel: string;
    onCancel?: () => void;
}

export function EventSummary({
    form,
    submitError,
    isSubmitting,
    formId,
    submitLabel,
    submittingLabel,
    onCancel,
}: EventSummaryProps) {
    return (
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
                        {[form.venue_name, form.city, form.country]
                            .filter(Boolean)
                            .join(", ") || "Venue, City, Country"}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500 dark:text-gray-400">Tickets</p>
                    <p className="font-semibold">
                        {form.ticket_types.length} ticket type(s)
                    </p>
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
                    onClick={onCancel}
                    className="rounded-2xl bg-gray-100 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-200 dark:bg-white/10 dark:text-white"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    form={formId}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FC7D0A] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#e86f00] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <MdConfirmationNumber />
                    {isSubmitting ? submittingLabel : submitLabel}
                </button>
            </div>
        </aside>
    );
}