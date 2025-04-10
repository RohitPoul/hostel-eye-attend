
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import BuildingsPage from "./pages/BuildingsPage";
import BuildingFormPage from "./pages/BuildingFormPage";
import BlocksPage from "./pages/BlocksPage";
import FloorsPage from "./pages/FloorsPage";
import RoomsPage from "./pages/RoomsPage";
import StudentFormPage from "./pages/StudentFormPage";
import AttendancePage from "./pages/AttendancePage";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage";
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
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Building Routes */}
          <Route path="/buildings" element={<BuildingsPage />} />
          <Route path="/buildings/add" element={<BuildingFormPage />} />
          <Route path="/buildings/edit/:buildingId" element={<BuildingFormPage />} />
          <Route path="/buildings/:buildingId/blocks" element={<BlocksPage />} />
          <Route path="/buildings/:buildingId/blocks/:blockId/floors" element={<FloorsPage />} />
          <Route path="/buildings/:buildingId/blocks/:blockId/floors/:floorId/rooms" element={<RoomsPage />} />
          
          {/* Student Routes */}
          <Route path="/buildings/:buildingId/blocks/:blockId/floors/:floorId/rooms/:roomId/add-student" element={<StudentFormPage />} />
          <Route path="/buildings/:buildingId/blocks/:blockId/floors/:floorId/rooms/:roomId/edit-student/:studentId" element={<StudentFormPage />} />
          <Route path="/students/:studentId" element={<StudentFormPage />} />
          
          {/* Attendance Routes */}
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          
          {/* Profile Route */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
