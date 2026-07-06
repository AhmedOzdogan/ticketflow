

# TicketFlow Web

The `web` folder contains the React frontend for TicketFlow, a full-stack event management and ticketing platform.

This frontend is built with **React**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **React Router**, and **React Icons**.

---

## Purpose

The web app is responsible for the user-facing experience of TicketFlow:

- Public homepage
- Event discovery page
- Login page
- Signup page
- Buyer account flow
- Organizer application flow
- Future organizer dashboard
- Future buyer ticket dashboard

---

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS v4
- React Router DOM
- React Icons
- ESLint
- Prettier

---

## Folder Structure

```txt
web/
  public/
    images/
    logo_256.png

  src/
    components/
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
        Button.tsx

    data/
      featuredEvents.ts

    pages/
      EventsPage.tsx
      HomePage.tsx
      LoginPage.tsx
      SignupPage.tsx

    App.tsx
    index.css
    main.tsx
```

---

## Current Pages

### Home Page

Route:

```txt
/
```

Sections:

- Header
- Hero section
- Featured events
- How it works
- Stats section
- Call-to-action section
- Footer

---

### Events Page

Route:

```txt
/events
```

Features:

- Page hero
- Search bar UI
- Category filter buttons
- Event cards
- Details and ticket buttons
- Organizer call-to-action section

The event data currently comes from:

```txt
src/data/featuredEvents.ts
```

---

### Login Page

Route:

```txt
/login
```

Features:

- Buyer / Organizer switch
- Controlled email input
- Controlled password input
- Remember me checkbox
- Submit handler with login payload

Current behavior:

```txt
The form logs the login payload to the browser console.
```

Later this will be connected to the Django authentication API.

---

### Signup Page

Route:

```txt
/signup
```

Features:

- Buyer / Organizer switch
- Controlled form inputs
- Buyer signup fields
- Organizer-specific fields
- Admin approval notice for organizers
- Password confirmation check
- Terms agreement checkbox

Buyer fields:

- First name
- Last name
- Email address
- Phone number
- Password
- Confirm password
- Terms agreement

Organizer additional fields:

- Company / organization name
- Website or social page
- Organizer details
- Admin approval notice

Current behavior:

```txt
The form logs the signup payload to the browser console.
```

Later this will be connected to the Django registration API.

---

## Routing

React Router is configured in:

```txt
src/App.tsx
```

Current routes:

```tsx
<Route path="/" element={<HomePage />} />
<Route path="/events" element={<EventsPage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/signup" element={<SignupPage />} />
```

Navigation is handled with:

```tsx
useNavigate()
```

The header uses button-based navigation instead of regular anchor links.

---

## Styling System

Global styles are defined in:

```txt
src/index.css
```

The project uses Tailwind CSS v4 with CSS variables and semantic color names.

Main brand colors:

```css
--brand-rose: #d12d4e;
--brand-yellow: #fcd051;
--brand-orange: #ed8c18;
--brand-black: #000003;
```

Semantic colors:

```css
--background
--foreground
--surface
--surface-muted
--border
--muted
--muted-foreground
--primary
--secondary
--accent
--success
--warning
--danger
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

---

## Current Status

Completed:

- React TypeScript setup
- Tailwind CSS v4 setup
- Brand colors and dark mode variables
- Reusable button component
- Theme toggle
- Header
- Footer
- Homepage sections
- Events page
- Login page
- Signup page
- Controlled form inputs

Next frontend steps:

- Add form validation messages
- Add loading and error states
- Create reusable input component
- Create event details page
- Connect login/signup to Django API
- Add buyer dashboard
- Add organizer dashboard
- Add Playwright tests