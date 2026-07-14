from datetime import timedelta

from django.core.cache import cache
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.orders.models import Order, OrderStatus


RESERVATION_MINUTES = 10


class Command(BaseCommand):
    help = "Cancel pending orders whose Redis reservations have expired."

    def handle(self, *args, **options):
        expiration_time = timezone.now() - timedelta(
            minutes=RESERVATION_MINUTES,
        )

        expired_order_ids = list(
            Order.objects.filter(
                status=OrderStatus.PENDING,
                created_at__lte=expiration_time,
            ).values_list("id", flat=True)
        )

        cancelled_count = 0

        for order_id in expired_order_ids:
            with transaction.atomic():
                order = (
                    Order.objects
                    .select_for_update()
                    .filter(id=order_id)
                    .first()
                )

                if order is None:
                    continue

                # The Stripe webhook may have completed the order
                # while this cleanup command was running.
                if order.status != OrderStatus.PENDING:
                    continue

                reservation_key = f"reservation:{order.id}"

                # If the reservation still exists, it has not expired yet.
                if cache.get(reservation_key) is not None:
                    continue

                order.status = OrderStatus.CANCELLED
                order.save(
                    update_fields=[
                        "status",
                        "updated_at",
                    ]
                )

                cancelled_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Cancelled {cancelled_count} expired pending order(s)."
            )
        )