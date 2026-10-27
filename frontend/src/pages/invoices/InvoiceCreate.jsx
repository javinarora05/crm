import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../api/client';

const { Title, Text } = Typography;
const { Option } = Select;

export const InvoiceCreate = () => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Watch items and taxRate for live financial total calculation
  const items = Form.useWatch('items', form) || [];
  const taxRate = Form.useWatch('taxRate', form) || 0;

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        setLoading(true);
        const [clientsRes, productsRes] = await Promise.all([
          api.get('/clients?limit=100'),
          api.get('/products'),
        ]);

        if (clientsRes.success) setClients(clientsRes.result);
        if (productsRes.success) setProducts(productsRes.result);
      } catch (err) {
        message.error('Failed to load clients or products');
      } finally {
        setLoading(false);
      }
    };

    loadPrerequisites();
  }, []);

  // Compute live totals
  const subTotal = items.reduce((acc, item) => {
    const qty = Number(item?.quantity) || 0;
    const price = Number(item?.price) || 0;
    return acc + qty * price;
  }, 0);

  const taxAmount = (subTotal * (Number(taxRate) || 0)) / 100;
  const grandTotal = subTotal + taxAmount;

  // Handler when user selects a preset product in an item row
  const handleProductSelect = (productId, fieldIndex) => {
    const selectedProd = products.find((p) => p._id === productId);
    if (!selectedProd) return;

    const currentItems = form.getFieldValue('items') || [];
    currentItems[fieldIndex] = {
      ...currentItems[fieldIndex],
      product: selectedProd._id,
      itemName: selectedProd.name,
      description: selectedProd.description,
      price: selectedProd.price,
      quantity: 1,
    };
    form.setFieldsValue({ items: [...currentItems] });
  };

  const onFinish = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        client: values.client,
        date: values.date ? values.date.toISOString() : new Date().toISOString(),
        expiredDate: values.expiredDate
          ? values.expiredDate.toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        currency: values.currency || 'USD',
        taxRate: Number(values.taxRate) || 0,
        notes: values.notes || '',
        items: values.items.map((it) => ({
          product: it.product,
          itemName: it.itemName,
          description: it.description || '',
          quantity: Number(it.quantity) || 1,
          price: Number(it.price) || 0,
        })),
      };

      const res = await api.post('/invoices', payload);
      if (res.success && res.result) {
        message.success('Invoice created successfully!');
        navigate(`/invoices/${res.result._id}`);
      }
    } catch (err) {
      message.error(err.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/invoices')}
          style={{ marginBottom: 8 }}
        >
          Back to Invoices
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          Create New Invoice
        </Title>
        <Text type="secondary">Generate an itemized invoice for a client</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          date: dayjs(),
          expiredDate: dayjs().add(30, 'day'),
          currency: 'USD',
          taxRate: 10,
          items: [{ itemName: '', quantity: 1, price: 0, description: '' }],
        }}
      >
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="client"
                label="Client / Customer"
                rules={[{ required: true, message: 'Please select a client' }]}
              >
                <Select
                  placeholder="Select or search client"
                  showSearch
                  optionFilterProp="children"
                  loading={loading}
                >
                  {clients.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={4}>
              <Form.Item name="currency" label="Currency">
                <Select>
                  <Option value="USD">USD ($)</Option>
                  <Option value="EUR">EUR (€)</Option>
                  <Option value="GBP">GBP (£)</Option>
                  <Option value="INR">INR (₹)</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={4}>
              <Form.Item
                name="date"
                label="Invoice Date"
                rules={[{ required: true, message: 'Select issue date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={4}>
              <Form.Item
                name="expiredDate"
                label="Due Date"
                rules={[{ required: true, message: 'Select due date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Dynamic Line Items */}
        <Card title="Invoice Line Items" style={{ marginBottom: 24 }}>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => {
                  const currentItem = items[index] || {};
                  const lineTotal =
                    (Number(currentItem.quantity) || 0) * (Number(currentItem.price) || 0);

                  return (
                    <div
                      key={key}
                      style={{
                        padding: 16,
                        marginBottom: 16,
                        background: '#fafafa',
                        borderRadius: 8,
                        border: '1px solid #f0f0f0',
                      }}
                    >
                      <Row gutter={16} align="middle">
                        <Col xs={24} md={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'product']}
                            label="Load from Catalog"
                            style={{ marginBottom: 8 }}
                          >
                            <Select
                              placeholder="Select pre-defined product"
                              allowClear
                              onChange={(val) => handleProductSelect(val, index)}
                            >
                              {products.map((p) => (
                                <Option key={p._id} value={p._id}>
                                  {p.name} (${p.price})
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'itemName']}
                            label="Item / Service Name"
                            rules={[{ required: true, message: 'Item name required' }]}
                            style={{ marginBottom: 8 }}
                          >
                            <Input placeholder="Item or service name" />
                          </Form.Item>
                        </Col>

                        <Col xs={12} md={3}>
                          <Form.Item
                            {...restField}
                            name={[name, 'quantity']}
                            label="Qty"
                            rules={[{ required: true, message: 'Qty required' }]}
                            style={{ marginBottom: 8 }}
                          >
                            <InputNumber min={1} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>

                        <Col xs={12} md={3}>
                          <Form.Item
                            {...restField}
                            name={[name, 'price']}
                            label="Price"
                            rules={[{ required: true, message: 'Price required' }]}
                            style={{ marginBottom: 8 }}
                          >
                            <InputNumber min={0} step={10} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>

                        <Col xs={16} md={3}>
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>Total</div>
                            <div style={{ fontWeight: 600, fontSize: 16, marginTop: 4 }}>
                              ${lineTotal.toFixed(2)}
                            </div>
                          </div>
                        </Col>

                        <Col xs={8} md={1} style={{ textAlign: 'center' }}>
                          {fields.length > 1 && (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                              style={{ marginTop: 12 }}
                            />
                          )}
                        </Col>
                      </Row>

                      <Row>
                        <Col span={24}>
                          <Form.Item
                            {...restField}
                            name={[name, 'description']}
                            label="Description (Optional)"
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="Item specifications or description..." />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  );
                })}

                <Button
                  type="dashed"
                  onClick={() => add({ itemName: '', quantity: 1, price: 0, description: '' })}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Another Item
                </Button>
              </>
            )}
          </Form.List>

          <Divider />

          {/* Totals Summary */}
          <Row justify="end">
            <Col xs={24} md={8}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Subtotal:</Text>
                <Text strong>${subTotal.toFixed(2)}</Text>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Space>
                  <Text>Tax Rate (%):</Text>
                  <Form.Item name="taxRate" noStyle>
                    <InputNumber min={0} max={100} style={{ width: 70 }} size="small" />
                  </Form.Item>
                </Space>
                <Text strong>${taxAmount.toFixed(2)}</Text>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Title level={4} style={{ margin: 0 }}>
                  Grand Total:
                </Title>
                <Title level={3} style={{ margin: 0, color: '#1677ff' }}>
                  ${grandTotal.toFixed(2)}
                </Title>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Notes & Actions */}
        <Card style={{ marginBottom: 24 }}>
          <Form.Item name="notes" label="Invoice Notes / Payment Instructions">
            <Input.TextArea
              rows={3}
              placeholder="e.g. Payment due within 30 days. Wire transfer details..."
            />
          </Form.Item>

          <Space size="middle">
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<SaveOutlined />}
              size="large"
            >
              Generate Invoice
            </Button>
            <Button size="large" onClick={() => navigate('/invoices')}>
              Cancel
            </Button>
          </Space>
        </Card>
      </Form>
    </div>
  );
};

export default InvoiceCreate;
