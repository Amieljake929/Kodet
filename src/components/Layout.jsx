import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import GridBackground from "./GridBackground";
import Navbar from "./Navbar";

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="relative min-h-screen font-mono">
      <GridBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}