

from django.urls import path

from .views import (
    EventDetailView,
    EventListView,
    EventListView,
    EventManageView,
)

app_name = "events"

urlpatterns = [
    # Public Events
    path("", EventListView.as_view(), name="event-list"),

    # Organizer / Admin Events
    path("manage/", EventListView.as_view(), name="event-list"),
    path("manage/<uuid:id>/", EventManageView.as_view(), name="event-manage"),

    path("<slug:slug>/", EventDetailView.as_view(), name="event-detail"),
]