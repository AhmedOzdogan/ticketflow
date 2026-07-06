export type FeaturedEvent = {
    id: number;
    title: string;
    category: string;
    date: string;
    location: string;
    price: string;
    image: string;
    status: 'Selling fast' | 'Available' | 'Almost full' | 'New';
    description: string;
};

const featuredEvents: FeaturedEvent[] = [
    {
        id: 1,
        title: 'Munich Sound Night',
        category: 'Music',
        date: 'Apr 18, 2026',
        location: 'Munich, Germany',
        price: 'From €39',
        image: '/images/concert.webp',
        status: 'Selling fast',
        description: 'A high-energy live concert night with local artists, premium tickets, and digital check-ins.',
    },
    {
        id: 2,
        title: 'Open Air Music Festival',
        category: 'Festival',
        date: 'May 02, 2026',
        location: 'Berlin, Germany',
        price: 'From €59',
        image: '/images/music_concert.webp',
        status: 'Almost full',
        description: 'A full-day outdoor festival experience with multiple stages, food courts, and VIP passes.',
    },
    {
        id: 3,
        title: 'Modern Theater Evening',
        category: 'Theater',
        date: 'May 16, 2026',
        location: 'Hamburg, Germany',
        price: 'From €24',
        image: '/images/theater.webp',
        status: 'Available',
        description: 'An elegant theater evening with reserved seating, attendee management, and smooth entry control.',
    },
    {
        id: 4,
        title: 'Digital Creators Summit',
        category: 'Conference',
        date: 'Jun 06, 2026',
        location: 'Frankfurt, Germany',
        price: 'From €89',
        image: '/images/event.webp',
        status: 'New',
        description: 'A professional conference for creators, founders, and teams building the next generation of digital products.',
    },
];

export default featuredEvents;