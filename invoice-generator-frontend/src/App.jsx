import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { App as AntdApp } from "antd";
import AppLayout from "./components/Layout";
import InvoiceList from "./components/InvoiceList";
import InvoiceForm from "./components/InvoiceForm";
import InvoiceView from "./components/InvoiceView";
import Login from "./components/Login";         // <-- Added Login
import ProtectedRoute from "./components/ProtectedRoute"; // <-- Guard
import { AppProvider } from "./context/AppContext";
import { Toaster } from "react-hot-toast";

import "./App.css";

function App() {
  return (
    <AntdApp>
      <AppProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>

          {/* ⭐ Default route: go to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ⭐ Login Page (without layout) */}
          <Route path="/login" element={<Login />} />

          {/* ⭐ Protected Routes (with sidebar layout) */}
          <Route 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/invoices/create" element={<InvoiceForm />} />
            <Route path="/invoices/edit/:id" element={<InvoiceForm />} />
            <Route path="/invoices/view/:id" element={<InvoiceView />} />
          </Route>

          {/* ⚠ Page not found */}
          <Route path="*" element={<div>Page not found</div>} />

        </Routes>
      </AppProvider>
    </AntdApp>
  );
}

export default App;
