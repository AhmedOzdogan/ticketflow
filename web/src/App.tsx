import { Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';

import HomePage from './pages/HomePage';
const EventsPage = lazy(() => import('./pages/EventsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const FeaturePreview = lazy(() => import('./pages/FeaturePreview'));
const NotFoundPage = lazy(() => import('./pages/404'));
const MyProfile = lazy(() => import('./pages/MyProfile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const CreateEventsPage = lazy(() => import('./pages/CreateEventsPage'));
const EditEventPage = lazy(() => import('./pages/EditEventPage'));
const MyEvents = lazy(() => import('./pages/MyEvents'));
const CheckoutPage = lazy(() => import('./pages/Checkout'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const MyTickets = lazy(() => import('./pages/MyTickets'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentFailedPage = lazy(() => import('./pages/PaymentFailedPage'));

import { Loading } from './components/ui/Loading';
import { RequireRole } from './components/auth/RequireRole';

function App() {
  return (
    <Suspense fallback={<Loading message="Loading page..." overlay />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />

        {/* Authenticated users */}
        <Route element={<RequireRole />}>
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/checkout/:slug" element={<CheckoutPage />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/my-tickets/:id" element={<MyTickets />} />
          <Route path="/checkout/success" element={<PaymentSuccessPage />} />
          <Route path="/checkout/failed" element={<PaymentFailedPage />} />
        </Route>

        {/* Organizers */}
        <Route element={<RequireRole allowedRoles={['organizer', 'admin']} />}>
          <Route
            path="/organizer/feature-preview"
            element={<FeaturePreview />}
          />
          <Route
            path="/organizer/create-event"
            element={<CreateEventsPage />}
          />
          <Route
            path="/organizer/edit-event/:slug"
            element={<EditEventPage />}
          />
          <Route
            path="/organizer/my-events"
            element={<MyEvents />}
          />
          <Route
            path="/organizer/events/preview/:id"
            element={<EventDetailPage />}
          />
        </Route>

        {/* Admin */}
        <Route element={<RequireRole allowedRoles={['admin']} />}>
          <Route
            path="/admin-dashboard"
            element={<AdminDashboard />}
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;