import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import TopNav from "./components/TopNav";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import PlayerPage from "./pages/PlayerPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { apiRequest } from "./api";
import { loadToken, saveToken } from "./auth-storage";

function AppContent() {
  const [token, setToken] = useState(loadToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const bootstrap = async () => {
      if (!token) {
        if (alive) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await apiRequest("/auth/me", {}, token);
        if (alive) {
          setUser(data.user);
        }
      } catch {
        if (alive) {
          saveToken("");
          setToken("");
          setUser(null);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      alive = false;
    };
  }, [token]);

  const handleLogin = (newToken, loggedInUser) => {
    saveToken(newToken);
    setToken(newToken);
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    saveToken("");
    setToken("");
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#05080a] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(6,182,212,0.12),transparent_32%)]" />
      </div>

      <div className="relative z-10">
        <TopNav user={user} onLogout={handleLogout} />

        <Routes>
          <Route path="/" element={<LandingPage user={user} />} />
          <Route path="/login" element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/player"} replace /> : <LoginPage onLogin={handleLogin} />} />
          <Route
            path="/player"
            element={
              <ProtectedRoute user={user} loading={loading} allowRoles={["player"]}>
                <PlayerPage token={token} user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} loading={loading} allowRoles={["admin"]}>
                <AdminPage token={token} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
