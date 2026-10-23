import { Outlet } from "react-router-dom";
import GridBackground from "./GridBackground";
import AuthBrand from "./AuthBrand";

// Layout for sign in / sign up: moving grid, no navbar.
// AuthBrand lives here so it stays mounted when switching between the forms.
export default function AuthLayout() {
  return (
    <div className="relative min-h-screen">
      <GridBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex flex-1 items-center">
          <section className="mx-auto grid w-full max-w-[1100px] items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:gap-20">
            <AuthBrand />
            <Outlet />
          </section>
        </main>
        <footer className="py-6 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Kodet. All rights reserved.
        </footer>
      </div>
    </div>
  );
}