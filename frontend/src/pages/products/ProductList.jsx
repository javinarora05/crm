import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  InputNumber,
  Space,
  Modal,
  Form,
  Typography,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import api from '../../api/client';

const { Title, Text } = Typography;

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.q = search;
      const res = await api.get('/products', { params });
      if (res.success) {
        setProducts(res.result);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      form.setFieldsValue(product);
    } else {
      form.resetFields();
      form.setFieldsValue({ price: 0, taxRate: 10, category: 'Services' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}`, values);
        if (res.success) {
          message.success('Product updated successfully');
        }
      } else {
        const res = await api.post('/products', values);
        if (res.success) {
          message.success('Product created successfully');
        }
      }
      handleCloseModal();
      fetchProducts();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.message || 'Error saving product');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.success) {
        message.success('Product deleted successfully');
        fetchProducts();
      }
    } catch (err) {
      message.error(err.message || 'Failed to delete product');
    }
  };

  const columns = [
    {
      title: 'Item / Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag color="blue">{cat || 'General'}</Tag>,
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      render: (val) => (
        <span style={{ fontWeight: 600 }}>
          ${val?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Tax Rate',
      dataIndex: 'taxRate',
      key: 'taxRate',
      render: (val) => `${val || 0}%`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Delete Product"
            description="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Products & Services Catalog
          </Title>
          <Text type="secondary">Manage standard billable items and services</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
        >
          Add Product
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={14} md={10}>
          <Input.Search
            placeholder="Search products by name or category..."
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={fetchProducts}
            enterButton={<SearchOutlined />}
          />
        </Col>
      </Row>

      <Table
        dataSource={products}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        okText={editingProduct ? 'Update Product' : 'Create Product'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Product / Service Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="e.g. Cloud Server Consulting" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Unit Price ($)"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber min={0} step={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="taxRate" label="Tax Rate (%)">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="category" label="Category">
            <Input placeholder="e.g. Development, Consulting, Retainer" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Detailed service description..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductList;
