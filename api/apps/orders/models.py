import uuid

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.events.models import Event, TicketType


class OrderStatus(models.TextChoices):
    PENDING = "pending", _("Pending")
    PROCESSING = "processing", _("Processing")
    PAID = "paid", _("Paid")
    FAILED = "failed", _("Failed")
    CANCELLED = "cancelled", _("Cancelled")
    EXPIRED = "expired", _("Expired")
    REFUNDED = "refunded", _("Refunded")


class Order(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders",
    )

    event = models.ForeignKey(
        Event,
        on_delete=models.PROTECT,
        related_name="orders",
    )

    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        db_index=True,
    )

    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    currency = models.CharField(max_length=3, default="EUR")

    stripe_checkout_session_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True,
    )

    stripe_payment_intent_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["event", "status"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"Order {self.id}"


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    ticket_type = models.ForeignKey(
        TicketType,
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    quantity = models.PositiveIntegerField()

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["order", "ticket_type"],
                name="unique_ticket_type_per_order",
            ),
        ]

    @property
    def total_price(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.quantity} × {self.ticket_type}"


class TicketStatus(models.TextChoices):
    ACTIVE = "active", _("Active")
    USED = "used", _("Used")
    CANCELLED = "cancelled", _("Cancelled")
    REFUNDED = "refunded", _("Refunded")


class Ticket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    order_item = models.ForeignKey(
        OrderItem,
        on_delete=models.CASCADE,
        related_name="tickets",
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="tickets",
    )

    event = models.ForeignKey(
        Event,
        on_delete=models.PROTECT,
        related_name="tickets",
    )

    ticket_type = models.ForeignKey(
        TicketType,
        on_delete=models.PROTECT,
        related_name="tickets",
    )

    qr_code = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )

    status = models.CharField(
        max_length=20,
        choices=TicketStatus.choices,
        default=TicketStatus.ACTIVE,
        db_index=True,
    )

    used_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["event", "status"]),
            models.Index(fields=["owner", "status"]),
        ]

    def __str__(self):
        return f"Ticket {self.id}"