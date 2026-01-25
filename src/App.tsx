import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Feed } from "./components/Feed";
import { Explore } from "./components/Explore";
import { Match } from "./components/Match";
import { Placements } from "./components/Placements";
import { Profile } from "./components/Profile";
import { Login } from "./components/Login";
import { SignUp } from "./components/SignUp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />}>
            <Route index element={<Feed />} />
            <Route path="daily" element={<Explore />} />
            <Route path="match" element={<Match />} />
            <Route path="placements" element={<Placements />} />
            <Route path="profile" element={<Profile />} />
            <Route path="login" element={<Login onSwitchToSignUp={() => {}} />} />
            <Route path="signup" element={<SignUp onSwitchToLogin={() => {}} />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
