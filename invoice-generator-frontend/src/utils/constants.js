export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
}

export const INVOICE_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'default' },
  { value: 'sent', label: 'Sent', color: 'blue' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'overdue', label: 'Overdue', color: 'red' },
]

export const TAX_RATES = [0, 5, 10, 15, 20]
export const DISCOUNT_RATES = [0, 5, 10, 15, 20]

export const DEFAULT_INVOICE = {
  from: {
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    email: '',
    phone: '',
  },
  to: {
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    email: '',
  },
  items: [
    {
      description: '',
      quantity: 1,
      price: 0,
      total: 0,
    },
  ],
  subtotal: 0,
  taxRate: 0,
  taxAmount: 0,
  discountRate: 0,
  discountAmount: 0,
  total: 0,
  issueDate: new Date(),
  dueDate: null,
  status: 'draft',
  notes: '',
}