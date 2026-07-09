

from rest_framework import serializers

from .models import Event, TicketType


class TicketTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketType
        fields = [
            "id",
            "name",
            "description",
            "price",
            "total_quantity",
            "remaining_quantity",
        ]
        read_only_fields = ["id", "remaining_quantity"]


class TicketTypeCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketType
        fields = [
            "name",
            "description",
            "price",
            "total_quantity",
        ]


class EventListSerializer(serializers.ModelSerializer):
    organizer_name = serializers.SerializerMethodField()
    ticket_types = TicketTypeSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "slug",
            "cover_image",
            "category",
            "venue_name",
            "city",
            "country",
            "start_date",
            "organizer_name",
            "ticket_types"
        ]

    def get_organizer_name(self, obj):
        full_name = f"{obj.organizer.first_name} {obj.organizer.last_name}".strip()
        return full_name or obj.organizer.email


class EventDetailSerializer(serializers.ModelSerializer):
    organizer_name = serializers.SerializerMethodField()
    ticket_types = TicketTypeSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "cover_image",
            "category",
            "venue_name",
            "address",
            "city",
            "country",
            "start_date",
            "end_date",
            "organizer_name",
            "ticket_types",
        ]

    def get_organizer_name(self, obj):
        full_name = f"{obj.organizer.first_name} {obj.organizer.last_name}".strip()
        return full_name or obj.organizer.email


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "title",
            "slug",
            "description",
            "cover_image",
            "category",
            "venue_name",
            "address",
            "city",
            "country",
            "start_date",
            "end_date",
            "status",
        ]