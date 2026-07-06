

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
- Order management
- Ticket generation
- Check-in workflow
- Payment confirmation from the Express payment service

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

    tickets/
      models.py
      serializers.py
      views.py
      urls.py
      tests/

    payments/
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

- Event categories
- Event creation
- Event editing
- Event publishing
- Event filtering
- Event searching
- Ticket type creation

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

### Tickets App

Responsible for:

- Generating tickets after successful payment
- Creating unique ticket codes
- Listing buyer tickets
- Validating tickets
- Check-in workflow
- Preventing duplicate check-ins

Ticket statuses:

```txt
ACTIVE
CHECKED_IN
CANCELLED
REFUNDED
```

---

### Payments App

Responsible for:

- Recording payment state
- Receiving internal confirmation from the Express payment service
- Marking orders as paid
- Triggering ticket generation

Payment statuses:

```txt
CREATED
SUCCEEDED
FAILED
REFUNDED
```

---

## Planned API Endpoints

### Authentication

```txt
POST /api/auth/register/buyer/
POST /api/auth/register/organizer/
POST /api/auth/login/
POST /api/auth/token/refresh/
GET  /api/auth/me/
```

### Organizer Approval

```txt
GET   /api/admin/organizer-applications/
PATCH /api/admin/organizer-applications/:id/approve/
PATCH /api/admin/organizer-applications/:id/reject/
```

### Events

```txt
GET    /api/events/
POST   /api/events/
GET    /api/events/:id/
PATCH  /api/events/:id/
DELETE /api/events/:id/
```

### Ticket Types

```txt
GET    /api/events/:eventId/ticket-types/
POST   /api/events/:eventId/ticket-types/
PATCH  /api/ticket-types/:id/
DELETE /api/ticket-types/:id/
```

### Orders

```txt
POST /api/orders/
GET  /api/orders/my-orders/
GET  /api/orders/:id/
```

### Tickets

```txt
GET  /api/tickets/my-tickets/
GET  /api/tickets/:id/
POST /api/tickets/check-in/
```

### Internal Payment Confirmation

```txt
POST /api/internal/payments/confirm/
```

This endpoint should only be called by the Express payment service using an internal shared secret.

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
- Organizer can create ticket types for own event
- Ticket capacity cannot be negative

### Orders

- Buyer can create order
- Order total is calculated correctly
- Order starts as pending
- Paid order cannot be paid twice

### Tickets

- Ticket is generated only after payment succeeds
- Buyer can only view own tickets
- Organizer can only check in tickets for own event
- Duplicate check-in is rejected

### Payments

- Internal payment confirmation requires secret
- Successful payment marks order as paid
- Successful payment triggers ticket generation

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
- Django setup in progress
- Package plan prepared

Next API steps:

- Create Django project
- Configure settings
- Add Django REST Framework
- Add CORS
- Add Simple JWT
- Add PostgreSQL configuration
- Create custom user model
- Add buyer and organizer registration endpoints
- Add login endpoint
- Add tests for authentication