import { useEffect, useState } from "react";
import { UserButton } from "@clerk/clerk-react";
import { useLocation } from "react-router";
import {
  HomeIcon,
  PanelLeftIcon,
  UsersIcon,
  SettingsIcon,
  Grid2X2Check,
  BookOpenIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";

export const NAVIGATION = [
  { name: "Dashboard", path: "/dashboard", icon: <HomeIcon className="size-5" /> },
  { name: "Areas", path: "/areas", icon: <Grid2X2Check className="size-5" /> },
  { name: "Bookings", path: "/bookings", icon: <BookOpenIcon className="size-5" /> },
  { name: "Analytics", path: "/analytics", icon: <UsersIcon className="size-5" /> },
  { name: "Users", path: "/users", icon: <UsersIcon className="size-5" /> },
  { name: "Settings", path: "/settings", icon: <SettingsIcon className="size-5" /> },
];

function Navbar() {
  const location = useLocation();
  const [theme, setTheme] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("reserveo-theme") || "light"
      : "light",
  );

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
    localStorage.setItem("reserveo-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const current = NAVIGATION.find((item) => item.path === location.pathname);

  return (
    <div className="navbar w-full bg-base-100/80 backdrop-blur border-b border-base-300">
      <label
        htmlFor="my-drawer"
        className="btn btn-square btn-ghost lg:hidden"
        aria-label="Open sidebar"
      >
        <PanelLeftIcon className="size-5" />
      </label>

      <div className="flex-1 px-2 lg:px-4">
        <h1 className="text-lg lg:text-2xl font-semibold tracking-tight">
          {current?.name || "Dashboard"}
        </h1>
      </div>

      <div className="mr-3 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-ghost btn-square"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
        </button>

        <UserButton />
      </div>
    </div>
  );
}

export default Navbar;