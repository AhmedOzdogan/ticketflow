from rest_framework.pagination import PageNumberPagination
from django.db.models import Count, Q
from rest_framework.response import Response

from apps.events.models import Event, Status


class DefaultPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = "page_size"
    max_page_size = 10


class EventPagination(DefaultPagination):
    def get_paginated_response(self, data):
        stats = Event.objects.aggregate(
            total=Count("id"),

            draft=Count(
                "id",
                filter=Q(status=Status.DRAFT),
            ),

            pending=Count(
                "id",
                filter=Q(status=Status.PENDING),
            ),

            published=Count(
                "id",
                filter=Q(status=Status.PUBLISHED),
            ),

            cancelled=Count(
                "id",
                filter=Q(status=Status.CANCELLED),
            ),

            completed=Count(
                "id",
                filter=Q(status=Status.COMPLETED),
            ),
        )

        return Response(
            {
                "count": self.page.paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "stats": {
                    "total": stats["total"],
                    "draft": stats["draft"],
                    "pending": stats["pending"],
                    "published": stats["published"],
                    "cancelled": stats["cancelled"],
                    "completed": stats["completed"],
                },
                "results": data,
            }
        )