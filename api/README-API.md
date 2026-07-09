# TicketFlow API

The `api` folder contains the Django backend for TicketFlow, a full-stack event management and ticketing platform.

The API will be built with **Django**, **Django REST Framework**, **PostgreSQL**, **JWT authentication**, and automated API tests.

---

## Purpose

The Django API is responsible for the core business logic of TicketFlow:

- User registration and login
- Buyer accounts
- Organizer accounts
- Admin approval for organizers
- Event management
- Ticket type management
- Order management (future feature)

---

## Tech Stack

- Python
- Django
- Django REST Framework
- PostgreSQL
- Simple JWT
- django-cors-headers
- python-decouple
- dj-database-url
- psycopg
- pytest
- pytest-django
- factory-boy
- Faker
- Ruff

---

## Planned Folder Structure

```txt
api/
  manage.py
  requirements.txt
  README-API.md
  .env.example

  config/
    __init__.py
    settings.py
    urls.py
    asgi.py
    wsgi.py

  apps/
    users/
      models.py
      serializers.py
      views.py
      urls.py
      permissions.py
      tests/

    events/
      models.py
      serializers.py
      views.py
      urls.py
      permissions.py
      tests/

    orders/
      models.py
      serializers.py
      views.py
      urls.py
      tests/
```

---

## Main API Responsibilities

### Users App

Responsible for:

- Custom user model
- Buyer registration
- Organizer registration
- Login
- JWT token handling
- Current user endpoint
- Role-based permissions
- Organizer approval status

Planned roles:

```txt
BUYER
ORGANIZER
ADMIN
```

Organizer approval statuses:

```txt
PENDING
APPROVED
REJECTED
```

---

### Events App

Responsible for:

- Event creation
- Event editing
- Event deletion
- Event publishing
- Event filtering
- Event searching
- Ticket type management

Event statuses:

```txt
DRAFT
PUBLISHED
CANCELLED
COMPLETED
```

---

### Orders App

Responsible for:

- Creating ticket orders
- Calculating totals
- Tracking order state
- Connecting orders to Stripe checkout sessions

Order statuses:

```txt
PENDING
PAID
FAILED
CANCELLED
REFUNDED
```

---

## API Endpoints

### Users and Authentication

Base path:

```txt
/api/users/
```

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/v1/users/register/` | Register a new buyer or organizer and return JWT tokens | No |
| POST | `/api/v1/users/login/` | Login with email and password and return JWT tokens | No |
| POST | `/api/v1/users/logout/` | Logout by blacklisting the refresh token | Yes |
| POST | `/api/v1/users/token/refresh/` | Generate a new access token from a refresh token | No |
| GET | `/api/v1/users/me/` | Get the current logged-in user profile | Yes |
| PATCH | `/api/v1/users/me/` | Update the current logged-in user profile | Yes |
| PUT | `/api/v1/users/me/` | Replace the current logged-in user profile | Yes |
| GET | `/api/v1/users/` | Get a paginated list of all users with search, filtering and ordering support | Admin only |
| GET | `/api/v1/stats/` | Get Stats of the all users | Admin only |
| PATCH | `/api/v1/users/organizers/<uuid:pk>/approve/` | Approve or reject an organizer account | Admin only |
| PUT | `/api/v1/users/organizers/<uuid:pk>/approve/` | Replace organizer approval status | Admin only |

#### User List Query Parameters

The `GET /api/v1/users/` endpoint supports:

| Query Parameter | Description |
|---|---|
| `page` | Page number |
| `page_size` | Number of results per page (maximum 100) |
| `search` | Search by email, first name, last name, phone number or organizer company name |
| `role` | Filter by user role |
| `organizer_approval_status` | Filter by organizer approval status |
| `is_email_verified` | Filter by email verification status |
| `ordering` | Order results by `created_at`, `updated_at`, `email`, `first_name`, `last_name` or `role` |

Example:

```txt
GET /api/v1/users/?role=organizer&search=music&page=2&page_size=20&ordering=-created_at
```

#### Authentication Request Examples

Buyer registration:

```json
{
  "email": "buyer@example.com",
  "password": "StrongPass123!",
  "confirm_password": "StrongPass123!",
  "first_name": "Ahmed",
  "last_name": "Ozdogan",
  "phone_number": "+49123456789",
  "role": "buyer"
}
```

Organizer registration:

```json
{
  "email": "organizer@example.com",
  "password": "StrongPass123!",
  "confirm_password": "StrongPass123!",
  "first_name": "Event",
  "last_name": "Manager",
  "phone_number": "+49123456789",
  "role": "organizer",
  "company_name": "TicketFlow Events",
  "website_url": "https://example.com",
  "organizer_details": "We organize concerts, conferences, and community events."
}
```

Login:

```json
{
  "email": "buyer@example.com",
  "password": "StrongPass123!"
}
```

Successful register/login response:

```json
{
  "access": "jwt-access-token",
  "refresh": "jwt-refresh-token",
  "user": {
    "id": "user-uuid",
    "email": "buyer@example.com",
    "first_name": "Ahmed",
    "last_name": "Ozdogan",
    "phone_number": "+49123456789",
    "role": "buyer",
    "is_email_verified": false,
    "organizer_approval_status": "not_applicable",
    "profile_image_url": "",
    "organizer_profile": null
  }
}
```

Refresh token:

```json
{
  "refresh": "jwt-refresh-token"
}
```

Logout:

```json
{
  "refresh": "jwt-refresh-token"
}
```

Update current user:

```json
{
  "first_name": "Ahmed",
  "last_name": "Ozdogan",
  "phone_number": "+49123456789",
  "profile_image_url": "https://example.com/avatar.png"
}
```

Change password:

```json
{
  "old_password": "OldPass123!",
  "new_password": "NewStrongPass123!",
  "confirm_password": "NewStrongPass123!"
}
```

Approve organizer:

```json
{
  "organizer_approval_status": "approved"
}
```

Reject organizer:

```json
{
  "organizer_approval_status": "rejected",
  "rejection_reason": "Company details are incomplete."
}
```
Stats:

```json
{
    "total_users": 38,
    "buyers": 14,
    "organizers": 18,
    "admins": 6,
    "pending_organizers": 5,
    "approved_organizers": 8,
    "rejected_organizers": 5,
    "verified_users": 15,
    "unverified_users": 23
}
```

### Organizer Approval Notes

Organizer approval is currently handled through the users app:

```txt
PATCH /api/users/organizers/<uuid:pk>/approve/
```

Allowed approval values:

```txt
approved
rejected
```

When an organizer is approved or rejected, the organizer profile stores `reviewed_at`. If the organizer is rejected, `rejection_reason` is required.

### Events

```txt
GET    /api/v1/events/
GET    /api/v1/events/<slug:slug>/
GET    /api/v1/events/manage/
POST   /api/v1/events/manage/
GET    /api/v1/events/manage/<uuid:pk>/
PATCH  /api/v1/events/manage/<uuid:pk>/
PUT    /api/v1/events/manage/<uuid:pk>/
DELETE /api/v1/events/manage/<uuid:pk>/
```

### Ticket Types

```txt
GET    /api/v1/events/<uuid:event_id>/ticket-types/
POST   /api/v1/events/<uuid:event_id>/ticket-types/
GET    /api/v1/ticket-types/<uuid:pk>/
PATCH  /api/v1/ticket-types/<uuid:pk>/
PUT    /api/v1/ticket-types/<uuid:pk>/
DELETE /api/v1/ticket-types/<uuid:pk>/
```

### Orders

```txt
POST /api/orders/
GET  /api/orders/my-orders/
GET  /api/orders/:id/
```

---

## Environment Variables

Planned `.env.example`:

```env
DJANGO_SECRET_KEY=change-me
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_URL=postgres://ticketflow:ticketflow@localhost:5432/ticketflow

CORS_ALLOWED_ORIGINS=http://localhost:5173

ACCESS_TOKEN_LIFETIME_MINUTES=30
REFRESH_TOKEN_LIFETIME_DAYS=7

INTERNAL_API_SECRET=change-me
PAYMENT_SERVICE_URL=http://localhost:4000
```

---

## Local Setup

Create and activate virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Upgrade pip:

```bash
python -m pip install --upgrade pip
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Create superuser:

```bash
python manage.py createsuperuser
```

Run development server:

```bash
python manage.py runserver
```

API will run at:

```txt
http://127.0.0.1:8000
```

---

## Initial Package Install Command

When setting up from scratch, install the main packages with:

```bash
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt "psycopg[binary]" python-decouple dj-database-url
```

Install development and testing packages:

```bash
pip install pytest pytest-django pytest-cov factory-boy faker ruff
```

Generate `requirements.txt`:

```bash
pip freeze > requirements.txt
```

---

## Testing Plan

The API should include tests for:

### Authentication

- Buyer can register
- Organizer can apply for an account
- User can log in
- User can refresh token
- User can fetch own profile

### Permissions

- Buyer cannot create events
- Pending organizer cannot create events
- Approved organizer can create events
- Organizer cannot edit another organizer's event
- Admin can approve organizer accounts

### Events

- Public users can view published events
- Draft events are hidden from public users
- Organizer can manage ticket types for own event

### Orders

- Buyer can create order
- Order total is calculated correctly
- Order starts as pending
- Paid order cannot be paid twice

---

## Code Quality

Planned tools:

```bash
ruff check .
pytest
```

Later CI should run:

- Django tests
- Ruff checks
- Coverage report

---

## Current Status

Completed:

- API folder created
- Django project configured
- PostgreSQL configured through `DATABASE_URL`
- Django REST Framework added
- Simple JWT authentication added
- JWT token blacklist app added for logout
- Custom user model created
- Email-based authentication backend added
- User serializers created
- User permissions created
- User views created
- User URLs created
- Buyer registration endpoint created
- Organizer registration endpoint created
- Login endpoint created
- Logout endpoint created
- Token refresh endpoint created
- Current user endpoint created
- Profile update endpoint created
- Change password endpoint created
- Organizer approval endpoint created
- User list endpoint created
- Pagination added
- Search added
- Filtering added
- Ordering added

Next API steps:

- Test all authentication endpoints.
- Build the Orders app.
- Integrate Stripe payment service.
- Generate tickets after successful payment.
- Add automated API tests.