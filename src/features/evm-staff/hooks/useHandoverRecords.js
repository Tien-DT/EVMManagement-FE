// src/features/evm-staff/hooks/useHandoverRecords.js
import { useState, useEffect } from "react";
import handoverRecordService from "../services/handoverRecordService";

const useHandoverRecords = () => {
  const [handoverRecords, setHandoverRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  // Fetch all handover records with pagination
  const fetchHandoverRecords = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Fetching handover records with params:', params);
      const response = await handoverRecordService.getAllHandoverRecords(params);
      
      console.log('Hook: Handover records response:', response);
      
      const recordsData = response.data || response;
      
      setHandoverRecords(recordsData.items || []);
      setPagination({
        pageNumber: recordsData.pageNumber || 1,
        pageSize: recordsData.pageSize || 10,
        totalCount: recordsData.totalCount || 0,
        totalPages: recordsData.totalPages || 0,
        hasNextPage: recordsData.hasNextPage || false,
        hasPreviousPage: recordsData.hasPreviousPage || false
      });
      return response;
    } catch (err) {
      console.error('Hook: Error fetching handover records:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách bàn giao');
      setHandoverRecords([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get handover record by ID
  const getHandoverRecordById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await handoverRecordService.getHandoverRecordById(id);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin bàn giao');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create handover record
  const createHandoverRecord = async (recordData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Hook: Creating handover record with data:', recordData);
      const response = await handoverRecordService.createHandoverRecord(recordData);
      console.log('Hook: Handover record created successfully:', response);
      // Refresh handover records list
      await fetchHandoverRecords();
      return response;
    } catch (err) {
      console.error('Hook: Error creating handover record:', err);
      setError(err.message || 'Có lỗi xảy ra khi tạo bàn giao');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update handover record
  const updateHandoverRecord = async (id, recordData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await handoverRecordService.updateHandoverRecord(id, recordData);
      // Refresh handover records list
      await fetchHandoverRecords();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật bàn giao');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete handover record
  const deleteHandoverRecord = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await handoverRecordService.deleteHandoverRecord(id);
      // Refresh handover records list
      await fetchHandoverRecords();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa bàn giao');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update handover record status (accept/reject)
  const updateHandoverRecordStatus = async (id, isAccepted) => {
    setLoading(true);
    setError(null);
    try {
      const response = await handoverRecordService.updateHandoverRecordStatus(id, isAccepted);
      // Refresh handover records list
      await fetchHandoverRecords();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái bàn giao');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandoverRecords().catch(err => {
      console.error('Initial fetch handover records failed:', err);
    });
  }, []);

  return {
    handoverRecords,
    loading,
    error,
    pagination,
    fetchHandoverRecords,
    getHandoverRecordById,
    createHandoverRecord,
    updateHandoverRecord,
    deleteHandoverRecord,
    updateHandoverRecordStatus
  };
};

export default useHandoverRecords;
