import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/authStore";
import useThemeStore from "./store/themeStore";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OTPPage from "./pages/OTPPage";
import ChatPage from "./pages/ChatPage";
import DashboardPage from "./pages/DashboardPage";
import LeadsPage from "./pages/LeadsPage";
import AdminPage from "./pages/AdminPage";
import SettingsPage from "./pages/SettingsPage";
import AgentConfigPage from "./pages/AgentConfigPage";
import WidgetPage from "./pages/WidgetPage";

function HomeRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/chat" replace />;
  return <LandingPage />;
}

export default function App() {
  const currentTheme = useThemeStore((state) => state.currentTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            padding: "12px 16px",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/otp" element={<OTPPage />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <LeadsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent"
          element={
            <ProtectedRoute>
              <AgentConfigPage />
            </ProtectedRoute>
          }
        />
        <Route path="/widget/:businessId" element={<WidgetPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
