import React, { useState, useEffect } from 'react';
import { Form, Button, Select, Input, message } from 'antd';
import { Plus, ChevronRight } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import endpoints from '../../../api/endpoints';
import { useAuth } from '../../../context/AuthContext';
import ImageUpload from '../../../components/ImageUpload';

const { Option } = Select;

const AddEvmVehicleToWarehouseForm = ({ warehouseId, onSuccess }) => {
  const { user } = useAuth();

  // Hook declarations MUST be first
  const [warehouses, setWarehouses] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableVehiclesByField, setAvailableVehiclesByField] = useState({});
  const [selectedVariantsInfo, setSelectedVariantsInfo] = useState({});
  const [form] = Form.useForm();

  useEffect(() => {
    axiosInstance.get(endpoints.warehouses.evm.getAll('EVM')).then((res) => {
      const data = res.items ?? res.data?.items ?? res.data ?? res;
      setWarehouses(Array.isArray(data) ? data : []);
    });
    axiosInstance.get(endpoints.vehicleVariants.getAll, {
      params: { 
        pageSize: 100,
      }
    }).then((res) => {
      const data = res.items ?? res.data?.items ?? res.data ?? res;
      setVariants(Array.isArray(data) ? data : []);
    }).catch((err) => {
      console.error('Error fetching variants:', err);
      message.error('Không thể tải danh sách variants');
    });
  }, []);

  useEffect(() => {
    if (warehouseId && warehouses.length > 0) {
      form.setFieldsValue({ warehouseId });
    }
  }, [warehouseId, warehouses, form]);

  // LUÔN kiểm tra quyền SAU khi đã gọi hết hook ở trên
  const allowRoles = ['admin', 'evm_admin', 'evmadmin', 'evm_admin', 'evm_admin', 'evmadmin', 'evm_admin', 'evm_admin'];
  if (!user?.role || !allowRoles.includes(user.role.replace(/\W/g, '').toLowerCase())) return null;

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const body = {
        warehouseId: values.warehouseId,
        vehicles: values.vehicles.map((v) => ({
          variantId: v.variantId,
          vin: v.vin,
          status: v.status,
          purpose: v.purpose,
          imageUrl: v.imageUrl,
        })),
      };
      
      const vehicleCount = values.vehicles.length;
      const selectedWarehouse = warehouses.find(w => w.id === values.warehouseId);
      const warehouseName = selectedWarehouse?.name || 'kho EVM';
      
      await axiosInstance.post(endpoints.warehouses.evm.addVehicles, body);
      
      // Hiển thị thông báo thành công với thông tin chi tiết
      message.success({
        content: (
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              Thêm xe vào kho thành công!
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              Đã thêm {vehicleCount} {vehicleCount === 1 ? 'xe' : 'xe'} vào {warehouseName}
            </div>
            {values.vehicles.length > 0 && values.vehicles[0].vin && (
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                VIN: {values.vehicles.map(v => v.vin).filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        ),
        duration: 5,
        style: {
          marginTop: '20vh',
        },
      });
      
      form.resetFields();
      setAvailableVehiclesByField({});
      setSelectedVariantsInfo({});
      // Reset to initial values
      form.setFieldsValue({
        vehicles: [{ status: 'IN_STOCK', purpose: 'FOR_SALE', warehouseId: warehouseId ? warehouseId : undefined }]
      });
      
      // Delay để người dùng thấy thông báo trước khi đóng modal
      setTimeout(() => {
        // Call onSuccess callback if provided
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
      if (typeof window.handleCloseAddVehicleModal==='function') window.handleCloseAddVehicleModal();
      }, 500);
    } catch (err) {
      message.error({
        content: (
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              Không thể thêm xe vào kho
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              {err?.message || 'Lỗi không xác định'}
            </div>
          </div>
        ),
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Thêm xe vào kho EVM</h1>
          <p className="text-slate-600">Hoàn thành thông tin xe bên dưới để đăng ký xe mới</p>
        </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ vehicles: [{ status: 'IN_STOCK', purpose: 'FOR_SALE', warehouseId: warehouseId ? warehouseId : undefined }] }}
      >
          {/* Warehouse Selection */}
          <div className="mb-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <Form.Item
          name="warehouseId"
                label={
                  <span className="block text-sm font-medium text-slate-900 mb-1">
                    Chọn kho EVM <span className="text-red-500">*</span>
                  </span>
                }
          rules={[{ required: true, message: 'Bắt buộc chọn warehouse!' }]}
        >
                <Select 
                  showSearch 
                  placeholder="Chọn kho EVM" 
                  disabled={!!warehouseId}
                  size="large"
                  className="w-full"
                >
            {warehouses.map(w => (
              <Option value={w.id} key={w.id}>{w.name}</Option>
            ))}
          </Select>
        </Form.Item>
            </div>
          </div>

        <Form.List name="vehicles">
          {(fields, { add, remove }) => (
            <>
                {/* Progress Steps */}
                {fields.length > 1 && (
                  <div className="mb-8 flex items-center gap-2">
                    {fields.map(({ key, name }, index) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all bg-blue-600 text-white">
                          {index + 1}
                        </div>
                        {index < fields.length - 1 && <div className="h-1 w-6 bg-slate-300 md:w-12" />}
                      </div>
                    ))}
                  </div>
                )}

                {/* Form Cards */}
                <div className="space-y-6">
              {fields.map(({ key, name, ...restField }, idx) => (
                    <div
                  key={key}
                      className="bg-white border-0 shadow-sm md:shadow-md rounded-lg overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-semibold">
                            {idx + 1}
                          </div>
                          <h2 className="text-xl font-semibold">Thông tin xe #{idx + 1}</h2>
                          {fields.length > 1 && (
                            <Button 
                              danger 
                              type="text"
                              onClick={() => {
                                remove(name);
                                setAvailableVehiclesByField(prev => {
                                  const newState = { ...prev };
                                  delete newState[name];
                                  return newState;
                                });
                                setSelectedVariantsInfo(prev => {
                                  const newState = { ...prev };
                                  delete newState[name];
                                  return newState;
                                });
                              }}
                              className="ml-auto text-white hover:bg-white/20"
                  size="small"
                >
                              Xóa
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="space-y-6 p-6 md:p-8">
                        {/* Model & Color and Status Row */}
                        <div className="grid gap-6 md:grid-cols-2">
                      <Form.Item
                        {...restField}
                        name={[name, 'variantId']}
                            label={
                              <div>
                                <span className="block text-sm font-medium text-slate-900 mb-1">
                                  Model & Màu xe <span className="text-red-500">*</span>
                                </span>
                                <p className="text-xs text-slate-500">Chọn model và màu của xe</p>
                              </div>
                            }
                        rules={[{ required: true, message: 'Chọn variant!' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select 
                              showSearch 
                              placeholder="Chọn model"
                              size="large"
                              filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                              onChange={(variantId) => {
                                if (variantId) {
                                  const selectedVariant = variants.find(v => v.id === variantId);
                                  
                                  // Fetch variant detail để lấy VIN từ variant
                                  axiosInstance.get(endpoints.vehicleVariants.getById(variantId))
                                    .then((variantRes) => {
                                      const variantDetail = variantRes.data || variantRes || selectedVariant;
                                      
                                      setSelectedVariantsInfo(prev => ({
                                        ...prev,
                                        [name]: variantDetail
                                      }));
                                      
                                      // Lấy VIN từ variant (mỗi variant có VIN riêng)
                                      const vinFromVariant = variantDetail.vin || variantDetail.VIN || variantDetail.vehicleVin || '';
                                      
                                      if (vinFromVariant) {
                                        form.setFieldValue(['vehicles', name, 'vin'], vinFromVariant);
                                        setAvailableVehiclesByField(prev => ({
                                          ...prev,
                                          [name]: []
                                        }));
                                      } else {
                                        // Nếu variant không có VIN, thử fetch từ vehicles
                                        const warehouseIdValue = form.getFieldValue('warehouseId');
                                        const params = {
                                          variantId: variantId,
                                          status: 'IN_STOCK',
                                          pageSize: 100
                                        };
                                        
                                        if (warehouseIdValue) {
                                          params.warehouseId = warehouseIdValue;
                                        }
                                        
                                        axiosInstance.get(endpoints.vehicles.getAll, { params })
                                          .then((res) => {
                                            let vehicles = [];
                                            if (Array.isArray(res)) {
                                              vehicles = res;
                                            } else if (res?.data) {
                                              vehicles = res.data?.items || res.data?.data || (Array.isArray(res.data) ? res.data : []);
                                            } else if (res?.items) {
                                              vehicles = res.items;
                                            }
                                            
                                            if (vehicles.length > 0) {
                                              vehicles = vehicles.filter(v => 
                                                v.variantId === variantId || 
                                                v.vehicleVariantId === variantId ||
                                                v.variant?.id === variantId ||
                                                v.vehicleVariant?.id === variantId
                                              );
                                            }
                                            
                                            setAvailableVehiclesByField(prev => ({
                                              ...prev,
                                              [name]: vehicles
                                            }));
                                            
                                            if (vehicles.length > 0) {
                                              const firstVehicle = vehicles[0];
                                              const vinValue = firstVehicle.vin || firstVehicle.VIN || '';
                                              form.setFieldValue(['vehicles', name, 'vin'], vinValue);
                                            } else {
                                              form.setFieldValue(['vehicles', name, 'vin'], '');
                                            }
                                          })
                                          .catch((err) => {
                                            console.error('Error fetching vehicles:', err);
                                            form.setFieldValue(['vehicles', name, 'vin'], '');
                                            setAvailableVehiclesByField(prev => ({
                                              ...prev,
                                              [name]: []
                                            }));
                                          });
                                      }
                                    })
                                    .catch((err) => {
                                      console.error('Error fetching variant detail:', err);
                                      if (selectedVariant) {
                                        const vinFromVariant = selectedVariant.vin || selectedVariant.VIN || selectedVariant.vehicleVin || '';
                                        if (vinFromVariant) {
                                          form.setFieldValue(['vehicles', name, 'vin'], vinFromVariant);
                                        }
                                      }
                                      setSelectedVariantsInfo(prev => ({
                                        ...prev,
                                        [name]: selectedVariant
                                      }));
                                    });
                                } else {
                                  form.setFieldValue(['vehicles', name, 'vin'], '');
                                  setAvailableVehiclesByField(prev => {
                                    const newState = { ...prev };
                                    delete newState[name];
                                    return newState;
                                  });
                                }
                              }}
                            >
                              {variants.map(variant => {
                                const modelName = variant.vehicleModel?.name || variant.vehicleModelName || variant.modelName || '';
                                const color = variant.color || '';
                                const displayText = modelName && color 
                                  ? `${modelName} - ${color}` 
                                  : variant.name 
                                    ? (variant.name + (color ? ` - ${color}` : ''))
                                    : color || variant.id;
                                
                                return (
                                  <Option 
                                    value={variant.id} 
                                    key={variant.id}
                                    label={displayText}
                                  >
                                    {displayText}
                            </Option>
                                );
                              })}
                            </Select>
                          </Form.Item>

                          <Form.Item 
                            {...restField} 
                            name={[name, 'status']} 
                            label={
                              <div>
                                <span className="block text-sm font-medium text-slate-900 mb-1">
                                  Trạng thái <span className="text-red-500">*</span>
                                </span>
                                <p className="text-xs text-slate-500">Trạng thái hiện tại của xe</p>
                              </div>
                            }
                            rules={[{ required: true }]} 
                            style={{ marginBottom: 0 }}
                          >
                            <Select size="large" placeholder="Chọn trạng thái">
                              <Option value="IN_STOCK">In Storage</Option>
                              <Option value="SOLD">Sold</Option>
                              <Option value="RESERVED">Reserved</Option>
                        </Select>
                      </Form.Item>
                        </div>

                        {/* VIN Code Row */}
                      <Form.Item
                        {...restField}
                        name={[name, 'vin']}
                          label={
                            <div>
                              <span className="block text-sm font-medium text-slate-900 mb-1">
                                Mã VIN <span className="text-red-500">*</span>
                              </span>
                              <p className="text-xs text-slate-500">Số định danh xe (ID riêng cho từng xe)</p>
                            </div>
                          }
                          rules={[{ required: true, message: 'VIN là bắt buộc' }]}
                          style={{ marginBottom: 0 }}
                        >
                          {availableVehiclesByField[name]?.length > 1 ? (
                            <Select
                              placeholder="Chọn VIN từ danh sách"
                              showSearch
                              size="large"
                              value={form.getFieldValue(['vehicles', name, 'vin'])}
                              filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                              onChange={(vin) => {
                                form.setFieldValue(['vehicles', name, 'vin'], vin);
                              }}
                            >
                              {availableVehiclesByField[name].map((vehicle) => {
                                const vin = vehicle.vin || vehicle.VIN || '';
                                return (
                                  <Option key={vehicle.id || vin} value={vin} label={vin}>
                                    {vin}
                                  </Option>
                                );
                              })}
                        </Select>
                          ) : (
                            <Input 
                              placeholder="Nhập mã VIN hoặc chọn variant để tự động điền" 
                              size="large"
                              readOnly={!!availableVehiclesByField[name]?.length}
                              value={form.getFieldValue(['vehicles', name, 'vin']) || ''}
                              onChange={(e) => {
                                if (!availableVehiclesByField[name]?.length) {
                                  form.setFieldValue(['vehicles', name, 'vin'], e.target.value);
                                }
                              }}
                              className={availableVehiclesByField[name]?.length ? 'bg-slate-50' : ''}
                            />
                          )}
                      </Form.Item>

                        {/* Purpose Row */}
                        <Form.Item 
                          {...restField} 
                          name={[name, 'purpose']} 
                          label={
                            <div>
                              <span className="block text-sm font-medium text-slate-900 mb-1">
                                Mục đích <span className="text-red-500">*</span>
                              </span>
                              <p className="text-xs text-slate-500">Lý do đăng ký xe này</p>
                            </div>
                          }
                          rules={[{ required: true }]} 
                          style={{ marginBottom: 0 }}
                        >
                          <Select size="large" placeholder="Chọn mục đích">
                            <Option value="FOR_SALE">For Sale</Option>
                            <Option value="FOR_TEST_DRIVE">For Test Drive</Option>
                            <Option value="FOR_RENT">For Rent</Option>
                        </Select>
                      </Form.Item>

                        {/* Image Upload Section */}
                        <div className="space-y-3 border-t border-slate-100 pt-6">
                          <label className="block text-sm font-medium text-slate-900">Ảnh xe</label>
                          <p className="text-xs text-slate-500">Upload ảnh xe (JPG, PNG, GIF, WebP - Tối đa 5MB)</p>
                          
                          <Form.Item 
                            {...restField} 
                            name={[name, 'imageUrl']} 
                            style={{ marginBottom: 0 }}
                          >
                            <ImageUpload
                              disabled={loading}
                            />
                      </Form.Item>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Another Vehicle Button */}
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => add({ status: 'IN_STOCK', purpose: 'FOR_SALE' })}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-blue-400 px-6 py-4 text-blue-600 transition-colors hover:border-blue-500 hover:bg-blue-50"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">Thêm xe khác</span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="mt-12 flex gap-3 justify-end">
                  <Button 
                    size="large"
                    onClick={() => {
                      if (onSuccess && typeof onSuccess === 'function') {
                        onSuccess();
                      }
                    }}
                  >
                    Hủy
                  </Button>
                  <Button 
                    htmlType="submit" 
                    loading={loading}
                    size="large" 
                    type="primary"
                    className="flex items-center gap-2 !bg-blue-600 hover:!bg-blue-700 !border-blue-600 hover:!border-blue-700"
                    style={{
                      backgroundColor: '#2563eb',
                      borderColor: '#2563eb',
                      color: '#ffffff',
                      fontWeight: 500
                    }}
                  >
                    {loading ? 'Đang lưu...' : (
                      <span className="flex items-center gap-2">
                        Lưu & Tiếp tục
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    )}
                </Button>
                </div>
            </>
          )}
        </Form.List>
      </Form>
      </div>
    </main>
  );
};

export default AddEvmVehicleToWarehouseForm;
