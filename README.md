# TicketFlow

**TicketFlow** is a full-stack event management and ticketing platform built as a production-style portfolio project.

The goal of this project is to demonstrate a realistic full-stack architecture using **React**, **Django REST Framework**, **Express.js**, **PostgreSQL**, **Stripe**, **Docker**, **Kubernetes**, and automated testing.

TicketFlow allows organizers to create events, sell tickets, manage attendees, and check in guests using QR-style ticket codes. Customers can browse events, buy tickets, and view their purchased tickets. Admins can manage users, events, and platform data.

---

## Project Goals

This project is designed to prove the following skills:

- Building a complete full-stack product from scratch
- Designing a real-world backend with Django REST Framework
- Creating a payment microservice with Express.js and Stripe
- Modeling relational data with PostgreSQL
- Building a modern frontend with React and TypeScript
- Implementing role-based authentication and authorization
- Writing automated tests for frontend, backend, and payment flows
- Running the full system with Docker Compose
- Preparing Kubernetes deployment manifests
- Documenting the project like a professional production application

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios or TanStack Query
- Playwright for end-to-end testing

### Backend API

- Python
- Django
- Django REST Framework
- PostgreSQL
- JWT authentication
- Pytest or Django TestCase

### Payment Service

- Node.js
- Express.js
- Stripe API
- Stripe Checkout
- Stripe Webhooks
- Jest / Supertest

### DevOps

- Docker
- Docker Compose
- GitHub Actions
- Kubernetes manifests
- Environment-based configuration

---

## High-Level Architecture

```txt
React Web App
    |
    | HTTP requests
    v
Django REST API  <--------------------+
    |                                  |
    | reads/writes                     |
    v                                  |
PostgreSQL                            |
                                       |
Django API creates order              |
    |                                  |
    | calls payment service            |
    v                                  |
Express Payment Service               |
    |                                  |
    | creates Stripe Checkout session  |
    v                                  |
Stripe                                |
    |                                  |
    | webhook after payment            |
    v                                  |
Express Payment Service --------------+
    |
    | confirms payment with Django API
    v
Django API generates ticket
```

---

## Main User Roles

### Customer / Attendee

Customers can:

- Register and log in
- Browse published events
- Search and filter events
- View event details
- Select ticket type
- Buy tickets using Stripe Checkout
- View purchased tickets
- See ticket status

### Organizer

Organizers can:

- Register and log in
- Create events
- Edit their own events
- Add ticket types
- Set ticket prices and capacity
- View attendee lists
- View sales summaries
- Check in attendees using ticket codes
- Prevent duplicate check-ins

### Admin

Admins can:

- View all users
- View all events
- Approve, reject, or deactivate events
- View platform payments
- View platform statistics
- Manage suspicious or invalid events

---

## Core Features

### Authentication and Authorization

- User registration
- User login
- JWT access and refresh tokens
- Role-based permissions
- Protected frontend routes
- Protected API endpoints

Roles:

```txt
CUSTOMER
ORGANIZER
ADMIN
```

Authorization rules:

- Customers can only view and manage their own tickets.
- Organizers can only manage their own events.
- Admins can access all users, events, orders, and payments.

---

### Event Management

Organizers can create and manage events with:

- Title
- Description
- Category
- Location
- Start date and time
- End date and time
- Event image or banner
- Event status
- Ticket types
- Capacity limits

Event statuses:

```txt
DRAFT
PUBLISHED
CANCELLED
COMPLETED
```

---

### Ticket Types

Each event can have multiple ticket types:

- Free
- Standard
- VIP
- Early Bird
- Student

Ticket type fields:

- Name
- Price
- Quantity available
- Quantity sold
- Sale start date
- Sale end date

---

### Event Discovery

Customers can:

- Browse published events
- Search by event title
- Filter by category
- Filter by city or location
- Filter by date
- View event detail pages

---

### Orders and Payments

Payment flow:

1. Customer selects a ticket.
2. Frontend sends order request to Django API.
3. Django creates an order with `PENDING` status.
4. Django calls the Express payment service.
5. Express creates a Stripe Checkout Session.
6. Customer completes payment on Stripe.
7. Stripe sends webhook to Express.
8. Express verifies the webhook signature.
9. Express notifies Django that payment succeeded.
10. Django updates order status to `PAID`.
11. Django generates the ticket.
12. Customer can view ticket in dashboard.

Order statuses:

```txt
PENDING
PAID
FAILED
CANCELLED
REFUNDED
```

Payment statuses:

```txt
CREATED
SUCCEEDED
FAILED
REFUNDED
```

---

### Ticket Generation

After successful payment, the system generates a ticket with:

- Unique ticket ID
- Ticket code
- Event details
- Attendee details
- Ticket type
- Ticket status
- QR-style code value

Ticket statuses:

```txt
ACTIVE
CHECKED_IN
CANCELLED
REFUNDED
```

---

### Check-In System

Organizers can check in attendees by entering or scanning a ticket code.

Check-in rules:

- Ticket must exist.
- Ticket must belong to the organizer's event.
- Ticket must be active.
- Ticket must not already be checked in.
- Duplicate check-ins must be rejected.

---

### Dashboards

#### Customer Dashboard

- My tickets
- Upcoming events
- Payment status
- Ticket status

#### Organizer Dashboard

- My events
- Tickets sold
- Revenue summary
- Attendee list
- Check-in status

#### Admin Dashboard

- All users
- All events
- All orders
- All payments
- Platform statistics

---

## Suggested Folder Structure

```txt
ticketflow/
  web/
    src/
    tests/
    package.json
    playwright.config.ts

  api/
    manage.py
    requirements.txt
    config/
    apps/
      users/
      events/
      orders/
      tickets/
      payments/

  payments/
    src/
    tests/
    package.json

  docs/
    architecture.md
    api.md
    database-schema.md
    testing.md

  k8s/
    web-deployment.yaml
    api-deployment.yaml
    payments-deployment.yaml
    postgres-statefulset.yaml
    ingress.yaml
    secrets-example.yaml

  .github/
    workflows/
      ci.yml

  docker-compose.yml
  .env.example
  README.md
```

---

## Database Models

Planned Django models:

```txt
User
OrganizerProfile
EventCategory
Event
TicketType
Order
OrderItem
Payment
Ticket
CheckIn
Notification
```

### User

Fields:

- id
- email
- password
- first_name
- last_name
- role
- is_active
- created_at
- updated_at

### OrganizerProfile

Fields:

- id
- user
- organization_name
- description
- website
- created_at
- updated_at

### EventCategory

Fields:

- id
- name
- slug

### Event

Fields:

- id
- organizer
- category
- title
- slug
- description
- location
- start_datetime
- end_datetime
- status
- banner_image
- created_at
- updated_at

### TicketType

Fields:

- id
- event
- name
- price
- quantity_available
- quantity_sold
- sale_start
- sale_end
- created_at
- updated_at

### Order

Fields:

- id
- customer
- status
- total_amount
- stripe_checkout_session_id
- created_at
- updated_at

### OrderItem

Fields:

- id
- order
- ticket_type
- quantity
- unit_price
- total_price

### Payment

Fields:

- id
- order
- provider
- provider_payment_id
- status
- amount
- currency
- created_at
- updated_at

### Ticket

Fields:

- id
- order_item
- customer
- event
- ticket_type
- ticket_code
- status
- checked_in_at
- created_at
- updated_at

### CheckIn

Fields:

- id
- ticket
- event
- checked_in_by
- checked_in_at

---

## API Plan

### Authentication

```txt
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/token/refresh/
GET  /api/auth/me/
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

### Admin

```txt
GET /api/admin/users/
GET /api/admin/events/
GET /api/admin/orders/
GET /api/admin/payments/
```

### Payment Service

```txt
POST /payments/create-checkout-session
POST /payments/webhooks/stripe
```

---

## Development Roadmap

### Phase 1: Monorepo and Tooling Setup

Goals:

- Create monorepo structure
- Add React app
- Add Django API
- Add Express payment service
- Add Docker Compose
- Add PostgreSQL container
- Add `.env.example`
- Add initial README

Tasks:

- [ ] Create `web`
- [ ] Create `api`
- [ ] Create `payments`
- [ ] Add root `docker-compose.yml`
- [ ] Add root `.env.example`
- [ ] Add GitHub repository description
- [ ] Add clean first commit

---

### Phase 2: Django API Foundation

Goals:

- Set up Django project
- Configure Django REST Framework
- Connect PostgreSQL
- Add custom user model
- Add JWT authentication
- Add role-based permissions

Tasks:

- [ ] Install Django and DRF
- [ ] Configure PostgreSQL
- [ ] Create custom user model
- [ ] Add user roles
- [ ] Add registration endpoint
- [ ] Add login endpoint
- [ ] Add `me` endpoint
- [ ] Add API tests for authentication

---

### Phase 3: Event and Ticket Models

Goals:

- Build core event data model
- Allow organizers to create events
- Allow customers to browse published events

Tasks:

- [ ] Create `events` app
- [ ] Create `EventCategory` model
- [ ] Create `Event` model
- [ ] Create `TicketType` model
- [ ] Add serializers
- [ ] Add viewsets
- [ ] Add permissions
- [ ] Add filtering and search
- [ ] Add API tests for event permissions

---

### Phase 4: React Frontend Foundation

Goals:

- Build frontend layout
- Add routing
- Add authentication pages
- Add event discovery pages

Tasks:

- [ ] Set up React with TypeScript and Vite
- [ ] Add Tailwind CSS
- [ ] Add React Router
- [ ] Add API client
- [ ] Add login page
- [ ] Add register page
- [ ] Add public event list page
- [ ] Add event detail page
- [ ] Add protected route handling

---

### Phase 5: Organizer Event Management

Goals:

- Allow organizers to manage their events
- Add organizer dashboard

Tasks:

- [ ] Create organizer dashboard page
- [ ] Create event form
- [ ] Add create event flow
- [ ] Add edit event flow
- [ ] Add ticket type management
- [ ] Add organizer event list
- [ ] Add frontend validation

---

### Phase 6: Orders and Stripe Checkout

Goals:

- Allow customers to buy tickets
- Integrate Django API with Express payment service
- Integrate Express payment service with Stripe

Tasks:

- [ ] Create `orders` app in Django
- [ ] Create `Order` model
- [ ] Create `OrderItem` model
- [ ] Create `Payment` model
- [ ] Add order creation endpoint
- [ ] Create Express payment service
- [ ] Add Stripe Checkout session creation
- [ ] Connect Django to Express payment service
- [ ] Redirect customer to Stripe Checkout
- [ ] Add Stripe webhook endpoint
- [ ] Verify Stripe webhook signature
- [ ] Notify Django after successful payment
- [ ] Update order status to `PAID`

---

### Phase 7: Ticket Generation and Customer Dashboard

Goals:

- Generate tickets after payment
- Allow customers to view their tickets

Tasks:

- [ ] Create `tickets` app in Django
- [ ] Create `Ticket` model
- [ ] Generate ticket after successful payment
- [ ] Generate unique ticket code
- [ ] Add customer ticket endpoint
- [ ] Add customer dashboard page
- [ ] Add ticket detail page
- [ ] Add QR-style ticket display

---

### Phase 8: Check-In Workflow

Goals:

- Allow organizers to check in attendees
- Prevent invalid and duplicate check-ins

Tasks:

- [ ] Create `CheckIn` model
- [ ] Add check-in endpoint
- [ ] Add organizer attendee list
- [ ] Add check-in page
- [ ] Validate ticket ownership
- [ ] Reject duplicate check-ins
- [ ] Add API tests for check-in rules

---

### Phase 9: Admin Dashboard

Goals:

- Add admin-level visibility and control

Tasks:

- [ ] Add admin user management endpoint
- [ ] Add admin event management endpoint
- [ ] Add admin order management endpoint
- [ ] Add admin payment management endpoint
- [ ] Create admin dashboard page
- [ ] Add platform statistics
- [ ] Add event approval or deactivation flow

---

### Phase 10: Automated Testing

Goals:

- Add meaningful test coverage across the stack

Frontend Playwright tests:

- [ ] User can register
- [ ] User can log in
- [ ] Customer can browse events
- [ ] Organizer can create event
- [ ] Customer can start ticket checkout
- [ ] Customer can view ticket after mocked payment
- [ ] Organizer can check in attendee
- [ ] Duplicate check-in is rejected

Django API tests:

- [ ] Registration works
- [ ] Login works
- [ ] Customer cannot create event
- [ ] Organizer can create event
- [ ] Organizer cannot edit another organizer's event
- [ ] Order cannot be paid without payment confirmation
- [ ] Ticket cannot be checked in twice
- [ ] Admin can access admin endpoints

Express payment service tests:

- [ ] Checkout session is created
- [ ] Invalid checkout payload is rejected
- [ ] Stripe webhook signature is verified
- [ ] Payment success notifies Django API

---

### Phase 11: Docker and Local Development

Goals:

- Run the full project locally with one command

Tasks:

- [ ] Add Dockerfile for React app
- [ ] Add Dockerfile for Django API
- [ ] Add Dockerfile for Express payment service
- [ ] Add PostgreSQL service
- [ ] Add Docker Compose network
- [ ] Add environment variables
- [ ] Add database migration command
- [ ] Add seed data command

Target command:

```bash
 docker compose up --build
```

---

### Phase 12: CI/CD

Goals:

- Add GitHub Actions workflow

Tasks:

- [ ] Run frontend lint
- [ ] Run frontend tests
- [ ] Run Django tests
- [ ] Run Express tests
- [ ] Build Docker images
- [ ] Add CI status badge to README

---

### Phase 13: Kubernetes Manifests

Goals:

- Add deployment examples for production-style documentation

Tasks:

- [ ] Add web deployment
- [ ] Add Django API deployment
- [ ] Add payment service deployment
- [ ] Add PostgreSQL stateful set
- [ ] Add services
- [ ] Add ingress
- [ ] Add secrets example
- [ ] Document Kubernetes deployment steps

---

## Environment Variables

A future `.env.example` should include:

```env
# Django API
DJANGO_SECRET_KEY=change-me
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://ticketflow:ticketflow@postgres:5432/ticketflow
JWT_SECRET_KEY=change-me
PAYMENT_SERVICE_URL=http://payments:4000

# PostgreSQL
POSTGRES_DB=ticketflow
POSTGRES_USER=ticketflow
POSTGRES_PASSWORD=ticketflow

# Express Payment Service
PAYMENTS_PORT=4000
STRIPE_SECRET_KEY=sk_test_change_me
STRIPE_WEBHOOK_SECRET=whsec_change_me
DJANGO_API_URL=http://api:8000
INTERNAL_API_SECRET=change-me

# React Web
VITE_API_URL=http://localhost:8000
VITE_PAYMENTS_URL=http://localhost:4000
```

---

## Local Development Commands

Planned commands:

```bash
# Start all services
 docker compose up --build

# Run Django migrations
 docker compose exec api python manage.py migrate

# Create Django superuser
 docker compose exec api python manage.py createsuperuser

# Run Django tests
 docker compose exec api pytest

# Run frontend tests
 cd web && npm run test:e2e

# Run payment service tests
 cd payments && npm test
```

---

## Testing Strategy

This project should not only work manually. The main user flows should be covered by tests.

### End-to-End Tests

Playwright will test the most important browser flows:

- Register
- Login
- Create event
- Browse event
- Start checkout
- View ticket
- Check in ticket

### API Tests

Django tests will focus on:

- Authentication
- Permissions
- Event ownership
- Order rules
- Ticket generation
- Check-in validation

### Payment Service Tests

Express tests will focus on:

- Stripe checkout creation
- Webhook validation
- Error handling
- Communication with Django API

---

## Definition of Done

The project will be considered resume-ready when:

- [ ] The app runs with Docker Compose
- [ ] Users can register and log in
- [ ] Organizers can create events
- [ ] Customers can buy tickets through Stripe test checkout
- [ ] Successful payment generates a ticket
- [ ] Customers can view purchased tickets
- [ ] Organizers can check in attendees
- [ ] Duplicate check-ins are blocked
- [ ] Playwright tests cover the main user flow
- [ ] Django API tests cover permissions and business rules
- [ ] Express tests cover payment service logic
- [ ] GitHub Actions runs tests automatically
- [ ] README includes screenshots and setup instructions
- [ ] Kubernetes manifests are included

---

## Future Improvements

Possible advanced features:

- React Native mobile app for attendees
- Appium tests for mobile ticket view
- Real QR code camera scanner
- Refund flow
- Email notifications
- PDF ticket generation
- Organizer analytics charts
- Multi-language support
- Event approval workflow
- Seat selection
- Discount codes
- Waiting list

---

## Resume Description Draft

```txt
TicketFlow – Event Management & Ticketing Platform
React, TypeScript, Django REST Framework, Express.js, PostgreSQL, Stripe, Docker, Kubernetes, Playwright

Built a full-stack event ticketing platform with organizer, attendee, and admin roles, including event creation, ticket purchasing, Stripe Checkout, webhook-based payment confirmation, QR-style ticket generation, and attendee check-in workflows.

Designed a microservice-style architecture using Django REST Framework for core business logic and an Express.js payment service for Stripe Checkout and webhook processing, backed by PostgreSQL and containerized with Docker.

Implemented automated test coverage with Playwright for end-to-end user flows, Django REST Framework tests for role-based API permissions, and Express tests for payment service logic, integrated into GitHub Actions CI.
```

---

## Current Status

Project planning started.

Next step:

```txt
Set up the root-level `web`, `api`, and `payments` folders and initialize the React, Django, and Express applications.
```
