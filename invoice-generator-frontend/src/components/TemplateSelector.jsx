import React from "react";
import { Modal, Card, Row, Col } from "antd";
import "../styles/templateModal.css";

const templates = [
  { id: "template1", name: "Modern Wave", img: "/templates-previews/t1.png" },
  { id: "template2", name: "Minimal", img: "/templates-previews/t2.png" },
 
];

export default function TemplateSelector({ open, onSelect, onClose }) {
  return (
    <Modal
      open={open}
      footer={null}
      onCancel={onClose}
      title="Select Invoice Template"
      className="template-modal"
      width={900}
      bodyStyle={{
        height: "500px",
        overflowY: "auto",
        background: "transparent",
      }}
    >
      <Row gutter={[20, 20]}>
        {templates.map((t) => (
          <Col xs={24} sm={12} md={12} key={t.id}>
            <Card
              className="invoice-card"
              hoverable
              cover={
                <div className="invoice-wrapper">
                  <img src={t.img} alt={t.name} className="invoice-img" />
                </div>
              }
              onClick={() => onSelect(t.id)}
            >
              <Card.Meta title={t.name} />
            </Card>
          </Col>
        ))}
      </Row>
    </Modal>
  );
}
