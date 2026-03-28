export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '₹0.00'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value)
}

export const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('eng-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}