import * as React from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Leaf,
  LayoutDashboard,
  ScanFace,
  CalendarCheck,
  LineChart,
  MessagesSquare,
  FlaskConical,
  UserRound,
  Moon,
  Sun,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { MEDICAL_DISCLAIMER } from "@/lib/constants";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyze", label: "Skin Analysis", icon: ScanFace },
  { to: "/plan", label: "7-Day Plan", icon: CalendarCheck },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/chat", label: "AI Assistant", icon: MessagesSquare },
  { to: "/library", label: "Ingredients", icon: FlaskConical },
  { to: "/profile", label: "Skin Profile", icon: UserRound },
] as const;

export function ThemeToggle() {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle colour theme">
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/60 p-5 lg:flex">
          <Link to="/dashboard" className="mb-8 flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="size-5" />
            </span>
            <span className="font-display text-lg leading-tight font-semibold">
              Skin
              <span className="text-primary">Intel</span>
            </span>
          </Link>
          <NavLinks />
          <div className="mt-auto space-y-3 pt-6">
            <p className="text-[11px] leading-relaxed text-muted-foreground">{MEDICAL_DISCLAIMER}</p>
            <div className="flex items-center justify-between">
              <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
              <div className="flex items-center">
                <ThemeToggle />
                <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
                  <LogOut className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-5">
                <NavLinks onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="font-display text-base font-semibold">
              Skin<span className="text-primary">Intel</span>
            </span>
            <div className="flex items-center">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
                <LogOut className="size-4" />
              </Button>
            </div>
          </header>
          <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
