from rest_framework.permissions import BasePermission

from .models import OrganizerApprovalStatus, UserRole


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_staff or request.user.role == UserRole.ADMIN)


class IsOrganizer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.ORGANIZER


class IsApprovedOrganizer(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == UserRole.ORGANIZER
            and request.user.organizer_approval_status == OrganizerApprovalStatus.APPROVED
        )


class IsBuyer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.BUYER


class IsSelf(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and obj == request.user