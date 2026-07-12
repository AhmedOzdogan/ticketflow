from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.events.models import Event, TicketType
from apps.orders.models import (
    Order,
    OrderItem,
    OrderStatus,
    Ticket,
    TicketStatus,
)


class OrderItemSerializer(serializers.ModelSerializer):
    ticket_type_id = serializers.UUIDField(
        source="ticket_type.id",
        read_only=True,
    )
    ticket_type_name = serializers.CharField(
        source="ticket_type.name",
        read_only=True,
    )
    total_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "ticket_type_id",
            "ticket_type_name",
            "quantity",
            "unit_price",
            "total_price",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "ticket_type_id",
            "ticket_type_name",
            "unit_price",
            "total_price",
            "created_at",
        ]


class OrderItemCreateSerializer(serializers.Serializer):
    ticket_type = serializers.PrimaryKeyRelatedField(
        queryset=TicketType.objects.all(),
    )
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.ModelSerializer):
    event = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(),
    )
    items = OrderItemCreateSerializer(
        many=True,
        write_only=True,
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "event",
            "items",
            "status",
            "total_price",
            "currency",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "total_price",
            "currency",
            "created_at",
        ]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError(
                "At least one ticket type is required."
            )

        ticket_type_ids = [
            item["ticket_type"].id
            for item in items
        ]

        if len(ticket_type_ids) != len(set(ticket_type_ids)):
            raise serializers.ValidationError(
                "The same ticket type cannot be added more than once."
            )

        return items

    def validate(self, attrs):
        event = attrs["event"]
        items = attrs["items"]

        if event.end_date < timezone.now():
            raise serializers.ValidationError(
                {
                    "event": (
                        "Tickets cannot be purchased for an event "
                        "that has already ended."
                    )
                }
            )

        for item in items:
            ticket_type = item["ticket_type"]
            quantity = item["quantity"]

            if ticket_type.event_id != event.id:
                raise serializers.ValidationError(
                    {
                        "items": (
                            f'Ticket type "{ticket_type}" does not '
                            "belong to this event."
                        )
                    }
                )

            if quantity > ticket_type.remaining_quantity:
                raise serializers.ValidationError(
                    {
                        "items": (
                            f'Only {ticket_type.remaining_quantity} tickets '
                            f'are available for "{ticket_type}".'
                        )
                    }
                )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        items_data = validated_data.pop("items")

        ticket_type_ids = [
            item["ticket_type"].id
            for item in items_data
        ]

        locked_ticket_types = {
            ticket_type.id: ticket_type
            for ticket_type in TicketType.objects.select_for_update().filter(
                id__in=ticket_type_ids
            )
        }

        total_price = Decimal("0.00")

        for item in items_data:
            original_ticket_type = item["ticket_type"]
            quantity = item["quantity"]

            ticket_type = locked_ticket_types.get(
                original_ticket_type.id
            )

            if ticket_type is None:
                raise serializers.ValidationError(
                    "One of the selected ticket types no longer exists."
                )

            if ticket_type.event_id != validated_data["event"].id:
                raise serializers.ValidationError(
                    "One of the selected ticket types does not belong "
                    "to this event."
                )

            if quantity > ticket_type.remaining_quantity:
                raise serializers.ValidationError(
                    (
                        f'Only {ticket_type.remaining_quantity} tickets '
                        f'are available for "{ticket_type}".'
                    )
                )

            total_price += ticket_type.price * quantity

        order = Order.objects.create(
            user=request.user,
            total_price=total_price,
            status=OrderStatus.PENDING,
            **validated_data,
        )

        order_items = []

        for item in items_data:
            ticket_type = locked_ticket_types[item["ticket_type"].id]

            order_items.append(
                OrderItem(
                    order=order,
                    ticket_type=ticket_type,
                    quantity=item["quantity"],
                    unit_price=ticket_type.price,
                )
            )

        OrderItem.objects.bulk_create(order_items)

        return order

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )

    event_id = serializers.UUIDField(
        source="event.id",
        read_only=True,
    )

    event_title = serializers.CharField(
        source="event.title",
        read_only=True,
    )

    event_cover_image = serializers.ImageField(
        source="event.cover_image",
        read_only=True,
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "event_id",
            "event_title",
            "event_cover_image",
            "status",
            "total_price",
            "currency",
            "items",
            "created_at",
            "paid_at",
            "updated_at",
        ]
        read_only_fields = fields


class TicketSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(
        source="owner.email",
        read_only=True,
    )

    event_id = serializers.UUIDField(
        source="event.id",
        read_only=True,
    )

    event_title = serializers.CharField(
        source="event.title",
        read_only=True,
    )

    event_slug = serializers.CharField(
        source="event.slug",
        read_only=True,
    )

    event_cover_image = serializers.ImageField(
        source="event.cover_image",
        read_only=True,
    )

    ticket_type_id = serializers.UUIDField(
        source="ticket_type.id",
        read_only=True,
    )

    ticket_type_name = serializers.CharField(
        source="ticket_type.name",
        read_only=True,
    )

    class Meta:
        model = Ticket
        fields = [
            "id",
            "owner_email",

            "event_id",
            "event_title",
            "event_slug",
            "event_cover_image",

            "ticket_type_id",
            "ticket_type_name",

            "qr_code",
            "status",
            "used_at",
            "created_at",
        ]
        read_only_fields = fields


class TicketPdfSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title")
    event_cover_image = serializers.ImageField(source="event.cover_image")
    ticket_type_name = serializers.CharField(source="ticket_type.name")
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            "id",
            "qr_code",
            "status",
            "created_at",
            "event_title",
            "event_cover_image",
            "ticket_type_name",
            "owner_name",
        ]

    def get_owner_name(self, obj):
        return obj.owner.get_full_name() or obj.owner.email


class TicketScanSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(
        source="owner.email",
        read_only=True,
    )

    class Meta:
        model = Ticket
        fields = [
            "id",
            "owner_email",
            "event",
            "ticket_type",
            "status",
            "used_at",
            "created_at",
        ]
        read_only_fields = fields

    def validate(self, attrs):
        ticket = self.instance

        if ticket.status == TicketStatus.USED:
            raise serializers.ValidationError("This ticket has already been used.")

        if ticket.status == TicketStatus.CANCELLED:
            raise serializers.ValidationError("This ticket has been cancelled.")

        if ticket.status == TicketStatus.REFUNDED:
            raise serializers.ValidationError("This ticket has been refunded.")

        return attrs

    def update(self, instance, validated_data):
        request = self.context["request"]
        user = request.user

        if not (
            user.is_staff
            or (
                user == instance.event.organizer
                and user.is_approved_organizer
            )
        ):
            raise serializers.ValidationError(
                "You do not have permission to check in this ticket."
            )

        instance.status = TicketStatus.USED
        instance.used_at = timezone.now()
        instance.save(update_fields=["status", "used_at"])

        return instance