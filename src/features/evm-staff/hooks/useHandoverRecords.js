// src/features/evm-staff/hooks/useHandoverRecords.js
import { useState, useEffect } from 'react';
import handoverRecordService from '../services/handoverRecordService';

const useHandoverRecords = () => {
  const [records, setRecords] = useState([]);
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

  // Fetch all handover records
  const fetchRecords = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Service returns PagedResult<HandoverRecordResponseDto>
      const pagedResult = await handoverRecordService.getAllHandoverRecords(params);
      console.log('Hook: Fetched paged result:', pagedResult);
      
      setRecords(pagedResult.items || []);
      setPagination({
        pageNumber: pagedResult.pageNumber || 1,
        pageSize: pagedResult.pageSize || 10,
        totalCount: pagedResult.totalCount || 0,
        totalPages: pagedResult.totalPages || 0,
        hasNextPage: pagedResult.hasNextPage || false,
        hasPreviousPage: pagedResult.hasPreviousPage || false
      });
      
      return pagedResult;
    } catch (err) {
      console.error('Hook: Error fetching records:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách bàn giao');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get handover record by ID
  const getRecordById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      // Service returns HandoverRecordResponseDto
      const record = await handoverRecordService.getHandoverRecordById(id);
      console.log('Hook: Fetched record:', record);
      return record;
    } catch (err) {
      console.error('Hook: Error getting record:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải thông tin bàn giao');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create handover record
  const createRecord = async (data) => {
    setLoading(true);
    setError(null);
    try {
      // Service returns HandoverRecordResponseDto
      const created = await handoverRecordService.createHandoverRecord(data);
      console.log('Hook: Created record:', created);
      await fetchRecords(); // Refresh list
      return created;
    } catch (err) {
      console.error('Hook: Error creating record:', err);
      setError(err.message || 'Có lỗi xảy ra khi tạo bàn giao');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update handover record
  const updateRecord = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      // Service returns HandoverRecordResponseDto
      const updated = await handoverRecordService.updateHandoverRecord(id, data);
      console.log('Hook: Updated record:', updated);
      await fetchRecords(); // Refresh list
      return updated;
    } catch (err) {
      console.error('Hook: Error updating record:', err);
      setError(err.message || 'Có lỗi xảy ra khi cập nhật bàn giao');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete handover record
  const deleteRecord = async (id) => {
    setLoading(true);
    setError(null);
    try {
      // Service returns HandoverRecordResponseDto
      const deleted = await handoverRecordService.deleteHandoverRecord(id);
      console.log('Hook: Deleted record:', deleted);
      await fetchRecords(); // Refresh list
      return deleted;
    } catch (err) {
      console.error('Hook: Error deleting record:', err);
      setError(err.message || 'Có lỗi xảy ra khi xóa bàn giao');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords().catch(err => {
      console.error('Initial fetch failed:', err);
    });
  }, []);

  return {
    records,
    loading,
    error,
    pagination,
    fetchRecords,
    getRecordById,
    createRecord,
    updateRecord,
    deleteRecord
  };
};

export default useHandoverRecords;
