import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Button, Space, Typography, Spin, Empty, Tag } from 'antd';
import {
  DollarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  PlusOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import StatusTag from '../components/StatusTag';

const { Title, Text } = Typography;

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.success) {
        setData(res.result);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  const { summary, recentInvoices = [], recentClients = [] } = data || {};

  const invoiceColumns = [
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
      dataIndex: ['client', 'name'],
      key: 'client',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name || 'N/A'}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.client?.company}</div>
        </div>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (val, record) => (
        <span style={{ fontWeight: 600 }}>
          {record.currency || '$'} {val?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'paymentStatus',
      key: 'status',
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          type="text"
          icon={<ArrowRightOutlined />}
          onClick={() => navigate(`/invoices/${record._id}`)}
        >
          View
        </Button>
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
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Executive Dashboard
          </Title>
          <Text type="secondary">Overview of financial health and CRM activity</Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/invoices/new')}
          >
            Create Invoice
          </Button>
          <Button icon={<TeamOutlined />} onClick={() => navigate('/clients')}>
            Manage Clients
          </Button>
        </Space>
      </div>

      {/* KPI Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Statistic
              title="Total Revenue (Collected)"
              value={summary?.totalRevenue || 0}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#389e0d', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: '#fffbe6', border: '1px solid #ffe58f' }}>
            <Statistic
              title="Pending Receivables"
              value={summary?.totalUnpaid || 0}
              precision={2}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#d46b08', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: '#e6f4ff', border: '1px solid #91caff' }}>
            <Statistic
              title="Total Invoices"
              value={summary?.totalInvoices || 0}
              prefix={<FileTextOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#0958d9', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: '#f9f0ff', border: '1px solid #d3adf7' }}>
            <Statistic
              title="Active Clients"
              value={summary?.activeClients || 0}
              prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#531dab', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tables Row */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title="Recent Invoices"
            extra={
              <Button type="link" onClick={() => navigate('/invoices')}>
                View All
              </Button>
            }
          >
            <Table
              dataSource={recentInvoices}
              columns={invoiceColumns}
              rowKey="_id"
              pagination={false}
              size="middle"
              locale={{ emptyText: <Empty description="No invoices recorded yet" /> }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="Recent Clients"
            extra={
              <Button type="link" onClick={() => navigate('/clients')}>
                View All
              </Button>
            }
          >
            {recentClients.length === 0 ? (
              <Empty description="No clients recorded yet" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentClients.map((client) => (
                  <div
                    key={client._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: 6,
                      background: '#fafafa',
                      border: '1px solid #f0f0f0',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{client.name}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {client.company || client.email}
                      </div>
                    </div>
                    <StatusTag status={client.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
