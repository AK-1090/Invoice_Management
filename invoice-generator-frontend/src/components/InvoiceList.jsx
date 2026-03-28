import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Input,
  Row,
  Col,
  Statistic,
  notification,
  Popconfirm,
  Alert,
  Empty,
  Spin,
  Typography,
  Badge,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  PlusOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "../hooks/useInvoices";
import { formatCurrency, formatDate } from "../utils/formatters";

import TemplateSelector from "../components/TemplateSelector";
import { downloadInvoicePdf } from "../services/pdf";

import "../styles/InvoiceList.css"; // Import CSS file

const { Search } = Input;
const { Title, Text } = Typography;

const InvoiceList = () => {
  const navigate = useNavigate();
  const { invoices, loading, fetchInvoices, deleteInvoice } = useInvoices();

  // Template selector state
  const [templateOpen, setTemplateOpen] = useState(false);
  const [selectedInvoiceForPdf, setSelectedInvoiceForPdf] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);

  // 🎯 open template modal
  const handleGeneratePDF = (invoice) => {
    setSelectedInvoiceForPdf(invoice);
    setTemplateOpen(true);
  };

  // 🎯 download after selecting template
  const handleSelectTemplate = async (templateId) => {
    setTemplateOpen(false);
    if (!selectedInvoiceForPdf) return;

    try {
      await downloadInvoicePdf(selectedInvoiceForPdf._id, templateId);
      notification.success({ 
        message: "PDF downloaded successfully", 
        duration: 2 
      });
    } catch (err) {
      notification.error({
        message: "Download failed",
        description: err.message,
      });
    }

    setSelectedInvoiceForPdf(null);
  };

  // Remove the body scroll restrictions
  useEffect(() => {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  // Load invoices when page, pageSize, or searchText changes
  useEffect(() => {
    loadInvoices();
  }, [pagination.current, pagination.pageSize, searchText]);

  const loadInvoices = async () => {
    try {
      setError(null);
      const response = await fetchInvoices({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
      });

      if (response.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: response.pagination.total,
        }));
      } else if (response.total) {
        setPagination((prev) => ({
          ...prev,
          total: response.total,
        }));
      }
    } catch (error) {
      console.error("Failed to load invoices:", error);
      setError(error.message);
      notification.error({
        message: "Failed to load invoices",
        description: error.message,
        duration: 5,
      });
    }
  };

  // Handle search input change - debounced
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchText(value);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 300);
  };

  // Immediate search when pressing Enter
  const handleSearchPressEnter = (e) => {
    const value = e.target.value;
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setInputValue(value);
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Clear search
  const handleClearSearch = () => {
    setInputValue("");
    setSearchText("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleDelete = async (id) => {
    try {
      await deleteInvoice(id);
      notification.success({
        message: "Invoice deleted successfully",
        duration: 3,
      });
      loadInvoices();
    } catch (error) {
      notification.error({
        message: "Failed to delete invoice",
        description: error.message,
        duration: 5,
      });
    }
  };

  const handleRetry = () => {
    loadInvoices();
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "default",
      sent: "blue",
      paid: "green",
      overdue: "red",
    };
    return colors[status] || "default";
  };

  const getStatusVariant = (status) => {
    const variants = {
      draft: {
        color: "default",
        gradient: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
      },
      sent: {
        color: "blue",
        gradient: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
      },
      paid: {
        color: "green",
        gradient: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
      },
      overdue: {
        color: "red",
        gradient: "linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)",
      },
    };
    return variants[status] || variants.draft;
  };

  const getStatusClass = (status) => {
    const classes = {
      draft: "status-tag status-draft",
      sent: "status-tag status-sent",
      paid: "status-tag status-paid",
      overdue: "status-tag status-overdue",
    };
    return classes[status] || "status-tag status-draft";
  };

  const columns = [
    {
      title: "Invoice Number",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      sorter: (a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber),
      render: (text) => (
        <Text strong className="invoice-number">
          {text}
        </Text>
      ),
    },
    {
      title: "Client",
      dataIndex: ["to", "name"],
      key: "clientName",
      sorter: (a, b) => a.to.name.localeCompare(b.to.name),
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.to?.email}
          </Text>
        </div>
      ),
    },
    {
      title: "Issue Date",
      dataIndex: "issueDate",
      key: "issueDate",
      render: (date) => (
        <Badge
          color="#1890ff"
          text={
            <Text strong className="issue-date">
              {formatDate(date)}
            </Text>
          }
        />
      ),
      sorter: (a, b) => new Date(a.issueDate) - new Date(b.issueDate),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => {
        const isOverdue = new Date(date) < new Date();
        return (
          <Badge
            color={isOverdue ? "#ff4d4f" : "#52c41a"}
            text={
              <Text strong className={isOverdue ? "due-date-overdue" : "due-date-normal"}>
                {formatDate(date)}
              </Text>
            }
          />
        );
      },
      sorter: (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (amount) => (
        <div style={{ textAlign: "right" }}>
          <Title level={5} className="total-amount">
            {formatCurrency(amount)}
          </Title>
        </div>
      ),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const variant = getStatusVariant(status);
        return (
          <Tag
            className={getStatusClass(status)}
          >
            {status?.toUpperCase()}
          </Tag>
        );
      },
      filters: [
        { text: "Draft", value: "draft" },
        { text: "Sent", value: "sent" },
        { text: "Paid", value: "paid" },
        { text: "Overdue", value: "overdue" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    
    {
      
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/invoices/view/${record._id}`)}
            title="View"
            className="view-button action-buttons"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/invoices/edit/${record._id}`)}
            title="Edit"
            className="edit-button action-buttons"
          />
          <Button
            type="text"
            icon={<FilePdfOutlined />}
            onClick={() => handleGeneratePDF(record)}
            title="Download PDF"
            className="pdf-button action-buttons"
          />
          <Popconfirm
            title="Delete invoice"
            description="Are you sure you want to delete this invoice?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okType="danger"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Delete"
              className="delete-button action-buttons"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: invoices.length,
    paid: invoices.filter((inv) => inv.status === "paid").length,
    overdue: invoices.filter((inv) => inv.status === "overdue").length,
    totalAmount: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="invoice-list-fullpage"
      >
        {/* Floating Background Shapes */}
        <div className="floating-shape floating-shape-1" />
        <div className="floating-shape floating-shape-2" />
        <div className="floating-shape floating-shape-3" />

        <div className="invoice-list-content">
          {/* Header Section */}
          <div className="invoice-list-header">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={12}>
                <Title level={1} className="invoice-list-title">
                  Invoice Management
                </Title>
                <Text className="invoice-list-subtitle">
                  Manage and track all your invoices in one place
                </Text>
              </Col>
              <Col xs={24} md={12} style={{ textAlign: "right" }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/invoices/create")}
                  size="large"
                  className="create-button"
                >
                  Create New Invoice
                </Button>
              </Col>
            </Row>
          </div>

          {/* Main Content Area */}
          <div className="invoice-list-main">
            {/* Error Alert */}
            {error && (
              <div className="fade-in-up">
                <Alert
                  message="Connection Error"
                  description={
                    <div>
                      <p>{error}</p>
                      <Space>
                        <Button
                          type="primary"
                          onClick={handleRetry}
                          icon={<ReloadOutlined />}
                          className="retry-button"
                        >
                          Retry
                        </Button>
                        <Button onClick={() => setError(null)}>Dismiss</Button>
                      </Space>
                    </div>
                  }
                  type="error"
                  showIcon
                  className="error-alert"
                  closable
                  onClose={() => setError(null)}
                />
              </div>
            )}

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="invoice-stats-row">
              <Col xs={24} sm={12} md={6}>
                <div className="fade-in-up fade-in-up-delay-1">
                  <Card className="stat-card stat-card-total" bodyStyle={{ padding: "16px" }}>
                    <Statistic
                      title={<Text className="stat-title">Total Invoices</Text>}
                      value={stats.total}
                      prefix={<FilePdfOutlined className="stat-prefix" />}
                      valueStyle={{ color: "white", fontSize: "24px" }}
                    />
                  </Card>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="fade-in-up fade-in-up-delay-2">
                  <Card className="stat-card stat-card-paid" bodyStyle={{ padding: "16px" }}>
                    <Statistic
                      title={<Text className="stat-title">Paid</Text>}
                      value={stats.paid}
                      prefix={<ArrowUpOutlined className="stat-prefix" />}
                      valueStyle={{ color: "white", fontSize: "24px" }}
                    />
                  </Card>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="fade-in-up fade-in-up-delay-3">
                  <Card className="stat-card stat-card-overdue" bodyStyle={{ padding: "16px" }}>
                    <Statistic
                      title={<Text className="stat-title">Overdue</Text>}
                      value={stats.overdue}
                      prefix={<ArrowDownOutlined className="stat-prefix" />}
                      valueStyle={{ color: "white", fontSize: "24px" }}
                    />
                  </Card>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="fade-in-up fade-in-up-delay-4">
                  <Card className="stat-card stat-card-amount" bodyStyle={{ padding: "16px" }}>
                    <Statistic
                      title={<Text className="stat-title">Total Amount</Text>}
                      value={stats.totalAmount}
                      precision={2}
                      prefix="₹"
                      valueStyle={{ color: "white", fontSize: "24px" }}
                    />
                  </Card>
                </div>
              </Col>
            </Row>

            {/* Search and Table Section */}
            <div className="table-section">
              {/* Search Card */}
              <div className="fade-in-up fade-in-up-delay-5">
                <Card className="search-card" bodyStyle={{ padding: "16px" }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={16}>
                      <Input
                        placeholder="Search by invoice number, client name..."
                        prefix={<SearchOutlined className="search-prefix" />}
                        value={inputValue}
                        onChange={handleSearchChange}
                        onPressEnter={handleSearchPressEnter}
                        allowClear
                        onClear={handleClearSearch}
                        className="search-input"
                        size="large"
                      />
                    </Col>
                    <Col xs={24} md={8}>
                      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                        <Button
                          icon={<ReloadOutlined />}
                          onClick={loadInvoices}
                          loading={loading}
                          size="large"
                          className="refresh-button"
                        >
                          Refresh
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </div>

              {/* Table Card */}
              <div className="fade-in-up fade-in-up-delay-6">
                <Card 
                  className="table-card" 
                  bodyStyle={{ 
                    padding: 0, 
                    borderRadius: "12px", 
                    overflow: "hidden",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {loading ? (
                    <div className="loading-container">
                      <Spin size="large" />
                      <p className="loading-text">Loading invoices...</p>
                    </div>
                  ) : error ? (
                    <div className="error-container">
                      <Empty
                        image={
                          <ExclamationCircleOutlined
                            style={{ fontSize: 48, color: "#ff6b6b" }}
                          />
                        }
                        description={
                          <div>
                            <p style={{ color: "#2d3436", fontWeight: "bold" }}>
                              Failed to load invoices
                            </p>
                            <Button
                              type="primary"
                              onClick={handleRetry}
                              className="retry-button"
                            >
                              Try Again
                            </Button>
                          </div>
                        }
                      />
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="empty-container">
                      <Empty
                        description={
                          searchText
                            ? `No invoices found for "${searchText}"`
                            : "No invoices found"
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      >
                        {searchText ? (
                          <Button
                            onClick={handleClearSearch}
                            className="clear-search-button"
                          >
                            Clear Search
                          </Button>
                        ) : (
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/invoices/create")}
                            className="create-first-button"
                          >
                            Create First Invoice
                          </Button>
                        )}
                      </Empty>
                    </div>
                  ) : (
                    <Table
                      columns={columns}
                      dataSource={invoices}
                      rowKey="_id"
                      loading={loading}
                      pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} items`,
                        className: "table-pagination",
                      }}
                      onChange={handleTableChange}
                      scroll={{ x: "max-content" }}
                      className="invoice-table"
                    />
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Template Selector Modal */}
        <TemplateSelector
          open={templateOpen}
          onSelect={handleSelectTemplate}
          onClose={() => {
            setTemplateOpen(false);
            setSelectedInvoiceForPdf(null);
          }}
        />
      </motion.div>
    </>
  );
};

export default InvoiceList;