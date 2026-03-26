import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ user, loading, allowRoles = [], children }) {
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm uppercase tracking-[0.3em] text-emerald-200/80">
        Syncing secure session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowRoles.length && !allowRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/player"} replace />;
  }

  return children;
}
