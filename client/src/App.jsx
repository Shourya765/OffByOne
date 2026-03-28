import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { EventDetailPage } from "./pages/EventDetailPage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { FavoritesPage } from "./pages/FavoritesPage.jsx";
import { AssistantPage } from "./pages/AssistantPage.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Routes>
    </Layout>
  );
}
