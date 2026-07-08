import django_filters

from .models import User


class UserFilter(django_filters.FilterSet):
    class Meta:
        model = User
        fields = {
            "role": ["exact"],
            "organizer_approval_status": ["exact"],
            "is_email_verified": ["exact"],
        }