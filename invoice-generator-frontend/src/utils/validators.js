export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/
  return phoneRegex.test(phone)
}

export const validateInvoice = (invoice) => {
  const errors = []

  if (!invoice.from?.name) errors.push('Sender name is required')
  if (!invoice.to?.name) errors.push('Recipient name is required')
  if (!invoice.dueDate) errors.push('Due date is required')
  
  if (invoice.items.length === 0) {
    errors.push('At least one item is required')
  } else {
    invoice.items.forEach((item, index) => {
      if (!item.description) {
        errors.push(`Item ${index + 1}: description is required`)
      }
      if (!item.quantity || item.quantity < 1) {
        errors.push(`Item ${index + 1}: quantity must be at least 1`)
      }
      if (!item.price || item.price < 0) {
        errors.push(`Item ${index + 1}: price must be positive`)
      }
    })
  }

  if (invoice.taxRate < 0 || invoice.taxRate > 100) {
    errors.push('Tax rate must be between 0 and 100')
  }

  if (invoice.discountRate < 0 || invoice.discountRate > 100) {
    errors.push('Discount rate must be between 0 and 100')
  }

  return errors
}