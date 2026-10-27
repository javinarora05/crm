import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Select,
  Space,
  Typography,
  message,
  Popconfirm,
  Row,
  Col,
  Tag,
  Dropdown,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import StatusTag from '../../components/StatusTag';

const { Title, Text } = Typography;
const { Option } = Select;

export const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.paymentStatus = statusFilter;
      const res = await api.get('/invoices', { params });
      if (res.success) {
        setInvoices(res.result);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status, paymentStatus) => {
    try {
      const res = await api.patch(`/invoices/${id}/status`, { status, paymentStatus });
      if (res.success) {
        message.success(`Status updated to ${paymentStatus.toUpperCase()}`);
        fetchInvoices();
      }
    } catch (err) {
      message.error(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/invoices/${id}`);
      if (res.success) {
        message.success('Invoice deleted successfully');
        fetchInvoices();
      }
    } catch (err) {
      message.error(err.message || 'Failed to delete invoice');
    }
  };

  const getStatusDropdownItems = (record) => ({
    items: [
      {
        key: 'paid',
        label: 'Mark as Paid',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        onClick: () => handleUpdateStatus(record._id, 'paid', 'paid'),
      },
      {
        key: 'unpaid',
        label: 'Mark as Unpaid',
        onClick: () => handleUpdateStatus(record._id, 'pending', 'unpaid'),
      },
      {
        key: 'draft',
        label: 'Mark as Draft',
        onClick: () => handleUpdateStatus(record._id, 'draft', 'unpaid'),
      },
    ],
  });

  const columns = [
    {
      title: 'Invoice #',
      dataIndex: 'number',
      key: 'number',
      render: (num, record) => (
        <Button
          type="link"
          style={{ padding: 0, fontWeight: 600 }}
          onClick={() => navigate(`/invoices/${record._id}`)}
        >
          INV-{num}
        </Button>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      render: (client) => (
        <div>
          <div style={{ fontWeight: 500 }}>{client?.name || 'Unknown'}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{client?.company || client?.email}</div>
        </div>
      ),
    },
    {
      title: 'Issue Date',
      dataIndex: 'date',
      key: 'date',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      title: 'Due Date',
      dataIndex: 'expiredDate',
      key: 'expiredDate',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      title: 'Subtotal',
      dataIndex: 'subTotal',
      key: 'subTotal',
      render: (val, r) => `${r.currency || '$'} ${val?.toFixed(2)}`,
    },
    {
      title: 'Total Amount',
      dataIndex: 'total',
      key: 'total',
      render: (val, r) => (
        <span style={{ fontWeight: 600, color: '#1677ff' }}>
          {r.currency || '$'} {val?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status, record) => (
        <Dropdown menu={getStatusDropdownItems(record)} trigger={['click']}>
          <span style={{ cursor: 'pointer' }}>
            <StatusTag status={status} />
            <DownOutlined style={{ fontSize: 10, marginLeft: 4, color: '#8c8c8c' }} />
          </span>
        </Dropdown>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="primary"
            ghost
            icon={<EyeOutlined />}
            onClick={() => navigate(`/invoices/${record._id}`)}
          >
            View
          </Button>
          <Popconfirm
            title="Delete Invoice"
            description="Are you sure you want to remove this invoice?"
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
            Invoices Management
          </Title>
          <Text type="secondary">Track receivables, billings, and payment statuses</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/invoices/new')}
        >
          Create Invoice
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={10} md={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Filter by Payment Status"
            value={statusFilter || undefined}
            allowClear
            onChange={(val) => setStatusFilter(val || '')}
          >
            <Option value="">All Payment Statuses</Option>
            <Option value="paid">Paid</Option>
            <Option value="unpaid">Unpaid</Option>
            <Option value="partially">Partially</Option>
          </Select>
        </Col>
      </Row>

      <Table
        dataSource={invoices}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default InvoiceList;
