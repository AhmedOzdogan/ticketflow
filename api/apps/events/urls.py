

from django.urls import path

from .views import (
    EventDetailView,
    EventListCreateView,
    EventListView,
    EventManageView,
    TicketTypeDetailView,
    TicketTypeListCreateView,
)

app_name = "events"

urlpatterns = [
    # Public Events
    path("", EventListView.as_view(), name="event-list"),
    path("<slug:slug>/", EventDetailView.as_view(), name="event-detail"),

    # Organizer / Admin Events
    path("manage/", EventListCreateView.as_view(), name="event-list-create"),
    path("manage/<uuid:pk>/", EventManageView.as_view(), name="event-manage"),

    # Ticket Types
    path(
        "<uuid:event_id>/ticket-types/",
        TicketTypeListCreateView.as_view(),
        name="ticket-type-list-create",
    ),
    path(
        "types/<uuid:pk>/",
        TicketTypeDetailView.as_view(),
        name="ticket-type-detail",
    ),
]