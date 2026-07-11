import { Route, Routes } from 'react-router-dom';

import EventsPage from './pages/EventsPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FeaturePreview from './pages/FeaturePreview';
import NotFoundPage from './pages/404';
import MyProfile from './pages/MyProfile';
import AdminDashboard from './pages/AdminDashboard';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventsPage from './pages/CreateEventsPage';
import EditEventPage from './pages/EditEventPage';
import MyEvents from './pages/MyEvents';

function App() {
  return (
    <Routes>
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
      <Route path="/organizer/events/preview/:id" element={<EventDetailPage />}
      />


      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;