import django_filters

from .models import Event, TicketType


class EventFilter(django_filters.FilterSet):
    class Meta:
        model = Event
        fields = {
            "category": ["exact"],
            "city": ["exact", "icontains"],
            "country": ["exact", "icontains"],
            "venue_name": ["icontains"],
            "status": ["exact"],
            "start_date": ["gte", "lte"],
            "end_date": ["gte", "lte"],
        }


class TicketTypeFilter(django_filters.FilterSet):
    class Meta:
        model = TicketType
        fields = {
            "event": ["exact"],
            "price": ["exact", "gte", "lte"],
            "remaining_quantity": ["exact", "gte", "lte"],
        }