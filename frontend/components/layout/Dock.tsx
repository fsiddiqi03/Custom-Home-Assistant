"use client";

/**
 * macOS-style dock navigation component
 * Fixed at bottom of screen with icon navigation
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, Activity, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/utils/constants";
import { ThemeToggle } from "./ThemeToggle";
import { useEditMode } from "./EditModeProvider";

interface DockItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const dockItems: DockItem[] = [
  {
    icon: Home,
    label: "Home",
    href: ROUTES.HOME,
  },
  {
    icon: Camera,
    label: "Camera",
    href: ROUTES.CAMERA,
  },
  {
    icon: Activity,
    label: "System",
    href: ROUTES.SYSTEM,
  },
];

export function Dock() {
  const pathname = usePathname();
  const { isEditMode, toggleEditMode } = useEditMode();

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 px-6 py-2 bg-card/80 backdrop-blur-lg border border-border rounded-full shadow-lg">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
                "hover:bg-background",
                isActive && "bg-primary/10"
              )}
              aria-label={item.label}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-foreground/60 group-hover:text-foreground"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-foreground/60 group-hover:text-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Edit Mode Toggle - only show on home page */}
        {pathname === ROUTES.HOME && (
          <button
            onClick={toggleEditMode}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
              "hover:bg-background",
              isEditMode && "bg-primary/10"
            )}
            aria-label={isEditMode ? "Done editing" : "Edit layout"}
          >
            {isEditMode ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Pencil className="w-5 h-5 text-foreground/60 hover:text-foreground" />
            )}
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                isEditMode ? "text-green-500" : "text-foreground/60"
              )}
            >
              {isEditMode ? "Done" : "Edit"}
            </span>
          </button>
        )}

        {/* Theme Toggle */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
