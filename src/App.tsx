import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ScrollToTop } from "@/components/ScrollToTop";
import { toast } from "sonner";
import { AppErrorBoundary } from "@/components/app/AppErrorBoundary";
import { Loader2 } from "lucide-react";

import Index from "./pages/Index";

const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Orders = lazy(() => import("./pages/Orders"));
const Settings = lazy(() => import("./pages/Settings"));
const Subscription = lazy(() => import("./pages/Subscription"));

const Admin = lazy(() => import("./pages/admin/Admin"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminProviders = lazy(() => import("./pages/admin/AdminProviders"));
const AdminMapping = lazy(() => import("./pages/admin/AdminServiceProviderMapping"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const App = () => {
  useEffect(() => {
    const handleRejection = (e: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", e.reason);
      toast.error("An error occurred. Please try again.");
      e.preventDefault();
    };
    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppErrorBoundary>
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/settings" element={<Settings />} />

                  <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
                  <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
                  <Route path="/admin/services" element={<AdminGuard><AdminServices /></AdminGuard>} />
                  <Route path="/admin/providers" element={<AdminGuard><AdminProviders /></AdminGuard>} />
                  <Route path="/admin/mapping" element={<AdminGuard><AdminMapping /></AdminGuard>} />
                  <Route path="/admin/subscriptions" element={<AdminGuard><AdminSubscriptions /></AdminGuard>} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AppErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
