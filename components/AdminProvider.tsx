'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

const AdminCtx = createContext({ isAdmin: false, refresh: () => {} })
export const useAdmin = () => useContext(AdminCtx)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)

  const refresh = async () => {
    const res = await fetch('/api/admin')
    const data = await res.json()
    setIsAdmin(data.isAdmin)
  }

  useEffect(() => { refresh() }, [])

  return <AdminCtx.Provider value={{ isAdmin, refresh }}>{children}</AdminCtx.Provider>
}
