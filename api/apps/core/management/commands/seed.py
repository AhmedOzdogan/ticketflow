from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model
from apps.users.models import (
    OrganizerApprovalStatus,
    OrganizerProfile,
    UserRole,
)
from apps.orders.models import (
    Order,
    OrderItem,
    Ticket,
    OrderStatus,
)
from datetime import timedelta
from django.utils import timezone
from apps.events.models import Event, EventCategory, Status
from decimal import Decimal
from apps.events.models import TicketType
import shutil
from django.conf import settings
from pathlib import Path
from django.core.files import File

User = get_user_model()

API_DIR = Path(__file__).resolve().parents[4]
IMAGE_DIR = API_DIR / "seed_images"

class Command(BaseCommand):
    help = "Seed the development database with TicketFlow demo data."

    def create_users(self):
        self.stdout.write("Creating users...")

        admin = User.objects.create_superuser(
            username="admin",
            email="admin@ticketflow.dev",
            password="Admin123!",
            first_name="System",
            last_name="Administrator",
        )

        admin.role = UserRole.ADMIN
        admin.is_email_verified = True
        admin.save()

        organizer = User.objects.create_user(
            username="organizer",
            email="organizer@ticketflow.dev",
            password="Organizer123!",
            first_name="John",
            last_name="Organizer",
        )

        organizer.role = UserRole.ORGANIZER
        organizer.is_email_verified = True
        organizer.organizer_approval_status = (
            OrganizerApprovalStatus.APPROVED
        )
        organizer.save()

        OrganizerProfile.objects.create(
            user=organizer,
            company_name="MusicFest GmbH",
            website_url="https://musicfest.dev",
            organizer_details="Development organizer account",
        )

        buyer = User.objects.create_user(
            username="buyer",
            email="buyer@ticketflow.dev",
            password="Buyer123!",
            first_name="Jane",
            last_name="Buyer",
        )

        buyer.role = UserRole.BUYER
        buyer.is_email_verified = True
        buyer.save()

        self.stdout.write(self.style.SUCCESS("✓ Users created"))

        return admin, organizer, buyer


    def create_events(self, organizer):
        self.stdout.write("Creating events...")

        event_data = [
            (
                "Summer Music Festival",
                EventCategory.MUSIC,
                "Munich",
                "summer-festival.webp",
            ),
            (
                "AI Summit Europe",
                EventCategory.TECHNOLOGY,
                "Berlin",
                "ai-summit.webp",
            ),
            (
                "Startup Expo",
                EventCategory.BUSINESS,
                "Frankfurt",
                "startup-expo.webp",
            ),
            (
                "Champions Cup",
                EventCategory.SPORTS,
                "Hamburg",
                "champions-cup.webp",
            ),
            (
                "Python Conference",
                EventCategory.EDUCATION,
                "Cologne",
                "python-conference.webp",
            ),
            (
                "Street Food Festival",
                EventCategory.FOOD,
                "Stuttgart",
                "street-food.webp",
            ),
            (
                "Night Beats",
                EventCategory.NIGHTLIFE,
                "Munich",
                "night-beats.webp",
            ),
            (
                "Rock Legends",
                EventCategory.MUSIC,
                "Dresden",
                "rock-legends.webp",
            ),
            (
                "DevFest",
                EventCategory.TECHNOLOGY,
                "Leipzig",
                "devfest.webp",
            ),
            (
                "Business Networking",
                EventCategory.BUSINESS,
                "Nuremberg",
                "business-networking.webp",
            ),
        ]

        events = []

        for index, (
            title,
            category,
            city,
            image_name,
        ) in enumerate(event_data):
            start = timezone.now() + timedelta(days=index + 1)

            event = Event.objects.create(
                organizer=organizer,
                title=title,
                description=f"Demo description for {title}",
                category=category,
                venue_name=f"{city} Convention Center",
                address="Demo Street 1",
                city=city,
                country="Germany",
                start_date=start,
                end_date=start + timedelta(hours=4),
                status=Status.PUBLISHED,
            )

            image_path = IMAGE_DIR / image_name

            if image_path.exists():
                with image_path.open("rb") as image_file:
                    event.cover_image.save(
                        image_name,
                        File(image_file),
                        save=True,
                    )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"Image not found for {title}: {image_path}"
                    )
                )

            events.append(event)

        self.stdout.write(
            self.style.SUCCESS("✓ 10 events created")
        )

        return events

    def create_ticket_types(self, events):
        self.stdout.write("Creating ticket types...")

        tickets = {}

        for event in events:
            regular = TicketType.objects.create(
                event=event,
                name="Regular",
                description="General admission",
                price=Decimal("25.00"),
                total_quantity=100,
                remaining_quantity=99,
            )

            vip = TicketType.objects.create(
                event=event,
                name="VIP",
                description="Premium seating",
                price=Decimal("60.00"),
                total_quantity=50,
                remaining_quantity=50,
            )

            early = TicketType.objects.create(
                event=event,
                name="Early Bird",
                description="Limited offer",
                price=Decimal("18.00"),
                total_quantity=30,
                remaining_quantity=30,
            )

            tickets[event.id] = regular

        self.stdout.write(self.style.SUCCESS("✓ Ticket types created"))

        return tickets
    
    def create_orders(self, buyer, regular_ticket_types):
        self.stdout.write("Creating orders...")

        orders = []

        for event_id, ticket_type in regular_ticket_types.items():
            order = Order.objects.create(
                user=buyer,
                event=ticket_type.event,
                status=OrderStatus.PAID,
                total_price=ticket_type.price,
                currency="EUR",
                paid_at=timezone.now(),
            )

            order_item = OrderItem.objects.create(
                order=order,
                ticket_type=ticket_type,
                quantity=1,
                unit_price=ticket_type.price,
            )

            orders.append(order_item)

            ticket_type.remaining_quantity -= 1
            ticket_type.save(update_fields=["remaining_quantity"])

        self.stdout.write(
            self.style.SUCCESS("✓ 10 orders created")
        )

        return orders


    def create_tickets(self, order_items):
        self.stdout.write("Creating tickets...")

        for order_item in order_items:
            Ticket.objects.create(
                order_item=order_item,
                owner=order_item.order.user,
                event=order_item.order.event,
                ticket_type=order_item.ticket_type,
            )

        self.stdout.write(
            self.style.SUCCESS("✓ 10 tickets created")
        )

    def clear_event_images(self):
        covers_dir = Path(settings.MEDIA_ROOT) / "events" / "covers"

        if covers_dir.exists():
            shutil.rmtree(covers_dir)

        covers_dir.mkdir(parents=True, exist_ok=True)

        self.stdout.write(
            self.style.SUCCESS("✓ Old event images removed")
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(
            self.style.WARNING("Seeding TicketFlow development database...")
        )

        self.clear_event_images()
        
        admin, organizer, buyer = self.create_users()

        events = self.create_events(organizer)

        regular_ticket_types = self.create_ticket_types(events)

        order_items = self.create_orders(
            buyer,
            regular_ticket_types,
        )

        self.create_tickets(order_items)

        self.stdout.write("")
        self.stdout.write("=" * 50)
        self.stdout.write(
            self.style.SUCCESS("TicketFlow database seeded successfully!")
        )
        self.stdout.write("=" * 50)
        self.stdout.write("")

        self.stdout.write("👑 Admin")
        self.stdout.write("Email: admin@ticketflow.dev")
        self.stdout.write("Password: Admin123!")
        self.stdout.write("")

        self.stdout.write("🏢 Organizer")
        self.stdout.write("Email: organizer@ticketflow.dev")
        self.stdout.write("Password: Organizer123!")
        self.stdout.write("")

        self.stdout.write("👤 Buyer")
        self.stdout.write("Email: buyer@ticketflow.dev")
        self.stdout.write("Password: Buyer123!")
        self.stdout.write("")