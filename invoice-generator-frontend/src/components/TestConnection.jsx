import React from 'react'
import { Button, Alert } from 'antd'
import api from '../services/api'

const TestConnection = () => {
  const [status, setStatus] = React.useState('')
  const [error, setError] = React.useState('')

  const testAPI = async () => {
    try {
      setStatus('Testing connection...')
      setError('')
      const response = await api.get('/health')
      setStatus(`✅ API is working: ${response.status}`)
    } catch (err) {
      setError(`❌ API Error: ${err.message}`)
      setStatus('')
    }
  }

  const testInvoices = async () => {
    try {
      setStatus('Testing invoices endpoint...')
      setError('')
      const response = await api.get('/invoices')
      setStatus(`✅ Invoices endpoint working: Found ${response.invoices?.length || 0} invoices`)
    } catch (err) {
      setError(`❌ Invoices Error: ${err.message}`)
      setStatus('')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3>API Connection Test</h3>
      <Button onClick={testAPI} style={{ marginRight: '10px' }}>
        Test API Health
      </Button>
      <Button onClick={testInvoices}>
        Test Invoices Endpoint
      </Button>
      
      {status && <Alert message={status} type="success" style={{ marginTop: '10px' }} />}
      {error && <Alert message={error} type="error" style={{ marginTop: '10px' }} />}
    </div>
  )
}

export default TestConnection