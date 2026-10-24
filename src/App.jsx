import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ThemeToggle from "./components/ThemeToggle";
import Kodet from "./website/Kodet";
import Services from "./sections/Services";
import Works from "./sections/Works";
import About from "./sections/About";
import FAQ from "./sections/FAQ";
import SignIn from "./forms/SignIn";
import SignUp from "./forms/SignUp";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Chats from "./pages/chats/Chats";
import People from "./pages/chats/People";
import Snippet from "./pages/snippet/Snippet";
import Notes from "./pages/notes/Notes";
import Collections from "./pages/collections/Collections";
import Tags from "./pages/tags/Tags";
import Favorites from "./pages/favorites/Favorites";
import Trash from "./pages/trash/Trash";
import HelpCenter from "./pages/helpcenter/HelpCenter";
import { ChatDataProvider } from "./pages/chats/chatStore";
import Placeholder from "./pages/Placeholder";
import { placeholderPages } from "./pages/placeholders";

/**
 * Floating dark/light toggle (bottom-right).
 * Hidden on dashboard routes, where the toggle lives in the profile
 * dropdown instead. It stays mounted so the saved theme is still applied.
 */
function FloatingThemeToggle() {
  const { pathname } = useLocation();
  const inDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  return <ThemeToggle variant="floating" hidden={inDashboard} />;
}

// Pages that now have a real component, so they no longer use the Placeholder
const realPages = [
  "snippets",
  "notes",
  "collections",
  "tags",
  "favorites",
  "trash",
  "help",
];
const stillPlaceholders = placeholderPages.filter(
  ({ path }) => !realPages.includes(path.replace(/^\/+/, ""))
);

export default function App() {
  return (
    <BrowserRouter>
      {/* Shared chat/connection state for the Chats and People pages */}
      <ChatDataProvider>
        <Routes>
          {/* Main site: navbar + grid */}
          <Route element={<Layout />}>
            <Route path="/" element={<Kodet />} />
            <Route path="/services" element={<Services />} />
            <Route path="/works" element={<Works />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
          </Route>

          {/* Auth pages: no navbar */}
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          {/* User dashboard: sidebar + top navbar, no grid */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="chats" element={<Chats />} />
            <Route path="people" element={<People />} />
            <Route path="snippets" element={<Snippet />} />
            <Route path="notes" element={<Notes />} />
            <Route path="collections" element={<Collections />} />
            <Route path="tags" element={<Tags />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="trash" element={<Trash />} />
            <Route path="help" element={<HelpCenter />} />
            <Route path="settings" element={<Settings />} />
            {stillPlaceholders.map(({ path, ...props }) => (
              <Route key={path} path={path} element={<Placeholder {...props} />} />
            ))}
          </Route>
        </Routes>

        <FloatingThemeToggle />
      </ChatDataProvider>
    </BrowserRouter>
  );
}