from django.contrib.auth import authenticate, password_validation
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed

from .models import OrganizerApprovalStatus, OrganizerProfile, User, UserRole


class OrganizerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizerProfile
        fields = [
            "company_name",
            "website_url",
            "organizer_details",
            "reviewed_at",
            "rejection_reason",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["reviewed_at", "rejection_reason", "created_at", "updated_at"]


class OrganizerProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizerProfile
        fields = [
            "company_name",
            "website_url",
            "organizer_details",
        ]


class UserMeSerializer(serializers.ModelSerializer):
    organizer_profile = OrganizerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "is_email_verified",
            "organizer_approval_status",
            "profile_image_url",
            "organizer_profile",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class OrganizerListSerializer(serializers.ModelSerializer):
    organizer_profile = OrganizerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "organizer_approval_status",
            "profile_image_url",
            "organizer_profile",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone_number", "profile_image_url"]


class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    website_url = serializers.URLField(write_only=True, required=False, allow_blank=True)
    organizer_details = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "confirm_password",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "company_name",
            "website_url",
            "organizer_details",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def generate_unique_username(self, email):
        base_username = email.split("@")[0][:140] or "user"
        username = base_username
        counter = 1

        while User.objects.filter(username=username).exists():
            suffix = f"-{counter}"
            username = f"{base_username[:150 - len(suffix)]}{suffix}"
            counter += 1

        return username

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value.lower()

    def validate_role(self, value):
        if value == UserRole.ADMIN:
            raise serializers.ValidationError("Admin accounts cannot be created through public registration.")
        if value not in [UserRole.BUYER, UserRole.ORGANIZER]:
            raise serializers.ValidationError("Invalid account type.")
        return value

    def validate(self, attrs):
        confirm_password = attrs.pop("confirm_password")

        if attrs["password"] != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        try:
            password_validation.validate_password(attrs["password"])
        except ValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})

        if attrs.get("role") == UserRole.ORGANIZER and not attrs.get("company_name"):
            raise serializers.ValidationError({"company_name": "Company name is required for organizer accounts."})

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        company_name = validated_data.pop("company_name", "")
        website_url = validated_data.pop("website_url", "")
        organizer_details = validated_data.pop("organizer_details", "")
        password = validated_data.pop("password")

        if validated_data.get("role") == UserRole.ORGANIZER:
            validated_data["organizer_approval_status"] = OrganizerApprovalStatus.PENDING
        else:
            validated_data["organizer_approval_status"] = OrganizerApprovalStatus.NOT_APPLICABLE

        validated_data["username"] = self.generate_unique_username(validated_data["email"])

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if user.role == UserRole.ORGANIZER:
            OrganizerProfile.objects.create(
                user=user,
                company_name=company_name,
                website_url=website_url,
                organizer_details=organizer_details,
            )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            email=attrs["email"],
            password=attrs["password"],
        )

        if not user:
            raise AuthenticationFailed("Invalid email or password.")

        attrs["user"] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        try:
            password_validation.validate_password(attrs["new_password"], self.context["request"].user)
        except ValidationError as exc:
            raise serializers.ValidationError({"new_password": list(exc.messages)})

        return attrs


class OrganizerApprovalSerializer(serializers.Serializer):
    organizer_approval_status = serializers.ChoiceField(
        choices=[OrganizerApprovalStatus.APPROVED, OrganizerApprovalStatus.REJECTED]
    )
    rejection_reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs["organizer_approval_status"] == OrganizerApprovalStatus.REJECTED and not attrs.get("rejection_reason"):
            raise serializers.ValidationError({"rejection_reason": "Rejection reason is required when rejecting an organizer."})
        return attrs

    @transaction.atomic
    def update(self, instance, validated_data):
        instance.organizer_approval_status = validated_data["organizer_approval_status"]
        instance.save(update_fields=["organizer_approval_status", "updated_at"])

        organizer_profile, _ = OrganizerProfile.objects.get_or_create(
            user=instance,
            defaults={"company_name": instance.full_name or instance.email},
        )
        organizer_profile.reviewed_at = timezone.now()
        organizer_profile.rejection_reason = validated_data.get("rejection_reason", "")
        organizer_profile.save(update_fields=["reviewed_at", "rejection_reason", "updated_at"])

        return instance

    def to_representation(self, instance):
        organizer_profile = getattr(instance, "organizer_profile", None)

        return {
            "id": instance.id,
            "email": instance.email,
            "role": instance.role,
            "organizer_approval_status": instance.organizer_approval_status,
            "rejection_reason": organizer_profile.rejection_reason if organizer_profile else "",
        }