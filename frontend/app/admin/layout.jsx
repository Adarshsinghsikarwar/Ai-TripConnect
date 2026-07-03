"use client";
/**
 * app/admin/layout.jsx
 * Admin section layout — requires admin role.
 */
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex h-screen overflow-hidden bg-light">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onMenuClick={() => setOpen(true)} title="Admin Panel" />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fade-in">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
