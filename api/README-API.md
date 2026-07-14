# TicketFlow API

<div align="center">

**Django REST API for TicketFlow's identity, events, orders, inventory, and ticket admission.**

[![Python](https://img.shields.io/badge/Python-3.14-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-6.0-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-3.17-A30000?logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

JWT authentication · transactional inventory · payment synchronization · QR check-in

</div>

TicketFlow API owns the platform's durable business state and rules. A separate Express service handles Stripe-facing operations, while Django remains authoritative for users, events, inventory, orders, tickets, and admission state.

## Table of contents

- [Overview](#overview)
- [Project highlights](#project-highlights)
- [Project metrics](#project-metrics)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Domain model](#domain-model)
  - [Users and organizer profiles](#users-and-organizer-profiles)
  - [Events and ticket types](#events-and-ticket-types)
  - [Orders, order items, and tickets](#orders-order-items-and-tickets)
- [Business workflows](#business-workflows)
  - [Registration and organizer approval](#registration-and-organizer-approval)
  - [Event creation, publication, and discovery](#event-creation-publication-and-discovery)
  - [Purchase, payment, and fulfillment](#purchase-payment-and-fulfillment)
  - [QR validation and check-in](#qr-validation-and-check-in)
- [Authentication and authorization](#authentication-and-authorization)
- [API overview](#api-overview)
- [Validation and inventory safety](#validation-and-inventory-safety)
- [Filtering, pagination, and performance](#filtering-pagination-and-performance)
- [Security](#security)
- [Project structure](#project-structure)
- [Local development](#local-development)
  - [Run the API directly](#run-the-api-directly)
- [Docker](#docker)
- [Testing and quality](#testing-and-quality)
- [Engineering decisions](#engineering-decisions)
- [Future improvements](#future-improvements)
- [Portfolio highlights](#portfolio-highlights)

## Overview

Django REST Framework keeps serialization, permissions, filtering, and ORM transactions close to the domain data they protect.

Implemented responsibilities include:

- account and JWT lifecycle management, including organizer review;
- organizer-owned events, nested ticket types, and public published-event discovery;
- authoritative order pricing, short-lived reservations, cancellation, and payment synchronization;
- atomic inventory reduction, ticket issuance, and role-scoped QR check-in;
- dependency health checks and generated OpenAPI, Swagger UI, and ReDoc documentation.

## Project highlights

- **JWT authentication:** 15-minute access tokens and 7-day rotating refresh tokens, with refresh-token blacklisting on rotation and logout.
- **Role-aware workflows:** buyer, organizer approval, administrator, record ownership, and service-to-service boundaries.
- **Nested ticket inventory:** event writes create and reconcile ticket types while preserving already-consumed quantity.
- **Safe checkout reservations:** Redis reservations, distributed locks, database transactions, and row locks reduce overselling risk during checkout.
- **Payment and fulfillment boundary:** a service-token-protected callback records payment, decrements stock, and issues one QR-backed ticket per unit.
- **Query and operations support:** filtering, search, pagination, aggregate statistics, caching, Docker Compose, seed data, expiry cleanup, and health reporting.

## Project metrics

Counts below are calculated from the current Python modules and URL configurations, excluding migrations, enum classes, Django admin, and documentation routes where noted.

| Metric | Count | What is counted |
|---|---:|---|
| Django applications | 4 | `core`, `users`, `events`, `orders` |
| Persisted domain models | 7 | User, OrganizerProfile, Event, TicketType, Order, OrderItem, Ticket |
| Serializer classes | 27 | Model, request, response, and utility serializers |
| API view classes | 24 | DRF generic views, APIViews, and token refresh view |
| Application routes | 24 | Versioned core, user, event, order, and ticket paths |
| Custom permissions | 6 | Five role/object permissions and one payment-service permission |
| Filter sets | 5 | User, event, ticket type, order, and ticket filters |
| Pagination classes | 7 | Three app defaults plus user, event, order, and ticket statistic responses |
| Management commands | 2 | Demo seeding and expired-order cleanup |
| Implemented automated tests | 0 | Existing `tests.py` files are placeholders |

## Technology stack

| Area | Technology | Role in TicketFlow |
|---|---|---|
| Language | Python 3.14 | API and domain implementation |
| Web framework | Django 6.0.6 | ORM, migrations, authentication, settings, and management commands |
| API framework | Django REST Framework 3.17.1 | Serialization, generic views, permissions, throttling, and pagination |
| Database | PostgreSQL 16 | Durable relational source of truth |
| Cache / coordination | Redis 7 + `django-redis` | Public-event caching, checkout reservations, and distributed locks |
| Authentication | Simple JWT 5.5.1 | Access/refresh tokens, rotation, and blacklisting |
| Query APIs | `django-filter` | Structured filtering alongside DRF search and ordering |
| API documentation | drf-spectacular | OpenAPI schema, Swagger UI, and ReDoc |
| Images | Pillow | Event cover-image handling |
| Configuration | python-decouple + dj-database-url | Environment-driven Django and database settings |
| Database driver | psycopg 3 | PostgreSQL connectivity |
| Cross-origin access | django-cors-headers | Local React client access |
| Containers | Docker + Docker Compose | API, PostgreSQL, Redis, payment, web, and cleanup services |
| Quality tooling | pytest, pytest-django, coverage, factory-boy, Faker, Ruff | Installed development tooling; test suites are not yet implemented |

## Architecture

TicketFlow uses a modular Django application with a narrow payment-service boundary:

| Component | Responsibility |
|---|---|
| Django API | Domain rules, authorization, authoritative pricing, reservations, order state, inventory, ticket fulfillment, and check-in |
| PostgreSQL | Durable users, events, ticket types, orders, payment identifiers, tickets, and admission state |
| Redis | Disposable public-event cache entries, 10-minute checkout reservations, and per-event reservation locks |
| Express payment service | Stripe Checkout creation, Stripe webhook handling, and payment-success notification to Django |
| Stripe | Hosted checkout and payment processing |

```mermaid
flowchart TB
    Browser[React frontend] -->|JWT / REST| API[Django REST API]
    API -->|ORM| DB[(PostgreSQL)]
    API -->|cache, locks, 10-minute reservations| Redis[(Redis)]
    Browser -->|start checkout| Payment[Express payment service]
    Payment -->|read order with user's JWT| API
    Payment -->|Checkout Session| Stripe[Stripe]
    Stripe -->|signed webhook| Payment
    Payment -->|service bearer token: complete order| API
    API -->|paid order, stock, tickets| DB
```

After a signed Stripe webhook, Express calls Django with a shared service token. Django accepts pending orders, treats already-paid orders as successful no-ops, and performs stock reduction and fulfillment transactionally.

## Domain model

### Users and organizer profiles

`User` extends Django's user model with UUID identity, unique email login, profile fields, platform role, verification state, and organizer approval state. An organizer has one optional `OrganizerProfile` containing company and review metadata.

### Events and ticket types

Each `Event` belongs to a user acting as its organizer and owns its `TicketType` rows. Events carry schedule, venue, category, cover, generated slug, and lifecycle status; ticket types hold price and inventory totals.

### Orders, order items, and tickets

An `Order` connects a buyer to one event. Its items snapshot ticket type, quantity, and unit price, with each ticket type allowed once per order. Payment completion creates one `Ticket` per purchased unit and links it to the owner, event, ticket type, and originating order item.

```mermaid
erDiagram
    USER ||--o| ORGANIZER_PROFILE : has
    USER ||--o{ EVENT : organizes
    USER ||--o{ ORDER : places
    USER ||--o{ TICKET : owns
    EVENT ||--o{ TICKET_TYPE : offers
    EVENT ||--o{ ORDER : receives
    EVENT ||--o{ TICKET : admits
    ORDER ||--|{ ORDER_ITEM : contains
    TICKET_TYPE ||--o{ ORDER_ITEM : selected_as
    ORDER_ITEM ||--o{ TICKET : fulfills
    TICKET_TYPE ||--o{ TICKET : classifies

    USER {
        uuid id PK
        string email UK
        string role
        string organizer_approval_status
    }
    ORGANIZER_PROFILE {
        uuid id PK
        uuid user_id FK,UK
        string company_name
        datetime reviewed_at
    }
    EVENT {
        uuid id PK
        uuid organizer_id FK
        string slug UK
        string status
    }
    TICKET_TYPE {
        uuid id PK
        uuid event_id FK
        decimal price
        int total_quantity
        int remaining_quantity
    }
    ORDER {
        uuid id PK
        uuid user_id FK
        uuid event_id FK
        string status
        decimal total_price
    }
    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        uuid ticket_type_id FK
        int quantity
        decimal unit_price
    }
    TICKET {
        uuid id PK
        uuid order_item_id FK
        uuid qr_code UK
        string status
    }
```

UUIDs are non-sequential internal identifiers; generated slugs route public event details. Anonymous event lists omit event IDs and anonymous ticket types omit their IDs, but public event details include the event UUID.

## Business workflows

### Registration and organizer approval

Buyer registration returns JWTs immediately. Organizer registration also requires a company, atomically creates a profile, and starts in `pending`. Admins can approve or reject applications; rejection requires a reason. Event management and check-in require approval.

```mermaid
sequenceDiagram
    actor User
    participant API as Django API
    participant DB as PostgreSQL
    actor Admin

    User->>API: POST /users/register/ (organizer)
    API->>API: validate email, role, passwords, company
    API->>DB: create User + OrganizerProfile atomically
    API-->>User: access token + refresh token + profile
    Admin->>API: PATCH organizer approval
    API->>DB: set approved/rejected, review time, reason
    API-->>Admin: reviewed organizer
```

### Event creation, publication, and discovery

An approved organizer creates an event together with its ticket types. Organizers may set only `draft` or `pending`; administrators can set any declared event status, including `published`. Public list and detail routes return published events only. Managed writes invalidate affected public list and detail cache entries.

### Purchase, payment, and fulfillment

Checkout calculates prices from stored ticket types and creates a pending order under a per-event Redis lock and database transaction. The resulting Redis reservation lasts 10 minutes and temporarily reduces the availability presented to other buyers.

```mermaid
sequenceDiagram
    actor Buyer
    participant API as Django API
    participant Redis
    participant DB as PostgreSQL
    participant Pay as Express payments
    participant Stripe

    Buyer->>API: POST /orders/create/
    API->>Redis: acquire event reservation lock
    API->>DB: lock ticket types and calculate price
    API->>DB: create pending order + items
    API->>Redis: reserve inventory for 10 minutes
    Buyer->>Pay: request Stripe Checkout
    Pay->>API: read buyer's order
    Pay->>Stripe: create Checkout Session
    Stripe-->>Buyer: hosted payment flow
    Stripe->>Pay: signed successful-payment webhook
    Pay->>API: complete(order, payment IDs) with service token
    API->>DB: mark paid and decrement locked inventory
    API->>DB: issue one QR ticket per unit
    API->>Redis: delete reservation
    API-->>Pay: paid
```

Owners may cancel pending orders. The `cleanup_expired_orders` command cancels pending orders older than ten minutes after their reservation disappears; Docker Compose invokes it once per minute.

### QR validation and check-in

Buyers list their own tickets, approved organizers list tickets for their events, and administrators list all tickets. A QR scan resolves a ticket by its unique code. Only the event's approved organizer or an administrator may mark it used; used, cancelled, and refunded tickets are rejected.

## Authentication and authorization

Requests use `Authorization: Bearer <access-token>`. Email is the authentication identifier through a custom case-insensitive backend.

| Capability | Anonymous | Buyer | Unapproved organizer | Approved organizer | Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Browse published events | ✓ | ✓ | ✓ | ✓ | ✓ |
| Register, log in, refresh | ✓ | ✓ | ✓ | ✓ | ✓ |
| Read/update own profile | — | ✓ | ✓ | ✓ | ✓ |
| Create an order / cancel own pending order | — | ✓ | ✓ | ✓ | ✓ |
| List orders and tickets | — | Own | Own | Own events | All |
| Retrieve a single order | — | Own | Own | Own | All |
| Manage events | — | — | — | Own | All |
| Scan tickets | — | — | — | Own events | All |
| Review organizers and list users | — | — | — | — | ✓ |
| Complete payment | Service token | — | — | — | — |

Approved organizers' collection views switch from personal purchases to their events. Single-order and payment-order detail views always remain purchaser-scoped, including for administrators.

The current-user endpoint supports `GET`, `PUT`, and `PATCH`; only name, phone number, and profile image URL are editable. Password changes require the old password and Django password validation. Logout requires a valid access token and blacklists the supplied refresh token.

## API overview

Base URL: `http://localhost:8000/api/v1/`

| Area | Route family | Access |
|---|---|---|
| System | `/`, `/health/` | Public |
| Authentication | `/users/register/`, `/login/`, `/token/refresh/`, `/logout/` | Public or authenticated by operation |
| Profile | `/users/me/`, `/users/change-password/` | Authenticated user |
| Administration | `/users/`, `/users/organizers/{id}/approve/` | Administrator |
| Public events | `/events/`, `/events/{slug}/` | Public; published events only |
| Managed events | `/events/create/`, `/events/manage/…` | Approved organizer or administrator |
| Orders | `/orders/`, `/orders/create/`, `/orders/{id}/…` | Authenticated and queryset-scoped |
| Tickets | `/orders/tickets/…` | Authenticated and role-scoped |
| Payment bridge | `/orders/payments/{id}/…` | Buyer JWT for reads; service token for completion |

Interactive documentation is available at `/api/schema/swagger/`, ReDoc at `/api/schema/redoc/`, and the raw OpenAPI schema at `/api/schema/`.

## Validation and inventory safety

| Domain | Implemented rules |
|---|---|
| Accounts | Case-insensitive email uniqueness; no public admin registration; matching, Django-validated passwords; company required for organizers |
| Organizer review | Rejection reason required; approval state and review metadata updated atomically |
| Events | Organizers limited to draft/pending status; nested ticket types initialize stock and reconcile quantity changes |
| Orders | At least one positive item; no duplicate ticket types; every type belongs to the event; event has not ended; requested quantity fits unreserved stock |
| Pricing | Total and unit prices come from persisted ticket types, not request values |
| Payment | Only pending orders complete; already-paid completion is an idempotent success |
| Check-in | Event ownership is checked; used, cancelled, and refunded tickets are rejected |

Availability is checked during serializer validation and again after Redis and database locks are acquired.

Database constraints add unique emails, slugs, payment identifiers, QR codes, and one occurrence of a ticket type per order.

## Filtering, pagination, and performance

List APIs combine `django-filter`, text search, and ordering. Common examples:

```http
GET /api/v1/events/?category=music&city__icontains=berlin&start_date__gte=2026-08-01T00:00:00Z&ordering=start_date
GET /api/v1/orders/?status=paid&total_price__gte=50&search=festival&ordering=-paid_at
GET /api/v1/orders/tickets/?status=active&order_id=<order-uuid>&ordering=-created_at
GET /api/v1/users/?role=organizer&organizer_approval_status=pending&search=music&page_size=20
```

Public event pages default to 5 results and cap `page_size` at 10. User, order, and ticket operational pages default to 10; users cap at 100 and orders/tickets at 20. Operational pagination responses include aggregate status statistics.

| Mechanism | Current use |
|---|---|
| Related-object loading | `select_related` for single-valued joins; `prefetch_related` for ticket types and order items |
| Redis caching | Five-minute public event list/detail cache with invalidation after managed writes |
| Query bounds | Page-number pagination with endpoint-specific limits |
| Database indexes | User role/approval, order and ticket status combinations, dates, and QR lookup |
| Batched writes | `bulk_create` for order items |
| Concurrency control | Redis per-event lock plus `select_for_update` during checkout and fulfillment |
| Connections | PostgreSQL connection reuse with `conn_max_age=600` |

## Security

| Layer | Implemented protection |
|---|---|
| Authentication | JWT access tokens; rotating and blacklisted refresh tokens |
| Default access | DRF requires authentication unless a view explicitly uses `AllowAny` |
| Authorization | Role permissions, event ownership checks, and scoped querysets |
| Service authentication | Constant-time comparison of the payment service bearer token |
| Credentials | Django password validation at registration and password change |
| Request controls | DRF throttling at 100 anonymous and 1,000 authenticated requests per hour |
| Browser access | CORS allowlist fixed to the two local frontend origins in settings |
| Persistence | Serializer validation, ORM parameterization, unique constraints, and transactions |

Slug routing and selective ID omission reduce exposure of some internal identifiers but are not authorization controls. TLS termination, production secret storage, deployment host/CORS policy, and infrastructure-level traffic controls are not configured by this repository.

## Project structure

```text
api/
├── apps/
│   ├── core/                  # API information, dependency health, demo seed command
│   ├── users/                 # Identity, organizer profiles, JWT flows, roles and approvals
│   ├── events/                # Events, ticket types, public discovery and managed lifecycle
│   └── orders/                # Reservations, orders, payment completion, tickets and check-in
├── config/                    # Settings, root routing, ASGI and WSGI entry points
├── seed_images/               # Cover assets consumed by the demo seed command
├── .env.example               # API environment template
├── Dockerfile                 # Python API image
├── manage.py                  # Django command entry point
├── requirements.txt           # Locked Python dependencies
└── run-api.sh                 # Local helper for PostgreSQL, migrations and development server
```

The apps collaborate through explicit model relationships and shared permission classes:

| Path | Responsibility |
|---|---|
| `apps/core/` | API metadata, dependency health checks, demo seeding, and cross-domain operational entry points |
| `apps/users/` | Custom identity model, organizer profiles, email authentication, JWT flows, account administration, and role permissions |
| `apps/events/` | Event and ticket-type persistence, public discovery, organizer management, filtering, caching, and pagination |
| `apps/orders/` | Checkout reservations, authoritative pricing, orders, payment completion, ticket fulfillment, and check-in |
| `config/` | Installed apps, middleware, database/cache/authentication settings, and root URL composition |

`events` depends on user roles and organizer permissions. `orders` connects users to events and ticket types, then exposes issued tickets. `core` observes PostgreSQL, Redis, and the payment service for health reporting. The repository-level Compose file coordinates these processes with their infrastructure.

## Local development

### Run the API directly

Prerequisites are Python 3.14, PostgreSQL, and Redis. From this directory:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Complete `.env` before starting:

| Variable | Required | Code behavior |
|---|:---:|---|
| `DJANGO_SECRET_KEY` | Yes | Django secret key |
| `DATABASE_URL` | Yes | Parsed PostgreSQL connection URL |
| `PAYMENT_SERVICE_TOKEN` | Yes | Shared bearer token required by payment completion |
| `DJANGO_DEBUG` | No | Defaults to `False` |
| `DJANGO_ALLOWED_HOSTS` | No | Comma-separated; defaults to `localhost` |
| `REDIS_URL` | No | Defaults to `redis://redis:6379/1` |
| `PAYMENTS_HEALTH_URL` | No | Health view defaults to `http://payment:5001/` |

```dotenv
DJANGO_SECRET_KEY=replace-with-a-long-random-value
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://ticketflow:ticketflow@localhost:5432/ticketflow
REDIS_URL=redis://localhost:6379/1
PAYMENT_SERVICE_TOKEN=use-the-same-secret-as-the-payment-service
PAYMENTS_HEALTH_URL=http://localhost:5001/
```

> When running Django on the host, override the container-oriented Redis and payment hostnames with `localhost`. `CORS_ALLOWED_ORIGINS`, `ACCESS_TOKEN_LIFETIME_MINUTES`, and `REFRESH_TOKEN_LIFETIME_DAYS` appear in `.env.example` but are not read by the current settings module; CORS origins and JWT lifetimes are fixed in code.

Create the database, then:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Optional demo content:

```bash
python manage.py seed
```

The seed command creates fixed demo accounts, published events, ticket types, paid orders, and tickets and is intended for a clean development database.

## Docker

From the repository root, create `.env` with the variables required by Django and the payment service, then run:

```bash
docker compose up --build
```

Compose runs PostgreSQL (`5432`), Redis (`6379`), Django (`8000`), the Express payment service (`5001`), React (`5173`), and a cleanup container that executes the expiry command every minute. Named volumes persist database and Redis data.

> **Data warning:** the API container runs `flush --no-input`, migrates, seeds, and starts Django's development server each time it starts. Restarting it destroys application data even though the PostgreSQL volume persists. No production application server is configured.

## Testing and quality

The dependencies include pytest, pytest-django, coverage, factory-boy, Faker, and Ruff. The three app `tests.py` modules are generated placeholders, with no pytest configuration or GitHub Actions workflow. There is currently no automated test coverage.

Useful checks today are:

```bash
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py spectacular --validate --file /tmp/ticketflow-schema.yml
ruff check .
```

## Engineering decisions

- **Domain changes are transactional.** Pricing, order state, inventory, and fulfillment stay in Django so related PostgreSQL writes share a transaction boundary.
- **Redis state is recoverable.** Cache entries and reservations accelerate reads and coordinate checkout, but PostgreSQL remains the durable record.
- **Public and internal identifiers serve different purposes.** UUIDs identify records internally; generated slugs provide readable public event routes.
- **Authorization has two layers.** Reusable role permissions reject invalid actor types, while scoped querysets and object checks constrain which records they can act on.
- **Serializers define request invariants.** Cross-field validation, calculated prices, nested writes, and read-only response fields remain outside views.
- **Concurrency checks occur at mutation time.** Early validation provides useful errors; Redis locks and locked database rows protect the final availability decision.

## Future improvements

These are recommendations, not implemented features:

| Category | Recommended next work |
|---|---|
| Testing | Cover JWT lifecycle, role and ownership boundaries, event transitions, concurrent reservations, payment idempotency, fulfillment, expiry cleanup, and QR replay |
| Developer experience | Add CI for Ruff, Django checks, migration drift, schema validation, tests, and coverage; add explicit pytest configuration |
| Security | Scope ticket downloads to the owner, event organizer, or admin; strengthen payment callbacks with signed or short-lived credentials and validated payloads |
| Infrastructure | Add a deployment application server, managed secrets, media/static storage, proxy configuration, and distinct readiness checks |
| Observability | Add structured logs, correlation IDs, metrics, traces, error reporting, and payment/reservation audit records |
| Background processing | Move expiry cleanup to a scheduler or task queue; add email verification and transactional notification workflows |
| Domain completeness | Define failure, refund, cancellation, and event-completion transitions across orders, inventory, and tickets |
| Scalability | Replace Redis key iteration with per-ticket-type counters or atomic scripts for larger inventories |

## Portfolio highlights

This backend demonstrates relational domain modeling, REST API design, authentication and multi-role authorization, transactional inventory, cross-service payment synchronization, cache and lock coordination, query optimization, OpenAPI documentation, and containerized local orchestration. The implementation connects those skills in one coherent order-to-admission lifecycle rather than presenting them as isolated examples.
