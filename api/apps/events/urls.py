

from django.urls import path

from .views import (
    EventDetailView,
    EventListView,
    EventListManageView,
    EventCreateView,
    EventManageView,
)

app_name = "events"

urlpatterns = [
    # Organizer / Admin Events
    path("manage/", EventListManageView.as_view(), name="event-list"),
    path("manage/<uuid:id>/", EventManageView.as_view(), name="event-manage"),
    path("create/", EventCreateView.as_view(), name="event-create"),

    # Public Events
    path("", EventListView.as_view(), name="event-list"),
    path("<slug:slug>/", EventDetailView.as_view(), name="event-detail"),
]