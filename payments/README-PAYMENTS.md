# TicketFlow Payments Backend API

This document describes the payment backend service for TicketFlow. It exposes endpoints for creating Stripe Checkout sessions, downloading ticket PDFs, and processing Stripe webhooks.

## 1. Overview

The payments service is a lightweight Express application that sits between the TicketFlow frontend, Stripe, and the Django backend.

### Responsibilities
- Create Stripe Checkout sessions from pending orders.
- Generate printable PDF tickets from ticket data fetched from the Django API.
- Receive Stripe webhook events and mark orders as completed in Django.

### Base URL
- Local development: http://localhost:5001

### Important implementation notes
- The service currently has no authentication middleware.
- Stripe webhook requests are parsed as raw JSON because Stripe signs the payload.
- All other routes use JSON request bodies.
- The frontend success URL is currently set to http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}.
- The frontend cancel URL is currently set to http://localhost:5173/payment/failed.

---

## 2. Environment Variables

The service expects the following environment variables:

- PORT: Port for the Express server. Defaults to 5001.
- STRIPE_SECRET_KEY: Secret key used to create Stripe Checkout sessions.
- STRIPE_WEBHOOK_SECRET: Secret used to verify incoming Stripe webhook signatures.
- DJANGO_API: Base URL of the Django API.
- DJANGO_API_TOKEN: Bearer token for the Django API.

Example:

```env
PORT=5001
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DJANGO_API=http://localhost:8000
DJANGO_API_TOKEN=your-token
```

---

## 3. API Endpoints Summary

| Method | Path | Purpose |
|---|---|---|
| GET | / | Health check |
| POST | /payment/create-checkout-session | Create a Stripe Checkout session for an order |
| GET | /api/tickets/:ticketId/pdf | Download a ticket as a PDF |
| POST | /webhook/ | Receive Stripe webhook events |

---

## 4. Endpoint Details

### 4.1 Health Check

#### GET /

Returns a simple health/status payload.

#### Request
No request body required.

#### Success Response
Status: 200 OK

```json
{
  "service": "TicketFlow Payments API",
  "status": "running"
}
```

#### Possible Responses
- 200: Service is healthy.

#### Example
```bash
curl http://localhost:5001/
```

---

### 4.2 Create Stripe Checkout Session

#### POST /payment/create-checkout-session

Creates a Stripe Checkout session for a pending order. The service first fetches the order from the Django backend, validates that it is still pending, and then creates a Stripe session with line items based on the order contents.

#### Request Body

```json
{
  "order_id": "123"
}
```

#### Required Field
- order_id: string — the ID of the order to pay for.

#### Success Response
Status: 200 OK

```json
{
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_abc123",
  "session_id": "cs_test_abc123"
}
```

#### Possible Responses
- 200: Checkout session created successfully.
- 400: Missing order_id in the request body.

```json
{
  "message": "order_id is required."
}
```

- 500: Stripe session creation failed or the order could not be processed.

```json
{
  "message": "Failed to create checkout session."
}
```

#### Notes
- The backend fetches the order from Django using the order ID.
- The order must have status pending; otherwise Stripe session creation fails.
- The session is created with:
  - payment mode: payment
  - payment method type: card
  - success URL: http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}
  - cancel URL: http://localhost:5173/payment/failed

#### Example
```bash
curl -X POST http://localhost:5001/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"order_id":"123"}'
```

---

### 4.3 Download Ticket as PDF

#### GET /api/tickets/:ticketId/pdf

Generates and returns a PDF ticket for a given ticket ID.

#### Path Parameter
- ticketId: string — the ticket identifier.

#### Success Response
Status: 200 OK

- Content-Type: application/pdf
- Content-Disposition: attachment; filename=ticket-<ticketId>.pdf
- Body: binary PDF data

#### Possible Responses
- 200: PDF generated successfully and returned as a file download.
- 500: Ticket PDF generation failed.

#### Example
```bash
curl -OJ http://localhost:5001/api/tickets/42/pdf
```

#### Internal Flow
1. The route extracts the ticket ID from the URL.
2. The service calls the Django API to fetch ticket details.
3. A PDF is generated with:
   - event title
   - ticket type name
   - owner name
   - purchase date
   - QR code
   - event cover image (if available)

#### Notes
- The endpoint does not currently validate the ticket ID format separately.
- If the Django API returns ticket data that cannot be processed, the PDF generation may fail.

---

### 4.4 Stripe Webhook Receiver

#### POST /webhook/

Receives Stripe webhook events and processes payment completion events. This endpoint is intended to be registered with Stripe as a webhook target.

#### Headers
- stripe-signature: string — required signature header sent by Stripe.

#### Request Body
Raw JSON body as received from Stripe.

#### Success Response
Status: 200 OK

```json
{
  "received": true
}
```

#### Possible Responses
- 400: Missing Stripe signature header.

```text
Missing Stripe signature.
```

- 400: Invalid Stripe signature.

```text
Invalid webhook signature.
```

- 400: The webhook event contained no valid order ID.

```text
Missing order ID.
```

- 200: Webhook was accepted and processed, even if the event type was not explicitly handled.

#### Webhook Processing Logic
The service currently handles the following event type:
- checkout.session.completed

When this event occurs, it:
1. Extracts the Stripe session object.
2. Reads the order ID from session metadata.
3. Calls the Django backend to mark the order as complete using:
   - stripe_checkout_session_id
   - stripe_payment_intent_id

#### Example
```bash
curl -X POST http://localhost:5001/webhook/ \
  -H "Stripe-Signature: test_signature" \
  -H "Content-Type: application/json" \
  -d '{"type":"checkout.session.completed"}'
```

#### Notes
- This endpoint must be configured in Stripe with the correct webhook secret.
- The webhook body must be received as raw data, not parsed JSON by Express before signature verification.

---

## 5. Internal Service Flow

### Payment Checkout Flow
1. The client sends an order ID to /payment/create-checkout-session.
2. The backend requests the order from the Django API.
3. If the order is pending, a Stripe Checkout session is created.
4. The client is redirected to Stripe to complete payment.
5. After payment succeeds, Stripe sends a webhook event to /webhook/.
6. The backend notifies Django to complete the order.

### Ticket PDF Flow
1. The client requests /api/tickets/:ticketId/pdf.
2. The backend fetches ticket metadata from Django.
3. The service generates a PDF with the ticket information and QR code.
4. The PDF is streamed back to the client.

---

## 6. Error Handling Summary

| Scenario | Response |
|---|---|
| Missing order_id | 400 with {"message":"order_id is required."} |
| Stripe checkout session creation failure | 500 with {"message":"Failed to create checkout session."} |
| Missing Stripe signature | 400 with plain text "Missing Stripe signature." |
| Invalid Stripe signature | 400 with plain text "Invalid webhook signature." |
| Missing order ID in webhook metadata | 400 with plain text "Missing order ID." |
| Successful webhook processing | 200 with {"received":true} |
| Successful PDF ticket download | Binary PDF response |

---

## 7. Integration Notes

### Frontend integration
The frontend should redirect users to the checkout URL returned from the payment endpoint.

Example flow:
```ts
const response = await fetch('http://localhost:5001/payment/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ order_id: orderId })
});

const data = await response.json();
window.location.href = data.checkout_url;
```

### Stripe webhook setup
In Stripe Dashboard, configure the webhook endpoint to point to:

```text
http://localhost:5001/webhook/
```

Use the event type:
- checkout.session.completed

---

## 8. Notes for Production

The current implementation is functional for local development, but the following improvements would be recommended before production deployment:
- Replace localhost success/cancel URLs with real frontend URLs.
- Add structured error handling and consistent JSON error responses across all endpoints.
- Add authentication and authorization for protected endpoints.
- Add logging and monitoring for payment failures and webhook issues.
- Validate ticket IDs and order IDs more explicitly.

---

## 9. Quick Reference

### Create checkout session
```bash
curl -X POST http://localhost:5001/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"order_id":"123"}'
```

### Download ticket PDF
```bash
curl -OJ http://localhost:5001/api/tickets/42/pdf
```

### Health check
```bash
curl http://localhost:5001/
```
