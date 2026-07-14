import os
import urllib.error
import urllib.request

from django.core.cache import cache
from django.db import connection
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        services = {
            "api": "ok",
            "database": "ok",
            "redis": "ok",
            "payments": "ok",
        }

        # PostgreSQL
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception:
            services["database"] = "error"

        # Redis
        try:
            cache.set("healthcheck", "ok", timeout=10)

            if cache.get("healthcheck") != "ok":
                services["redis"] = "error"

        except Exception:
            services["redis"] = "error"

        # Express Payments
        payments_url = os.getenv(
            "PAYMENTS_HEALTH_URL",
            "http://payment:5001/",
        )

        try:
            with urllib.request.urlopen(payments_url, timeout=3) as response:
                print(response.status)
                if response.status != 200:
                    services["payments"] = "error"

        except (
            urllib.error.URLError,
            urllib.error.HTTPError,
            TimeoutError,
        ):
            services["payments"] = "error"

        healthy = all(status == "ok" for status in services.values())

        return Response(
            {
                "status": "healthy" if healthy else "unhealthy",
                "services": services,
            },
            status=(
                status.HTTP_200_OK
                if healthy
                else status.HTTP_503_SERVICE_UNAVAILABLE
            ),
        )