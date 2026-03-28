// src/hooks/useInvoices.js
import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import api from "../services/api";

export const useInvoices = () => {
  const [loading, setLoading] = useState(false);
  const { invoices, setInvoices } = useContext(AppContext);

  /* ======================================================
     GET ALL INVOICES
  ====================================================== */
  const fetchInvoices = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get("/invoices", { params });

      if (!response.success || !response.data) {
        throw new Error("Invalid server response");
      }

      const invoicesList = response.data.invoices || [];
      const pagination = response.data.pagination || {
        total: invoicesList.length,
        current: 1,
        pageSize: 10,
      };

      setInvoices(invoicesList);

      return {
        invoices: invoicesList,
        pagination,
        total: pagination.total,
      };
    } catch (error) {
      throw new Error(`Failed to fetch invoices: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     CREATE INVOICE
  ====================================================== */
  const createInvoice = async (invoiceData) => {
    setLoading(true);
    try {
      const response = await api.post("/invoices", invoiceData);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create invoice");
      }

      const newInvoice = response.data;
      setInvoices((prev) => [newInvoice, ...prev]);
      return newInvoice;
    } catch (error) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     UPDATE INVOICE
  ====================================================== */
  const updateInvoice = async (id, invoiceData) => {
    setLoading(true);
    try {
      const response = await api.put(`/invoices/${id}`, invoiceData);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update invoice");
      }

      setInvoices((prev) =>
        prev.map((inv) => (inv._id === id ? response.data : inv))
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to update invoice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     DELETE INVOICE
  ====================================================== */
  const deleteInvoice = async (id) => {
    setLoading(true);
    try {
      const response = await api.delete(`/invoices/${id}`);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete invoice");
      }

      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (error) {
      throw new Error(`Failed to delete invoice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     GENERATE PDF (Using backend + Vite proxy)
  ====================================================== */
  const generatePDF = async (invoiceId, template = "template1") => {
    try {
      // Correct API path (NO /api prefix)
      const response = await api.get(
        `/invoices/${invoiceId}/pdf?template=${template}`,
        { responseType: "blob" }
      );

      // Create blob
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId}-${template}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  };

  /* ======================================================
     GET SINGLE INVOICE
  ====================================================== */
  const getInvoiceById = async (id) => {
    setLoading(true);
    try {
      const response = await api.get(`/invoices/${id}`);

      if (!response.success || !response.data) {
        throw new Error("Invalid invoice response");
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch invoice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    invoices,
    loading,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    generatePDF,
    getInvoiceById,
  };
};
