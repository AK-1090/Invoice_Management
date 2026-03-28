import dayjs from "dayjs";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Table,
  Divider,
  notification,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useCallback, useMemo } from "react";

import { useForm } from "../hooks/useForm";
import { useInvoices } from "../hooks/useInvoices";
import { formatCurrency } from "../utils/formatters";
import "../styles/InvoiceForm.css";

const { Option } = Select;
const { TextArea } = Input;

const InvoiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { createInvoice, updateInvoice, getInvoiceById, loading } = useInvoices();
  const { form, items, totals, setItems, handleAddItem, handleRemoveItem, handleItemChange } = useForm();

  const [notificationApi, contextHolder] = notification.useNotification();

  const showNotification = useCallback((type, msg, desc) => {
    notificationApi[type]({
      message: msg,
      description: desc,
      placement: "topRight",
    });
  }, [notificationApi]);

  useEffect(() => {
    const loadInvoiceData = async () => {
      if (!isEditing) return;

      try {
        const data = await getInvoiceById(id);

        form.setFieldsValue({
          from: data.from,
          to: data.to,
          dueDate: data.dueDate ? dayjs(data.dueDate) : null,
          taxRate: data.taxRate,
          discountRate: data.discountRate,
          status: data.status,
          notes: data.notes,
        });

        if (data.items) {
          setItems(
            data.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price,
            }))
          );
        }
      } catch (err) {
        showNotification("error", "Failed to load invoice", err.message);
      }
    };

    loadInvoiceData();
  }, [id, isEditing, getInvoiceById, form, setItems, showNotification]);

  const onFinish = async (values) => {
    try {
      const invoiceData = {
        from: values.from,
        to: values.to,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price,
        })),
        subtotal: totals.subtotal,
        taxRate: values.taxRate,
        taxAmount: totals.taxAmount,
        discountRate: values.discountRate,
        discountAmount: totals.discountAmount,
        total: totals.total,
        dueDate: values.dueDate?.format("YYYY-MM-DD"),
        status: values.status,
        notes: values.notes,
      };

      if (isEditing) {
        await updateInvoice(id, invoiceData);
        showNotification("success", "Invoice Updated", "Invoice updated successfully!");
      } else {
        await createInvoice(invoiceData);
        showNotification("success", "Invoice Created", "Invoice created successfully!");
      }

      navigate("/invoices");
    } catch (error) {
      showNotification("error", "Error", error.message);
    }
  };

  const onFinishFailed = () => {
    showNotification("error", "Form Error", "Please fill all required fields.");
  };

  const itemColumns = useMemo(() => [
    {
      title: "Description",
      dataIndex: "description",
      render: (_, record, index) => (
        <Input
          value={record.description}
          placeholder="Item description"
          onChange={(e) => handleItemChange(index, "description", e.target.value)}
        />
      ),
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      width: 80,
      render: (_, record, index) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleItemChange(index, "quantity", value)}
        />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 120,
      render: (_, record, index) => (
        <InputNumber
          min={1}
          value={record.price}
          onChange={(value) => handleItemChange(index, "price", value)}
        />
      ),
    },
    {
      title: "Total",
      width: 140,
      render: (_, record) => (
        <span className="currency-amount total-cell">
          {formatCurrency(record.total)}
        </span>
      ),
    },
    {
      title: "Action",
      width: 60,
      render: (_, __, index) => (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          disabled={items.length === 1}
          onClick={() => handleRemoveItem(index)}
        />
      ),
    },
  ], [items.length, handleItemChange, handleRemoveItem]);

  const formFields = useMemo(() => [
    { name: "name", label: "Name", required: true },
    { name: "address", label: "Address", required: true },
    { name: "city", label: "City", required: true },
    { name: "state", label: "State", required: true },
    { name: "zip", label: "ZIP", required: true },
    { name: "email", label: "Email", required: true },
  ], []);

  const renderFormFields = useCallback((prefix) =>
    formFields.map((field) => (
      <Form.Item
        key={field.name}
        name={[prefix, field.name]}
        label={field.label}
        rules={[{ required: field.required }]}
      >
        <Input />
      </Form.Item>
    )), [formFields]);

  const itemsData = useMemo(() => 
    items.map((item, index) => ({ ...item, key: index })), 
    [items]
  );

  return (
    <>
      {contextHolder}
      <div className="invoice-form-page">
        <div className="floating-shape floating-shape-1" />
        <div className="floating-shape floating-shape-2" />
        <div className="floating-shape floating-shape-3" />

        <div className="invoice-form-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              title={isEditing ? "Edit Invoice" : "Create Invoice"}
              className="invoice-card"
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                initialValues={{ taxRate: 0, discountRate: 0, status: "draft" }}
              >
                <Row gutter={[16, 16]} className="form-section">
                  <Col xs={24} md={12}>
                    <Card size="small" title="From">
                      {renderFormFields("from")}
                      <Form.Item
                        name={["from", "phone"]}
                        label="Phone"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card size="small" title="Bill To">
                      {renderFormFields("to")}
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <Row gutter={[16, 16]} className="form-section">
                  <Col xs={24} md={8}>
                    <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="status" label="Status">
                      <Select>
                        <Option value="draft">Draft</Option>
                        <Option value="sent">Sent</Option>
                        <Option value="paid">Paid</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Card
                  title="Items"
                  size="small"
                  extra={
                    <Button 
                      type="default"
                      icon={<PlusOutlined />} 
                      onClick={handleAddItem}
                    >
                      Add Item
                    </Button>
                  }
                >
                  <Table
                    className="invoice-items-table"
                    columns={itemColumns}
                    dataSource={itemsData}
                    pagination={false}
                  />
                </Card>

                <Row className="summary-container" justify="end" style={{ marginTop: 24 }}>
                  <Col xs={24} md={12} lg={8}>
                    <Card size="small" title="Summary">
                      <p>
                        Subtotal:{" "}
                        <span className="currency-amount">
                          {formatCurrency(totals.subtotal)}
                        </span>
                      </p>

                      <Form.Item name="taxRate" label="Tax %">
                        <InputNumber min={0} />
                      </Form.Item>

                      <p>
                        Tax:{" "}
                        <span className="currency-amount">
                          {formatCurrency(totals.taxAmount)}
                        </span>
                      </p>

                      <Form.Item name="discountRate" label="Discount %">
                        <InputNumber min={0} />
                      </Form.Item>

                      <p>
                        Discount:{" "}
                        <span className="currency-amount">
                          {formatCurrency(totals.discountAmount)}
                        </span>
                      </p>

                      <Divider />

                      <h3 className="summary-total">
                        Total: {formatCurrency(totals.total)}
                      </h3>
                    </Card>
                  </Col>
                </Row>

                <Form.Item name="notes" label="Notes">
                  <TextArea rows={4} />
                </Form.Item>

                <Row className="pdf-container" justify="end" gutter={16}>
                  <Col>
                    <Button 
                      className="pdf-btn" 
                      onClick={() => navigate("/invoices")}
                    >
                      Cancel
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      className="pdf-btn"
                      icon={<FilePdfOutlined />}
                      onClick={() => showNotification("info", "PDF", "Save invoice first.")}
                    >
                      Generate PDF
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={loading}
                    >
                      {isEditing ? "Update Invoice" : "Create Invoice"}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default InvoiceForm;