
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
import ExperienceBuilderChat from "./pages/ExperienceBuilderChat";
import ExperienceDetail from "./pages/ExperienceDetail";
import ExperiencePortal from "./pages/ExperiencePortal";
import Experiences from "./pages/Experiences";
import Community from "./pages/Community";
import BrandProfile from "./pages/BrandProfile";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import ExperienceEdit from "./pages/ExperienceEdit";
import ExperienceApplicants from "./pages/ExperienceApplicants";
import NotFound from "./pages/NotFound";
import MyAccount from "./pages/MyAccount";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/create" element={<ExperienceBuilderChat />} />
          <Route path="/create-classic" element={<Layout><ExperienceBuilder /></Layout>} />
          <Route path="/experiences" element={<Layout><Experiences /></Layout>} />
          <Route path="/community" element={<Layout><Community /></Layout>} />
          <Route path="/experience/:experienceId" element={<Layout><ExperienceDetail /></Layout>} />
          <Route path="/experience/portal/:experienceId" element={<Layout><ExperiencePortal /></Layout>} />
          <Route path="/host/:hostId" element={<Layout><BrandProfile /></Layout>} />
          <Route path="/organizer/dashboard" element={<Layout><OrganizerDashboard /></Layout>} />
          <Route path="/account" element={<Layout><MyAccount /></Layout>} />
          <Route path="/brand/:brandId" element={<Layout><BrandPageWrapper /></Layout>} />
          <Route path="/retreat/:retreatId" element={<Layout><RetreatPage /></Layout>} />
          <Route path="/experiences/:experienceId/edit" element={<Layout><ExperienceEdit /></Layout>} />
          <Route path="/experiences/:experienceId/applicants" element={<Layout><ExperienceApplicants /></Layout>} />
          <Route path="/checkout/success" element={<Layout><CheckoutSuccess /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
