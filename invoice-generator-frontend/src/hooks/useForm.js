import { useState, useEffect } from 'react'
import { Form } from 'antd'

export const useForm = () => {
  const [form] = Form.useForm()
  const [items, setItems] = useState([
    { description: '', quantity: 1, price: 0, total: 0 }
  ])
  const [totals, setTotals] = useState({
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0
  })

  useEffect(() => {
    const calculateTotals = () => {
      const subtotal = items.reduce((sum, item) => {
        const itemTotal = (item.quantity || 0) * (item.price || 0)
        return sum + itemTotal
      }, 0)
      
      const taxRate = form.getFieldValue('taxRate') || 0
      const discountRate = form.getFieldValue('discountRate') || 0
    
      const taxAmount = (subtotal * taxRate) / 100
      const discountAmount = (subtotal * discountRate) / 100
      const total = Math.max(0, subtotal + taxAmount - discountAmount)

      setTotals({ subtotal, taxAmount, discountAmount, total })
    }

    calculateTotals()
  }, [items, form])

  const handleAddItem = () => {
    setItems(prev => [...prev, { description: '', quantity: 1, price: 0, total: 0 }])
  }

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const newItems = [...prev]
      newItems[index] = { ...newItems[index], [field]: value }

      const quantity = field === 'quantity' ? value : newItems[index].quantity
      const price = field === 'price' ? value : newItems[index].price
      newItems[index].total = (quantity || 0) * (price || 0)

      return newItems
    })
  }

  return {
    form,
    items,
    totals,
    setItems,       // REQUIRED FOR EDIT MODE
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
  }
}
