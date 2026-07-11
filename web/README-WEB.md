# TicketFlow Web

The `web` folder contains the React frontend for TicketFlow, a full-stack event management and ticketing platform.

This frontend is built with **React**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **React Router**, **React Icons**, and **Sonner** for notifications.

---

## Purpose

The web app delivers the public event discovery experience plus authenticated buyer, organizer, and admin workflows for TicketFlow.

Core responsibilities:

- Public landing page and event discovery
- Login and signup workflows
- User profile and security management
- Organizer event creation, editing, and management
- Admin user and organizer approval dashboard
- Public event detail views and organizer preview mode

---

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS v4
- React Router DOM
- React Icons
- Sonner
- ESLint

---

## Folder Structure

```txt
web/
  public/
    images/
    logo_256.png

  src/
    api/
      authApi.ts
      eventApi.ts

    components/
      admin/
        AdminLayout.tsx
        AdminSidebar.tsx
        AdminTable.tsx
        AdminToolbar.tsx
        AdminTopbar.tsx
        StatusBadge.tsx
      events/
        EventForm.tsx
        EventSummary.tsx
      home/
        CtaSection.tsx
        FeaturedEvents.tsx
        HeroSection.tsx
        HowItWorks.tsx
        StatsSection.tsx
      layout/
        Footer.tsx
        Header.tsx
      ui/
        AccountSwitch.tsx
        AuthButtons.tsx
        Badge.tsx
        Button.tsx
        Card.tsx
        CardHeader.tsx
        EventCard.tsx
        Form.tsx
        Loading.tsx
        LoginButtons.tsx
        MobileNavigation.tsx
        PageHeader.tsx
        SettingsCard.tsx
    context/
      AuthContext.tsx
    data/
      eventFormFields.ts
      featuredEvents.ts
    hooks/
      useEventForm.ts
    pages/
      404.tsx
      AdminDashboard.tsx
      AuthGate.tsx
      CreateEventsPage.tsx
      EditEventPage.tsx
      EventDetailPage.tsx
      EventsPage.tsx
      FeaturePreview.tsx
      HomePage.tsx
      LoginPage.tsx
      MyEvents.tsx
      MyProfile.tsx
      SignupPage.tsx
    types/
      api.ts
      auth.ts
      common.ts
      events.ts
      myProfile.ts
      user.ts
    utils/
      getApiErrorMessages.ts
      myProfileHelpers.tsx
    App.tsx
    index.css
    main.tsx
```

---

## Pages and Logic

### Home Page

Route:

```txt
/
```

Logic:

- Fetches public events from `getEvents()` on mount
- Renders `HeroSection` with the first featured event
- Displays featured events, product explanation, stats, and CTA sections
- Includes `Header` and `Footer` for consistent layout

### Events Page

Route:

```txt
/events
```

Logic:

- Fetches paginated events from `getEvents()` whenever `page`, `search`, or `category` changes
- Provides search and category filter controls
- Renders event cards using `EventCard`
- Uses a loading overlay while fetching data
- Includes pagination with previous/next and page numbers
- Shows an empty state if no events match filters

### Login Page

Route:

```txt
/login
```

Logic:

- Renders a login form with email, password, and remember-me fields
- Supports password visibility toggle
- Uses `useAuth()` to call `loginUser()`
- Handles loading state and API errors
- Displays toast notifications for success and failure
- Redirects to home on successful login

### Signup Page

Route:

```txt
/signup
```

Logic:

- Renders buyer and organizer signup in a single form
- Includes fields for name, email, phone, and password
- Shows organizer-only fields for company name, website, and organizer details
- Validates passwords and terms acceptance
- Normalizes organizer website URLs before submission
- Uses `registerUser()` from `AuthContext`
- Displays toast messages for success and failure

### Feature Preview Page

Route:

```txt
/feature-preview
```

Logic:

- Serves as a portfolio placeholder for future pages
- Explains that this page is intentionally not implemented in the portfolio version
- Provides navigation back to the previous page and home

### My Profile Page

Route:

```txt
/my-profile
```

Logic:

- Protected by `AuthGate` for authenticated users
- Pre-fills profile data from `AuthContext`
- Allows updating personal details via `editProfile()`
- Supports password changes via `changePassword()`
- Shows organizer profile details for organizers only
- Displays approval status, rejection reasons, and pending review status
- Includes read-only metadata cards for account timestamps and verification state

### Admin Dashboard

Route:

```txt
/admin-dashboard
```

Logic:

- Protected admin-only page using `AuthGate`
- Uses admin layout components for sidebar, toolbar, and table
- Fetches user lists with `getUsers()` and dashboard metrics with `getStats()`
- Supports buyer, organizer, and admin views
- Provides search and organizer status filters
- Allows approving and rejecting organizer applications
- Sends updates through `updateOrganizerStatus()` and refreshes data
- Includes pagination and admin error handling

### Event Detail Page

Routes:

```txt
/events/:slug
/organizer/events/preview/:id
```

Logic:

- Loads public event details via `getEventDetails()` for slug-based pages
- Loads organizer preview/edit details via `getManageEventDetails()` when an ID is present
- Displays event metadata, venue, date, ticket types, and feature highlights
- Maintains ticket quantity state and calculates totals
- Includes preview banners and publication workflow for organizers

### Create Event Page

Route:

```txt
/organizer/create-event/
```

Logic:

- Protected organizer/admin page using `AuthGate`
- Uses `useEventForm()` to manage event creation state and ticket types
- Renders `EventForm` and `EventSummary`
- Supports cover image upload, event details, location, date/time, and ticket management
- Submits event creation through the event form hook

### Edit Event Page

Route:

```txt
/organizer/edit-event/:slug
```

Logic:

- Protected organizer/admin page using `AuthGate`
- Fetches existing event details via `getManageEventDetails(slug)`
- Pre-fills the event form and ticket types for editing
- Submits updates using `editEvent()` with `FormData`
- Redirects to organizer event list after successful save

### My Events Page

Route:

```txt
/organizer/my-events
```

Logic:

- Protected organizer/admin page using `AuthGate`
- Fetches organizer-owned events from `getMyEvents()` with pagination
- Supports search, ordering, and status filtering
- Computes counts for published, draft, and rejected events
- Renders event cards with badges, location, date, tickets, and action buttons
- Enables preview and edit actions based on event status
- Includes loading state, empty state, and pagination

---

## Routing

React Router is configured in `src/App.tsx`.

Current routes:

```tsx
<Route path="/" element={<HomePage />} />
<Route path="/events" element={<EventsPage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/signup" element={<SignupPage />} />
<Route path="/feature-preview" element={<FeaturePreview />} />
<Route path="/my-profile" element={<MyProfile />} />
<Route path="/admin-dashboard" element={<AdminDashboard />} />
<Route path="/events/:slug" element={<EventDetailPage />} />
<Route path="/organizer/create-event/" element={<CreateEventsPage />} />
<Route path="/organizer/edit-event/:slug" element={<EditEventPage />} />
<Route path="/organizer/my-events" element={<MyEvents />} />
<Route path="/organizer/events/preview/:id" element={<EventDetailPage />} />
<Route path="*" element={<NotFoundPage />} />
```

Navigation uses `useNavigate()` and protected pages use `AuthGate`.

---

## Styling System

Global styles are defined in `src/index.css`.

The project uses Tailwind CSS v4 with CSS variables and semantic tokens.

Semantic colors include:

- `--background`
- `--foreground`
- `--surface`
- `--surface-muted`
- `--border`
- `--muted`
- `--muted-foreground`
- `--primary`
- `--secondary`
- `--accent`
- `--success`
- `--warning`
- `--danger`

Example usage:

```tsx
<div className="bg-background text-foreground">
  <div className="border border-border bg-surface">
    <button className="bg-primary text-primary-foreground">Submit</button>
  </div>
</div>
```

---

## Authentication and API

Auth state is managed by `src/context/AuthContext.tsx`.

API modules:

- `src/api/eventApi.ts`
- `src/api/authApi.ts`

Key API flows:

- `getEvents()` for public event listings
- `getEventDetails()` for public event details
- `getManageEventDetails()` for organizer preview/edit details
- `getMyEvents()` for organizer-owned event listings
- `getUsers()` for admin user lists
- `updateOrganizerStatus()` for organizer approvals
- `getStats()` for admin dashboard metrics
- `editProfile()`, `changePassword()`, and `getCurrentUser()` for profile management

---

## Reusable Components

Reusable UI components include:

- `Button`
- `FormFields`
- `EventCard`
- `Loading`
- `PageHeader`
- `SettingsCard`
- `CardHeader`
- `Header` and `Footer`
- Admin UI components under `src/components/admin/`
- Event creation components under `src/components/events/`

---

## Development Commands

Install dependencies:

```bash
npm install
```

Run local development server:

```bash
npm run dev
```

Build production output:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

Example usage:

```tsx
<div className="bg-background text-foreground">
  <div className="border border-border bg-surface">
    <button className="bg-primary text-primary-foreground">Submit</button>
  </div>
</div>
```

---

## Dark Mode

Dark mode is controlled by the `dark` class on the root HTML element.

The reusable theme switcher is in:

```txt
src/components/ui/Button.tsx
```

Component:

```tsx
<ThemeToggle />
```

Theme preference is stored in localStorage using:

```txt
ticketflow-theme
```

---

## Reusable Button Component

The reusable button lives in:

```txt
src/components/ui/Button.tsx
```

Available variants:

```txt
primary
secondary
outline
ghost
```

Available sizes:

```txt
sm
md
lg
```

Example usage:

```tsx
<Button variant="primary" size="lg">
  Create event
</Button>

<Button variant="outline" size="sm">
  Login
</Button>
```

The button is intentionally a real `<button>` component. Navigation should use `useNavigate()` in the page or layout component.

---

## Images

Static images are stored in:

```txt
public/images/
```

Current images used by the UI:

```txt
/images/concert.webp
/images/music_concert.webp
/images/theater.webp
/images/event.webp
```

Logo:

```txt
/logo_256.png
```

Use public assets like this:

```tsx
<img src="/images/concert.webp" alt="Concert crowd" />
```

