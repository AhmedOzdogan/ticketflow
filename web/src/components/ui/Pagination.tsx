import { Button } from './Button';

type PaginationProps = {
    page: number;
    totalPages: number;
    loading?: boolean;
    onPageChange: (page: number) => void;
};

export default function Pagination({
    page,
    totalPages,
    loading = false,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <Button
                variant="outline"
                disabled={page === 1 || loading}
                onClick={() => onPageChange(page - 1)}
            >
                Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                    key={pageNumber}
                    type="button"
                    disabled={loading}
                    onClick={() => onPageChange(pageNumber)}
                    className={`size-10 rounded-full border font-bold transition ${pageNumber === page
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:border-primary hover:text-primary'
                        }`}
                >
                    {pageNumber}
                </button>
            ))}

            <Button
                variant="outline"
                disabled={page === totalPages || loading}
                onClick={() => onPageChange(page + 1)}
            >
                Next
            </Button>
        </div>
    );
}