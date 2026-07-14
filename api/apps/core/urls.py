from django.urls import path

from .views import (
    HealthCheckView,
    ApiInfoView
)

app_name = "core"

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check",),
    path("", ApiInfoView.as_view(), name="api-info",
),
]
