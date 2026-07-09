from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404

from .models import Event, TicketType, Status
from .serializers import (
    EventCreateUpdateSerializer,
    EventDetailSerializer,
    EventListSerializer,
    TicketTypeCreateUpdateSerializer,
    TicketTypeSerializer,
)
from apps.users.permissions import IsAdmin, IsApprovedOrganizer

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .filters import (
    EventFilter,
    TicketTypeFilter)
from .paginations import DefaultPagination
from rest_framework.filters import OrderingFilter


class EventListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = EventListSerializer
    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]
    filterset_class = EventFilter
    pagination_class = DefaultPagination
    search_fields = [
        "title",
        "short_description",
        "description",
        "city",
        "country",
        "venue_name",
    ]
    ordering_fields = [
        "start_date",
        "created_at",
        "title",
    ]
    ordering = ["start_date"]

    def get_queryset(self):
        return Event.objects.filter(
            status=Status.PUBLISHED,
        ).select_related("organizer")


class EventDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = EventDetailSerializer
    queryset = Event.objects.select_related(
        "organizer"
    ).prefetch_related("ticket_types")
    lookup_field = "slug"


class EventListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsApprovedOrganizer | IsAdmin]
    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]
    filterset_class = EventFilter
    pagination_class = DefaultPagination
    search_fields = [
        "title",
        "city",
        "venue_name",
    ]
    ordering_fields = [
        "created_at",
        "start_date",
        "title",
    ]
    ordering = ["-created_at"]

    def get_queryset(self):
        if self.request.user.role == "admin":
            return Event.objects.select_related("organizer")

        return Event.objects.filter(
            organizer=self.request.user,
        ).select_related("organizer")

    def get_serializer_class(self):
        if self.request.method == "GET":
            return EventListSerializer
        return EventCreateUpdateSerializer

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)


class EventManageView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsApprovedOrganizer | IsAdmin]
    queryset = Event.objects.select_related("organizer")

    def get_serializer_class(self):
        if self.request.method == "GET":
            return EventDetailSerializer
        return EventCreateUpdateSerializer


class TicketTypeListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsApprovedOrganizer | IsAdmin]
    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]
    filterset_class = TicketTypeFilter
    pagination_class = DefaultPagination
    search_fields = [
        "name",
        "description",
    ]
    ordering_fields = [
        "price",
        "created_at",
        "remaining_quantity",
    ]
    ordering = ["price"]

    def get_queryset(self):
        return TicketType.objects.filter(
            event_id=self.kwargs["event_id"]
        ).select_related("event")

    def get_serializer_class(self):
        if self.request.method == "GET":
            return TicketTypeSerializer
        return TicketTypeCreateUpdateSerializer

    def perform_create(self, serializer):
        event = get_object_or_404(Event, pk=self.kwargs["event_id"])
        serializer.save(
            event=event,
            remaining_quantity=serializer.validated_data["total_quantity"],
        )


class TicketTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsApprovedOrganizer | IsAdmin]
    queryset = TicketType.objects.select_related("event")

    def get_serializer_class(self):
        if self.request.method == "GET":
            return TicketTypeSerializer
        return TicketTypeCreateUpdateSerializer
