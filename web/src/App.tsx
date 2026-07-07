import { Route, Routes } from 'react-router-dom';

import EventsPage from './pages/EventsPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FeaturePreview from './pages/FeaturePreview';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/feature-preview" element={<FeaturePreview />} />
    </Routes>
  );
}

export default App;