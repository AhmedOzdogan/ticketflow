import django_filters

from .models import Order, Ticket


class OrderFilter(django_filters.FilterSet):
    class Meta:
        model = Order
        fields = {
            "status": ["exact"],
            "event": ["exact"],
            "total_price": ["exact", "gte", "lte"],
            "created_at": ["gte", "lte"],
            "paid_at": ["gte", "lte"],
        }


class TicketFilter(django_filters.FilterSet):
    class Meta:
        model = Ticket
        fields = {
            "id": ["exact"],
            "status": ["exact"],
            "event": ["exact"],
            "ticket_type": ["exact"],
            "created_at": ["gte", "lte"],
            "used_at": ["gte", "lte"],
        }