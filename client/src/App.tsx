import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Pages
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import TenantReport from "@/pages/TenantReport";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Replit Auth standard redirects to Landing/Login
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public Tenant Route - Open to anyone with the QR code */}
      <Route path="/report/:propertyId" component={TenantReport} />
      
      {/* Root handling based on auth state */}
      <Route path="/">
        {isAuthenticated ? <Dashboard /> : <Landing />}
      </Route>

      {/* Protected Landlord Routes */}
      <Route path="/properties">
        <ProtectedRoute component={Properties} />
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
