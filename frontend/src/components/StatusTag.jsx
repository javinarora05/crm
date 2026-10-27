import React from 'react';
import { Tag } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';

export const StatusTag = ({ status }) => {
  if (!status) return null;

  const normalized = status.toLowerCase();

  switch (normalized) {
    case 'paid':
    case 'active':
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          {status.toUpperCase()}
        </Tag>
      );
    case 'pending':
    case 'partially':
      return (
        <Tag icon={<ClockCircleOutlined />} color="warning">
          {status.toUpperCase()}
        </Tag>
      );
    case 'lead':
      return (
        <Tag icon={<UserOutlined />} color="processing">
          LEAD
        </Tag>
      );
    case 'unpaid':
    case 'overdue':
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          {status.toUpperCase()}
        </Tag>
      );
    case 'draft':
      return (
        <Tag icon={<ClockCircleOutlined />} color="default">
          DRAFT
        </Tag>
      );
    case 'inactive':
    case 'cancelled':
      return (
        <Tag icon={<ExclamationCircleOutlined />} color="default">
          {status.toUpperCase()}
        </Tag>
      );
    default:
      return <Tag>{status.toUpperCase()}</Tag>;
  }
};

export default StatusTag;
