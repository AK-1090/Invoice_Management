import React, { createContext, useState } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([])
  const [currentInvoice, setCurrentInvoice] = useState(null)
  const [loading, setLoading] = useState(false)

  const value = {
    invoices,
    setInvoices,
    currentInvoice,
    setCurrentInvoice,
    loading,
    setLoading,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export { AppContext }