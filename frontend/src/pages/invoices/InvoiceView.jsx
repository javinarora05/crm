import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Button,
  Space,
  Divider,
  Spin,
  message,
  Popconfirm,
  Tag,
} from 'antd';
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import StatusTag from '../../components/StatusTag';

const { Title, Text } = Typography;

export const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/invoices/${id}`);
      if (res.success) {
        setInvoice(res.result);
      }
    } catch (err) {
      message.error(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleStatusChange = async (newStatus, newPaymentStatus) => {
    try {
      const res = await api.patch(`/invoices/${id}/status`, {
        status: newStatus,
        paymentStatus: newPaymentStatus,
      });
      if (res.success) {
        message.success(`Status updated to ${newPaymentStatus.toUpperCase()}`);
        fetchInvoice();
      }
    } catch (err) {
      message.error(err.message || 'Status update failed');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await api.delete(`/invoices/${id}`);
      if (res.success) {
        message.success('Invoice deleted');
        navigate('/invoices');
      }
    } catch (err) {
      message.error(err.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading invoice..." />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Title level={4}>Invoice not found</Title>
        <Button onClick={() => navigate('/invoices')}>Return to Invoices</Button>
      </div>
    );
  }

  const columns = [
    {
      title: 'Item & Description',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          {record.description && (
            <div style={{ fontSize: 13, color: '#8c8c8c' }}>{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center',
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      align: 'right',
      render: (val) => `${invoice.currency || '$'} ${val?.toFixed(2)}`,
    },
    {
      title: 'Line Total',
      dataIndex: 'total',
      key: 'total',
      width: 160,
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 600 }}>
          {invoice.currency || '$'} {val?.toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* Top Action Toolbar (hidden during print) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/invoices')}>
          Back to Invoices
        </Button>

        <Space size="middle">
          {invoice.paymentStatus !== 'paid' ? (
            <Button
              type="primary"
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange('paid', 'paid')}
            >
              Mark as Paid
            </Button>
          ) : (
            <Button
              icon={<ClockCircleOutlined />}
              onClick={() => handleStatusChange('pending', 'unpaid')}
            >
              Mark as Unpaid
            </Button>
          )}

          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
            Print / PDF
          </Button>

          <Popconfirm
            title="Delete Invoice"
            description="Are you sure you want to delete this invoice?"
            onConfirm={handleDelete}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      </div>

      {/* Printable Invoice Card */}
      <Card
        className="printable-invoice"
        style={{
          maxWidth: 860,
          margin: '0 auto',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          borderRadius: 8,
        }}
      >
        {/* Header */}
        <Row justify="space-between" align="top" style={{ marginBottom: 32 }}>
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: '#1677ff',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 18,
                }}
              >
                ID
              </div>
              <Title level={3} style={{ margin: 0 }}>
                IDURAR ERP-CRM
              </Title>
            </div>
            <Text type="secondary">Enterprise Management System</Text>
            <br />
            <Text type="secondary">support@idurar.com</Text>
          </Col>

          <Col style={{ textAlign: 'right' }}>
            <Title level={2} style={{ margin: 0, color: '#1677ff' }}>
              INVOICE
            </Title>
            <Title level={4} style={{ margin: '4px 0', color: '#595959' }}>
              #INV-{invoice.number}
            </Title>
            <div style={{ marginTop: 8 }}>
              <StatusTag status={invoice.paymentStatus} />
            </div>
          </Col>
        </Row>

        <Divider />

        {/* Client & Date Info */}
        <Row gutter={24} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12}>
            <Text type="secondary" strong style={{ textTransform: 'uppercase', fontSize: 12 }}>
              Billed To:
            </Text>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
              {invoice.client?.name}
            </div>
            {invoice.client?.company && (
              <div style={{ color: '#595959' }}>{invoice.client.company}</div>
            )}
            {invoice.client?.email && <div>{invoice.client.email}</div>}
            {invoice.client?.phone && <div>{invoice.client.phone}</div>}
            {invoice.client?.address && <div>{invoice.client.address}</div>}
            {invoice.client?.country && <div>{invoice.client.country}</div>}
          </Col>

          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Invoice Date:</Text>{' '}
              <Text strong>{new Date(invoice.date).toLocaleDateString()}</Text>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Due Date:</Text>{' '}
              <Text strong>{new Date(invoice.expiredDate).toLocaleDateString()}</Text>
            </div>
            <div>
              <Text type="secondary">Currency:</Text> <Tag>{invoice.currency || 'USD'}</Tag>
            </div>
          </Col>
        </Row>

        {/* Itemized Table */}
        <Table
          dataSource={invoice.items}
          columns={columns}
          rowKey={(r, i) => i}
          pagination={false}
          style={{ marginBottom: 24 }}
        />

        {/* Totals Section */}
        <Row justify="end" style={{ marginBottom: 32 }}>
          <Col xs={24} sm={10}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <Text type="secondary">Subtotal:</Text>
              <Text strong>
                {invoice.currency || '$'} {invoice.subTotal?.toFixed(2)}
              </Text>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <Text type="secondary">Tax ({invoice.taxRate}%):</Text>
              <Text strong>
                {invoice.currency || '$'} {invoice.taxTotal?.toFixed(2)}
              </Text>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                background: '#fafafa',
                borderRadius: 4,
                paddingLeft: 8,
                paddingRight: 8,
              }}
            >
              <Title level={4} style={{ margin: 0 }}>
                Total Due:
              </Title>
              <Title level={3} style={{ margin: 0, color: '#1677ff' }}>
                {invoice.currency || '$'}{' '}
                {invoice.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Title>
            </div>
          </Col>
        </Row>

        {/* Notes */}
        {invoice.notes && (
          <div
            style={{
              padding: 16,
              background: '#fcfcfc',
              borderLeft: '4px solid #1677ff',
              borderRadius: 4,
            }}
          >
            <Text strong>Notes & Instructions:</Text>
            <p style={{ marginTop: 4, color: '#595959', whiteSpace: 'pre-line', margin: 0 }}>
              {invoice.notes}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InvoiceView;
