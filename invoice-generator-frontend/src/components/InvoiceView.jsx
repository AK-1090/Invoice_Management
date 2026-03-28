import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Descriptions, Table, Tag, Button, Space } from "antd";
import { FilePdfOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useInvoices } from "../hooks/useInvoices";
import { formatCurrency, formatDate } from "../utils/formatters";

import TemplateSelector from "../components/TemplateSelector";
import { downloadInvoicePdf } from "../services/pdf";

const InvoiceView = () => {
  const { id } = useParams();
  const { getInvoiceById, loading } = useInvoices();

  const [invoice, setInvoice] = useState(null);

  // NEW — for template selection modal
  const [templateOpen, setTemplateOpen] = useState(false);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const data = await getInvoiceById(id);
        setInvoice(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadInvoice();
  }, [id]);

  const getStatusColor = (status) => {
    const colors = {
      draft: "default",
      sent: "blue",
      paid: "green",
      overdue: "red",
    };
    return colors[status] || "default";
  };

  const itemColumns = [
    { title: "Description", dataIndex: "description" },
    { title: "Quantity", dataIndex: "quantity" },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => formatCurrency(price),
    },
    {
      title: "Total",
      dataIndex: "total",
      render: (total) => formatCurrency(total),
    },
  ];

  const handleOpenTemplate = () => setTemplateOpen(true);

  const handleSelectTemplate = async (templateId) => {
    setTemplateOpen(false);
    try {
      await downloadInvoicePdf(invoice._id, templateId);
    } catch (err) {
      console.error("PDF download failed:", err);
    }
  };

  if (loading || !invoice) return <div>Loading invoice...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => window.history.back()}
            >
              Back
            </Button>
            <span>Invoice {invoice.invoiceNumber}</span>
            <Tag color={getStatusColor(invoice.status)}>
              {invoice.status?.toUpperCase()}
            </Tag>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={handleOpenTemplate}
          >
            Download PDF
          </Button>
        }
      >
        {/* Bill From */}
        <Descriptions title="Bill From" bordered style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Name" span={3}>
            {invoice.from?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Address" span={3}>
            {invoice.from?.address}
          </Descriptions.Item>
          <Descriptions.Item label="City">
            {invoice.from?.city}
          </Descriptions.Item>
          <Descriptions.Item label="State">
            {invoice.from?.state}
          </Descriptions.Item>
          <Descriptions.Item label="ZIP">{invoice.from?.zip}</Descriptions.Item>
          <Descriptions.Item label="Email">
            {invoice.from?.email}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {invoice.from?.phone}
          </Descriptions.Item>
        </Descriptions>

        {/* Bill To */}
        <Descriptions title="Bill To" bordered style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Name" span={3}>
            {invoice.to?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Address" span={3}>
            {invoice.to?.address}
          </Descriptions.Item>
          <Descriptions.Item label="City">{invoice.to?.city}</Descriptions.Item>
          <Descriptions.Item label="State">
            {invoice.to?.state}
          </Descriptions.Item>
          <Descriptions.Item label="ZIP">{invoice.to?.zip}</Descriptions.Item>
          <Descriptions.Item label="Email">
            {invoice.to?.email}
          </Descriptions.Item>
        </Descriptions>

        {/* Invoice Details */}
        <Descriptions
          title="Invoice Details"
          bordered
          style={{ marginBottom: 24 }}
        >
          <Descriptions.Item label="Issue Date">
            {formatDate(invoice.issueDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Due Date">
            {formatDate(invoice.dueDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(invoice.status)}>
              {invoice.status?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        {/* Items Table */}
        <Table
          title={() => "Items"}
          columns={itemColumns}
          dataSource={invoice.items || []}
          pagination={false}
          rowKey={(item, index) => index}
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={3} align="right">
                  <strong>Subtotal</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <strong>{formatCurrency(invoice.subtotal)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>

              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={3} align="right">
                  <strong>Tax ({invoice.taxRate}%)</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <strong>{formatCurrency(invoice.taxAmount)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>

              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={3} align="right">
                  <strong>Discount ({invoice.discountRate}%)</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <strong>-{formatCurrency(invoice.discountAmount)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>

              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={3} align="right">
                  <strong>Total</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <strong>{formatCurrency(invoice.total)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />

        {/* Notes Section */}
        {invoice.notes && (
          <Card title="Notes" style={{ marginTop: 24 }}>
            <p>{invoice.notes}</p>
          </Card>
        )}

        {/* NEW — Template Selector Modal */}
        <TemplateSelector
          open={templateOpen}
          onSelect={handleSelectTemplate}
          onClose={() => setTemplateOpen(false)}
        />
      </Card>
    </motion.div>
  );
};

export default InvoiceView;
