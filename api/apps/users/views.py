from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .models import (
    User,
    UserRole,
    OrganizerApprovalStatus,

)
from .permissions import IsAdmin
from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    OrganizerApprovalSerializer,
    RegisterSerializer,
    UserMeSerializer,
    UserUpdateSerializer,
    UserListSerializer,
    UserStatsSerializer,
    AuthResponseSerializer,
    LogoutSerializer,
    TokenRefreshResponseSerializer,
    DetailSerializer,
)

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .filters import UserFilter
from .paginations import DefaultPagination,UserPagination
from rest_framework.filters import OrderingFilter
from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiResponse,
)


@extend_schema(
    tags=["Authentication"],
    summary="Register a new user",
    description="Creates a new user account and returns JWT access and refresh tokens together with the authenticated user's information.",
    request=RegisterSerializer,
    responses={
        201: AuthResponseSerializer,
        400: OpenApiResponse(description="Invalid registration data."),
    },
)
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserMeSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema(
    tags=["Authentication"],
    summary="Login",
    description="Authenticates a user and returns JWT access and refresh tokens.",
    request=LoginSerializer,
    responses={
        200: AuthResponseSerializer,
        400: OpenApiResponse(description="Invalid email or password."),
    },
)
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserMeSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(
    tags=["Authentication"],
    summary="Logout",
    description="Invalidates the provided refresh token by adding it to the blacklist.",
    request=LogoutSerializer,
    responses={
        205: None,
        400: OpenApiResponse(description="Invalid or missing refresh token."),
        401: OpenApiResponse(description="Authentication credentials were not provided."),
    },
)
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response({"detail": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_205_RESET_CONTENT)


@extend_schema_view(

    get=extend_schema(
        tags=["Users"],
        summary="Get current user",
        description="Returns the authenticated user's profile.",
        responses={
            200: UserMeSerializer,
            401: OpenApiResponse(
                description="Authentication required."
            ),
        },
    ),

    put=extend_schema(
        tags=["Users"],
        summary="Replace current user profile",
        description="Replaces the authenticated user's editable profile information.",
        request=UserUpdateSerializer,
        responses={
            200: UserUpdateSerializer,
            400: OpenApiResponse(
                description="Invalid profile data."
            ),
            401: OpenApiResponse(
                description="Authentication required."
            ),
        },
    ),

    patch=extend_schema(
        tags=["Users"],
        summary="Update current user profile",
        description="Partially updates the authenticated user's profile information.",
        request=UserUpdateSerializer,
        responses={
            200: UserUpdateSerializer,
            400: OpenApiResponse(
                description="Invalid profile data."
            ),
            401: OpenApiResponse(
                description="Authentication required."
            ),
        },
    ),
)
class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserUpdateSerializer
        return UserMeSerializer


@extend_schema(
    tags=["Users"],
    summary="Change password",
    description="Changes the authenticated user's password.",
    request=ChangePasswordSerializer,
    responses={
        200: DetailSerializer,
        400: DetailSerializer,
        401: DetailSerializer,
    },
)
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password", "updated_at"])

        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Admin"],
    summary="List users",
    description="Returns a paginated list of users. Accessible only to administrators.",
    responses={
        200: UserListSerializer,
        401: OpenApiResponse(description="Authentication required."),
        403: OpenApiResponse(description="Administrator access required."),
    },
)
class UserListView(generics.ListAPIView):
    queryset = User.objects.select_related("organizer_profile").order_by("-created_at")
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    pagination_class = UserPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = UserFilter
    search_fields = [
        "email",
        "first_name",
        "last_name",
        "phone_number",
        "organizer_profile__company_name",

    ]

    ordering_fields = [
    "created_at",
    "updated_at",
    "email",
    "first_name",
    "last_name",
    "role",

    ]

    ordering = ["-created_at"]


@extend_schema(
    tags=["Admin"],
    summary="Approve or reject organizer",
    description="Updates an organizer's approval status. Accessible only to administrators.",
    request=OrganizerApprovalSerializer,
    responses={
        200: OrganizerApprovalSerializer,
        400: OpenApiResponse(description="Invalid approval request."),
        401: OpenApiResponse(description="Authentication required."),
        403: OpenApiResponse(description="Administrator access required."),
        404: OpenApiResponse(description="Organizer not found."),
    },
)
class OrganizerApprovalView(generics.UpdateAPIView):
    queryset = User.objects.filter(role="organizer")
    serializer_class = OrganizerApprovalSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


@extend_schema(
    tags=["Authentication"],
    summary="Refresh access token",
    description="Generates a new JWT access token using a valid refresh token.",
    responses={
        200: TokenRefreshResponseSerializer,
        401: OpenApiResponse(description="Invalid or expired refresh token."),
    },
)
class TokenRefresh(TokenRefreshView):
    permission_classes = [permissions.AllowAny]