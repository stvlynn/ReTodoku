import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="font-bold text-xl flex items-center">
            <i className="ri-postcard-line mr-2 text-blue-600"></i>
            ReTodoku
          </NavLink>
          <nav className="flex items-center gap-6">
            <NavLink 
              to="/about" 
              className={({ isActive }) => cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <i className="ri-information-line mr-1"></i>
              About
            </NavLink>
            <NavLink 
              to="/friends" 
              className={({ isActive }) => cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <i className="ri-group-line mr-1"></i>
              Friends
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}