const productLinks = [
    { label: 'Events', href: '/events' },
    { label: 'Create event', href: '/create-event' },
    { label: 'Organizer dashboard', href: '/organizer' },
    { label: 'Pricing', href: '/pricing' },
];

const supportLinks = [
    { label: 'Help center', href: '/feature-preview' },
    { label: 'Contact', href: '/feature-preview' },
    { label: 'Status', href: '/feature-preview' },
    { label: 'Security', href: '/feature-preview' },
];

const legalLinks = [
    { label: 'User Agreement', href: '/feature-preview' },
    { label: 'Privacy Policy', href: '/feature-preview' },
    { label: 'Cookie Policy', href: '/feature-preview' },
    { label: 'Terms of Service', href: '/feature-preview' },
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-surface pb-12 text-foreground sm:pb-4">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
                    {/* Brand summary */}
                    <div className="max-w-sm">
                        <a href="/" className="inline-flex items-center gap-3" aria-label="TicketFlow home">
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-foreground shadow-sm">
                                T
                            </div>
                            <div>
                                <p className="text-lg font-bold tracking-tight">TicketFlow</p>
                                <p className="text-sm text-muted-foreground">Events. Tickets. Check-ins.</p>
                            </div>
                        </a>

                        <p className="mt-5 text-sm leading-6 text-muted">
                            A modern event management and ticketing platform for creating events, selling tickets,
                            managing attendees, and handling secure check-ins.
                        </p>
                    </div>

                    {/* Product links */}
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Product</h2>
                        <ul className="mt-4 space-y-3">
                            {productLinks.map((link) => (
                                <li key={link.href}>
                                    <a href={link.href} className="text-sm text-muted transition hover:text-primary">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support links */}
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Support</h2>
                        <ul className="mt-4 space-y-3">
                            {supportLinks.map((link) => (
                                <li key={`${link.label}-${link.href}`}>
                                    <a href={link.href} className="text-sm text-muted transition hover:text-primary">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal links */}
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Legal</h2>
                        <ul className="mt-4 space-y-3">
                            {legalLinks.map((link) => (
                                <li key={`${link.label}-${link.href}`}>
                                    <a href={link.href} className="text-sm text-muted transition hover:text-primary">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
                    <p>© {currentYear} TicketFlow. All rights reserved.</p>
                    <p>
                        Built with <span className="font-semibold text-primary">React</span>,{' '}
                        <span className="font-semibold text-success">Express.js</span>,{' '}
                        <span className="font-semibold text-accent">Django</span>, and{' '}
                        <span className="font-semibold text-secondary">Stripe</span>.
                    </p>
                </div>
            </div>
        </footer>
    );
}