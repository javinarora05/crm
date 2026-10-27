import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
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
  TeamOutlined,
} from '@ant-design/icons';
import api from '../../api/client';
import StatusTag from '../../components/StatusTag';

const { Title, Text } = Typography;
const { Option } = Select;

export const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form] = Form.useForm();

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.q = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/clients', { params });
      if (res.success) {
        setClients(res.result);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClients();
  };

  const handleOpenModal = (client = null) => {
    setEditingClient(client);
    if (client) {
      form.setFieldsValue(client);
    } else {
      form.resetFields();
      form.setFieldsValue({ status: 'active', country: 'United States' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingClient) {
        const res = await api.put(`/clients/${editingClient._id}`, values);
        if (res.success) {
          message.success('Client updated successfully');
        }
      } else {
        const res = await api.post('/clients', values);
        if (res.success) {
          message.success('Client created successfully');
        }
      }
      handleCloseModal();
      fetchClients();
    } catch (err) {
      if (err.errorFields) return; // Validation error
      message.error(err.message || 'Error saving client');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/clients/${id}`);
      if (res.success) {
        message.success('Client deleted successfully');
        fetchClients();
      }
    } catch (err) {
      message.error(err.message || 'Failed to delete client');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.address}</div>
        </div>
      ),
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      render: (val) => val || <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (val) => val || <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag status={status} />,
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
            title="Delete Client"
            description="Are you sure you want to delete this client?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes, delete"
            cancelText="Cancel"
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
            Clients & Contacts
          </Title>
          <Text type="secondary">Manage your CRM client relationships and leads</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
        >
          Add Client
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={14} md={10}>
          <Input.Search
            placeholder="Search by name, company, email..."
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={fetchClients}
            enterButton={<SearchOutlined />}
          />
        </Col>
        <Col xs={24} sm={10} md={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Filter by Status"
            value={statusFilter || undefined}
            allowClear
            onChange={(val) => setStatusFilter(val || '')}
          >
            <Option value="">All Statuses</Option>
            <Option value="active">Active</Option>
            <Option value="lead">Lead</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Col>
      </Row>

      <Table
        dataSource={clients}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      {/* Create / Edit Modal */}
      <Modal
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        okText={editingClient ? 'Update Client' : 'Create Client'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter client name' }]}
          >
            <Input placeholder="e.g. Jane Doe" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="company" label="Company Name">
                <Input placeholder="e.g. Acme Corp" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Select status' }]}
              >
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="lead">Lead</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Enter a valid email' },
                ]}
              >
                <Input placeholder="jane@company.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone Number">
                <Input placeholder="+1 555-0100" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="country" label="Country">
                <Input placeholder="e.g. United States" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="address" label="City / Address">
                <Input placeholder="e.g. New York, NY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientList;
