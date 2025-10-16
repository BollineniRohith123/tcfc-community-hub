import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, DollarSign, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/events", label: "Events", icon: Calendar },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/payments", label: "Payments", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-8">
          <h1 className="text-2xl font-bold">TCFC Admin</h1>
          <nav className="ml-8 flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <Button variant="outline" size="sm" className="ml-auto" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default AdminLayout;
