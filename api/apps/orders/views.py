from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import Order, Ticket
from .serializers import (
    OrderCreateSerializer,
    OrderSerializer,
    TicketSerializer,
    TicketScanSerializer,
)
from apps.users.permissions import IsAdmin, IsApprovedOrganizer
from rest_framework.filters import SearchFilter
from .filters import (
    OrderFilter,
    TicketFilter)
from .paginations import DefaultPagination
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

class OrderCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderCreateSerializer


class OrderListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_class = OrderFilter
    pagination_class = DefaultPagination

    search_fields = [
        "event__title",
        "status",
    ]

    ordering_fields = [
        "created_at",
        "paid_at",
        "total_price",
    ]

    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Order.objects
            .select_related("event", "user")
            .prefetch_related("items__ticket_type")
        )

        if user.role == "admin":
            return queryset

        if user.is_approved_organizer:
            return queryset.filter(event__organizer=user)

        return queryset.filter(user=user)


class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer
    lookup_field = "id"

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .select_related("event")
            .prefetch_related("items__ticket_type")
        )


class TicketListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TicketSerializer

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_class = TicketFilter
    pagination_class = DefaultPagination

    search_fields = [
        "event__title",
        "owner__email",
        "status",
    ]

    ordering_fields = [
        "created_at",
        "used_at",
    ]

    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user

        queryset = Ticket.objects.select_related(
            "event",
            "ticket_type",
            "owner",
            "event__organizer",
        )

        if user.role == "admin":
            return queryset

        if user.is_approved_organizer:
            return queryset.filter(event__organizer=user)

        return queryset.filter(owner=user)


class TicketScanView(generics.UpdateAPIView):
    permission_classes = [
        permissions.IsAuthenticated,
        IsApprovedOrganizer | IsAdmin,
    ]
    serializer_class = TicketScanSerializer
    lookup_field = "qr_code"

    def get_queryset(self):
        return Ticket.objects.select_related(
            "event",
            "ticket_type",
            "owner",
            "event__organizer",
        )

    def update(self, request, *args, **kwargs):
        ticket = self.get_object()

        if (
            request.user.role != "admin"
            and ticket.event.organizer != request.user
        ):
            raise PermissionDenied(
                "You do not have permission to check in tickets for this event."
            )

        serializer = self.get_serializer(
            ticket,
            data={},
            partial=True,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)