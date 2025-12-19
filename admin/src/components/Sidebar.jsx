import { useUser } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router";
import { NAVIGATION } from "./Navbar";

function Sidebar() {
  const location = useLocation();
  const { user } = useUser();

  return (
    <div className="drawer-side">
      <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay" />

      <div className="flex min-h-full flex-col bg-base-200/80 backdrop-blur w-64">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-base-300 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold">
            R
          </div>
          <div>
            <p className="font-semibold text-base">Reserveo</p>
            <p className="text-xs opacity-60">Organizer dashboard</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAVIGATION.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all
                ${isActive ? "bg-primary text-primary-content shadow-sm" : "hover:bg-base-300"}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User mini-profile */}
        <div className="px-4 py-4 border-t border-base-300 flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              {/* Clerk renverra une image par défaut si pas d'avatar */}
              <img src={user?.imageUrl} alt={user?.fullName || "User avatar"} />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs opacity-60 truncate">
              {user?.emailAddresses?.[0]?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;