import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

export const testDriveService = {
  // Lấy danh sách xe lái thử
  getTestDriveVehicles: async (dealerId) => {
    return await axiosInstance.get(
      endpoints.testDriveVehicles.getByDealer(dealerId)
    );
  },

  // Lấy danh sách slot lái thử
  getTestDriveSlots: async (dealerId) => {
    return await axiosInstance.get(endpoints.masterTimeSlots.getAll);
  },

  // Thêm xe vào slot lái thử
  addVehicleToSlot: async (vehicleData) => {
    return await axiosInstance.post(
      endpoints.testDriveVehicles.create,
      vehicleData
    );
  },

  // Cập nhật trạng thái xe lái thử
  updateTestDriveVehicleStatus: async (vehicleId, status) => {
    return await axiosInstance.patch(
      endpoints.testDriveVehicles.updateStatus(vehicleId),
      { status }
    );
  },

  // Xóa xe khỏi slot lái thử
  deleteTestDriveVehicle: async (vehicleId) => {
    return await axiosInstance.delete(
      endpoints.testDriveVehicles.delete(vehicleId)
    );
  },
};
