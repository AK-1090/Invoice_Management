import React from 'react'
import { Layout, Menu } from 'antd'
import {
  FileTextOutlined,
  PlusOutlined,
  UnorderedListOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom' // <-- Outlet here
import { motion } from 'framer-motion'

const { Sider, Content } = Layout

const AppLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { key: '/invoices', icon: <UnorderedListOutlined />, label: 'All Invoices' },
    { key: '/invoices/create', icon: <PlusOutlined />, label: 'Create Invoice' }
  ]

  const handleMenuClick = ({ key }) => navigate(key)

  return (
    <Layout
      style={{
        minHeight: '100vh',
        padding: 0,
        background: 'linear-gradient(135deg, #0f172a, #1e293b, #334155)'
      }}
    >
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
       

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ background: 'transparent', marginTop: '10px' }}
        />
      </Sider>

      <Layout>
        <Content style={{ padding: 0 }}>
          {/* THIS is the vital line — nested routes will render here */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
