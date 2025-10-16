import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { vehicleModelService } from "../services/vehicleModelService";

export const useVehicleModels = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await vehicleModelService.getAll();
      const list = Array.isArray(res) ? res : res?.items || [];
      setItems(list);
    } catch (err) {
      message.error(err?.message || "Failed to load vehicle models");
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload) => {
    await vehicleModelService.create(payload);
    message.success("Created successfully");
    fetchAll();
  }, [fetchAll]);

  const update = useCallback(async (id, payload) => {
    await vehicleModelService.update(id, payload);
    message.success("Updated successfully");
    fetchAll();
  }, [fetchAll]);

  const remove = useCallback(async (id) => {
    await vehicleModelService.remove(id);
    message.success("Deleted successfully");
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { items, loading, fetchAll, create, update, remove };
};

export default useVehicleModels;


