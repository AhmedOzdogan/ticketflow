from django.urls import path

from .views import (
    ChangePasswordView,
    LoginView,
    LogoutView,
    MeView,
    OrganizerApprovalView,
    RegisterView,
    TokenRefresh,
    UserListView,
)

app_name = "users"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefresh.as_view(), name="token-refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("", UserListView.as_view(), name="user-list"),
    path("organizers/<uuid:pk>/approve/", OrganizerApprovalView.as_view(), name="approve-organizer"),
]