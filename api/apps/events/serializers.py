from rest_framework import serializers
from .models import Event, TicketType
from django.http import QueryDict
import json


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
    ticket_types = TicketTypeCreateUpdateSerializer(many=True, write_only=True)

    start_date = serializers.DateTimeField(input_formats=["iso-8601"])

    end_date = serializers.DateTimeField(input_formats=["iso-8601"])

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
            "status",
            "ticket_types",
        ]
        read_only_fields = ["id", "slug"]

    def create(self, validated_data):
        ticket_types_data = validated_data.pop("ticket_types", [])
        event = Event.objects.create(**validated_data)

        for ticket_data in ticket_types_data:
            TicketType.objects.create(
                event=event,
                remaining_quantity=ticket_data["total_quantity"],
                **ticket_data,
            )

        return event

    def update(self, instance, validated_data):
        ticket_types_data = validated_data.pop("ticket_types", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if ticket_types_data is not None:
            instance.ticket_types.all().delete()

            for ticket_data in ticket_types_data:
                TicketType.objects.create(
                    event=instance,
                    remaining_quantity=ticket_data["total_quantity"],
                    **ticket_data,
                )
    
        return instance

    def to_internal_value(self, data):
        if isinstance(data, QueryDict):
            data = data.dict()
        else:
            data = data.copy()

        ticket_types = data.get("ticket_types")

        if isinstance(ticket_types, str):
            data["ticket_types"] = json.loads(ticket_types)

        return super().to_internal_value(data)
        