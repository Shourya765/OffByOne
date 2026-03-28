import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { EventDetailPage } from "./pages/EventDetailPage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { FavoritesPage } from "./pages/FavoritesPage.jsx";
import { AssistantPage } from "./pages/AssistantPage.jsx";
import { OrganizerPage } from "./pages/OrganizerPage.jsx";
import { OrganizerAddEventPage } from "./pages/OrganizerAddEventPage.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/organizer" element={<OrganizerPage />} />
        <Route path="/organizer/add" element={<OrganizerAddEventPage />} />
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Routes>
    </Layout>
  );
}
