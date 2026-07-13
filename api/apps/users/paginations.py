from django.db.models import Count, Q
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from apps.users.models import OrganizerApprovalStatus
from apps.users.models import (
    OrganizerApprovalStatus,
    UserRole,
)
from .models import User

class DefaultPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100



class UserPagination(DefaultPagination):
    def get_paginated_response(self, data):
        base_queryset = User.objects.all()

        stats = base_queryset.aggregate(
            total=Count("id"),

            buyers=Count(
                "id",
                filter=Q(role=UserRole.BUYER),
            ),

            organizers=Count(
                "id",
                filter=Q(role=UserRole.ORGANIZER),
            ),

            admins=Count(
                "id",
                filter=Q(role=UserRole.ADMIN),
            ),

            organizers_pending=Count(
                "id",
                filter=Q(
                    role=UserRole.ORGANIZER,
                    organizer_approval_status=OrganizerApprovalStatus.PENDING,
                ),
            ),

            organizers_approved=Count(
                "id",
                filter=Q(
                    role=UserRole.ORGANIZER,
                    organizer_approval_status=OrganizerApprovalStatus.APPROVED,
                ),
            ),

            organizers_rejected=Count(
                "id",
                filter=Q(
                    role=UserRole.ORGANIZER,
                    organizer_approval_status=OrganizerApprovalStatus.REJECTED,
                ),
            ),
        )

        return Response(
            {
                "count": self.page.paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "stats": {
                    "total": stats["total"],
                    "buyers": stats["buyers"],
                    "admins": stats["admins"],
                    "organizers": {
                        "total": stats["organizers"],
                        "pending": stats["organizers_pending"],
                        "approved": stats["organizers_approved"],
                        "rejected": stats["organizers_rejected"],
                    },
                },
                "results": data,
            }
        )