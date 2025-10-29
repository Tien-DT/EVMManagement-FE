// src/features/dealer-manager/hooks/useReports.js
import { useState, useEffect, useCallback } from "react";
import { reportService } from "../services/reportService";

export const useReports = (autoFetch = true) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
  });

  /**
   * Fetch all reports
   * @param {Object} params - { dealerId, accountId, pageNumber, pageSize }
   */
  const fetchReports = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching reports with params:", params);
      const response = await reportService.getAllReports(params);
      
      // Handle different response formats
      const data = response?.data || response;
      
      if (data?.items) {
        setReports(data.items);
        setPagination({
          currentPage: params.pageNumber || 1,
          pageSize: params.pageSize || 10,
          totalPages: data.totalPages || Math.ceil((data.total || 0) / (params.pageSize || 10)),
          totalItems: data.total || 0,
        });
      } else if (Array.isArray(data)) {
        setReports(data);
        setPagination({
          currentPage: 1,
          pageSize: data.length,
          totalPages: 1,
          totalItems: data.length,
        });
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err.message || "Failed to fetch reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get report by ID
   */
  const getReportById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.getReportById(id);
      return response?.data || response;
    } catch (err) {
      console.error("Error fetching report:", err);
      setError(err.message || "Failed to fetch report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new report
   */
  const createReport = async (reportData) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Creating report with data:", reportData);
      const response = await reportService.createReport(reportData);
      // Refresh reports list
      await fetchReports();
      return response;
    } catch (err) {
      console.error("Error creating report:", err);
      setError(err.message || "Failed to create report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Report order issue to EVM
   * Convenience method for reporting incorrect orders
   */
  const reportOrderIssue = async (data) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Reporting order issue with data:", data);
      const response = await reportService.reportOrderIssue(data);
      // Refresh reports list
      await fetchReports();
      return response;
    } catch (err) {
      console.error("Error reporting order issue:", err);
      setError(err.message || "Failed to report order issue");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update report
   */
  const updateReport = async (id, partialData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.updateReport(id, partialData);
      // Refresh reports list
      await fetchReports();
      return response;
    } catch (err) {
      console.error("Error updating report:", err);
      setError(err.message || "Failed to update report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete report
   */
  const deleteReport = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.deleteReport(id);
      // Refresh reports list
      await fetchReports();
      return response;
    } catch (err) {
      console.error("Error deleting report:", err);
      setError(err.message || "Failed to delete report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get reports by order ID
   */
  const getReportsByOrder = async (orderId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.getReportsByOrder(orderId, params);
      const data = response?.data || response;
      
      if (data?.items) {
        setReports(data.items);
        setPagination({
          currentPage: params.pageNumber || 1,
          pageSize: params.pageSize || 10,
          totalPages: data.totalPages || 1,
          totalItems: data.total || 0,
        });
      } else if (Array.isArray(data)) {
        setReports(data);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error("Error fetching reports by order:", err);
      setError(err.message || "Failed to fetch reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchReports();
    }
  }, [autoFetch, fetchReports]);

  return {
    reports,
    loading,
    error,
    pagination,
    fetchReports,
    getReportById,
    createReport,
    reportOrderIssue,
    updateReport,
    deleteReport,
    getReportsByOrder,
  };
};

export default useReports;

