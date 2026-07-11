import uuid

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from django.utils.crypto import get_random_string


class Status(models.TextChoices):
    DRAFT = "draft", _("Draft")
    PENDING = "pending", _("Pending")
    PUBLISHED = "published", _("Published")
    CANCELLED = "cancelled", _("Cancelled")
    COMPLETED = "completed", _("Completed")


class EventCategory(models.TextChoices):
    MUSIC = "music", "Music"
    BUSINESS = "business", "Business"
    TECHNOLOGY = "technology", "Technology"
    SPORTS = "sports", "Sports"
    EDUCATION = "education", "Education"
    FOOD = "food", "Food"
    NIGHTLIFE = "nightlife", "Nightlife"


class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="events",
    )

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()

    cover_image = models.ImageField(
        upload_to="events/covers/",
        blank=True,
        null=True,
    )

    category = models.CharField(
        max_length=30,
        choices=EventCategory.choices,
    )

    venue_name = models.CharField(max_length=200)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug

            while Event.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{get_random_string(6).lower()}"

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class TicketType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="ticket_types",
    )

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    price = models.DecimalField(max_digits=8, decimal_places=2)

    total_quantity = models.PositiveIntegerField(default=0)
    remaining_quantity = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.event.title} - {self.name}"
