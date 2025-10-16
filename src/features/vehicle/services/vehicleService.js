import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

const dealerPath = endpoints.dealer.vehicles; // e.g. /v1/Dealer/vehicles
const adminPath = endpoints.admin.vehicles;   // e.g. /v1/vehicles

async function tryBoth(makeCallDealer, makeCallAdmin) {
  try {
    return await makeCallDealer();
  } catch (e1) {
    if (adminPath) {
      try {
        return await makeCallAdmin();
      } catch (e2) {
        throw e2 || e1;
      }
    }
    throw e1;
  }
}

export const vehicleService = {
  list: async (params = {}) =>
    tryBoth(
      () => axiosInstance.get(dealerPath, { params }),
      () => axiosInstance.get(adminPath, { params })
    ),

  getById: async (id) =>
    tryBoth(
      () => axiosInstance.get(`${dealerPath}/${id}`),
      () => axiosInstance.get(`${adminPath}/${id}`)
    ),

  create: async (payload) =>
    tryBoth(
      () => axiosInstance.post(dealerPath, payload),
      () => axiosInstance.post(adminPath, payload)
    ),

  update: async (id, payload) =>
    tryBoth(
      () => axiosInstance.put(`${dealerPath}/${id}`, payload),
      () => axiosInstance.put(`${adminPath}/${id}`, payload)
    ),

  remove: async (id) =>
    tryBoth(
      () => axiosInstance.delete(`${dealerPath}/${id}`),
      () => axiosInstance.delete(`${adminPath}/${id}`)
    ),
};

export default vehicleService;


