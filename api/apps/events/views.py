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
from .paginations import DefaultPagination, EventPagination
from rest_framework.filters import OrderingFilter
from drf_spectacular.utils import (
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)


@extend_schema(
    tags=["Events"],
    summary="List published events",
    description="Returns a paginated list of published events visible to the public.",
    responses={
        200: EventListSerializer,
    },
)
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


@extend_schema(
    tags=["Events"],
    summary="Get event details",
    description="Returns the details of a published event by its slug.",
    responses={
        200: EventListSerializer,
        404: OpenApiResponse(description="Event not found."),
    },
)
class EventDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = EventListSerializer
    queryset = Event.objects.filter(
        status=Status.PUBLISHED,
    ).select_related(
        "organizer"
    ).prefetch_related("ticket_types")
    lookup_field = "slug"


@extend_schema(
    tags=["Events"],
    summary="List managed events",
    description=(
        "Returns the authenticated organizer's events. "
        "Administrators receive all events."
    ),
    responses={
        200: EventDetailSerializer,
        401: OpenApiResponse(description="Authentication required."),
        403: OpenApiResponse(
            description="Approved organizer or administrator access required."
        ),
    },
)
class EventListManageView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsApprovedOrganizer | IsAdmin]
    serializer_class = EventDetailSerializer
    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]
    filterset_class = EventFilter
    pagination_class = EventPagination
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


@extend_schema(
    tags=["Events"],
    summary="Create event",
    description="Creates a new event for the authenticated organizer.",
    request=EventCreateUpdateSerializer,
    responses={
        201: EventCreateUpdateSerializer,
        400: OpenApiResponse(description="Invalid event data."),
        401: OpenApiResponse(description="Authentication required."),
        403: OpenApiResponse(
            description="Approved organizer or administrator access required."
        ),
    },
)
class EventCreateView(generics.CreateAPIView):
    permission_classes = [
        permissions.IsAuthenticated,
        IsApprovedOrganizer | IsAdmin,
    ]
    serializer_class = EventCreateUpdateSerializer

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)


@extend_schema_view(
    get=extend_schema(
        tags=["Events"],
        summary="Get managed event",
        description=(
            "Returns a single event owned by the authenticated organizer. "
            "Administrators can retrieve any event."
        ),
        responses={
            200: EventDetailSerializer,
            401: OpenApiResponse(description="Authentication required."),
            403: OpenApiResponse(
                description="Approved organizer or administrator access required."
            ),
            404: OpenApiResponse(description="Event not found."),
        },
    ),
    put=extend_schema(
        tags=["Events"],
        summary="Replace event",
        description="Replaces all editable fields of an existing event.",
        request=EventCreateUpdateSerializer,
        responses={
            200: EventCreateUpdateSerializer,
            400: OpenApiResponse(description="Invalid event data."),
            401: OpenApiResponse(description="Authentication required."),
            403: OpenApiResponse(
                description="Approved organizer or administrator access required."
            ),
            404: OpenApiResponse(description="Event not found."),
        },
    ),
    patch=extend_schema(
        tags=["Events"],
        summary="Update event",
        description="Partially updates an existing event.",
        request=EventCreateUpdateSerializer,
        responses={
            200: EventCreateUpdateSerializer,
            400: OpenApiResponse(description="Invalid event data."),
            401: OpenApiResponse(description="Authentication required."),
            403: OpenApiResponse(
                description="Approved organizer or administrator access required."
            ),
            404: OpenApiResponse(description="Event not found."),
        },
    ),
    delete=extend_schema(
        tags=["Events"],
        summary="Delete event",
        description="Deletes an existing event.",
        responses={
            204: None,
            401: OpenApiResponse(description="Authentication required."),
            403: OpenApiResponse(
                description="Approved organizer or administrator access required."
            ),
            404: OpenApiResponse(description="Event not found."),
        },
    ),
)
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