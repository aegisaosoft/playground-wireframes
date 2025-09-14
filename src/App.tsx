
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { Layout } from "./components/Layout";
import { HostProfileWrapper } from "./components/HostProfileWrapper";
import { BrandPageWrapper } from "./components/BrandPageWrapper";
import RetreatPage from "./pages/RetreatPage";
import ExperienceBuilder from "./pages/ExperienceBuilder";
import ExperienceDetail from "./pages/ExperienceDetail";
import Experiences from "./pages/Experiences";
import BrandProfile from "./pages/BrandProfile";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<ExperienceBuilder />} />
          <Route path="/experiences" element={<Layout><Experiences /></Layout>} />
          <Route path="/experience/:experienceId" element={<ExperienceDetail />} />
          <Route path="/host/:hostId" element={<Layout><BrandProfile /></Layout>} />
          <Route path="/brand/:brandId" element={<Layout><BrandPageWrapper /></Layout>} />
          <Route path="/retreat/:retreatId" element={<Layout><RetreatPage /></Layout>} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
