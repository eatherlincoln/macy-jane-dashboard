import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import IndexPage from "@/pages/Index";
import AdminPage from "@/pages/Admin";
import DebugPage from "@/pages/Debug";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/debug" element={<DebugPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
