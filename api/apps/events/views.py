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
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from urllib.parse import urlencode
from rest_framework.response import Response


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

    def list(self, request, *args, **kwargs):
        query_string = urlencode(
            sorted(request.query_params.lists()),
            doseq=True,

        )
        cache_key = f"events:list:{query_string}"
        cached_response = cache.get(cache_key)
        if cached_response is not None:
            return Response(cached_response)
        response = super().list(request, *args, **kwargs)
        cache.set(
            cache_key,
            response.data,
            timeout=60,
        )
        return response

    def get_queryset(self):
        return (
            Event.objects.filter(status=Status.PUBLISHED)
            .select_related("organizer")
            .prefetch_related("ticket_types")
        )


@extend_schema(
    tags=["Events"],
    summary="Get event details",
    description="Returns the details of a published event by its slug.",
    responses={
        200: EventDetailSerializer,
        404: OpenApiResponse(description="Event not found."),
    },
)
class EventDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = EventDetailSerializer

    def get_object(self):
        slug = self.kwargs["slug"]
        cache_key = f"events:detail:{slug}"

        event = cache.get(cache_key)

        if event is None:
            event = get_object_or_404(
                Event.objects
                .select_related("organizer")
                .prefetch_related("ticket_types"),
                slug=slug,
                status=Status.PUBLISHED,
            )

            cache.set(
                cache_key,
                event,
                timeout=60,
            )

        return event

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
        cache.delete_pattern("events:list:*")
        


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
    
    def perform_update(self, serializer):
        old_slug = serializer.instance.slug
        event = serializer.save()

        cache.delete_pattern("events:list:*")
        cache.delete(f"events:detail:{old_slug}")
        cache.delete(f"events:detail:{event.slug}")

    def perform_destroy(self, instance):
        slug = instance.slug
        instance.delete()

        cache.delete_pattern("events:list:*")
        cache.delete(f"events:detail:{slug}")

        
        
    def get_serializer_class(self):
        if self.request.method == "GET":
            return EventDetailSerializer
        return EventCreateUpdateSerializer