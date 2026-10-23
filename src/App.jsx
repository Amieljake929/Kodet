import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Placeholder from "./pages/Placeholder";
import { placeholderPages } from "./pages/placeholders";

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="settings" element={<Settings />} />
          {placeholderPages.map(({ path, ...props }) => (
            <Route key={path} path={path} element={<Placeholder {...props} />} />
          ))}
        </Route>
      </Routes>

      {/* Floating dark/light toggle (bottom-right) */}
      <ThemeToggle />
    </BrowserRouter>
  );
}