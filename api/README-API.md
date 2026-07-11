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

⸻

## Events

Base path:

```txt
/api/v1/events/
```

### Event Endpoints

| Method | Endpoint | Description | Authorization |
| --- | --- | --- | --- |
| GET | `/api/v1/events/` | Return paginated published events | Public |
| GET | `/api/v1/events/<slug:slug>/` | Return a published event by slug | Public |
| GET | `/api/v1/events/manage/` | Return the authenticated organizer's events or all events for an admin | Approved Organizer or Admin |
| POST | `/api/v1/events/create/` | Create a new event | Approved Organizer or Admin |
| GET | `/api/v1/events/manage/<uuid:id>/` | Return a single event by ID | Approved Organizer or Admin  |
| PATCH | `/api/v1/events/manage/<uuid:id>/` | Partially update an event | Approved Organizer or Admin  |
| PUT | `/api/v1/events/manage/<uuid:id>/` | Fully replace an event | Approved Organizer or Admin  |
| DELETE | `/api/v1/events/manage/<uuid:id>/` | Delete an event | Approved Organizer or Admin  |

---

### Authorization

#### Public Endpoints

```txt
GET /api/v1/events/
GET /api/v1/events/<slug:slug>/
```

These endpoints:

- Do not require authentication.
- Return only events whose status is `published`.
- Use the public event serializer.
- Do not expose the event `id`.
- Do not expose ticket type `id`s.

---

#### Organizer/Admin Event List

```txt
GET /api/v1/events/manage/
```

Requires an authenticated **approved organizer** or **admin**.

- Organizers receive only events they own.
- Admins receive every event.

Conceptually:

```python
# Organizer
Event.objects.filter(organizer=request.user)

# Admin
Event.objects.all()
```

---

#### Event Management

```txt
GET    /api/v1/events/manage/<uuid:id>/
PATCH  /api/v1/events/manage/<uuid:id>/
PUT    /api/v1/events/manage/<uuid:id>/
DELETE /api/v1/events/manage/<uuid:id>/
```

Requires an authenticated **approved organizer** or **admin**.

- Organizers may retrieve, update and delete **only their own events**.
- Admins may retrieve, update and delete **any event**.
- Events are looked up by their UUID `id`.

---

### Public Event Response

Example response from:

```txt
GET /api/v1/events/
GET /api/v1/events/<slug:slug>/
```

```json
{
  "title": "Summer Music Festival",
  "slug": "summer-music-festival",
  "cover_image": "https://example.com/event.jpg",
  "category": "concert",
  "venue_name": "Olympia Park",
  "city": "Munich",
  "country": "Germany",
  "start_date": "2026-08-20T18:00:00Z",
  "organizer_name": "TicketFlow Events",
  "ticket_types": [
    {
      "name": "General Admission",
      "description": "Standing ticket",
      "price": "49.99",
      "total_quantity": 500,
      "remaining_quantity": 420
    }
  ]
}
```

Public responses intentionally **do not expose** event IDs or ticket type IDs.

---

### Organizer/Admin Event Response

Organizer and admin endpoints return the complete event data required for management.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Summer Music Festival",
  "slug": "summer-music-festival",
  "description": "Outdoor live music festival.",
  "cover_image": "https://example.com/event.jpg",
  "category": "concert",
  "venue_name": "Olympia Park",
  "address": "Spiridon-Louis-Ring 21",
  "city": "Munich",
  "country": "Germany",
  "start_date": "2026-08-20T18:00:00Z",
  "end_date": "2026-08-20T23:00:00Z",
  "status": "draft",
  "created_at": "2026-07-11T09:00:00Z",
  "updated_at": "2026-07-11T10:00:00Z",
  "organizer_name": "TicketFlow Events",
  "ticket_types": [
    {
      "id": "9e675a76-2454-4ebd-b4a2-d12d476ef755",
      "name": "General Admission",
      "description": "Standing ticket",
      "price": "49.99",
      "total_quantity": 500,
      "remaining_quantity": 420
    }
  ]
}
```

The event ID and ticket type IDs are included because they are required for update and delete operations.

---

### Event List Query Parameters

Both public and organizer/admin event lists support pagination, filtering, searching and ordering.

| Query Parameter | Description |
| --- | --- |
| `page` | Page number |
| `page_size` | Number of results per page |
| `search` | Search by supported event fields |
| `category` | Filter by category |
| `city` | Filter by city |
| `country` | Filter by country |
| `ordering` | Order by `start_date`, `created_at` or `title` |

Use `-` before an ordering field for descending order.

Examples:

```txt
GET /api/v1/events/?city=Munich&ordering=start_date
```

```txt
GET /api/v1/events/manage/?ordering=-created_at&page=1&page_size=10
```

```txt
GET /api/v1/events/manage/?search=550e8400-e29b-41d4-a716-446655440000
```

---

### Create Event

Example request body:

```json
{
  "title": "Summer Music Festival",
  "description": "Outdoor live music festival.",
  "cover_image": "https://example.com/event.jpg",
  "category": "concert",
  "venue_name": "Olympia Park",
  "address": "Spiridon-Louis-Ring 21",
  "city": "Munich",
  "country": "Germany",
  "start_date": "2026-08-20T18:00:00Z",
  "end_date": "2026-08-20T23:00:00Z",
  "status": "draft",
  "ticket_types": [
    {
      "name": "General Admission",
      "description": "Standing ticket",
      "price": "49.99",
      "total_quantity": 500
    },
    {
      "name": "VIP",
      "description": "VIP access",
      "price": "149.99",
      "total_quantity": 50
    }
  ]
}
```

Notes:

- The authenticated user is automatically assigned as the organizer.
- `event.id` is generated automatically.
- `event.slug` is generated automatically.
- `ticket_type.id` is generated automatically.
- `remaining_quantity` is calculated automatically.

---

### PATCH Event

Endpoint:

```txt
PATCH /api/v1/events/manage/<uuid:id>/
```

`PATCH` updates only the fields supplied in the request.

Example:

```json
{
  "title": "Updated Summer Music Festival",
  "venue_name": "Updated Olympia Park"
}
```

---

### PUT Event

Endpoint:

```txt
PUT /api/v1/events/manage/<uuid:id>/
```

`PUT` replaces the complete writable resource.

```json
{
  "title": "Updated Summer Music Festival",
  "description": "Updated outdoor live music festival.",
  "cover_image": "https://example.com/updated-event.jpg",
  "category": "concert",
  "venue_name": "Olympia Park",
  "address": "Spiridon-Louis-Ring 21",
  "city": "Munich",
  "country": "Germany",
  "start_date": "2026-08-20T18:00:00Z",
  "end_date": "2026-08-20T23:00:00Z",
  "status": "draft",
  "ticket_types": [
    {
      "id": "9e675a76-2454-4ebd-b4a2-d12d476ef755",
      "name": "General Admission",
      "description": "Updated standing ticket",
      "price": "54.99",
      "total_quantity": 600
    },
    {
      "name": "Backstage",
      "description": "Backstage access",
      "price": "249.99",
      "total_quantity": 20
    }
  ]
}
```

---

### Nested Ticket Type Updates

When updating ticket types:

- Include an existing `id` to update a ticket type.
- Omit the `id` to create a new ticket type.
- `remaining_quantity` is read-only.
- The API recalculates `remaining_quantity` whenever `total_quantity` changes.
- Ticket types omitted from the submitted list may be deleted by the nested update logic.

---

### Delete Event

Endpoint:

```txt
DELETE /api/v1/events/manage/<uuid:id>/
```

No request body is required.

Returns:

```txt
204 No Content
```

Only the event owner or an admin may delete an event.

---

## Ticket Types

Ticket types are managed as nested objects through the Event create and update endpoints.

There are currently no standalone Ticket Type endpoints.

- Public endpoints do not expose ticket type IDs.
- Organizer/Admin endpoints expose ticket type IDs so existing ticket types can be updated.

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