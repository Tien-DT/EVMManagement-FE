import React, { useState, useEffect } from 'react';
import { Form, Button, Select, Input, Card, Space, message, Row, Col } from 'antd';
import axiosInstance from '../../../api/axiosInstance';
import { useAuth } from '../../../context/AuthContext';

const { Option } = Select;

const AddEvmVehicleToWarehouseForm = ({ warehouseId }) => {
  const { user } = useAuth();

  // Hoook declarations MUST be first
  const [warehouses, setWarehouses] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    axiosInstance.get('/v1/Warehouses?organization=EVM').then((res) => {
      const data = res.items ?? res.data?.items ?? res.data ?? res;
      setWarehouses(Array.isArray(data) ? data : []);
    });
    axiosInstance.get('/v1/VehicleVariants?pageSize=100').then((res) => {
      const data = res.items ?? res.data?.items ?? res.data ?? res;
      setVariants(Array.isArray(data) ? data : []);
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
      await axiosInstance.post('/v1/Warehouses/evm/add-vehicles', body);
      message.success('Thêm xe vào kho EVM thành công!');
      form.resetFields();
      if (typeof window.handleCloseAddVehicleModal==='function') window.handleCloseAddVehicleModal();
    } catch (err) {
      message.error('Không thể thêm xe: ' + (err?.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Thêm xe vào kho EVM (Admin/EVM Admin)">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ vehicles: [{ status: 'IN_STOCK', purpose: 'FOR_SALE', warehouseId: warehouseId ? warehouseId : undefined }] }}
      >
        <Form.Item
          name="warehouseId"
          label="Chọn Warehouse EVM"
          rules={[{ required: true, message: 'Bắt buộc chọn warehouse!' }]}
        >
          <Select showSearch placeholder="Chọn kho EVM" disabled={!!warehouseId}>
            {warehouses.map(w => (
              <Option value={w.id} key={w.id}>{w.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.List name="vehicles">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, idx) => (
                <Card
                  key={key}
                  type="inner"
                  className="mb-2"
                  title={<span>Xe #{idx + 1}</span>}
                  extra={fields.length > 1 && <Button danger onClick={() => remove(name)}>Xoá</Button>}
                  size="small"
                >
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'variantId']}
                        label="Variant"
                        rules={[{ required: true, message: 'Chọn variant!' }]}
                      >
                        <Select showSearch placeholder="Chọn variant">
                          {variants.map(variant => (
                            <Option value={variant.id} key={variant.id}>{variant.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item
                        {...restField}
                        name={[name, 'vin']}
                        label="VIN"
                        rules={[{ required: true, message: 'Nhập VIN' }]}
                      >
                        <Input placeholder="Nhập mã VIN" />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item {...restField} name={[name, 'status']} label="Status" rules={[{ required: true }] }>
                        <Select>
                          <Option value="IN_STOCK">IN_STOCK</Option>
                          <Option value="SOLD">SOLD</Option>
                          <Option value="RESERVED">RESERVED</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item {...restField} name={[name, 'purpose']} label="Purpose" rules={[{ required: true }] }>
                        <Select>
                          <Option value="FOR_SALE">FOR_SALE</Option>
                          <Option value="FOR_TEST_DRIVE">FOR_TEST_DRIVE</Option>
                          <Option value="FOR_RENT">FOR_RENT</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item {...restField} name={[name, 'imageUrl']} label="Image Url">
                        <Input placeholder="Link ảnh xe (nếu có)" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add({ status: 'IN_STOCK', purpose: 'FOR_SALE' })} block>
                  + Thêm xe
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item>
          <Button htmlType="submit" loading={loading} type="primary">
            Thêm xe vào kho
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AddEvmVehicleToWarehouseForm;
