import secrets

from django.conf import settings
from rest_framework.permissions import BasePermission


class IsPaymentService(BasePermission):
    def has_permission(self, request, view):
        authorization = request.headers.get("Authorization", "")

        expected = f"Bearer {settings.PAYMENT_SERVICE_TOKEN}"

        return (
            bool(settings.PAYMENT_SERVICE_TOKEN)
            and secrets.compare_digest(authorization, expected)
        )