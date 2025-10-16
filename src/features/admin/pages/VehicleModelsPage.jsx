import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, RefreshCw, Search } from "lucide-react";
import { Modal, Form, Input, DatePicker, Switch, Select, Button, message } from "antd";
import dayjs from "dayjs";
import { vehicleModelService } from "../services/vehicleModelService";

// Map UI values to backend enum (nullable int): 0=Standard,1=Premium,2=Luxury
const rankingOptions = [
  { label: "Standard", value: 0 },
  { label: "Premium", value: 1 },
  { label: "Luxury", value: 2 },
];

const emptyModel = {
  code: "",
  name: "",
  launchDate: undefined,
  description: "",
  status: true,
  ranking: 0,
};

const VehicleModelsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await vehicleModelService.list({ page: 1, pageSize: 50, search });
      // Normalize: API may return either {items} or an array
      const items = Array.isArray(res) ? res : res?.items || [];
      setData(items);
    } catch (err) {
      message.error(err?.message || "Failed to load vehicle models");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue(emptyModel);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      launchDate: record.launchDate ? dayjs(record.launchDate) : undefined,
    });
    setModalOpen(true);
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: `Delete ${record.name}?`,
      okType: "danger",
      onOk: async () => {
        try {
          await vehicleModelService.remove(record.id || record.code);
          message.success("Deleted");
          fetchList();
        } catch (err) {
          message.error(err?.message || "Delete failed");
        }
      },
    });
  };

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      const payload = {
        ...values,
        launchDate: values.launchDate ? values.launchDate.toISOString() : null,
      };

      if (editing) {
        await vehicleModelService.update(editing.id || editing.code, payload);
        message.success("Updated successfully");
      } else {
        await vehicleModelService.create(payload);
        message.success("Created successfully");
      }
      // close and reset form after success
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
      fetchList();
    } catch (err) {
      if (err?.errorFields) return; // antd validation errors
      message.error(err?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(
      (x) =>
        x.name?.toLowerCase().includes(q) ||
        x.code?.toLowerCase().includes(q) ||
        x.description?.toLowerCase().includes(q)
    );
  }, [data, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Vehicle Models</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-3 py-2 border rounded-md"
            />
          </div>
          <button
            onClick={fetchList}
            disabled={loading}
            className="px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openCreate}
            className="px-3 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 flex items-center gap-1"
          >
            <Plus size={16} /> New
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600">
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Launch Date</th>
                <th className="px-4 py-2">Ranking</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id || item.code} className="border-t">
                  <td className="px-4 py-2 font-mono">{item.code}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">
                    {item.launchDate ? dayjs(item.launchDate).format("YYYY-MM-DD") : "—"}
                  </td>
                  <td className="px-4 py-2">{item.ranking}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        item.status ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 max-w-xl truncate" title={item.description}>
                    {item.description}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>
                    {loading ? "Loading..." : "No data"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title={editing ? "Edit Vehicle Model" : "New Vehicle Model"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={emptyModel}>
          <Form.Item name="code" label="Code" rules={[{ required: true, message: "Code is required" }]}>
            <Input placeholder="e.g., TESLA-M3" />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Name is required" }]}>
            <Input placeholder="e.g., Model 3" />
          </Form.Item>
          <Form.Item name="launchDate" label="Launch Date">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="ranking" label="Ranking" initialValue="Standard">
            <Select options={rankingOptions} />
          </Form.Item>
          <Form.Item name="status" label="Status" valuePropName="checked" initialValue>
            <Switch />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={onSubmit} loading={submitting} disabled={submitting}>
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default VehicleModelsPage;


