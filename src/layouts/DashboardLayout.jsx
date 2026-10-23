import { useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import GridBackground from "../components/GridBackground";
import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";
import { getUser, saveUser, clearUser } from "../lib/auth";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser);
  const [menuOpen, setMenuOpen] = useState(false);

  // Not signed in -> back to the sign in page
  if (!user) return <Navigate to="/signin" replace />;

  const updateUser = (next) => setUser(saveUser({ ...user, ...next }));

  const handleSignOut = () => {
    clearUser();
    navigate("/signin");
  };

  return (
    <div className="relative min-h-screen">
      {/* Softer grid so it doesn't compete with the content */}
      <GridBackground subtle />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardNavbar
            user={user}
            onOpenMenu={() => setMenuOpen(true)}
            onSignOut={handleSignOut}
          />

          <main className="flex-1 px-6 py-8 md:px-10 md:py-12">
            <div className="mx-auto w-full max-w-[960px]">
              <Outlet context={{ user, updateUser }} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}