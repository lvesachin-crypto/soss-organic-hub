import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CurrencyProvider } from "@/hooks/useCurrency";
import { ScrollToTop } from "@/components/ScrollToTop";
import { toast } from "sonner";
import { AppErrorBoundary } from "@/components/app/AppErrorBoundary";
import { Loader2 } from "lucide-react";


// Landing eager (LCP) — everything else lazy for smaller initial bundle
import Index from "./pages/Index";

const SmmPanelUsa = lazy(() => import("./pages/SmmPanelUsa"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Orders = lazy(() => import("./pages/Orders"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Settings = lazy(() => import("./pages/Settings"));
const Support = lazy(() => import("./pages/Support"));
const ApiAccess = lazy(() => import("./pages/ApiAccess"));
const MyProviders = lazy(() => import("./pages/MyProviders"));
const MyServices = lazy(() => import("./pages/MyServices"));
const MyBundles = lazy(() => import("./pages/MyBundles"));
const MassOrder = lazy(() => import("./pages/MassOrder"));
const AIIntelligence = lazy(() => import("./pages/AIIntelligence"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Maintenance = lazy(() => import("./pages/Maintenance"));

// 🔧 Maintenance mode toggle — set to false to bring the site back online
const MAINTENANCE_MODE = true;
// Admin bypass: visit /?admin-bypass=1 once to set localStorage flag
const isAdminBypass = () => {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("admin-bypass") === "1") {
      localStorage.setItem("bp_admin_bypass", "1");
    }
    return localStorage.getItem("bp_admin_bypass") === "1"
      || window.location.pathname.startsWith("/admin");
  } catch { return false; }
};

const EngagementOrder = lazy(() => import("./pages/EngagementOrder"));
const EngagementOrders = lazy(() => import("./pages/EngagementOrders"));
const EngagementOrderDetail = lazy(() => import("./pages/EngagementOrderDetail"));

// Admin — heavy, lazy
const Admin = lazy(() => import("./pages/admin/Admin"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminBundles = lazy(() => import("./pages/admin/AdminBundles"));
const AdminCronMonitor = lazy(() => import("./pages/admin/AdminCronMonitor"));
const AdminDeposits = lazy(() => import("./pages/admin/AdminDeposits"));
const AdminProviderAccounts = lazy(() => import("./pages/admin/AdminProviderAccounts"));
const AdminServiceProviderMapping = lazy(() => import("./pages/admin/AdminServiceProviderMapping"));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog"));
const AdminOxaPayEvents = lazy(() => import("./pages/admin/AdminOxaPayEvents"));
const AdminPopupAd = lazy(() => import("./pages/admin/AdminPopupAd"));
const AdminTopupPlan = lazy(() => import("./pages/admin/AdminTopupPlan"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));

const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/legal/RefundPolicy"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));
const ContactUs = lazy(() => import("./pages/legal/ContactUs"));
const AboutUs = lazy(() => import("./pages/legal/AboutUs"));
const ShippingPolicy = lazy(() => import("./pages/legal/ShippingPolicy"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 2,
      retryDelay: (i) => Math.min(1000 * 2 ** i, 10000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
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
    const handleError = (e: ErrorEvent) => {
      console.error("Unhandled error:", e.error || e.message);
    };
    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("error", handleError);
    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppErrorBoundary>
              <BrowserRouter>
                <ScrollToTop />
                <Suspense fallback={<PageFallback />}>
                  <AppRoutes />
                </Suspense>
              </BrowserRouter>

            </AppErrorBoundary>
          </TooltipProvider>
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
