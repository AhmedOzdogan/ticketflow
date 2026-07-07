import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserRole(models.TextChoices):
    BUYER = "buyer", _("Buyer")
    ORGANIZER = "organizer", _("Organizer")
    ADMIN = "admin", _("Admin")


class OrganizerApprovalStatus(models.TextChoices):
    NOT_APPLICABLE = "not_applicable", _("Not applicable")
    PENDING = "pending", _("Pending")
    APPROVED = "approved", _("Approved")
    REJECTED = "rejected", _("Rejected")


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=32, blank=True)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.BUYER)
    is_email_verified = models.BooleanField(default=False)
    organizer_approval_status = models.CharField(
        max_length=20,
        choices=OrganizerApprovalStatus.choices,
        default=OrganizerApprovalStatus.NOT_APPLICABLE,
    )
    profile_image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        ordering = ["-date_joined"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
            models.Index(fields=["organizer_approval_status"]),
        ]

    def __str__(self) -> str:
        return self.email

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def is_buyer(self) -> bool:
        return self.role == UserRole.BUYER

    @property
    def is_organizer(self) -> bool:
        return self.role == UserRole.ORGANIZER

    @property
    def is_approved_organizer(self) -> bool:
        return self.is_organizer and self.organizer_approval_status == OrganizerApprovalStatus.APPROVED


class OrganizerProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="organizer_profile")
    company_name = models.CharField(max_length=255)
    website_url = models.URLField(blank=True)
    organizer_details = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["company_name"]
        indexes = [
            models.Index(fields=["company_name"]),
        ]

    def __str__(self) -> str:
        return self.company_name
