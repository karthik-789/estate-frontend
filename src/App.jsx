import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import HomePage from "./pages/HomePage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import AuthPage from "./pages/AuthPage";
import { AboutPage, ContactPage } from "./pages/InfoPages";
import { UserDashboard, ProfilePage, EnquiriesPage, BookingsPage, PaymentsPage } from "./pages/UserPages";
import { SavedPropertiesPage, NotificationsPage, InterestedBuyersPage } from "./pages/EngagementPages";
import { AgentDashboard, AgentProperties, PropertyForm } from "./pages/AgentPages";
import AgentProfilePage from "./pages/AgentProfilePage";
import Loading from "./components/Loading";

const lazyAdminPage = (name) => lazy(() => import("./pages/AdminPages").then((pages) => ({ default: pages[name] })));
const AdminDashboard = lazyAdminPage("AdminDashboard");
const AdminUsers = lazyAdminPage("AdminUsers");
const VerificationPage = lazyAdminPage("VerificationPage");
const ReportsPage = lazyAdminPage("ReportsPage");

export default function App() {
  return <Suspense fallback={<Loading />}><Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePage />} /><Route path="/properties" element={<PropertiesPage />} /><Route path="/properties/:id" element={<PropertyDetailsPage />} />
      <Route path="/about" element={<AboutPage />} /><Route path="/contact" element={<ContactPage />} /><Route path="/login" element={<AuthPage />} /><Route path="/register" element={<AuthPage register />} />
    </Route>
    <Route element={<ProtectedRoute roles={["USER"]} />}><Route element={<DashboardLayout />}>
      <Route path="/user/dashboard" element={<UserDashboard />} /><Route path="/user/profile" element={<ProfilePage />} /><Route path="/user/saved-properties" element={<SavedPropertiesPage />} /><Route path="/user/enquiries" element={<EnquiriesPage />} /><Route path="/user/bookings" element={<BookingsPage />} /><Route path="/user/payments" element={<PaymentsPage />} /><Route path="/user/notifications" element={<NotificationsPage />} /><Route path="/user/settings" element={<ProfilePage />} />
    </Route></Route>
    <Route element={<ProtectedRoute roles={["AGENT"]} />}><Route element={<DashboardLayout />}>
      <Route path="/agent/dashboard" element={<AgentDashboard />} /><Route path="/agent/profile" element={<AgentProfilePage />} /><Route path="/agent/properties" element={<AgentProperties />} /><Route path="/agent/properties/add" element={<PropertyForm />} /><Route path="/agent/properties/:id/edit" element={<PropertyForm />} /><Route path="/agent/enquiries" element={<EnquiriesPage agent />} /><Route path="/agent/interested-buyers" element={<InterestedBuyersPage />} /><Route path="/agent/notifications" element={<NotificationsPage />} /><Route path="/agent/bookings" element={<BookingsPage agent />} /><Route path="/agent/analytics" element={<AgentDashboard />} />
    </Route></Route>
    <Route element={<ProtectedRoute roles={["ADMIN"]} />}><Route element={<DashboardLayout />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} /><Route path="/admin/users" element={<AdminUsers />} /><Route path="/admin/agents" element={<AdminUsers agents />} /><Route path="/admin/properties" element={<VerificationPage />} /><Route path="/admin/properties/pending" element={<VerificationPage />} /><Route path="/admin/enquiries" element={<EnquiriesPage admin />} /><Route path="/admin/bookings" element={<BookingsPage admin />} /><Route path="/admin/payments" element={<PaymentsPage admin />} /><Route path="/admin/reports" element={<ReportsPage />} />
    </Route></Route>
    <Route path="*" element={<PublicLayout />} />
  </Routes></Suspense>;
}

