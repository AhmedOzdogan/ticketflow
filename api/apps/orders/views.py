from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import (
    Order,
    OrderItem,
    Ticket,
    OrderStatus,
    TicketStatus,
)
from .serializers import (
    OrderCreateSerializer,
    OrderSerializer,
    TicketSerializer,
    TicketScanSerializer,
    TicketPdfSerializer,
)
from apps.users.permissions import IsAdmin, IsApprovedOrganizer
from rest_framework.filters import SearchFilter
from .filters import (
    OrderFilter,
    TicketFilter
)
from .paginations import DefaultPagination,OrderPagination,TicketPagination
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.utils import timezone
from .permissions import IsPaymentService
from apps.events.models import TicketType

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
    pagination_class = OrderPagination

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
    pagination_class = TicketPagination

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
            pass
        elif user.is_approved_organizer:
            queryset = queryset.filter(event__organizer=user)
        else:
            queryset = queryset.filter(owner=user)

        order_id = self.request.query_params.get("order")
        if order_id:
            queryset = queryset.filter(order_item__order_id=order_id)

        return queryset


class TicketDownloadView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TicketPdfSerializer
    lookup_field = "id"

    queryset = Ticket.objects.select_related(
        "event",
        "ticket_type",
        "owner",
        "event__organizer",
    )


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


class PaymentOrderDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer
    lookup_field = "id"
    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .select_related("event", "user")
            .prefetch_related("items__ticket_type")
        )


class CompletePaymentView(generics.UpdateAPIView):
    authentication_classes=[]
    permission_classes = [IsPaymentService]
    lookup_field = "id"

    queryset = (
        Order.objects
        .select_related("event", "user")
        .prefetch_related("items__ticket_type")
    )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        order = self.get_object()

        if order.status == "paid":
            return Response(
                {
                    "id": str(order.id),
                    "status": order.status,
                }
            )

        if order.status != "pending":
            return Response(
                {"detail": "Order cannot be processed."},
                status=409,
            )

        order.status = "paid"
        order.paid_at = timezone.now()
        order.stripe_checkout_session_id = request.data.get(
            "stripe_checkout_session_id"
        )
        order.stripe_payment_intent_id = request.data.get(
            "stripe_payment_intent_id"
        )
        order.save()

        for item in order.items.select_related("ticket_type"):
            ticket_type = TicketType.objects.select_for_update().get(
                id=item.ticket_type.id
            )

            ticket_type.remaining_quantity -= item.quantity
            ticket_type.save()

            for _ in range(item.quantity):
                Ticket.objects.create(
                    order_item=item,
                    owner=order.user,
                    event=order.event,
                    ticket_type=ticket_type,
                    status=TicketStatus.ACTIVE,
                )

        return Response(
            {
                "id": str(order.id),
                "status": order.status,
            }
        )


class CancelOrderView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    queryset = Order.objects.all()

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        order = self.get_object()

        if order.user != request.user:
            raise PermissionDenied()

        if order.status != OrderStatus.PENDING:
            return Response(
                {
                    "detail": "Only pending orders can be cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = OrderStatus.CANCELLED
        order.save(update_fields=["status"])

        return Response(
            {
                "id": str(order.id),
                "status": order.status,
            }
        )
        
    @transaction.atomic
    def patch(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)