// src/features/evm-staff/hooks/useReports.js
import { useState, useEffect, useCallback } from "react";
import { reportService } from "../services/reportService";

/**
 * Hook for EVM Staff to receive and handle reports from Dealer Managers
 */
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
   * Fetch all reports (received from Dealer Managers)
   * @param {Object} params - { dealerId, accountId, pageNumber, pageSize }
   */
  const fetchReports = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      console.log("EVM Staff: Fetching reports with params:", params);
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
      console.error("EVM Staff: Error fetching reports:", err);
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
      console.error("EVM Staff: Error fetching report:", err);
      setError(err.message || "Failed to fetch report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Approve report
   */
  const approveReport = async (id, notes = null) => {
    setLoading(true);
    setError(null);
    try {
      console.log("EVM Staff: Approving report:", id);
      const response = await reportService.approveReport(id, notes);
      // Refresh reports list
      await fetchReports();
      return response;
    } catch (err) {
      console.error("EVM Staff: Error approving report:", err);
      setError(err.message || "Failed to approve report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reject report
   */
  const rejectReport = async (id, notes = null) => {
    setLoading(true);
    setError(null);
    try {
      console.log("EVM Staff: Rejecting report:", id);
      const response = await reportService.rejectReport(id, notes);
      // Refresh reports list
      await fetchReports();
      return response;
    } catch (err) {
      console.error("EVM Staff: Error rejecting report:", err);
      setError(err.message || "Failed to reject report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get pending reports
   * Reports waiting for review
   */
  const getPendingReports = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      console.log("EVM Staff: Fetching pending reports");
      const response = await reportService.getPendingReports(params);
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
      console.error("EVM Staff: Error fetching pending reports:", err);
      setError(err.message || "Failed to fetch pending reports");
      setReports([]);
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
      console.error("EVM Staff: Error fetching reports by order:", err);
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
    approveReport,
    rejectReport,
    getPendingReports,
    getReportsByOrder,
  };
};

export default useReports;

