import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
    FiAlertTriangle,
    FiArrowLeft,
    FiCamera,
    FiCheckCircle,
    FiRefreshCw,
    FiSmartphone,
    FiXCircle,
} from 'react-icons/fi';

import { Scanner } from '@yudiel/react-qr-scanner';

import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import type { Ticket } from '../types/order';
import { scanTicket } from '../api/orderApi';

type ScannerStatus =
    | 'idle'
    | 'scanning'
    | 'detected'
    | 'error';

type ScannedTicket = {
    value: string;
    scannedAt: Date;
};

const MOBILE_BREAKPOINT = 1024;

export default function OrganizerScanner() {
    const navigate = useNavigate();

    const scanLockRef = useRef(false);

    const [isDesktop, setIsDesktop] =
        useState(false);

    const [cameraEnabled, setCameraEnabled] =
        useState(false);

    const [scannerStatus, setScannerStatus] =
        useState<ScannerStatus>('idle');

    const [lastScan, setLastScan] =
        useState<ScannedTicket | null>(null);

    const [scanHistory, setScanHistory] =
        useState<ScannedTicket[]>([]);

    const [cameraError, setCameraError] =
        useState<string | null>(null);

    const [scannedTicket, setScannedTicket] =

        useState<Ticket | null>(null);

    const [isValidating, setIsValidating] =

        useState(false);

    useEffect(() => {
        const updateDeviceType = () => {
            setIsDesktop(
                window.innerWidth >= MOBILE_BREAKPOINT,
            );
        };

        updateDeviceType();

        window.addEventListener(
            'resize',
            updateDeviceType,
        );

        return () => {
            window.removeEventListener(
                'resize',
                updateDeviceType,
            );
        };
    }, []);

    const handleStartCamera = () => {
        setCameraError(null);
        setScannerStatus('scanning');
        setCameraEnabled(true);
    };

    const handleScanAgain = () => {
        setLastScan(null);
        setScannedTicket(null);
        setCameraError(null);

        scanLockRef.current = false;

        setScannerStatus('scanning');
        setCameraEnabled(true);
    };

    const handleScan = useCallback(
        async (
            detectedCodes: Array<{
                rawValue: string;
            }>,
        ) => {
            if (
                scanLockRef.current ||
                detectedCodes.length === 0
            ) {
                return;
            }

            const qrCode =
                detectedCodes[0]?.rawValue?.trim();
            console.log("Scanned:", qrCode);
            if (!qrCode) {
                return;
            }

            scanLockRef.current = true;
            setIsValidating(true);
            setCameraError(null);

            try {
                const ticket = await scanTicket(qrCode);

                setScannedTicket(ticket);

                const scan: ScannedTicket = {
                    value: qrCode,
                    scannedAt: new Date(),
                };

                setLastScan(scan);

                setScanHistory((current) =>
                    [scan, ...current].slice(0, 10),
                );

                setScannerStatus('detected');
                setCameraEnabled(false);

                if (
                    typeof navigator.vibrate ===
                    'function'
                ) {
                    navigator.vibrate(150);
                }
            } catch (error) {
                console.error(
                    'Ticket scan failed:',
                    error,
                );

                setScannerStatus('error');
                setCameraEnabled(false);

                setCameraError(
                    'The ticket could not be validated.',
                );
            } finally {
                setIsValidating(false);
            }
        },
        [],
    );


    const handleScannerError = useCallback(
        (error: unknown) => {
            console.error(
                'QR scanner error:',
                error,
            );

            setCameraEnabled(false);
            setScannerStatus('error');

            setCameraError(
                'The camera could not be opened. Please check your browser camera permissions.',
            );
        },
        [],
    );



    const formatScanTime = (date: Date) =>
        new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(date);

    return (
        <>
            <Header />

            <main className="min-h-screen bg-background">
                <section className="border-b border-border bg-surface">
                    <div className="mx-auto max-w-7xl px-6 py-8">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:underline"
                        >
                            <FiArrowLeft />
                            Back
                        </button>

                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                                    <FiCamera />
                                    Ticket Scanner
                                </div>

                                <h1 className="mt-4 text-4xl font-black text-foreground">
                                    Scan Ticket QR Codes
                                </h1>

                                <p className="mt-2 max-w-2xl text-muted">
                                    Scan attendee tickets and check them in directly
                                    from your phone or tablet.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                                <span
                                    className={`h-3 w-3 rounded-full ${scannerStatus === 'scanning'
                                        ? 'animate-pulse bg-green-500'
                                        : scannerStatus === 'detected'
                                            ? 'bg-blue-500'
                                            : scannerStatus === 'error'
                                                ? 'bg-red-500'
                                                : 'bg-gray-400'
                                        }`}
                                />

                                <span className="font-semibold capitalize">
                                    {isValidating
                                        ? 'Validating'
                                        : scannerStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 py-10">
                    {isDesktop && (
                        <div className="mb-8 flex items-start gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-5">
                            <FiAlertTriangle className="mt-1 shrink-0 text-2xl text-amber-600" />

                            <div>
                                <h2 className="font-bold text-amber-900">
                                    Desktop device detected
                                </h2>

                                <p className="mt-1 text-sm text-amber-800">
                                    For the best scanning experience, open this page
                                    on a phone or tablet. You can still continue if
                                    your computer has a webcam.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
                        <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
                            <div className="border-b border-border px-6 py-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-foreground">
                                            Camera
                                        </h2>

                                        <p className="mt-1 text-sm text-muted">
                                            Position the ticket QR code inside the
                                            frame.
                                        </p>
                                    </div>

                                    <FiSmartphone className="shrink-0 text-3xl text-primary" />
                                </div>
                            </div>

                            <div className="p-6">
                                {!cameraEnabled ? (
                                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background px-6 text-center">
                                        {scannerStatus === 'detected' ? (
                                            <FiCheckCircle className="mb-6 text-7xl text-green-600" />
                                        ) : scannerStatus === 'error' ? (
                                            <FiXCircle className="mb-6 text-7xl text-red-600" />
                                        ) : (
                                            <FiCamera className="mb-6 text-7xl text-primary" />
                                        )}

                                        <h3 className="text-2xl font-bold text-foreground">
                                            {scannerStatus === 'detected'
                                                ? 'Ticket Scanned'
                                                : scannerStatus === 'error'
                                                    ? 'Scanner Stopped'
                                                    : 'Camera Ready'}
                                        </h3>

                                        <p className="mt-2 max-w-sm text-muted">
                                            {scannerStatus === 'detected'
                                                ? 'Review the scanned ticket details before scanning the next ticket.'
                                                : scannerStatus === 'error'
                                                    ? 'Review the error below, then try opening the camera again.'
                                                    : 'Start the camera and point it at any TicketFlow QR code.'}
                                        </p>

                                        {scannerStatus === 'detected' ? (
                                            <Button
                                                type="button"
                                                className="mt-8"
                                                size="lg"
                                                onClick={handleScanAgain}
                                            >
                                                <FiRefreshCw />
                                                Scan Another Ticket
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                className="mt-8"
                                                size="lg"
                                                onClick={handleStartCamera}
                                            >
                                                <FiCamera />
                                                Open Camera
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative overflow-hidden rounded-2xl border border-border bg-black">
                                        <Scanner
                                            onScan={handleScan}
                                            onError={handleScannerError}
                                            constraints={{
                                                facingMode: 'environment',
                                            }}
                                            styles={{
                                                container: {
                                                    width: '100%',
                                                    height: '420px',
                                                },
                                            }}
                                        />

                                        <div className="pointer-events-none absolute inset-0">
                                            <div className="h-[18%] bg-black/55" />

                                            <div className="flex h-[64%]">
                                                <div className="w-[15%] bg-black/55" />

                                                <div className="relative flex-1 rounded-xl border-4 border-white">
                                                    <div className="absolute -left-1 -top-1 h-10 w-10 border-l-4 border-t-4 border-primary" />
                                                    <div className="absolute -right-1 -top-1 h-10 w-10 border-r-4 border-t-4 border-primary" />
                                                    <div className="absolute -bottom-1 -left-1 h-10 w-10 border-b-4 border-l-4 border-primary" />
                                                    <div className="absolute -bottom-1 -right-1 h-10 w-10 border-b-4 border-r-4 border-primary" />

                                                    <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 animate-pulse bg-primary shadow-lg shadow-primary/60" />
                                                </div>

                                                <div className="w-[15%] bg-black/55" />
                                            </div>

                                            <div className="h-[18%] bg-black/55" />
                                        </div>

                                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-4 py-2 backdrop-blur-sm">
                                            <p className="text-sm font-semibold text-white">
                                                Align the QR code inside the frame
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {isValidating && (
                                    <div className="mt-6 flex items-center justify-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700" />

                                        <span className="font-semibold">
                                            Validating and checking in ticket...
                                        </span>
                                    </div>
                                )}

                                {cameraError && (
                                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                                        <FiXCircle className="mt-0.5 shrink-0 text-xl" />

                                        <span>{cameraError}</span>
                                    </div>
                                )}

                                <div
                                    className={`mt-6 rounded-xl p-5 transition-all ${scannerStatus === 'detected'
                                        ? 'border border-green-300 bg-green-50'
                                        : scannerStatus === 'error'
                                            ? 'border border-red-300 bg-red-50'
                                            : 'border border-border bg-background'
                                        }`}
                                >
                                    {scannerStatus === 'idle' && (
                                        <p className="text-center text-muted">
                                            Ready to start scanning.
                                        </p>
                                    )}

                                    {scannerStatus === 'scanning' &&
                                        !isValidating && (
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="h-3 w-3 animate-ping rounded-full bg-green-500" />

                                                <span className="font-semibold text-foreground">
                                                    Looking for a QR code...
                                                </span>
                                            </div>
                                        )}

                                    {scannerStatus === 'detected' && (
                                        <div className="flex items-center gap-3">
                                            <FiCheckCircle className="shrink-0 text-3xl text-green-600" />

                                            <div>
                                                <p className="font-bold text-green-700">
                                                    Ticket checked in successfully
                                                </p>

                                                <p className="text-sm text-green-600">
                                                    The ticket status has been
                                                    changed to used.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {scannerStatus === 'error' && (
                                        <div className="flex items-center gap-3">
                                            <FiXCircle className="shrink-0 text-3xl text-red-600" />

                                            <div>
                                                <p className="font-bold text-red-700">
                                                    Ticket validation failed
                                                </p>

                                                <p className="text-sm text-red-600">
                                                    The ticket may be invalid,
                                                    already used, cancelled, or
                                                    belong to another organizer.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <aside className="space-y-6">
                            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
                                <h2 className="text-xl font-black text-foreground">
                                    Last Scan
                                </h2>

                                {!lastScan ? (
                                    <div className="mt-8 text-center">
                                        <FiCamera className="mx-auto mb-4 text-5xl text-muted" />

                                        <p className="font-semibold text-foreground">
                                            Waiting for ticket...
                                        </p>

                                        <p className="mt-2 text-sm text-muted">
                                            Ticket information will appear here
                                            after a successful scan.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-6 space-y-4">
                                        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                                            <FiCheckCircle className="shrink-0 text-2xl text-green-600" />

                                            <div>
                                                <p className="font-bold text-green-700">
                                                    Checked In
                                                </p>

                                                <p className="text-sm text-green-600">
                                                    {formatScanTime(
                                                        lastScan.scannedAt,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {scannedTicket && (
                                            <>
                                                <div className="rounded-xl border border-border bg-background p-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                                        Event
                                                    </p>

                                                    <p className="mt-1 font-bold text-foreground">
                                                        {
                                                            scannedTicket.event_title
                                                        }
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border border-border bg-background p-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                                        Ticket Type
                                                    </p>

                                                    <p className="mt-1 font-bold text-foreground">
                                                        {
                                                            scannedTicket.ticket_type_name
                                                        }
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border border-border bg-background p-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                                        Owner
                                                    </p>

                                                    <p className="mt-1 break-all font-bold text-foreground">
                                                        {
                                                            scannedTicket.owner_email
                                                        }
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border border-border bg-background p-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                                        Status
                                                    </p>

                                                    <p className="mt-1 font-bold uppercase text-green-600">
                                                        {scannedTicket.status}
                                                    </p>
                                                </div>
                                            </>
                                        )}

                                        <div className="rounded-xl border border-border bg-background p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                                QR Value
                                            </p>

                                            <p className="mt-2 break-all font-mono text-sm text-foreground">
                                                {lastScan.value}
                                            </p>
                                        </div>

                                        <Button
                                            type="button"
                                            className="w-full"
                                            variant="outline"
                                            onClick={handleScanAgain}
                                        >
                                            <FiRefreshCw />
                                            Scan Another Ticket
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
                                <h2 className="text-xl font-black text-foreground">
                                    Recent Activity
                                </h2>

                                <div className="mt-6 space-y-3">
                                    {scanHistory.length === 0 ? (
                                        <p className="text-sm text-muted">
                                            No tickets scanned yet.
                                        </p>
                                    ) : (
                                        scanHistory.map((scan, index) => (
                                            <div
                                                key={`${scan.value}-${scan.scannedAt.getTime()}-${index}`}
                                                className="rounded-xl border border-border bg-background p-4"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <FiCheckCircle className="shrink-0 text-green-600" />

                                                        <span className="font-semibold text-foreground">
                                                            Ticket #{index + 1}
                                                        </span>
                                                    </div>

                                                    <span className="shrink-0 text-xs text-muted">
                                                        {formatScanTime(
                                                            scan.scannedAt,
                                                        )}
                                                    </span>
                                                </div>

                                                <p className="mt-2 truncate font-mono text-xs text-muted">
                                                    {scan.value}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}