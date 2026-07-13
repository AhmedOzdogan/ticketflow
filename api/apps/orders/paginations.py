from rest_framework.pagination import PageNumberPagination
from django.db.models import Count, Q
from rest_framework.response import Response
from .models import Order, OrderStatus,Ticket, TicketStatus



class DefaultPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 20



class OrderPagination(DefaultPagination):
    def get_paginated_response(self, data):
        stats = Order.objects.aggregate(
            total=Count("id"),

            pending=Count(
                "id",
                filter=Q(status=OrderStatus.PENDING),
            ),

            processing=Count(
                "id",
                filter=Q(status=OrderStatus.PROCESSING),
            ),

            paid=Count(
                "id",
                filter=Q(status=OrderStatus.PAID),
            ),

            failed=Count(
                "id",
                filter=Q(status=OrderStatus.FAILED),
            ),

            cancelled=Count(
                "id",
                filter=Q(status=OrderStatus.CANCELLED),
            ),

            expired=Count(
                "id",
                filter=Q(status=OrderStatus.EXPIRED),
            ),

            refunded=Count(
                "id",
                filter=Q(status=OrderStatus.REFUNDED),
            ),
        )

        return Response(
            {
                "count": self.page.paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "stats": stats,
                "results": data,
            }
        )


class TicketPagination(DefaultPagination):
    def paginate_queryset(self, queryset, request, view=None):
        self.filtered_queryset = queryset
        return super().paginate_queryset(queryset, request, view)

    def get_paginated_response(self, data):
        stats = self.filtered_queryset.aggregate(
            total=Count("id"),

            active=Count(
                "id",
                filter=Q(status=TicketStatus.ACTIVE),
            ),

            used=Count(
                "id",
                filter=Q(status=TicketStatus.USED),
            ),

            cancelled=Count(
                "id",
                filter=Q(status=TicketStatus.CANCELLED),
            ),

            refunded=Count(
                "id",
                filter=Q(status=TicketStatus.REFUNDED),
            ),
        )

        return Response(
            {
                "count": self.page.paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "stats": stats,
                "results": data,
            }
        )