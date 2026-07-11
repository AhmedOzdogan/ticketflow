from django.urls import path

from .views import (
    OrderCreateView,
    OrderDetailView,
    OrderListView,
    TicketListView,
    TicketScanView,
)

app_name = "orders"

urlpatterns = [
    path("", OrderListView.as_view(), name="order-list"),
    path("create/", OrderCreateView.as_view(), name="order-create"),
    path("<uuid:id>/", OrderDetailView.as_view(), name="order-detail"),
    path("tickets/", TicketListView.as_view(), name="ticket-list"),
    path(
        "tickets/<uuid:qr_code>/scan/",
        TicketScanView.as_view(),
        name="ticket-scan",
    ),
]