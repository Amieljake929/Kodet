import { useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";
import { getUser, saveUser, clearUser } from "../lib/auth";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [user, setUser] = useState(getUser);
  const [menuOpen, setMenuOpen] = useState(false);

  // Not signed in -> back to the sign in page
  if (!user) return <Navigate to="/signin" replace />;

  // Chats uses the full width and height of the screen and never scrolls the page.
  // Every other dashboard page keeps the centered, scrollable layout.
  const fullBleed =
    pathname === "/dashboard/chats" || pathname.startsWith("/dashboard/chats/");

  const updateUser = (next) => setUser(saveUser({ ...user, ...next }));

  const handleSignOut = () => {
    clearUser();
    navigate("/signin");
  };

  return (
    <div
      className={`relative ${
        fullBleed ? "h-screen overflow-hidden" : "min-h-screen"
      }`}
    >
      <div
        className={`relative z-10 flex ${
          fullBleed ? "h-full" : "min-h-screen"
        }`}
      >
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div
          className={`flex min-w-0 flex-1 flex-col ${fullBleed ? "min-h-0" : ""}`}
        >
          <DashboardNavbar
            user={user}
            onOpenMenu={() => setMenuOpen(true)}
            onSignOut={handleSignOut}
          />

          <main
            className={
              fullBleed
                ? "min-h-0 flex-1 p-3 md:p-5"
                : "flex-1 px-6 py-8 md:px-10 md:py-12"
            }
          >
            <div
              className={
                fullBleed ? "h-full w-full" : "mx-auto w-full max-w-[960px]"
              }
            >
              <Outlet context={{ user, updateUser }} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}