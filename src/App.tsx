
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
          <Route path="/host/:hostId" element={<Layout><HostProfileWrapper /></Layout>} />
          <Route path="/brand/:brandId" element={<Layout><BrandPageWrapper /></Layout>} />
          <Route path="/retreat/:retreatId" element={<Layout><RetreatPage /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
