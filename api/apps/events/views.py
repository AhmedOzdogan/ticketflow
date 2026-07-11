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
        "description",
        "category",
        "city",
        "country",
        "venue_name",
        "organizer__first_name",
        "organizer__last_name",
        "organizer__email",
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
        ).select_related("organizer").prefetch_related("ticket_types")


class EventDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = EventListSerializer
    queryset = Event.objects.filter(
        status=Status.PUBLISHED,
    ).select_related(
        "organizer"
    ).prefetch_related("ticket_types")
    lookup_field = "slug"

class EventListManageView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsApprovedOrganizer | IsAdmin]
    serializer_class = EventDetailSerializer
    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]
    filterset_class = EventFilter
    pagination_class = DefaultPagination
    search_fields = [
        "title",
        "description",
        "category",
        "city",
        "country",
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
            return Event.objects.select_related("organizer").prefetch_related("ticket_types")

        return Event.objects.filter(
            organizer=self.request.user,
        ).select_related("organizer").prefetch_related("ticket_types")

class EventCreateView(generics.CreateAPIView):
    permission_classes = [
        permissions.IsAuthenticated,
        IsApprovedOrganizer | IsAdmin,
    ]
    serializer_class = EventCreateUpdateSerializer

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
        
class EventManageView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsApprovedOrganizer | IsAdmin]
    lookup_field = "id"

    def get_queryset(self):
        if self.request.user.role == "admin":
            return Event.objects.select_related("organizer").prefetch_related("ticket_types")

        return Event.objects.filter(
            organizer=self.request.user,
        ).select_related("organizer").prefetch_related("ticket_types")
    
    def get_serializer_class(self):
        if self.request.method == "GET":
            return EventDetailSerializer
        return EventCreateUpdateSerializer